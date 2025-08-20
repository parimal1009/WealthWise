import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from chatbot.utils.chatbot_utils import ChatBot


@csrf_exempt
def chat_with_bot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        chat_id = 1

        # Extract message from form-data or JSON
        if request.content_type.startswith("multipart/form-data"):
            user_message = request.POST.get("user_message", "").strip()
            uploaded_file = request.FILES.get("files", None)
        else:
            data = json.loads(request.body)
            user_message = data.get("user_message", "").strip()
            uploaded_file = None

        if not user_message and not uploaded_file:
            return JsonResponse({"error": "user_message or file is required"}, status=400)

        print(f"Uploaded file: {uploaded_file}")

        # Create ChatBot instance
        bot = ChatBot(chat_id=chat_id, user_id=request.user.id if request.user.is_authenticated else None)

        # Pass both text + file
        response_text = bot.reply(user_message=user_message, file=uploaded_file)

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat_id,
                "user_id": request.user.id if request.user.is_authenticated else None,
                "bot_reply": response_text,
            }
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
