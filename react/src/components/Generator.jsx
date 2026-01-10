import { useEffect, useRef, useState } from "react";
import { generatePassword } from "../services/passgenApi";
import "../styles/generator.css";

export default function Generator() {
  const [master, setMaster] = useState("");
  const [site, setSite] = useState("");
  const [keyword, setKeyword] = useState("");
  const [length, setLength] = useState(16);
  const [mode, setMode] = useState("ALL");

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState("dark");

  const intervalRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const timerCountDown = 30;

  /* ---------------- THEME ---------------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

 /* ---------------- COPY ---------------- */
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

  /* ---------------- STRENGTH ---------------- */
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

  /* ---------------- TIMER ---------------- */
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

  /* ---------------- GENERATE ---------------- */

const handleGenerate = async () => {
  setError("");

  if (!master || !site) {
    setError("Master password and Site are required");
    return;
  }

  // ✅ Build backend-compatible context
  const context = keyword
    ? `${site}::${keyword}`
    : site;

  try {
    const res = await generatePassword({
      master,
      context,
      length,
      charset: "all",
    });

    setPassword(res.password);
    setStrength(calculateStrength(res.password));
    startAutoHideTimer(timerCountDown);
  } catch (e) {
    setError(e.message || "Failed to generate password");
  }
};

  /* ---------------- CLEANUP ---------------- */
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
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </header>

      {/* Center card */}
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
            <label>Length</label>
            <input
              type="number"
              min={8}
              max={32}
              value={length}
              onChange={(e) => setLength(+e.target.value)}
            />
          </div>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ALPHA">Alpha</option>
            <option value="NUMERIC">Numeric</option>
          </select>

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
        </div>
      </div>
    </>
  );
}