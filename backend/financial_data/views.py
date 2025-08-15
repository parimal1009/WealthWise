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

# Initialize KiteConnect with redirect URL
kite = KiteConnect(api_key=API_KEY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_login_url(request):
    """Get Zerodha login URL"""
    try:
        # Get the login URL from KiteConnect
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
        
        print(f"Processing callback with request_token: {request_token[:10]}...")
        
        # Check if user already has a Zerodha account linked
        try:
            existing_user = ZerodhaUser.objects.get(user=request.user)
            print(f"User already has Zerodha account linked: {existing_user.user_name}")
            return Response({
                "message": "Zerodha account already linked",
                "profile": {
                    "user_name": existing_user.user_name,
                    "user_id": existing_user.zerodha_user_id,
                    "email": existing_user.email,
                    "broker": existing_user.broker
                }
            })
        except ZerodhaUser.DoesNotExist:
            pass  # Continue with linking process
        
        # Check if this token was already processed (prevent duplicate processing)
        from django.core.cache import cache
        cache_key = f"processed_token_{request_token}"
        if cache.get(cache_key):
            print(f"Token {request_token[:10]}... already processed, returning success")
            # Get the user that was created with this token
            try:
                existing_user = ZerodhaUser.objects.get(user=request.user)
                return Response({
                    "message": "Zerodha account already linked",
                    "profile": {
                        "user_name": existing_user.user_name,
                        "user_id": existing_user.zerodha_user_id,
                        "email": existing_user.email,
                        "broker": existing_user.broker
                    }
                })
            except ZerodhaUser.DoesNotExist:
                return Response({
                    "error": "Token already processed but user not found. Please try connecting again.",
                    "code": "TOKEN_ALREADY_PROCESSED"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark token as being processed
        cache.set(cache_key, True, timeout=300)  # 5 minutes timeout
        
        # Clean up old processed tokens (older than 10 minutes)
        try:
            from django.core.cache import cache
            # This is a simple cleanup - in production, you might want a more sophisticated approach
            # For now, we'll rely on the timeout mechanism
        except Exception as e:
            print(f"Cache cleanup error: {e}")
        
        data = kite.generate_session(request_token, api_secret=API_SECRET)
        access_token = data["access_token"]
        
        print(f"Generated access_token: {access_token[:10]}...")
        
        # Get user profile
        kite.set_access_token(access_token)
        profile = kite.profile()
        
        print(f"Retrieved profile for user: {profile.get('user_name', 'Unknown')}")
        
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
        
        print(f"Zerodha user {'created' if created else 'updated'} successfully")
        
        return Response({
            "message": "Login successful",
            "access_token": access_token,
            "profile": profile
        })
        
    except Exception as e:
        print(f"Error in kite_callback: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a token expiration error
        if "Token is invalid or has expired" in str(e):
            # Check if user was actually created despite the error
            try:
                existing_user = ZerodhaUser.objects.get(user=request.user)
                print(f"User was created despite token error: {existing_user.user_name}")
                return Response({
                    "message": "Zerodha account already linked",
                    "profile": {
                        "user_name": existing_user.user_name,
                        "user_id": existing_user.zerodha_user_id,
                        "email": existing_user.email,
                        "broker": existing_user.broker
                    }
                })
            except ZerodhaUser.DoesNotExist:
                return Response({
                    "error": "Request token has expired. Please try connecting again.",
                    "code": "TOKEN_EXPIRED"
                }, status=status.HTTP_400_BAD_REQUEST)
        
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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_zerodha(request):
    """Disconnect Zerodha account"""
    try:
        zerodha_user = ZerodhaUser.objects.get(user=request.user)
        zerodha_user.delete()
        return Response({"message": "Zerodha account disconnected successfully"})
    except ZerodhaUser.DoesNotExist:
        return Response({"error": "No Zerodha account linked"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



