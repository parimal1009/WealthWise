import os
import json
import requests  # Add this import
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialApp, SocialAccount, SocialToken  # Add SocialAccount, SocialToken
from django.shortcuts import redirect
from django.urls import reverse
from urllib.parse import urlencode
from urllib.parse import quote


def get_google_data(user):
    """Get additional data from Google People API"""
    try:
        social_account = SocialAccount.objects.get(user=user, provider='google')
        social_token = SocialToken.objects.get(account=social_account)
        
        # Basic data from OAuth
        basic_data = {
            "google_id": social_account.extra_data.get('sub'),
            "profile_picture": social_account.extra_data.get('picture'),
            "given_name": social_account.extra_data.get('given_name'),
            "family_name": social_account.extra_data.get('family_name'),
        }
        
        # Call People API for additional data
        headers = {'Authorization': f'Bearer {social_token.token}'}
        url = 'https://people.googleapis.com/v1/people/me'
        params = {'personFields': 'birthdays,genders,addresses'}
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            people_data = response.json()
            
            # Extract birthday
            if 'birthdays' in people_data:
                for birthday in people_data['birthdays']:
                    if birthday.get('metadata', {}).get('primary'):
                        date_info = birthday.get('date', {})
                        if all(k in date_info for k in ['year', 'month', 'day']):
                            basic_data['birthday'] = f"{date_info['year']}-{date_info['month']:02d}-{date_info['day']:02d}"
                            # Calculate age
                            from datetime import date
                            birth_date = date(date_info['year'], date_info['month'], date_info['day'])
                            today = date.today()
                            basic_data['age'] = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                        break
            
            # Extract gender
            if 'genders' in people_data:
                for gender in people_data['genders']:
                    if gender.get('metadata', {}).get('primary'):
                        basic_data['gender'] = gender.get('value', '').lower()
                        break
            
            # Extract location
            if 'addresses' in people_data:
                for address in people_data['addresses']:
                    if address.get('metadata', {}).get('primary'):
                        basic_data['country'] = address.get('country')
                        break
        
        return basic_data
        
    except:
        return {}


@csrf_exempt
def google_login(request):
    """Directly redirect to Google OAuth without intermediate page"""
    # Build the direct Google OAuth URL
    params = {
        "process": "login",
        "next": request.build_absolute_uri(reverse("oauth_callback")),
    }
    google_login_url = f"/accounts/google/login/?{urlencode(params)}"
    return redirect(google_login_url)


@csrf_exempt
def oauth_callback(request):
    """Handle OAuth callback and create JWT token"""
    site_url = os.environ.get("SITE_URL", "http://localhost:3000")
    if not request.user.is_authenticated:
        return redirect(
            f"{site_url}/login?error=auth_failed&reason=user_not_authenticated"
        )

    try:
        refresh = RefreshToken.for_user(request.user)
        
        # Get Google data
        google_data = get_google_data(request.user)
        
        user_data = {
            "id": request.user.id,
            "email": request.user.email,
            "name": request.user.get_full_name() or request.user.username,
            **google_data  # Add all Google data
        }

        # URL encode the user data
        user_json = json.dumps(user_data)
        user_encoded = quote(user_json)

        redirect_url = (
            f"{site_url}/auth/callback?"
            f"token={str(refresh.access_token)}&"
            f"refresh={str(refresh)}&"
            f"user={user_encoded}"
        )
        return redirect(redirect_url)

    except Exception as e:
        return redirect(
            f"{site_url}/login?" f"error=auth_failed&reason=exception&message={str(e)}"
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """Verify JWT token and return user data"""
    user = request.user
    google_data = get_google_data(user)
    
    return Response(
        {
            "id": user.id,
            "email": user.email,
            "name": user.get_full_name() or user.username,
            **google_data  # Add all Google data
        }
    )


@api_view(["POST"])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({"message": "Logged out successfully"})