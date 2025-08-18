import streamlit as st
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import FAISS
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, PyMuPDFLoader
import os
import tempfile
from datetime import datetime
import hashlib

# Load secrets from Streamlit
if "GROQ_API_KEY" not in st.secrets:
    st.error("Groq API key not found in secrets. Please configure your secrets.")
    st.stop()

if "HF_TOKEN" not in st.secrets:
    st.error("Hugging Face token not found in secrets. Please configure your secrets.")
    st.stop()

groq_api_key = st.secrets["GROQ_API_KEY"]
os.environ["HF_TOKEN"] = st.secrets["HF_TOKEN"]

# Constants
DEFAULT_MODEL = "Llama3-70b-8192"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 4000
CHUNK_OVERLAP = 500
TEMPERATURE = 0.1  # Lower temperature for more precise pension information
MAX_TOKENS = 3072

# Initialize Embeddings
embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

# Streamlit UI Configuration
st.set_page_config(
    page_title="🏛 Pension Document Assistant",
    page_icon="🏛",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Sidebar Configuration
with st.sidebar:
    st.title("⚙ Pension Assistant Settings")

    # Model Selection
    model_options = {
        "Llama3-70b-8192": "Best for complex pension analysis",
        "Llama3-8b-8192": "Faster processing",
        "Mixtral-8x7b-32768": "Large context for lengthy documents",
        "Gemma2-9b-It": "Quick responses",
    }
    selected_model = st.selectbox(
        "Select AI Model",
        options=list(model_options.keys()),
        index=0,
        help="Choose model based on your pension document complexity",
    )

    # Pension-specific settings
    st.markdown("### 🎯 Analysis Focus")
    analysis_focus = st.selectbox(
        "Primary Analysis Focus",
        [
            "General Pension Information",
            "Benefit Calculations",
            "Eligibility Requirements",
            "Contribution Details",
            "Retirement Planning",
            "Tax Implications",
            "Survivor Benefits",
        ],
        help="Tailor responses to your specific pension concerns",
    )

    # Quick question templates
    st.markdown("### 💡 Quick Questions")
    quick_questions = [
        "What is my retirement eligibility age?",
        "How are my pension benefits calculated?",
        "What are my contribution rates?",
        "What survivor benefits are available?",
        "How does early retirement affect my benefits?",
        "What are the vesting requirements?",
        "Can I take a lump sum withdrawal?",
        "How does my pension integrate with Social Security?",
    ]

    selected_quick_question = st.selectbox(
        "Choose a common pension question:",
        ["Select a question..."] + quick_questions,
        help="Click to use pre-written pension questions",
    )

    # Advanced Options
    with st.expander("🔧 Advanced Options"):
        chunk_size = st.slider(
            "Document Chunk Size",
            1000,
            10000,
            CHUNK_SIZE,
            help="Larger chunks for comprehensive pension rule context",
        )
        chunk_overlap = st.slider(
            "Chunk Overlap",
            100,
            2000,
            CHUNK_OVERLAP,
            help="Maintains context between pension document sections",
        )
        temperature = st.slider(
            "Response Precision",
            0.0,
            0.5,
            0.1,
            help="Lower values for more precise pension information",
        )
        max_tokens = st.slider(
            "Response Length",
            500,
            4096,
            MAX_TOKENS,
            help="Maximum length of pension explanations",
        )
        search_k = st.slider(
            "Document Sections to Analyze",
            3,
            12,
            6,
            help="Number of relevant sections to review for answers",
        )

    st.markdown("---")
    st.markdown("### 📋 About This System")
    st.markdown(
        """
    *Pension Document Assistant* helps you:
    
    🔍 *Analyze* pension plan documents, SPDs, and statements
    
    💰 *Calculate* benefits and understand formulas
    
    📅 *Plan* retirement timelines and strategies
    
    📊 *Compare* different pension options
    
    ⚖ *Understand* legal requirements and regulations
    
    💡 *Get* personalized pension guidance
    """
    )

# Main UI
st.title("🏛 Pension Document Assistant")
st.markdown(
    """
Upload your pension documents and get instant, accurate answers about your retirement benefits, 
eligibility requirements, calculations, and planning options.
"""
)

# Important disclaimer
st.warning(
    """
⚠ *Important Disclaimer*: This assistant provides information based on your uploaded documents. 
For official benefit calculations and legal advice, always consult your pension administrator or financial advisor.
"""
)

# Initialize session state
if "store" not in st.session_state:
    st.session_state.store = {}
if "vectorstore" not in st.session_state:
    st.session_state.vectorstore = None
if "processed_files" not in st.session_state:
    st.session_state.processed_files = set()
if "file_hashes" not in st.session_state:
    st.session_state.file_hashes = set()
if "analysis_focus" not in st.session_state:
    st.session_state.analysis_focus = analysis_focus


# Generate session ID
def generate_session_id():
    return f"pension_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"


# Session Management
col1, col2 = st.columns(2)
with col1:
    session_id = st.text_input(
        "Session ID",
        value=generate_session_id(),
        help="Unique ID for your pension consultation session",
    )
with col2:
    if st.button("🔄 New Consultation", help="Start a fresh pension consultation"):
        session_id = generate_session_id()
        st.session_state.store[session_id] = ChatMessageHistory()
        st.success(f"New pension consultation started: {session_id}")
        st.rerun()


# File processing functions
def get_file_hash(file_content):
    return hashlib.md5(file_content).hexdigest()


def process_pdf(file_path):
    try:
        loader = PyMuPDFLoader(file_path)
        docs = loader.load()
    except Exception as e:
        st.warning(f"Trying alternative PDF loader: {str(e)}")
        loader = PyPDFLoader(file_path)
        docs = loader.load()
    return docs


# Enhanced File Uploader with pension document types
st.markdown("### 📄 Upload Your Pension Documents")

document_types = st.multiselect(
    "What types of pension documents are you uploading? (This helps provide better answers)",
    [
        "Summary Plan Description (SPD)",
        "Pension Plan Document",
        "Annual Benefit Statement",
        "Individual Benefit Statement",
        "Plan Amendment",
        "QJSA/QPSA Notice",
        "Distribution Options",
        "Plan Summary",
        "Other Pension Document",
    ],
    help="Select all that apply to help the AI understand your document types",
)

uploaded_files = st.file_uploader(
    "Upload Pension Documents (PDF format)",
    type="pdf",
    accept_multiple_files=True,
    help="Upload SPDs, benefit statements, plan documents, and other pension-related PDFs",
)

if uploaded_files:
    with st.spinner("🔍 Processing and indexing your pension documents..."):
        documents = []
        new_files = []

        for uploaded_file in uploaded_files:
            file_content = uploaded_file.getvalue()
            file_hash = get_file_hash(file_content)

            if file_hash not in st.session_state.file_hashes:
                with tempfile.NamedTemporaryFile(
                    delete=False, suffix=".pdf"
                ) as temp_file:
                    temp_file.write(file_content)
                    temp_path = temp_file.name

                try:
                    docs = process_pdf(temp_path)
                    # Add document type metadata if provided
                    for doc in docs:
                        doc.metadata["document_types"] = document_types
                        doc.metadata["upload_timestamp"] = datetime.now().isoformat()

                    documents.extend(docs)
                    st.session_state.file_hashes.add(file_hash)
                    new_files.append(uploaded_file.name)
                    os.unlink(temp_path)
                except Exception as e:
                    st.error(f"Error processing {uploaded_file.name}: {str(e)}")
                    continue

        if documents:
            # Enhanced text splitting for pension documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", ". ", " ", ""],
                length_function=len,
                add_start_index=True,
            )

            splits = text_splitter.split_documents(documents)

            # Create or update FAISS vector store
            if st.session_state.vectorstore is None:
                st.session_state.vectorstore = FAISS.from_documents(
                    splits, embedding=embeddings
                )
            else:
                st.session_state.vectorstore.add_documents(splits)

            st.success(
                f"✅ Successfully processed {len(documents)} pages from {len(new_files)} pension documents"
            )
            st.session_state.processed_files.update(new_files)

            # Show document analysis summary
            with st.expander("📊 Document Analysis Summary"):
                st.write(f"*Total Pages Processed:* {len(documents)}")
                st.write(f"*Document Chunks Created:* {len(splits)}")
                st.write(
                    f"*Document Types:* {', '.join(document_types) if document_types else 'Not specified'}"
                )
                st.write(f"*Files:* {', '.join(new_files)}")

