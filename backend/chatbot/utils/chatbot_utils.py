import os
from langchain_google_genai import ChatGoogleGenerativeAI

from users.models import IncomeStatus, RetirementInfo
from chatbot.models import Chat
from chatbot.prompts import ANSWER_USER_QUERY_PROMPT, INTERPRETER_USER_REQUEST
from chatbot.utils.text_utils import extract_json_from_text


class ChatBot:
    def __init__(self, chat_id: int, user_id: int):
        # self.chat = Chat.objects.get(id=chat_id)
        self.user_id = user_id

    def reply(self, user_message, file):
        has_uploaded_document = True if file else False

        intent = self._get_message_intent(user_message, has_uploaded_document)

        if intent.get("category") == "INCOMPLETE_REQUEST":
            return "I couldn't understand that. Could you please rephrase it clearly?"

        if intent.get("category") == "QUESTION":
            answer = self._answer_user_query(user_message)
            return answer

        print(intent)

        return "Can you rephrase your question properly."

    def _answer_user_query(self, user_message: str, file=None) -> str:
        """
        Answers a user query by providing context from IncomeStatus and RetirementInfo.
        If no context exists, still tries to answer the query.
        """
        llm = ChatGoogleGenerativeAI(
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            model="gemini-2.5-flash",
            temperature=0.6,
        )

        # Build context from DB
        context_parts = []
        try:
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

        # Merge context
        context = (
            "\n".join(context_parts)
            if context_parts
            else "No user income or retirement information available."
        )

        print(context)

        # Final prompt
        prompt = ANSWER_USER_QUERY_PROMPT.format(
            user_query=user_message.strip(), context=context
        )

        try:
            response = llm.predict(prompt).strip()
            return response if response else "Sorry, I couldn't come up with an answer."
        except Exception as e:
            print("An error occurred while generating a response: ", e)
            return f"An error occurred while generating a response"

    def _get_message_intent(self, user_message, has_uploaded_document=False):
        prompt = INTERPRETER_USER_REQUEST.format(
            user_message=user_message.strip(),
            has_uploaded_document=has_uploaded_document,
        )
        interpreter_llm = ChatGoogleGenerativeAI(
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            model="gemini-2.5-flash",
            temperature=0.7,
        )
        response = interpreter_llm.predict(prompt)

        print(response)

        try:
            data = extract_json_from_text(response)

            if "category" not in data:
                return {"category": "INCOMPLETE"}

            return data

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"category": "INCOMPLETE", "error": str(e)}
