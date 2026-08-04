import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const GOOGLE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function validateFields() {
    const errs = {};
    if (!email.trim()) errs.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "That doesn't look like a valid email.";
    if (!password) errs.password = "Enter your password.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errs = validateFields();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        setError("That email and password don't match. Double-check and try again.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Check your inbox — you need to confirm your email before signing in.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setError("Couldn't reach the server. Check your connection and try again.");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect happens automatically via Supabase OAuth flow
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left panel — form */}
      <motion.div
        className="login-form-panel"
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="login-form-inner">
          {/* Logo */}
          <Link to="/" className="login-logo">
            <span className="login-logo-mark">R</span>
            <span className="login-logo-text">MithrAI</span>
          </Link>

          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Pick up where you left off.</p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            id="google-signin-btn"
          >
            {googleLoading ? (
              <span className="btn-spinner" />
            ) : (
              GOOGLE_ICON
            )}
            Continue with Google
          </button>

          <div className="or-divider"><span>or sign in with email</span></div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="form-error-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            <div className={`form-field ${fieldErrors.email ? "has-error" : ""}`}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className={`form-field ${fieldErrors.password ? "has-error" : ""}`}>
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className="password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || googleLoading}
              id="login-submit-btn"
            >
              {loading ? <span className="btn-spinner" /> : "Sign In"}
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account? <Link to="/register">Create one — it's free</Link>
          </p>
        </div>
      </motion.div>

      {/* Right panel — illustration & value statement */}
      <motion.div
        className="login-hero-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="login-hero-inner">
          <div className="login-hero-illustration">
            {/* Abstract career-progress visual */}
            <svg width="260" height="240" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="130" cy="120" r="90" fill="rgba(108,99,255,0.08)"/>
              <circle cx="130" cy="120" r="60" fill="rgba(108,99,255,0.12)"/>
              <circle cx="130" cy="120" r="30" fill="rgba(108,99,255,0.22)"/>
              {/* Progress ring */}
              <circle cx="130" cy="120" r="80" stroke="#6c63ff" strokeWidth="2" strokeDasharray="408" strokeDashoffset="102" strokeLinecap="round" transform="rotate(-90 130 120)"/>
              {/* Score display */}
              <text x="130" y="115" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700">91</text>
              <text x="130" y="135" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">ATS Score</text>
              {/* Orbiting nodes */}
              <circle cx="200" cy="60" r="14" fill="#1a1830" stroke="#6c63ff" strokeWidth="1.5"/>
              <text x="200" y="65" textAnchor="middle" fill="#6c63ff" fontSize="10">📄</text>
              <circle cx="210" cy="175" r="14" fill="#1a1830" stroke="#a78bfa" strokeWidth="1.5"/>
              <text x="210" y="180" textAnchor="middle" fill="#a78bfa" fontSize="10">🎯</text>
              <circle cx="55" cy="170" r="14" fill="#1a1830" stroke="#f472b6" strokeWidth="1.5"/>
              <text x="55" y="175" textAnchor="middle" fill="#f472b6" fontSize="10">🗺</text>
              <circle cx="45" cy="70" r="14" fill="#1a1830" stroke="#34d399" strokeWidth="1.5"/>
              <text x="45" y="75" textAnchor="middle" fill="#34d399" fontSize="10">🤝</text>
            </svg>
          </div>

          <div className="login-hero-text">
            <h2>Your career prep, actually organized.</h2>
            <p>
              AI feedback on your resume, realistic mock interviews, and a
              step-by-step learning roadmap — all in one place, not scattered
              across five different tools.
            </p>
          </div>

          <div className="login-testimonial">
            <blockquote>
              "MithrAI boosted my ATS score from 54 to 91. I got the offer in 3 weeks."
            </blockquote>
            <cite>Priya M. · SWE @ Google</cite>
          </div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          background: #08070f;
          color: #e2e0ff;
        }

        .login-form-panel {
          flex: 0 0 480px;
          max-width: 480px;
          background: #0e0c1e;
          border-right: 1px solid rgba(108,99,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 48px;
        }

        .login-form-inner {
          width: 100%;
          max-width: 360px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 40px;
        }

        .login-logo-mark {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          color: #fff;
          flex-shrink: 0;
        }

        .login-logo-text {
          font-weight: 700;
          font-size: 18px;
          color: #fff;
        }

        .login-heading {
          margin-bottom: 28px;
        }

        .login-heading h1 {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }

        .login-heading p {
          font-size: 14px;
          color: rgba(226,224,255,0.5);
        }

        .google-btn {
          width: 100%;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #fff;
          color: #1a1a2e;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 20px;
        }

        .google-btn:hover:not(:disabled) {
          background: #f3f0ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(108,99,255,0.3);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0 20px;
          color: rgba(226,224,255,0.3);
          font-size: 12px;
        }

        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(108,99,255,0.2);
        }

        .form-error-banner {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .form-field {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(226,224,255,0.8);
        }

        .form-field input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(108,99,255,0.06);
          border: 1.5px solid rgba(108,99,255,0.2);
          border-radius: 10px;
          font-size: 14px;
          color: #e2e0ff;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .form-field input::placeholder { color: rgba(226,224,255,0.25); }

        .form-field input:focus {
          border-color: #6c63ff;
          background: rgba(108,99,255,0.1);
        }

        .form-field.has-error input {
          border-color: rgba(239,68,68,0.5);
        }

        .field-error {
          font-size: 12px;
          color: #fca5a5;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 12px;
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover { color: #c4b5fd; }

        .password-wrap {
          position: relative;
        }

        .password-wrap input {
          width: 100%;
          padding-right: 60px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: rgba(226,224,255,0.4);
          font-family: inherit;
          transition: color 0.2s;
        }

        .password-toggle:hover { color: #a78bfa; }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6c63ff, #a855f7);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
          margin-bottom: 20px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(108,99,255,0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .switch-auth {
          font-size: 13px;
          color: rgba(226,224,255,0.45);
          text-align: center;
        }

        .switch-auth a {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
        }

        .switch-auth a:hover { color: #c4b5fd; text-decoration: underline; }

        /* ── Right hero panel ── */
        .login-hero-panel {
          flex: 1;
          background: linear-gradient(135deg, #0d0b1e 0%, #120f2d 50%, #0d0b1e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .login-hero-panel::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-hero-inner {
          max-width: 440px;
          text-align: center;
        }

        .login-hero-illustration {
          margin-bottom: 36px;
        }

        .login-hero-text h2 {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .login-hero-text p {
          font-size: 15px;
          color: rgba(226,224,255,0.55);
          line-height: 1.65;
          margin-bottom: 36px;
        }

        .login-testimonial {
          background: rgba(108,99,255,0.08);
          border: 1px solid rgba(108,99,255,0.2);
          border-radius: 14px;
          padding: 20px 24px;
          text-align: left;
        }

        .login-testimonial blockquote {
          font-size: 14px;
          color: rgba(226,224,255,0.8);
          line-height: 1.55;
          font-style: italic;
          margin-bottom: 10px;
        }

        .login-testimonial cite {
          font-size: 12px;
          color: #a78bfa;
          font-style: normal;
          font-weight: 500;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .login-form-panel {
            flex: 1;
            max-width: 100%;
            border-right: none;
            padding: 32px 24px;
          }
          .login-hero-panel { display: none; }
        }
      `}</style>
    </div>
  );
}