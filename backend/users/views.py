# ========== users/views.py ==========
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialApp
import json
from django.shortcuts import redirect
from django.urls import reverse
from urllib.parse import urlencode
from urllib.parse import quote


@csrf_exempt
def google_login(request):
    """Directly redirect to Google OAuth without intermediate page"""
    # Build the direct Google OAuth URL
    params = {
        'process': 'login',
        'next': request.build_absolute_uri(reverse('oauth_callback'))
    }
    google_login_url = f"/accounts/google/login/?{urlencode(params)}"
    return redirect(google_login_url)

@csrf_exempt 
def oauth_callback(request):
    """Handle OAuth callback and create JWT token"""
    if not request.user.is_authenticated:
        return redirect("http://localhost:3000/login?error=auth_failed&reason=user_not_authenticated")
    
    try:
        refresh = RefreshToken.for_user(request.user)
        user_data = {
            'id': request.user.id,
            'email': request.user.email,
            'name': request.user.get_full_name() or request.user.username,
        }
        
        # URL encode the user data
        user_json = json.dumps(user_data)
        user_encoded = quote(user_json)
        
        redirect_url = (
            f"http://localhost:3000/auth/callback?"
            f"token={str(refresh.access_token)}&"
            f"refresh={str(refresh)}&"
            f"user={user_encoded}"
        )
        return redirect(redirect_url)
        
    except Exception as e:
        return redirect(
            f"http://localhost:3000/login?"
            f"error=auth_failed&reason=exception&message={str(e)}"
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """Verify JWT token and return user data"""
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.get_full_name() or user.username,
    })

@api_view(['POST'])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({'message': 'Logged out successfully'})