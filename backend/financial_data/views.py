import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from kiteconnect import KiteConnect
from .models import ZerodhaUser
import json


# Initialize KiteConnect
API_KEY = os.getenv("KITE_API_KEY")
API_SECRET = os.getenv("KITE_API_SECRET")

if not API_KEY or not API_SECRET:
    raise Exception("Please set KITE_API_KEY and KITE_API_SECRET in your environment variables.")

kite = KiteConnect(api_key=API_KEY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_login_url(request):
    """Get Zerodha login URL"""
    try:
        login_url = kite.login_url()
        return Response({"login_url": login_url})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kite_callback(request):
    """Handle Zerodha callback and generate session"""
    try:
        request_token = request.GET.get('request_token')
        if not request_token:
            return Response({"error": "request_token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        data = kite.generate_session(request_token, api_secret=API_SECRET)
        access_token = data["access_token"]
        
        # Get user profile
        kite.set_access_token(access_token)
        profile = kite.profile()
        
        # Save or update Zerodha user data
        zerodha_user, created = ZerodhaUser.objects.get_or_create(
            user=request.user,
            defaults={
                'access_token': access_token,
                'api_key': API_KEY,
                'zerodha_user_id': profile.get('user_id'),
                'user_name': profile.get('user_name'),
                'email': profile.get('email'),
                'mobile': profile.get('mobile'),
                'broker': profile.get('broker'),
                'products': profile.get('products', []),
                'order_types': profile.get('order_types', []),
                'exchanges': profile.get('exchanges', [])
            }
        )
        
        if not created:
            # Update existing user
            zerodha_user.access_token = access_token
            zerodha_user.zerodha_user_id = profile.get('user_id')
            zerodha_user.user_name = profile.get('user_name')
            zerodha_user.email = profile.get('email')
            zerodha_user.mobile = profile.get('mobile')
            zerodha_user.broker = profile.get('broker')
            zerodha_user.products = profile.get('products', [])
            zerodha_user.order_types = profile.get('order_types', [])
            zerodha_user.exchanges = profile.get('exchanges', [])
            zerodha_user.save()
        
        return Response({
            "message": "Login successful",
            "access_token": access_token,
            "profile": profile
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kite_profile(request):
    """Get Zerodha user profile"""
    try:
        # Get access token from stored user data
        try:
            zerodha_user = ZerodhaUser.objects.get(user=request.user)
        except ZerodhaUser.DoesNotExist:
            return Response({"error": "Zerodha account not linked"}, status=status.HTTP_404_NOT_FOUND)
        
        kite.set_access_token(zerodha_user.access_token)
        profile = kite.profile()
        
        return Response(profile)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
