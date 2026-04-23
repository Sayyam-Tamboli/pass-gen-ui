import { useCallback, useEffect, useRef, useState } from "react";
import { deletePasswordEntry, getPasswordEntries, regenerateEntry } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard({ onGenerateNew, onLogout }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "dark"
  );

  const [activeRegenId, setActiveRegenId] = useState(null);
  const [regenMaster, setRegenMaster] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenResults, setRegenResults] = useState({});
  const [regenCountdown, setRegenCountdown] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const regenIntervalRef = useRef(null);
  const regenHideRef = useRef(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPasswordEntries(user.id);
      setEntries(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchEntries();
  }, [user, fetchEntries]);

  const handleRegenClick = (entry) => {
    setConfirmDeleteId(null);
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
    if (!regenMaster.trim()) return;
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

  const handleCopyRegen = async (entryId, password) => {
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(entryId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (entryId) => {
    setActiveRegenId(null);
    setConfirmDeleteId(entryId === confirmDeleteId ? null : entryId);
  };

  const handleConfirmDelete = async (entryId) => {
    setDeleteLoading(true);
    try {
      await deletePasswordEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
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
            aria-label="Toggle theme"
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
              + Generate New
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <>
                      <tr key={entry.id}>
                        <td data-label="Site">{entry.site}</td>
                        <td data-label="Context">{entry.context}</td>
                        <td data-label="Charset">{entry.charset}</td>
                        <td data-label="Actions">
                          <div className="action-btns">
                            <button
                              className={`btn-small${activeRegenId === entry.id ? " cancel" : ""}`}
                              onClick={() => handleRegenClick(entry)}
                            >
                              {activeRegenId === entry.id ? "Cancel" : "Regenerate"}
                            </button>
                            {confirmDeleteId === entry.id ? (
                              <>
                                <button
                                  className="btn-small btn-confirm-delete"
                                  onClick={() => handleConfirmDelete(entry.id)}
                                  disabled={deleteLoading}
                                >
                                  {deleteLoading ? "Deleting..." : "Confirm"}
                                </button>
                                <button
                                  className="btn-small cancel"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn-small btn-delete"
                                onClick={() => handleDeleteClick(entry.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {activeRegenId === entry.id && (
                        <tr key={`${entry.id}-panel`} className="regen-row">
                          <td colSpan={4}>
                            <div className="regen-panel">
                              <div className="regen-input-row">
                                <input
                                  type="password"
                                  placeholder="Enter master password"
                                  value={regenMaster}
                                  onChange={(e) => setRegenMaster(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleRegenerate(entry)}
                                  autoComplete="off"
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
                                <div className="regen-result-row">
                                  <input readOnly value={regenResults[entry.id].password} />
                                  <button
                                    className="btn-copy-regen"
                                    onClick={() => handleCopyRegen(entry.id, regenResults[entry.id].password)}
                                  >
                                    {copiedId === entry.id ? "✓ Copied" : "Copy"}
                                  </button>
                                  {regenCountdown !== null && (
                                    <span className="regen-countdown">hides in {regenCountdown}s</span>
                                  )}
                                </div>
                              )}

                              {regenResults[entry.id]?.error && (
                                <div className="error-message">{regenResults[entry.id].error}</div>
                              )}
                            </div>
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
