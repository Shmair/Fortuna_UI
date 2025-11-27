import { useState, FormEvent } from 'react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabaseClient';

type LoginCardProps = {
  onLogin?: (email: string, password: string) => void;
  onGoogle?: () => void;
  onSignup?: () => void;
  onForgot?: () => void;
};

export default function LoginCard({ onLogin, onGoogle, onSignup, onForgot }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleOAuthSignIn = (provider: Provider) => {
    onGoogle?.();
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        queryParams: { prompt: 'select_account' }
      }
    });
  };
  return (
    <div className="50-h-screen flex items-center justify-center bg-gray-50">
  <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-2xl h-[540px] flex flex-col items-center justify-center">
  <div className="bg-blue-100 rounded-full p-2 mb-2">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v1a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1m4 4l-4-4m0 0l4-4m-4 4h12" />
            </svg>
          </div>
        </div>
  <h2 className="text-2xl font-extrabold text-gray-900 mb-0">Welcome to <span className="font-black">RefunD</span></h2>
  <div className="text-gray-500 mb-3">Sign in to continue</div>
        <button
          className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 mb-2 font-semibold hover:bg-gray-100 transition"
          onClick={() => handleOAuthSignIn('google')}
        >
          <span className="mr-2 flex items-center justify-center rounded-full bg-white p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.82-.07-1.64-.21-2.44H12v4.62h6.48a5.55 5.55 0 01-2.4 3.64v3h3.88c2.27-2.08 3.53-5.14 3.53-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.63 7.63 0 01-11.35-4 7.68 7.68 0 010-4.83H.7v3.04A12 12 0 0012 24z"
              />
              <path
                fill="#FBBC05"
                d="M4.65 9.26a7.2 7.2 0 010-4.83V1.39H.7a12.01 12.01 0 000 10.22l3.95-3.03z"
              />
              <path
                fill="#EA4335"
                d="M12 4.73c1.76 0 3.35.61 4.6 1.81l3.43-3.43C17.94 1.06 15.22 0 12 0 7.3 0 3.06 2.69.7 6.61l3.95 3.04A7.63 7.63 0 0112 4.73z"
              />
            </svg>
          </span>
          Continue with Google
        </button>
  <div className="flex items-center w-full my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
  <form className="w-full mt-1" onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onLogin && onLogin(email, password); }}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg py-2 font-bold text-lg hover:bg-gray-800 transition mb-1"
          >
            Sign in
          </button>
        </form>
  <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
          <button className="hover:underline" onClick={onForgot}>Forgot password?</button>
          <span>
            Need an account?{' '}
            <button className="text-blue-600 hover:underline font-semibold" onClick={onSignup}>Sign up</button>
          </span>
        </div>
      </div>
    </div>
  );
}
