from django.urls import path
from . import views

urlpatterns = [
    path('kite/login-url/', views.get_login_url, name='kite_login_url'),
    path('kite/callback/', views.kite_callback, name='kite_callback'),
    path('kite/profile/', views.kite_profile, name='kite_profile'),
    path('kite/disconnect/', views.disconnect_zerodha, name='disconnect_zerodha'),
    path('risk/calculate/', views.calculate_risk_tolerance, name='calculate_risk'),
    path('risk/profile/', views.get_risk_profile, name='get_risk_profile'),
]