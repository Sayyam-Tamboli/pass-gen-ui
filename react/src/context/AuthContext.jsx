import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Ensure user object has 'id' field
      const normalizedUser = {
        id: userData.id || userData.userId || userData.user_id,
        ...userData
      };
      setUser(normalizedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Ensure user object has 'id' field - handle different backend response formats
    const normalizedUser = {
      id: userData.id || userData.userId || userData.user_id,
      username: userData.username,
      email: userData.email,
      ...userData
    };
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
