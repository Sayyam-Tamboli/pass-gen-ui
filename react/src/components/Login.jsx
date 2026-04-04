import { useState } from "react";
import { login } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await login(username, password);
      setUser(response);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Login to PassGen</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <p className="auth-switch">
          Don't have an account?{" "}
          <button 
            onClick={onSwitchToRegister}
            className="link-button"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
