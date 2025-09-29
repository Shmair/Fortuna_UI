
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Auth({ }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const justSignedIn = useRef(false);
  
  // Email/password form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        justSignedIn.current = true;
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);


  if (loading) return <div>טוען...</div>;
  // Only show greeting if just signed in during this session
  if (user && user.id && justSignedIn.current) return <div>שלום, {user.user_metadata?.full_name || user.email}!</div>;

  const handleOAuthSignIn = (provider) => {
    supabase.auth.signInWithOAuth({
      provider,
      options: { prompt: 'select_account' }
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const authRedirect = process.env.REACT_APP_AUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        }, {
          emailRedirectTo: authRedirect
        });
        if (error) throw error;
        // Supabase behavior: if email already exists, `user.identities` is an empty array
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          const existsError = new Error('USER_EXISTS');
          // @ts-ignore annotate a status-like code for downstream handling
          existsError.status = 409;
          throw existsError;
        }
        setSuccess('נשלח אימייל לאימות החשבון');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      if (isSignUp && (message.includes('already') || message.includes('exists') || error?.status === 422)) {
        setSuccess('');
        setError('המשתמש כבר קיים. נסה להתחבר.');
      } else if (isSignUp && error?.message === 'USER_EXISTS') {
        setSuccess('');
        setError('המשתמש כבר קיים. נסה להתחבר.');
      } else {
        setError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');
    setForgotLoading(true);
    try {
      const resetRedirect = process.env.REACT_APP_AUTH_RESET_URL || `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirect,
      });
      if (error) throw error;
      setSuccess('שלחנו לינק לאיפוס סיסמה לכתובת האימייל.');
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת מייל לאיפוס סיסמה');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    justSignedIn.current = false;
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-xl font-bold mb-2">התחברות למערכת</h2>
      
      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="w-full max-w-md space-y-4">
        <div>
          <input
            type="email"
            placeholder="כתובת אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        
        {success && (
          <div className="text-green-600 text-sm text-center">{success}</div>
        )}
        
        <button
          type="submit"
          disabled={authLoading}
          className="w-full bg-green-600 text-white px-6 py-2 rounded font-bold disabled:opacity-50"
        >
          {authLoading ? 'טוען...' : (isSignUp ? 'הרשמה' : 'התחברות')}
        </button>
        
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-blue-600 text-sm underline"
        >
          {isSignUp ? 'יש לך כבר חשבון? התחבר' : 'אין לך חשבון? הירשם'}
        </button>

        {/* Mode hint */}
        <div className="text-xs text-gray-500 text-center">
          מצב: {isSignUp ? 'הרשמה' : 'התחברות'}
        </div>

        {/* Forgot password (only on login mode) */}
        {!isSignUp && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={forgotLoading || !email}
            className="w-full text-blue-600 text-xs underline disabled:opacity-50"
          >
            {forgotLoading ? 'שולח…' : 'שכחת סיסמה? שלח לינק לאיפוס'}
          </button>
        )}
      </form>
      
      <div className="text-gray-500 text-sm">או</div>
      
      {/* OAuth Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          onClick={() => handleOAuthSignIn('google')}
        >
          התחברות עם Google
        </button>
        <button
          className="bg-gray-800 text-white px-6 py-2 rounded font-bold"
          onClick={() => handleOAuthSignIn('github')}
        >
          התחברות עם GitHub
        </button>
      </div>
      
      {/* Sign Out Button */}
      {user && (
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-6 py-2 rounded font-bold mt-4"
        >
          התנתקות
        </button>
      )}
    </div>
  );
}
