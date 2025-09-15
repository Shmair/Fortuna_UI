
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Auth({ }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const justSignedIn = useRef(false);

  useEffect(() => {
    setLoading(false);
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <h2 className="text-xl font-bold mb-2">התחברות למערכת</h2>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded font-bold mb-2"
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
  );
}
