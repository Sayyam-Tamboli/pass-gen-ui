import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import GeneratorWithAuth from "./components/GeneratorWithAuth";
import "./index.css";
import { FeedBot } from "@stl-ai-org/feedbot";
import '@stl-ai-org/feedbot/dist/feedbot.css';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("generator"); // generator | dashboard
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [prefilledEntry, setPrefilledEntry] = useState(null);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>Loading PassGen...</span>
    </div>
  );

  // Not logged in - show auth pages
  if (!user) {
    return authMode === "login" ? (
      <Login
        onSwitchToRegister={() => setAuthMode("register")}
        onLoginSuccess={() => setCurrentPage("dashboard")}
      />
    ) : (
      <Register
        onSwitchToLogin={() => setAuthMode("login")}
        onRegisterSuccess={() => setCurrentPage("dashboard")}
      />
    );
  }

  // Logged in - show generator or dashboard
  return currentPage === "dashboard" ? (
    <Dashboard
      onGenerateNew={(entry) => {
        if (entry) {
          setPrefilledEntry(entry);
        }
        setCurrentPage("generator");
      }}
      onLogout={() => {
        logout();
        setCurrentPage("generator");
      }}
    />
  ) : (
    <GeneratorWithAuth
      prefilledEntry={prefilledEntry}
      onBack={() => {
        setCurrentPage("dashboard");
        setPrefilledEntry(null);
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <FeedBot 
        apiKey="passgen-test-key"
        position="bottom-right"
      />
    </AuthProvider>
  );
}