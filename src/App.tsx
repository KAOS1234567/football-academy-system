import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { auth } from "./firebase";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Players from "./components/Players";
import Coaches from "./components/Coaches";
import Teams from "./components/Teams";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"login" | "register">("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">
            جاري تأمين الاتصال السحابي...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        currentView === "login" ? (
          <Login
            onNavigateToRegister={() => setCurrentView("register")}
          />
        ) : (
          <Register
            onNavigateToLogin={() => setCurrentView("login")}
          />
        )
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
    }