# Only proceed if API key is available and documents are processed
if groq_api_key and st.session_state.vectorstore:
    try:
        # Initialize Groq with pension-optimized settings
        llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name=selected_model,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=0.85,
            frequency_penalty=0.1,
            presence_penalty=0.1,
        )

        # Configure retriever for pension documents
        retriever = st.session_state.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": search_k,
                "fetch_k": min(20, search_k * 3),
                "lambda_mult": 0.7,  # Higher diversity for comprehensive pension info
            },
        )

        # Pension-specific contextual reformulation prompt
        contextualize_q_system_prompt = f"""You are a pension and retirement benefits expert assistant. Your role is to reformulate questions to be clear and comprehensive for pension document analysis.

        Current analysis focus: {analysis_focus}

        Guidelines:
        1. Understand the conversation history and current pension question
        2. Reformulate questions to be standalone while preserving pension-specific context
        3. Expand abbreviations and pension terminology for clarity
        4. Connect follow-up questions to previous pension discussions
        5. Never answer the question - only clarify and expand it for better document search
        6. Maintain focus on pension, retirement, and benefit-related topics
        """

        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )

        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_q_prompt
        )

        # Specialized pension QA system prompt
        qa_system_prompt = (
            """You are a specialized pension and retirement benefits advisor with deep expertise in pension plan documents, regulations, and calculations.

Current Analysis Focus: """
            + analysis_focus
            + """

Core Responsibilities:
1. *Pension Expertise*: Provide accurate, detailed information about pension benefits, eligibility, calculations, and requirements
2. *Document Analysis*: Analyze pension documents including SPDs, plan documents, benefit statements, and regulatory notices
3. *Benefit Calculations*: Help users understand how their benefits are calculated, including formulas and factors
4. *Retirement Planning*: Provide guidance on retirement timing, benefit optimization, and planning strategies

Response Guidelines:

🔍 *Information Accuracy*:
- ONLY use information from the uploaded pension documents
- Be precise with benefit amounts, dates, eligibility requirements, and calculations
- If information is unclear or missing, explicitly state this
- Always cite specific document sections and page numbers

💰 *Financial Information*:
- Clearly explain benefit calculation formulas
- Break down complex pension mathematics into understandable steps
- Highlight important factors affecting benefit amounts
- Distinguish between different types of benefits (normal retirement, early retirement, disability, survivor)

📅 *Timing and Eligibility*:
- Provide clear timelines for eligibility and vesting
- Explain the impact of different retirement dates on benefits
- Clarify any waiting periods or service requirements

⚖ *Regulatory Compliance*:
- Reference relevant pension laws and regulations when mentioned in documents
- Explain participant rights and protections
- Clarify required disclosures and notices

🎯 *Personalized Responses*:
- Tailor answers to the user's specific analysis focus: """
            + analysis_focus
            + """
- Connect different document sections when relevant
- Provide actionable insights and next steps

⚠ *Important Disclaimers*:
- Always remind users to verify official calculations with plan administrators
- Note when professional financial or legal advice may be needed
- Distinguish between general information and specific plan provisions

Document Context:
{context}

Conversation History:
{chat_history}

Question: {input}

Remember: Provide comprehensive, accurate pension information while being clear about limitations and the need for official verification of any benefit calculations or important decisions.
"""
        )

        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", qa_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )

        # Create enhanced chains for pension analysis
        question_answer_chain = create_stuff_documents_chain(
            llm,
            qa_prompt,
            document_prompt=ChatPromptTemplate.from_template(
                "Pension Document Section (Page {page}):\n{page_content}\n---"
            ),
        )

        rag_chain = create_retrieval_chain(
            history_aware_retriever, question_answer_chain
        )

        # Session history management
        def get_session_history(session_id: str) -> BaseChatMessageHistory:
            if session_id not in st.session_state.store:
                st.session_state.store[session_id] = ChatMessageHistory()
            return st.session_state.store[session_id]

        conversational_rag_chain = RunnableWithMessageHistory(
            rag_chain,
            get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
            output_messages_key="answer",
        )

        # Enhanced Chat Interface
        st.markdown("---")
        st.subheader("💬 Pension Q&A Chat")

        # Initialize chat history
        if "messages" not in st.session_state:
            st.session_state.messages = []

        # Display chat messages with pension-specific styling
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        # Handle quick question selection
        if selected_quick_question != "Select a question...":
            st.session_state.quick_question_selected = selected_quick_question

        # Accept user input with enhanced placeholder
        prompt_placeholder = "Ask about your pension benefits, eligibility, calculations, or retirement planning..."

        # Use quick question if selected
        if "quick_question_selected" in st.session_state:
            prompt = st.session_state.quick_question_selected
            del st.session_state.quick_question_selected
        else:
            prompt = st.chat_input(prompt_placeholder)

        if prompt:
            # Add user message to chat history
            st.session_state.messages.append({"role": "user", "content": prompt})
            # Display user message
            with st.chat_message("user"):
                st.markdown(prompt)

            # Display assistant response
            with st.chat_message("assistant"):
                with st.spinner("Analyzing your pension documents..."):
                    try:
                        session_history = get_session_history(session_id)

                        response = conversational_rag_chain.invoke(
                            {"input": prompt},
                            config={"configurable": {"session_id": session_id}},
                        )

                        # Display enhanced answer with pension-specific formatting
                        answer = response["answer"]
                        st.markdown(answer)

                        # Add assistant response to chat history
                        st.session_state.messages.append(
                            {"role": "assistant", "content": answer}
                        )

                        # Enhanced source display for pension documents
                        if "context" in response:
                            with st.expander("📋 Document References & Sources"):
                                for i, doc in enumerate(response["context"]):
                                    source = os.path.basename(
                                        doc.metadata.get("source", "Unknown Document")
                                    )
                                    page = doc.metadata.get("page", "N/A")
                                    doc_types = doc.metadata.get("document_types", [])

                                    st.subheader(f"Reference {i+1}: {source}")

                                    col1, col2 = st.columns(2)
                                    with col1:
                                        st.caption(f"📄 Page: {page}")
                                    with col2:
                                        if doc_types:
                                            st.caption(
                                                f"📋 Type: {', '.join(doc_types)}"
                                            )

                                    # Relevance score
                                    score = doc.metadata.get("score")
                                    if isinstance(score, (float, int)):
                                        st.caption(f"🎯 Relevance: {score:.2f}")

                                    # Document content with better formatting
                                    st.markdown("*Document Content:*")
                                    st.text_area(
                                        f"content_{i}",
                                        doc.page_content,
                                        height=150,
                                        disabled=True,
                                        key=f"doc_content_{i}",
                                    )

                                    if i < len(response["context"]) - 1:
                                        st.markdown("---")

                        # Pension-specific follow-up suggestions
                        if any(
                            keyword in prompt.lower()
                            for keyword in [
                                "benefit",
                                "retirement",
                                "pension",
                                "calculate",
                            ]
                        ):
                            with st.expander("💡 Related Questions You Might Ask"):
                                related_questions = [
                                    "How does this affect my Social Security benefits?",
                                    "What are my options if I leave before retirement?",
                                    "Are there any tax implications I should know about?",
                                    "What happens to my benefits if I become disabled?",
                                    "Can I get an estimate of my monthly retirement benefit?",
                                ]
                                for q in related_questions:
                                    if st.button(q, key=f"related_{hash(q)}"):
                                        st.rerun()

                    except Exception as e:
                        st.error(f"Error analyzing pension documents: {str(e)}")
                        st.info(
                            "Please try rephrasing your question or check if your documents were uploaded correctly."
                        )

        # Enhanced chat history management
        st.markdown("---")
        with st.expander("📜 Consultation History Management"):
            col1, col2 = st.columns(2)

            with col1:
                if st.button("🗑 Clear Current Session"):
                    if session_id in st.session_state.store:
                        st.session_state.store[session_id].clear()
                        st.session_state.messages = []
                        st.success("Consultation history cleared!")
                        st.rerun()

            with col2:
                if st.button("📊 Generate Consultation Summary"):
                    if st.session_state.messages:
                        summary_prompt = "Please provide a summary of the key pension topics discussed in this consultation session."
                        # This would generate a summary - simplified for this example
                        st.info(
                            "Summary generation feature - would analyze the conversation and provide key takeaways about pension topics discussed."
                        )

            if st.session_state.store.get(session_id):
                st.write(f"### Consultation Messages: {session_id}")
                message_count = len(st.session_state.store[session_id].messages)
                st.caption(f"Total messages in this session: {message_count}")

                # Export enhanced chat history
                if st.session_state.store[session_id].messages:
                    export_text = f"Pension Consultation Session: {session_id}\n"
                    export_text += f"Analysis Focus: {analysis_focus}\n"
                    export_text += (
                        f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                    )
                    export_text += "=" * 50 + "\n\n"

                    export_text += "\n\n".join(
                        [
                            f"{msg.type.upper()}:\n{msg.content}"
                            for msg in st.session_state.store[session_id].messages
                        ]
                    )

                    st.download_button(
                        label="📥 Export Pension Consultation",
                        data=export_text,
                        file_name=f"pension_consultation_{session_id}.txt",
                        mime="text/plain",
                    )

    except Exception as e:
        st.error(f"Error initializing the pension assistant: {str(e)}")
