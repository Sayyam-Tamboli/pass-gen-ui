import { useState } from "react";
import { login } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AuthInfo() {
  return (
    <div className="auth-info">
      <div className="auth-info-logo">🔐 PassGen</div>
      <h1 className="auth-info-title">Your passwords,<br />always reproducible.</h1>
      <p className="auth-info-desc">
        PassGen is a <strong>deterministic password manager</strong> — it generates
        the same strong password every time from your master key and a site name.
        Nothing is ever stored.
      </p>
      <ul className="auth-features">
        <li>
          <span className="feature-icon">🔑</span>
          <div>
            <strong>One master key</strong>
            <p>One password to remember. All others are derived on the fly.</p>
          </div>
        </li>
        <li>
          <span className="feature-icon">🚫</span>
          <div>
            <strong>Zero storage</strong>
            <p>Your passwords are never saved — not even on our servers.</p>
          </div>
        </li>
        <li>
          <span className="feature-icon">⚡</span>
          <div>
            <strong>Deterministic</strong>
            <p>Same inputs always produce the same password. Recover anytime.</p>
          </div>
        </li>
        <li>
          <span className="feature-icon">🤖</span>
          <div>
            <strong>AI custom mode</strong>
            <p>Describe your requirements in plain English and get a matching password.</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <AuthInfo />

      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🔐</span>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your PassGen account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="link-button">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
