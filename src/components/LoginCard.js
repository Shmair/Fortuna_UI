import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../utils/supabaseClient';

export default function LoginCard({ onLogin, onGoogle, onSignup, onForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleOAuthSignIn = (provider) => {
    supabase.auth.signInWithOAuth({
      provider,
      options: { prompt: 'select_account' }
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
          <FcGoogle className="mr-2 text-xl" /> Continue with Google
        </button>
  <div className="flex items-center w-full my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
  <form className="w-full mt-1" onSubmit={e => { e.preventDefault(); onLogin && onLogin(email, password); }}>
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
