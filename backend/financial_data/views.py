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
from .models import RiskProfile
from .stocks_list import stocks

from config import KITE_API_KEY, KITE_API_SECRET

# Initialize KiteConnect
API_KEY = KITE_API_KEY
API_SECRET = KITE_API_SECRET

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

# ---- Risk Calculation ----
# Remove nan entries and normalize to uppercase
stocks = [s.upper() for s in stocks if str(s).lower() != 'nan']

# --- Risk Calculation Functions ---
def get_cap_category(stock_name):
    stock_name = stock_name.upper()
    if stock_name in stocks:
        idx = stocks.index(stock_name)
        if 0 <= idx <= 99:
            return "Large Cap"
        elif 100 <= idx <= 249:
            return "Mid Cap"
        else:
            return "Small Cap"
    return None

cap_scores = {"Large Cap": 1, "Mid Cap": 2, "Small Cap": 3}

def calc_market_cap_score(holdings=None, total_stock_value=None, mode="symbol"):
    """
    holdings: dict {stock_symbol: holding_value}
    total_stock_value: float
    mode: "symbol" or "total"
    """
    if mode == "total":
        # If only total value is provided, assume mid-risk stock allocation (Mid Cap)
        return 2.0  # default risk score for unknown allocation
    elif mode == "symbol" and holdings:
        total_stock_value = sum(holdings.values())
        if total_stock_value == 0:
            return 0  # no stocks
        weights = {"Large Cap": 0, "Mid Cap": 0, "Small Cap": 0}
        for stock, value in holdings.items():
            cap = get_cap_category(stock)
            if cap:
                weights[cap] += value
        for cap in weights:
            weights[cap] = weights[cap] / total_stock_value if total_stock_value > 0 else 0
        risk_score = sum(weights[cap] * cap_scores[cap] for cap in weights)
        return risk_score
    return 0

def calc_fd_score(fd_value, stock_value):
    total = fd_value + stock_value
    if total == 0:
        return 0
    
    safety_ratio = fd_value / total
    if safety_ratio > 0.75:
        return 1.0
    elif 0.50 <= safety_ratio <= 0.75:
        return 1.5
    elif 0.25 <= safety_ratio < 0.50:
        return 2.0
    else:
        return 3.0

def risk_tolerance_bucket(score):
    score = round(score, 2)
    if 1.00 <= score <= 1.50:
        return "Conservative (Low Risk)"
    elif 1.51 <= score <= 2.50:
        return "Moderate"
    elif 2.51 <= score <= 3.00:
        return "Aggressive (High Risk)"
    return "Unknown"

def calc_mf_score(mf_value, stock_value, fd_value):
    total = mf_value + stock_value + fd_value
    if total == 0:
        return 0
    
    mf_score = 1.8
    weight = mf_value / total
    return mf_score * weight

def calc_final_risk(fd_value, holdings=None, mf_value=0, mode="symbol", total_stock_value=None):
    """
    mode: "symbol" or "total"
    holdings: dict of {symbol: value} (used if mode="symbol")
    total_stock_value: float (used if mode="total")
    """
    if mode == "total":
        stock_value = total_stock_value or 0
    else:
        stock_value = sum(holdings.values()) if holdings else 0

    total_assets = fd_value + stock_value + mf_value
    if total_assets == 0:
        return 0, "No Investments"

    risk_a = calc_market_cap_score(holdings, total_stock_value, mode)
    risk_b = calc_fd_score(fd_value, stock_value)
    risk_c = calc_mf_score(mf_value, stock_value, fd_value)

    weights = {
        "stocks": stock_value / total_assets if total_assets > 0 else 0,
        "fd": fd_value / total_assets if total_assets > 0 else 0,
        "mf": mf_value / total_assets if total_assets > 0 else 0,
    }

    final_score = (
        risk_a * weights["stocks"] +
        risk_b * weights["fd"] +
        risk_c  # already weighted
    )

    return final_score, risk_tolerance_bucket(final_score)

