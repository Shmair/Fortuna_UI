
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import './index.css';

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/Profile";
import Wizard from "./pages/Wizard";
import UserProfileForm from "./components/UserProfileForm";

function App() {
  // Example state for UserProfileForm usage
  const [userData, setUserData] = React.useState({});
  return (
    <div dir="rtl" className="font-sans bg-gray-50 min-h-screen">
      <Router>
        <AnimatePresence>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/user-profile-form" element={<UserProfileForm userData={userData} setUserData={setUserData} />} />
          </Routes>
        </AnimatePresence>
      </Router>
      <Toaster position="top-left" />
    </div>
  );
}

export default App;
