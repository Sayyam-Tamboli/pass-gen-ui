import { useEffect, useRef, useState } from "react";
import { getPasswordEntries, regenerateEntry } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard({ onGenerateNew, onLogout }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");

  // Inline regenerate state
  const [activeRegenId, setActiveRegenId] = useState(null);
  const [regenMaster, setRegenMaster] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenResults, setRegenResults] = useState({}); // { [entryId]: { password, error } }
  const [regenCountdown, setRegenCountdown] = useState(null);
  const regenIntervalRef = useRef(null);
  const regenHideRef = useRef(null);

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
      console.log("[Dashboard] fetching entries for userId:", user.id);
      const data = await getPasswordEntries(user.id);
      console.log("[Dashboard] entries received:", data);
      setEntries(data || []);
    } catch (err) {
      console.error("[Dashboard] fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenClick = (entry) => {
    if (activeRegenId === entry.id) {
      setActiveRegenId(null);
      setRegenMaster("");
    } else {
      setActiveRegenId(entry.id);
      setRegenMaster("");
      setRegenResults((prev) => ({ ...prev, [entry.id]: null }));
    }
  };

  const startRegenCountdown = (entryId) => {
    clearInterval(regenIntervalRef.current);
    clearTimeout(regenHideRef.current);
    setRegenCountdown(15);

    regenIntervalRef.current = setInterval(() => {
      setRegenCountdown((c) => {
        if (c <= 1) { clearInterval(regenIntervalRef.current); return null; }
        return c - 1;
      });
    }, 1000);

    regenHideRef.current = setTimeout(() => {
      setRegenResults((prev) => ({ ...prev, [entryId]: null }));
      setActiveRegenId(null);
      setRegenMaster("");
      setRegenCountdown(null);
    }, 15000);
  };

  const handleRegenerate = async (entry) => {
    if (entry.charset !== "custom" && !regenMaster.trim()) return;

    setRegenLoading(true);
    setRegenResults((prev) => ({ ...prev, [entry.id]: null }));
    try {
      const res = await regenerateEntry(entry.id, regenMaster);
      setRegenResults((prev) => ({ ...prev, [entry.id]: { password: res.password } }));
      startRegenCountdown(entry.id);
    } catch (err) {
      setRegenResults((prev) => ({ ...prev, [entry.id]: { error: err.message } }));
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <>
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
                  {entries.map((entry) => (
                    <>
                      <tr key={entry.id}>
                        <td>{entry.site}</td>
                        <td>{entry.context}</td>
                        <td>{entry.charset}</td>
                        <td>
                          <button
                            className="btn-small"
                            onClick={() => handleRegenClick(entry)}
                          >
                            {activeRegenId === entry.id ? "Cancel" : "Regenerate"}
                          </button>
                        </td>
                      </tr>
                      {activeRegenId === entry.id && (
                        <tr key={`${entry.id}-regen`}>
                          <td colSpan={5} style={{ background: "var(--card-bg, #1a1a2e)", padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                              <input
                                type="password"
                                placeholder="Enter master password"
                                value={regenMaster}
                                onChange={(e) => setRegenMaster(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRegenerate(entry)}
                                style={{ flex: 1, minWidth: "180px" }}
                              />
                              <button
                                className="btn-small"
                                onClick={() => handleRegenerate(entry)}
                                disabled={regenLoading || !regenMaster.trim()}
                              >
                                {regenLoading ? "Generating..." : "Generate"}
                              </button>
                            </div>
                            {regenResults[entry.id]?.password && (
                              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input
                                  readOnly
                                  value={regenResults[entry.id].password}
                                  style={{ flex: 1, fontFamily: "monospace" }}
                                />
                                {regenCountdown !== null && (
                                  <span style={{ fontSize: "0.75rem", opacity: 0.6, whiteSpace: "nowrap" }}>
                                    hides in {regenCountdown}s
                                  </span>
                                )}
                              </div>
                            )}
                            {regenResults[entry.id]?.error && (
                              <div className="error-message" style={{ marginTop: "0.5rem" }}>
                                {regenResults[entry.id].error}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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
