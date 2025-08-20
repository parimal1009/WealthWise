import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from chatbot.utils.chatbot_utils import ChatBot


@csrf_exempt
def chat_with_bot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        chat_id = 1
        # Extract user message
        data = json.loads(request.body)
        user_message = data.get("user_message", "").strip()
        if not user_message:
            return JsonResponse({"error": "user_message is required"}, status=400)

        # Extract file if provided
        uploaded_file = request.FILES.get("file", None)

        # Create ChatBot instance
        bot = ChatBot(chat_id=chat_id, user_id=request.user.id)

        # Get reply
        response_text = bot.reply(user_message=user_message, file=uploaded_file)

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat_id,
                "bot_reply": response_text,
            }
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
