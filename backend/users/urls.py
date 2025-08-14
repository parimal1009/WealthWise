from django.urls import path
from . import views

urlpatterns = [
    path('google/login/', views.google_login, name='google_login'),
    path('callback/', views.oauth_callback, name='oauth_callback'),
    path('verify/', views.verify_token, name='verify_token'),
    path('logout/', views.logout_view, name='logout'),
]