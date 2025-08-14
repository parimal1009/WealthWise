import { API_BASE_URL } from '../utils/constants';

class AuthService {
  async googleLogin() {
  // Add state parameter to protect against CSRF
  const state = Math.random().toString(36).substring(2);
  localStorage.setItem('oauth_state', state);
  
  // Redirect directly to Google OAuth with state
  window.location.href = `${API_BASE_URL}/auth/google/login/`;
}

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Handle OAuth callback (call this from a callback route)
  // authservice.js
  handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get tokens and user data from URL
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refresh');
  const userJson = urlParams.get('user');

  if (token && userJson) {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
      return { user, token };
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  return null;
}
}

export const authService = new AuthService();