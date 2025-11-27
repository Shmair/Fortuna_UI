import { useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    (async () => {
      try {debugger
        await supabase.auth.exchangeCodeForSession(window.location.href);
        navigate('/'); // or '/' - redirect to your main page
      } catch (error) {
        console.error('Error exchanging code for session:', error);
        navigate('/'); // redirect to home on error
      }
    })();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg">מאמת חשבון...</div>
        <div className="text-sm text-gray-500 mt-2">אנא המתן</div>
      </div>
    </div>
  );
}
