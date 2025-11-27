
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { User } from "@supabase/supabase-js";

import "./index.css";

import Header from "./components/layout/Header";
import { Button } from "./components/ui/button";
import ComprehensiveUserProfileForm from "./components/forms/ComprehensiveUserProfileForm";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ProfilePage from "./pages/Profile";
import Wizard from "./components/steps/Wizard";
import { supabase } from "./utils/supabaseClient";
import Auth from "./components/auth/Auth";
import AuthCallback from "./components/auth/AuthCallback";
import ResetPassword from "./components/auth/ResetPassword";

type UserData = Record<string, unknown>;

const App: React.FC = () => {
  // Auth state
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState<UserData>({});
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);


  // On mount, check for existing Supabase user/session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setIsAuthenticated(true);
        setUser(supabaseUser);
        setUserName(supabaseUser.user_metadata?.full_name || supabaseUser.email || "");
      }
      setIsLoadingUser(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        setUserName(session.user.user_metadata?.full_name || session.user.email || "");
        setShowAuth(false); // Close auth modal on successful login
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserName("");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Example state for ComprehensiveUserProfileForm usage

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserName("");
    setShowAuth(false);
    setUserData({});
    // Optionally reload to clear state
    window.location.href = "/";
  };

  return (
    <div
      dir="rtl"
      className="font-sans min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
  <Router future={{ v7_startTransition: true }}>
        <AnimatePresence>
          <>
            <Header
              isAuthenticated={isAuthenticated}
              userName={userName}
              setShowAuth={setShowAuth}
              onLogout={handleLogout}
            />
            {showAuth && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 min-w-[420px]">
                  <Auth />
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setShowAuth(false)}>סגור</Button>
                </div>
              </div>
            )}
            <main className="pt-20 md:pt-24 px-4 sm:px-0">
              <Routes>
                <Route path="/" element={
                  <Home
                    setShowAuth={setShowAuth}
                    isAuthenticated={isAuthenticated}
                  />
                } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/wizard" element={<Wizard user={user} isLoadingUser={isLoadingUser} />} />
                <Route path="/user-profile-form" element={<ComprehensiveUserProfileForm userData={userData} setUserData={setUserData} showErrors={false} />} />
              </Routes>
            </main>
          </>
        </AnimatePresence>
      </Router>
      <Toaster position="top-left" />
    </div>
  );
};

export default App;
