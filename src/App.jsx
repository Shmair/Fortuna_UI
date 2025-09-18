
import { AnimatePresence } from "framer-motion";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import './index.css';

import { useState } from "react";
import Header from "./components/Header";
import { Button } from "./components/ui/button";
import UserProfileForm from "./components/UserProfileForm";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import ProfilePage from "./pages/Profile";
import Wizard from "./pages/Wizard";
import { supabase } from './utils/supabaseClient';
import LoginCard from "./components/LoginCard";

function App() {
  // Auth state
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState({});
  const [user, setUser] = useState(null);
  

  // On mount, check for existing Supabase user/session
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        setUserName(user.user_metadata?.full_name || user.email || "");
      }
    });
  }, []);

  // Example state for UserProfileForm usage

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserName("");
    setShowAuth(false);
    setUserData({});
    // Optionally reload to clear state
    window.location.href = "/";
  };

  return (
    <div dir="rtl" className="font-sans bg-gray-50 min-h-screen">
  <Router future={{ v7_startTransition: true }}>
        <AnimatePresence>
          <>
            <Header 
              isAuthenticated={isAuthenticated}
              userName={userName}
              setShowAuth={setShowAuth}
              showAuth={showAuth}
              onLogout={handleLogout}
            />
            {showAuth && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 min-w-[420px]">
                  <LoginCard 
                    onLogin={(email, password) => {
                      // Handle login
                    }}
                    onGoogle={() => {
                      // Handle Google login
                    }}
                    onSignup={() => {
                      // Handle signup
                    }}
                    onForgot={() => {
                      // Handle forgot password
                    }}
                  />
                  <Button variant="outline" className="mt-4 w-full" onClick={() => setShowAuth(false)}>סגור</Button>
                </div>
              </div>
            )}
            <Routes>
              <Route path="/" element={
                <Home 
                  setShowAuth={setShowAuth}
                  isAuthenticated={isAuthenticated}
                />
              } />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wizard" element={<Wizard user={user} />} />
              <Route path="/user-profile-form" element={<UserProfileForm userData={userData} setUserData={setUserData} />} />
            </Routes>
          </>
        </AnimatePresence>
      </Router>
      <Toaster position="top-left" />
    </div>
  );
}

export default App;
