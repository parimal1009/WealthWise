import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        const reason = searchParams.get('reason') || 'unknown';
        const message = searchParams.get('message') || 'Authentication failed';
        navigate(`/login?error=${error}&reason=${reason}&message=${message}`);
        return;
      }

      try {
        const result = authService.handleOAuthCallback();
        if (result) {
          setUser(result.user);
          navigate('/dashboard');
        } else {
          navigate('/login?error=auth_failed&reason=no_token');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate(`/login?error=callback_error&message=${error.message}`);
      }
    };

    handleCallback();
  }, [navigate, setUser, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-4">Completing sign in...</span>
    </div>
  );
};

export default OAuthCallback;