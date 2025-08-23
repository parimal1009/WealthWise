import os
import asyncio
import json
import tempfile
import uuid
from typing import List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.runnables import RunnableSequence
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec

from users.models import UserData, IncomeStatus, RetirementInfo
from chatbot.models import Chat
from chatbot.prompts import (
    ANSWER_USER_QUERY_PROMPT,
    INTERPRETER_USER_REQUEST,
    EXTRACT_USER_INFO_PROMPT,
)
from chatbot.utils.text_utils import extract_json_from_text

from config import GOOGLE_API_KEY
from dotenv import load_dotenv

load_dotenv()


class ChatBot:
    def __init__(self, chat_id: int, user_id: int):
        # self.chat = Chat.objects.get(id=chat_id)
        self.user_id = user_id

        # Initialize Pinecone and embeddings
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "pension-chatbot")

        # Initialize Pinecone client
        if self.pinecone_api_key:
            self.pc = Pinecone(api_key=self.pinecone_api_key)
            self._initialize_pinecone_index()
        else:
            self.pc = None
            print(
                "Warning: Pinecone API key not found. RAG functionality will be disabled."
            )

        # Initialize embeddings model
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            asyncio.set_event_loop(asyncio.new_event_loop())
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", google_api_key=GOOGLE_API_KEY
        )

        # Text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def _initialize_pinecone_index(self):
        """Initialize Pinecone index if it doesn't exist."""
        try:
            # Check if index exists
            existing_indexes = [index.name for index in self.pc.list_indexes()]

            if self.index_name not in existing_indexes:
                # Create index with appropriate dimensions for Google embeddings
                self.pc.create_index(
                    name=self.index_name,
                    dimension=768,  # Google embedding-001 dimension
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region=self.pinecone_environment),
                )
                print(f"Created Pinecone index: {self.index_name}")

            # Connect to the index
            self.index = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Error initializing Pinecone index: {e}")
            self.index = None

    def reply(self, user_message, file):
        has_uploaded_document = True if file else False

        # Save user message to chat history
        self._save_message_to_history(user_message, "user")

        # First, determine user intent before processing any files
        intent = self._get_message_intent(user_message, has_uploaded_document)

        if intent.get("category") == "INCOMPLETE_REQUEST":
            response = (
                "I couldn't understand that. Could you please rephrase it clearly?"
            )
            self._save_message_to_history(response, "assistant")
            return response

        # Handle extraction request - process PDF for extraction only
        if intent.get("category") == "EXTRACT_USER_INFO_FROM_DOCUMENT":
            if file and self._is_pdf_file(file):
                extraction_result = self._extract_user_info_from_pdf(file)
                # self._save_message_to_history(f"{extraction_result}", "assistant")
                return extraction_result
            response = "Please upload a PDF document to extract your information."
            self._save_message_to_history(response, "assistant")
            return response

        # Handle questions or general queries - process PDF for RAG if needed
        if intent.get("category") in ["QUESTION", "GENERAL"]:
            # Process PDF for RAG only if it's a question/general query and file is uploaded
            if file and self._is_pdf_file(file):
                pdf_processing_result = self._process_pdf_file(file)
                if pdf_processing_result:
                    # Continue to answer the question using the processed PDF
                    pass
                else:
                    response = "I encountered an issue processing your PDF, but I'll try to answer your question with available information."
                    self._save_message_to_history(response, "assistant")

            answer = self._answer_user_query(user_message, file)
            self._save_message_to_history(answer, "assistant")
            return answer

        response = "Can you rephrase your question properly."
        self._save_message_to_history(response, "assistant")
        return response

    def _answer_user_query(
        self, user_message: str, file=None, max_history_messages=10
    ) -> str:
        """
        Answers a user query by providing context from IncomeStatus, RetirementInfo, conversation history, and RAG.
        If no context exists, still tries to answer the query.

        Args:
            user_message: The current user message
            file: Optional file attachment
            max_history_messages: Maximum number of previous messages to include in context
        """
        llm = ChatGoogleGenerativeAI(
            google_api_key=GOOGLE_API_KEY,
            model="gemini-2.5-flash",
            temperature=0.6,
        )

        # Build context from DB
        context_parts = []
        try:
            basic_data = UserData.objects.filter(user_id=self.user_id).first()
            if basic_data:
                context_parts.append(
                    f"""
                    User Info:
                    - Date of Birth: {basic_data.dateOfBirth}
                    - Gender: {basic_data.gender}
                    - Location: {basic_data.location}
                    - Marital Status: {basic_data.maritalStatus}
                    - Number of Dependents: {basic_data.numberOfDependants}
                    """
                )
            income_status = IncomeStatus.objects.filter(user_id=self.user_id).first()
            if income_status:
                context_parts.append(
                    f"""
                    Income Information:
                    - Current Salary: {income_status.currentSalary}
                    - Years of Service: {income_status.yearsOfService}
                    - Employer Type: {income_status.employerType}
                    - Pension Scheme: {income_status.pensionScheme}
                    - Pension Balance: {income_status.pensionBalance}
                    - Employer Contribution: {income_status.employerContribution or "Not provided"}
                    """
                )

            retirement_info = RetirementInfo.objects.filter(
                user_id=self.user_id
            ).first()
            if retirement_info:
                context_parts.append(
                    f"""
                    Retirement Plan:
                    - Planned Retirement Age: {retirement_info.plannedRetirementAge}
                    - Lifestyle Goal: {retirement_info.retirementLifestyle}
                    - Estimated Monthly Expenses in Retirement: {retirement_info.monthlyRetirementExpense}
                    - Legacy Goal: {retirement_info.legacyGoal}
                    - Plan Created At: {retirement_info.created_at}
                    """
                )

        except Exception as e:
            print("Error while fetching user context:", e)

        # Build conversation history context
        history_context = self._get_conversation_history(max_history_messages)
        if history_context:
            context_parts.append(f"Recent Conversation History:\n{history_context}")

        # Get relevant context from RAG (Pinecone)
        rag_context = self._get_rag_context(user_message)
        if rag_context:
            context_parts.append(f"Relevant Document Information:\n{rag_context}")

        # Merge context
        context = (
            "\n".join(context_parts)
            if context_parts
            else "No user income or retirement information available."
        )

        prompt = ANSWER_USER_QUERY_PROMPT.format(
            user_query=user_message.strip(), context=context
        )

        try:
            response = llm.invoke(prompt)
            print(response)
            return (
                response.content
                if response
                else "Sorry, I couldn't come up with an answer."
            )
        except Exception as e:
            print("An error occurred while generating a response: ", e)
            return "An error occurred while generating a response"

    def _get_message_intent(self, user_message, has_uploaded_document=False):
        prompt = INTERPRETER_USER_REQUEST.format(
            user_message=user_message.strip(),
            has_uploaded_document=has_uploaded_document,
        )
        interpreter_llm = ChatGoogleGenerativeAI(
            google_api_key=GOOGLE_API_KEY,
            model="gemini-2.5-flash",
            temperature=0.7,
        )
        response = interpreter_llm.predict(prompt)

        try:
            data = extract_json_from_text(response)

            if "category" not in data:
                return {"category": "INCOMPLETE"}

            return data

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"category": "INCOMPLETE", "error": str(e)}

    def _get_conversation_history(self, max_messages=10) -> str:
        """
        Retrieves recent conversation history for the user.

        Args:
            max_messages: Maximum number of messages to retrieve

        Returns:
            Formatted conversation history string
        """
        try:
            # Get recent chat messages for this user, ordered by creation time (newest first)
            recent_chats = Chat.objects.filter(user_id=self.user_id).order_by(
                "-created_at"
            )[:max_messages]

            if not recent_chats:
                return ""

            # Reverse to get chronological order (oldest first)
            recent_chats = list(reversed(recent_chats))

            history_parts = []
            for chat in recent_chats:
                sender_label = "User" if chat.sender == "user" else "Assistant"
                history_parts.append(f"{sender_label}: {chat.content}")

            return "\n".join(history_parts)

        except Exception as e:
            print(f"Error retrieving conversation history: {e}")
            return ""

    def _save_message_to_history(self, message: str, sender: str):
        """
        Saves a message to the chat history.

        Args:
            message: The message content to save
            sender: Either 'user' or 'assistant'
        """
        try:
            Chat.objects.create(user_id=self.user_id, sender=sender, content=message)
        except Exception as e:
            print(f"Error saving message to history: {e}")

    def _is_pdf_file(self, file) -> bool:
        """Check if the uploaded file is a PDF."""
        if hasattr(file, "name"):
            return file.name.lower().endswith(".pdf")
        elif hasattr(file, "content_type"):
            return file.content_type == "application/pdf"
        return False

    def _process_pdf_file(self, file) -> Optional[str]:
        """
        Process PDF file: extract text, create embeddings, and store in Pinecone.

        Args:
            file: The uploaded PDF file

        Returns:
            Success message or None if failed
        """
        if not self.pc or not self.index:
            return "RAG functionality is not available (Pinecone not configured)."

        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            # Load and process PDF
            loader = PyPDFLoader(temp_file_path)
            documents = loader.load()

            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)

            # Process chunks and store in Pinecone
            vectors_to_upsert = []
            for i, chunk in enumerate(chunks):
                # Generate embedding
                embedding = self.embeddings.embed_query(chunk.page_content)

                # Create unique ID for this chunk
                chunk_id = f"user_{self.user_id}_pdf_{uuid.uuid4().hex[:8]}_{i}"

                # Prepare metadata
                metadata = {
                    "user_id": str(self.user_id),
                    "content": chunk.page_content,
                    "source": getattr(file, "name", "uploaded_pdf"),
                    "page": chunk.metadata.get("page", 0),
                    "chunk_index": i,
                }

                vectors_to_upsert.append(
                    {"id": chunk_id, "values": embedding, "metadata": metadata}
                )

            # Batch upsert to Pinecone
            if vectors_to_upsert:
                self.index.upsert(vectors=vectors_to_upsert)

            # Clean up temporary file
            os.unlink(temp_file_path)

            return (
                f"Processed {len(chunks)} chunks from PDF and stored in knowledge base."
            )

        except Exception as e:
            print(f"Error processing PDF file: {e}")
            # Clean up temporary file if it exists
            try:
                if "temp_file_path" in locals():
                    os.unlink(temp_file_path)
            except (OSError, FileNotFoundError):
                pass
            return None

    def _get_rag_context(self, query: str, top_k: int = 5) -> str:
        """
        Retrieve relevant context from Pinecone based on the query.

        Args:
            query: The user's query
            top_k: Number of top similar chunks to retrieve

        Returns:
            Formatted context string from retrieved documents
        """
        if not self.pc or not self.index:
            return ""

        try:
            # Generate embedding for the query
            query_embedding = self.embeddings.embed_query(query)

            # Search in Pinecone with user filter
            search_results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter={"user_id": str(self.user_id)},
            )

            if not search_results.matches:
                return ""

            # Format retrieved context
            context_parts = []
            for match in search_results.matches:
                if match.score > 0.7:  # Only include high-confidence matches
                    content = match.metadata.get("content", "")
                    source = match.metadata.get("source", "document")
                    page = match.metadata.get("page", "unknown")

                    context_parts.append(f"From {source} (Page {page}):\n{content}\n")

            return "\n".join(context_parts) if context_parts else ""

        except Exception as e:
            print(f"Error retrieving RAG context: {e}")
            return ""

    def _extract_user_info_from_pdf(self, file) -> str:
        """
        Extract user information from PDF document using LLM.

        Args:
            file: The uploaded PDF file

        Returns:
            JSON string with extracted user information or error message
        """
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            # Load and extract text from PDF
            loader = PyPDFLoader(temp_file_path)
            documents = loader.load()

            # Combine all pages into one text
            full_text = "\n".join([doc.page_content for doc in documents])

            # Clean up temporary file
            os.unlink(temp_file_path)

            # Use LLM to extract structured information
            llm = ChatGoogleGenerativeAI(
                google_api_key=GOOGLE_API_KEY,
                model="gemini-2.5-flash",
                temperature=0.1,  # Low temperature for consistent extraction
            )

            prompt = EXTRACT_USER_INFO_PROMPT.format(document_text=full_text)

            response = llm.invoke(prompt)
            extracted_text = response.content if response else ""

            # Try to extract JSON from the response
            try:
                extracted_data = extract_json_from_text(extracted_text)
                if extracted_data:
                    return extracted_data
                else:
                    return "I couldn't extract structured information from the document. The document might not contain the expected personal/financial information."
            except Exception as json_error:
                print(f"Error parsing extracted JSON: {json_error}")
                return f"I found some information in the document but couldn't format it properly. Raw response: {extracted_text}"

        except Exception as e:
            print(f"Error extracting user info from PDF: {e}")
            # Clean up temporary file if it exists
            try:
                if "temp_file_path" in locals():
                    os.unlink(temp_file_path)
            except (OSError, FileNotFoundError):
                pass
            return "Sorry, I encountered an error while processing your document. Please make sure it's a valid PDF file."
