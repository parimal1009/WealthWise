import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableSequence

from users.models import UserData, IncomeStatus, RetirementInfo
from chatbot.models import Chat
from chatbot.prompts import ANSWER_USER_QUERY_PROMPT, INTERPRETER_USER_REQUEST
from chatbot.utils.text_utils import extract_json_from_text

from config import GOOGLE_API_KEY
from dotenv import load_dotenv

load_dotenv()


class ChatBot:
    def __init__(self, chat_id: int, user_id: int):
        # self.chat = Chat.objects.get(id=chat_id)
        self.user_id = user_id

    def reply(self, user_message, file):
        has_uploaded_document = True if file else False

        # Save user message to chat history
        self._save_message_to_history(user_message, "user")

        intent = self._get_message_intent(user_message, has_uploaded_document)

        if intent.get("category") == "INCOMPLETE_REQUEST":
            response = (
                "I couldn't understand that. Could you please rephrase it clearly?"
            )
            self._save_message_to_history(response, "assistant")
            return response

        if intent.get("category") == "QUESTION":
            answer = self._answer_user_query(user_message)
            self._save_message_to_history(answer, "assistant")
            return answer

        if intent.get("category") == "GENERAL":
            answer = self._answer_user_query(user_message)
            self._save_message_to_history(answer, "assistant")
            return answer

        response = "Can you rephrase your question properly."
        self._save_message_to_history(response, "assistant")
        return response

    def _answer_user_query(
        self, user_message: str, file=None, max_history_messages=10
    ) -> str:
        """
        Answers a user query by providing context from IncomeStatus, RetirementInfo, and conversation history.
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
            return f"An error occurred while generating a response"

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

    def clear_conversation_history(self):
        """
        Clears all conversation history for the current user.
        """
        try:
            Chat.objects.filter(user_id=self.user_id).delete()
            return True
        except Exception as e:
            print(f"Error clearing conversation history: {e}")
            return False

    def get_conversation_count(self) -> int:
        """
        Returns the total number of messages in the conversation history.
        """
        try:
            return Chat.objects.filter(user_id=self.user_id).count()
        except Exception as e:
            print(f"Error getting conversation count: {e}")
            return 0