# --- API Endpoint to Calculate Risk Tolerance ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_risk_tolerance(request):
    """Calculate risk tolerance based on either Zerodha holdings or manual input"""
    try:
        mode = request.data.get('mode', 'zerodha')  # 'zerodha' or 'manual'
        
        if mode == 'zerodha':
            # Get Zerodha user data
            try:
                zerodha_user = ZerodhaUser.objects.get(user=request.user)
            except ZerodhaUser.DoesNotExist:
                return Response({"error": "Zerodha account not linked"}, status=status.HTTP_404_NOT_FOUND)
            
            # Set access token
            kite.set_access_token(zerodha_user.access_token)
            
            # Fetch stock holdings from Zerodha
            try:
                holdings_response = kite.holdings()
                stock_holdings = {}
                total_stock_value = 0
                
                for holding in holdings_response:
                    if holding['product'] == 'CNC':  # Only consider delivery holdings
                        symbol = holding['tradingsymbol']
                        current_value = holding['quantity'] * holding['last_price']
                        stock_holdings[symbol] = current_value
                        total_stock_value += current_value
                
            except Exception as e:
                return Response({"error": f"Failed to fetch stock holdings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Fetch mutual fund holdings from Zerodha
            try:
                mf_holdings_response = kite.mf_holdings()
                total_mf_value = 0
                
                for mf_holding in mf_holdings_response:
                    total_mf_value += mf_holding['quantity'] * mf_holding['average_price']
                    
            except Exception as e:
                # If MF API fails, continue with 0 value
                total_mf_value = 0
                print(f"MF holdings fetch failed: {str(e)}")
            
            # For FD, use a hardcoded value (you can make this configurable later)
            fd_value = request.data.get('fd_value', 500000)  # Use provided FD value or default
            
            # Calculate risk tolerance
            risk_score, risk_category = calc_final_risk(
                fd_value, holdings=stock_holdings, mf_value=total_mf_value, mode="symbol"
            )
            
            # Save risk profile
            risk_profile, created = RiskProfile.objects.update_or_create(
                user=request.user,
                defaults={
                    'risk_score': risk_score,
                    'risk_category': risk_category,
                    'stock_exposure': stock_holdings,
                    'mf_exposure': {'total_value': total_mf_value},
                    'fd_value': fd_value,
                    'calculation_mode': 'zerodha'
                }
            )
            
            return Response({
                "mode": "zerodha",
                "risk_score": round(risk_score, 2),
                "risk_category": risk_category,
                "stock_holdings_value": total_stock_value,
                "mf_holdings_value": total_mf_value,
                "fd_value": fd_value,
                "total_portfolio_value": total_stock_value + total_mf_value + fd_value,
                "stock_breakdown": stock_holdings,
                "calculated_at": risk_profile.last_calculated.isoformat()
            })
            
        elif mode == 'manual':
            # Get manual input values
            fd_value = request.data.get('fd_value', 0)
            stock_value = request.data.get('stock_value', 0)
            mf_value = request.data.get('mf_value', 0)
            
            # Validate inputs
            if not all(isinstance(val, (int, float)) for val in [fd_value, stock_value, mf_value]):
                return Response({"error": "All values must be numbers"}, status=status.HTTP_400_BAD_REQUEST)
            
            if fd_value < 0 or stock_value < 0 or mf_value < 0:
                return Response({"error": "Values cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate risk tolerance using total value mode
            risk_score, risk_category = calc_final_risk(
                fd_value, mf_value=mf_value, mode="total", total_stock_value=stock_value
            )
            
            # Save risk profile
            risk_profile, created = RiskProfile.objects.update_or_create(
                user=request.user,
                defaults={
                    'risk_score': risk_score,
                    'risk_category': risk_category,
                    'stock_exposure': {'total_value': stock_value},
                    'mf_exposure': {'total_value': mf_value},
                    'fd_value': fd_value,
                    'calculation_mode': 'manual'
                }
            )
            
            return Response({
                "mode": "manual",
                "risk_score": round(risk_score, 2),
                "risk_category": risk_category,
                "stock_value": stock_value,
                "mf_value": mf_value,
                "fd_value": fd_value,
                "total_portfolio_value": stock_value + mf_value + fd_value,
                "calculated_at": risk_profile.last_calculated.isoformat()
            })
            
        else:
            return Response({"error": "Invalid mode. Use 'zerodha' or 'manual'"}, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        print(f"Error in calculate_risk_tolerance: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_risk_profile(request):
    """Get user's risk profile"""
    try:
        risk_profile = RiskProfile.objects.get(user=request.user)
        return Response({
            "risk_score": risk_profile.risk_score,
            "risk_category": risk_profile.risk_category,
            "last_calculated": risk_profile.last_calculated,
            "stock_exposure": risk_profile.stock_exposure,
            "mf_exposure": risk_profile.mf_exposure,
            "fd_value": risk_profile.fd_value,
            "calculation_mode": risk_profile.calculation_mode
        })
    except RiskProfile.DoesNotExist:
        return Response({"error": "Risk profile not calculated yet"}, status=status.HTTP_404_NOT_FOUND)