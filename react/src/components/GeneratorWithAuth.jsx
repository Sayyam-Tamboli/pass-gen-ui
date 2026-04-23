import { useEffect, useRef, useState } from "react";
import { generatePassword } from "../services/passgenApi";
import { addPasswordEntry } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/generator.css";

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function parseKeyword(context) {
  if (!context) return "";
  return context.includes("::") ? context.split("::")[1] : "";
}

export default function GeneratorWithAuth({ prefilledEntry, onBack }) {
  const { user } = useAuth();
  const [master, setMaster] = useState("");
  const [showMaster, setShowMaster] = useState(false);
  const [site, setSite] = useState(prefilledEntry?.site || "");
  const [keyword, setKeyword] = useState(parseKeyword(prefilledEntry?.context));
  const [length, setLength] = useState(prefilledEntry?.passwordLength || 16);
  const [charset, setCharset] = useState(prefilledEntry?.charset || "all");
  const [customInput, setCustomInput] = useState("");

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(
    document.body.getAttribute("data-theme") || "dark"
  );
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generatedRule, setGeneratedRule] = useState(null);
  const [generating, setGenerating] = useState(false);

  const intervalRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const timerCountDown = 15;

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateStrength = (pwd) => {
    if (
      pwd.length >= 14 &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd)
    )
      return "Strong";
    if (pwd.length >= 10) return "Medium";
    return "Weak";
  };

  const startAutoHideTimer = (seconds) => {
    clearInterval(intervalRef.current);
    clearTimeout(hideTimeoutRef.current);
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          return null;
        }
        return c - 1;
      });
    }, 1000);

    hideTimeoutRef.current = setTimeout(() => {
      setPassword("");
      setStrength("");
      setCountdown(null);
    }, seconds * 1000);
  };

  const handleGenerate = async () => {
    setError("");
    const isCustom = charset === "custom";

    if (!master || !site) {
      setError("Master password and Site are required");
      return;
    }

    if (isCustom && !customInput.trim()) {
      setError("Please describe your password requirements");
      return;
    }

    const context = keyword ? `${site}::${keyword}` : site;

    setGenerating(true);
    try {
      const res = await generatePassword(
        isCustom
          ? { charset: "custom", input: customInput, master, context, length }
          : { master, context, length, charset }
      );

      setPassword(res.password);
      setStrength(calculateStrength(res.password));
      setGenerated(true);
      setGeneratedRule(res.rule || null);
      startAutoHideTimer(timerCountDown);
      setAddError("");
      setAddSuccess("");
    } catch (e) {
      setError(e.message || "Failed to generate password");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddPassword = async () => {
    if (!password) {
      setAddError("No password generated yet");
      return;
    }

    if (!user?.id) {
      setAddError("User not authenticated");
      return;
    }

    const context = keyword ? `${site}::${keyword}` : site;

    try {
      setAddError("");
      await addPasswordEntry(user.id, context, site, charset, length, generatedRule);
      setAddSuccess("Password saved to your account!");
      setTimeout(() => {
        setAddSuccess("");
        setPassword("");
        setStrength("");
        setCountdown(null);
      }, 2000);
    } catch (err) {
      setAddError(err.message);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const isCustom = charset === "custom";
  const strengthLevel = strength.toLowerCase();

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
          {onBack && (
            <button className="btn-back" onClick={onBack}>
              ← Dashboard
            </button>
          )}
        </div>
      </header>

      <div className="generator-wrapper">
        <div className="generator-card">
          <p className="tagline">
            Deterministic password generator.
            <br />
            <strong>We never store your passwords.</strong>
          </p>

          {/* Master password */}
          <div className="field-group">
            <div className="password-input-wrap">
              <input
                type={showMaster ? "text" : "password"}
                placeholder="Master password"
                value={master}
                onChange={(e) => setMaster(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="gen-eye-toggle"
                onClick={() => setShowMaster((v) => !v)}
                tabIndex={-1}
                aria-label={showMaster ? "Hide master password" : "Show master password"}
              >
                <EyeIcon open={showMaster} />
              </button>
            </div>
          </div>

          <input
            placeholder="Site / App (e.g. gmail)"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          />

          <input
            placeholder="Keyword / context (optional)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <div className="field-row">
            <label>Charset</label>
            <select value={charset} onChange={(e) => setCharset(e.target.value)}>
              <option value="all">All characters</option>
              <option value="noSymbols">No Symbols</option>
              <option value="lettersOnly">Letters Only</option>
              <option value="digitsOnly">Digits Only</option>
              <option value="custom">Custom (AI)</option>
            </select>
          </div>

          {isCustom && (
            <div className="custom-prompt-wrap">
              <textarea
                placeholder="Describe your requirements (e.g. 'strong 16-char password for banking, no ambiguous chars')"
                maxLength={200}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={3}
              />
              <div className="char-count">{customInput.length}/200</div>
            </div>
          )}

          <div className="field-row">
            <label htmlFor="length-input">Length: <strong>{length}</strong></label>
            <input
              id="length-input"
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(+e.target.value)}
              className="length-slider"
            />
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <span className="btn-spinner-row">
                <span className="btn-spinner" /> Generating...
              </span>
            ) : (
              "Generate Password"
            )}
          </button>

          {error && <div className="error">{error}</div>}

          {password && (
            <div className="result-section">
              <div className="password-output-wrap">
                <input className="password-output" readOnly value={password} />
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? "✓" : "Copy"}
                </button>
              </div>

              <div className="strength-row">
                <div className="strength-bars">
                  <div className={`strength-bar ${strengthLevel === "weak" || strengthLevel === "medium" || strengthLevel === "strong" ? strengthLevel : ""}`} />
                  <div className={`strength-bar ${strengthLevel === "medium" || strengthLevel === "strong" ? strengthLevel : ""}`} />
                  <div className={`strength-bar ${strengthLevel === "strong" ? strengthLevel : ""}`} />
                </div>
                <span className={`strength-label ${strengthLevel}`}>
                  {strength}
                </span>
                {countdown !== null && (
                  <span className="countdown">hides in {countdown}s</span>
                )}
              </div>
            </div>
          )}

          {user && generated && !prefilledEntry && (
            <div>
              <button className="btn-add" onClick={handleAddPassword}>
                + Save to My Passwords
              </button>
              {addError && <div className="error">{addError}</div>}
              {addSuccess && <div className="success">{addSuccess}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