elif not groq_api_key:
    st.error(
        "Please configure your GROQ_API_KEY in Streamlit secrets to use the pension assistant."
    )
elif not st.session_state.vectorstore:
    st.info(
        "📄 Please upload your pension documents to start getting answers about your benefits and retirement planning."
    )

# Enhanced Document Management for Pension Documents
with st.expander("📁 Pension Document Management"):
    if st.session_state.processed_files:
        st.write("### 📋 Processed Pension Documents:")
        for i, file in enumerate(st.session_state.processed_files, 1):
            st.write(f"{i}. 📄 {file}")

        st.write("### 📊 Document Statistics:")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Documents", len(st.session_state.processed_files))
        with col2:
            if st.session_state.vectorstore:
                st.metric(
                    "Searchable Chunks", st.session_state.vectorstore.index.ntotal
                )
        with col3:
            st.metric("Document Types", len(document_types) if document_types else 0)

        if st.button("🗑 Clear All Pension Documents", type="secondary"):
            st.session_state.vectorstore = None
            st.session_state.processed_files = set()
            st.session_state.file_hashes = set()
            st.success("All pension documents cleared. You can upload new files.")
            st.rerun()
    else:
        st.info(
            "📄 No pension documents currently loaded. Upload your pension documents above to begin analysis."
        )

