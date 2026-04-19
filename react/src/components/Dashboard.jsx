import { useEffect, useState } from "react";
import { getPasswordEntries } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard({ onGenerateNew, onLogout }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getPasswordEntries(user.id);
      setEntries(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <header className="top-bar">
        <div className="logo">🔐 PassGen</div>
        <div className="top-bar-right">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <span className="user-info">👤 {user?.username}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-wrapper">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <h2>My Saved Passwords</h2>
            <button className="btn-primary" onClick={() => onGenerateNew()}>
              + Generate New Password
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading your passwords...</div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <p>No saved passwords yet. Generate one to get started!</p>
            </div>
          ) : (
            <div className="passwords-table">
              <table>
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Context</th>
                    <th>Charset</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{entry.site}</td>
                      <td>{entry.context}</td>
                      <td>{entry.charset}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => onGenerateNew(entry)}
                        >
                          Regenerate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
