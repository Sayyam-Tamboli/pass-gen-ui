import { useEffect, useRef, useState } from "react";
import { generatePassword } from "../services/passgenApi";
import { addPasswordEntry } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/generator.css";

function parseKeyword(context) {
  if (!context) return "";
  return context.includes("::") ? context.split("::")[1] : "";
}

export default function GeneratorWithAuth({ prefilledEntry, onBack }) {
  const { user } = useAuth();
  const [master, setMaster] = useState("");
  const [site, setSite] = useState(prefilledEntry?.site || "");
  const [keyword, setKeyword] = useState(parseKeyword(prefilledEntry?.context));
  const [length, setLength] = useState(16);
  const [charset, setCharset] = useState(prefilledEntry?.charset || "all");

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [generated, setGenerated] = useState(false);

  const intervalRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const timerCountDown = 15;

  useEffect(() => {
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
    ) return "Strong";
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

    if (!master || !site) {
      setError("Master password and Site are required");
      return;
    }

    const context = keyword ? `${site}::${keyword}` : site;

    try {
      const res = await generatePassword({
        master,
        context,
        length,
        charset,
      });

      setPassword(res.password);
      setStrength(calculateStrength(res.password));
      setGenerated(true);
      startAutoHideTimer(timerCountDown);
      setAddError("");
      setAddSuccess("");
    } catch (e) {
      setError(e.message || "Failed to generate password");
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
      await addPasswordEntry(user.id, context, site, charset, length);
      setAddSuccess("✓ Password saved to your account!");
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
          {onBack && (
            <button className="btn-back" onClick={onBack}>
              ← Back to Dashboard
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

          <input
            type="password"
            placeholder="Master password"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
          />

          <input
            placeholder="Site / App (e.g. gmail)"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          />

          <input
            placeholder="Keyword (context)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <div className="row rm-space-between">
            <label>Charset</label>
            <select value={charset} onChange={(e) => setCharset(e.target.value)}>
              <option value="all">All</option>
              <option value="noSymbols">No Symbols</option>
              <option value="lettersOnly">Letters Only</option>
              <option value="digitsOnly">Digits Only</option>
            </select>
          </div>

          {/* Length input */}
          <div className="row rm-space-between">
            <label htmlFor="length-input">Password Length: {length}</label>
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

          <button onClick={handleGenerate}>Generate Password</button>

          {error && <div className="error">{error}</div>}

          {password && (
            <div className="result">
              <input readOnly value={password} />
              <div className={`strength ${strength.toLowerCase()}`}>
                Strength: {strength}
                {countdown !== null && ` • hides in ${countdown}s`}
                <button
                  className="copy-btn"
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
          {user && generated && (
            <div>
              <button
                className="btn-add"
                onClick={handleAddPassword}
              >
                + Add to My Passwords
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