# Enhanced Footer with Pension-Specific Resources
st.markdown("---")
st.markdown("### 🔗 Additional Pension Resources")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(
        """
    *🏛 Government Resources:*
    - [Department of Labor - EBSA](https://www.dol.gov/agencies/ebsa)
    - [PBGC - Pension Benefit Guaranty Corporation](https://www.pbgc.gov)
    - [IRS Retirement Plans](https://www.irs.gov/retirement-plans)
    """
    )

with col2:
    st.markdown(
        """
    *📚 Educational Materials:*
    - [Understanding Your Pension](https://www.dol.gov/sites/dolgov/files/ebsa/about-ebsa/our-activities/resource-center/publications/understanding-retirement-plan-fees-and-expenses.pdf)
    - [Retirement Planning Guidelines](https://www.consumer.gov/content/retirement-planning)
    - [Social Security Integration](https://www.ssa.gov)
    """
    )

with col3:
    st.markdown(
        """
    *⚠ Important Reminders:*
    - Always verify calculations with your plan administrator
    - Consider consulting a financial advisor for major decisions
    - Keep copies of all pension-related documents
    """
    )

st.markdown("---")
st.caption(
    """
🏛 Pension Document Assistant | Specialized AI for Retirement Benefits Analysis | 
Always consult your plan administrator for official benefit information | 
Built with Groq & LangChain
"""
)
