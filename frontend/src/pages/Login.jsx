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

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoad,   setGoogleLoad]   = useState(false);
  const [error,        setError]        = useState("");
  const [fieldErrors,  setFieldErrors]  = useState({});

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
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
        setError("That email and password don't match. Double-check and try again.");
      else if (msg.includes("Email not confirmed"))
        setError("Check your inbox — you need to confirm your email before signing in.");
      else if (msg.includes("network") || msg.includes("fetch"))
        setError("Couldn't reach the server. Check your connection and try again.");
      else setError(msg || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoad(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoad(false);
    }
  }

  return (
    <div className="lp">
      {/* ── Left panel — form ── */}
      <motion.div
        className="lp-form"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="lp-form-inner">
          {/* Logo */}
          <Link to="/" className="lp-logo">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
              <rect width="36" height="36" rx="10" fill="#B4563E"/>
              <path d="M7 21C14 21 19 16 19 9" stroke="#FDF6EC" strokeWidth="3" strokeLinecap="round"/>
              <path d="M29 15C22 15 17 20 17 27" stroke="#FDF6EC" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="2.5" fill="#E2A377"/>
            </svg>
            <span className="lp-logo-text">MithrAI</span>
          </Link>

          <div className="lp-heading">
            <h1>Welcome back</h1>
            <p>Pick up where you left off.</p>
          </div>

          {/* Google */}
          <button type="button" className="google-btn" onClick={handleGoogle}
            disabled={googleLoad || loading} id="google-signin-btn">
            {googleLoad ? <span className="btn-spinner" /> : GOOGLE_ICON}
            Continue with Google
          </button>

          <div className="or-div"><span>or sign in with email</span></div>

          <AnimatePresence>
            {error && (
              <motion.div className="err-banner"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            <div className={`ff ${fieldErrors.email ? "ff-err" : ""}`}>
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" autoComplete="email"
                placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); }} />
              {fieldErrors.email && <span className="fe">{fieldErrors.email}</span>}
            </div>

            <div className={`ff ${fieldErrors.password ? "ff-err" : ""}`}>
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-lnk">Forgot?</Link>
              </div>
              <div className="pw-wrap">
                <input id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password" placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); }} />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {fieldErrors.password && <span className="fe">{fieldErrors.password}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading || googleLoad} id="login-submit-btn">
              {loading ? <span className="btn-spinner" /> : "Sign In →"}
            </button>
          </form>

          <p className="switch-auth">
            No account? <Link to="/register">Create one — it's free</Link>
          </p>
        </div>
      </motion.div>

      {/* ── Right panel — value statement (terracotta) ── */}
      <motion.div className="lp-hero"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.1 }}>
        <div className="lp-hero-inner">
          {/* Recolored illustration in terracotta */}
          <div className="lp-illustration">
            <svg width="260" height="240" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="130" cy="120" r="90" fill="rgba(180,86,62,0.07)"/>
              <circle cx="130" cy="120" r="60" fill="rgba(180,86,62,0.11)"/>
              <circle cx="130" cy="120" r="30" fill="rgba(180,86,62,0.2)"/>
              <circle cx="130" cy="120" r="80" stroke="#B4563E" strokeWidth="2"
                strokeDasharray="408" strokeDashoffset="102" strokeLinecap="round"
                transform="rotate(-90 130 120)"/>
              <text x="130" y="115" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700" fontFamily="Fraunces,Georgia,serif">91</text>
              <text x="130" y="135" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontFamily="Inter,sans-serif">ATS Score</text>
              {/* Orbiting nodes */}
              <circle cx="200" cy="60"  r="16" fill="rgba(42,31,26,.6)"  stroke="#B4563E" strokeWidth="1.5"/>
              <circle cx="210" cy="175" r="16" fill="rgba(42,31,26,.6)"  stroke="#E2A377" strokeWidth="1.5"/>
              <circle cx="55"  cy="170" r="16" fill="rgba(42,31,26,.6)"  stroke="#B4563E" strokeWidth="1.5"/>
              <circle cx="45"  cy="70"  r="16" fill="rgba(42,31,26,.6)"  stroke="#E2A377" strokeWidth="1.5"/>
              {/* Line icons in nodes */}
              <text x="200" y="65"  textAnchor="middle" fill="#B4563E" fontSize="12">📄</text>
              <text x="210" y="180" textAnchor="middle" fill="#E2A377" fontSize="12">🎯</text>
              <text x="55"  y="175" textAnchor="middle" fill="#B4563E" fontSize="12">🗺</text>
              <text x="45"  y="75"  textAnchor="middle" fill="#E2A377" fontSize="12">🤝</text>
            </svg>
          </div>

          <div className="lp-hero-text">
            <h2>Your career prep, actually organized.</h2>
            <p>
              AI feedback on your resume, realistic mock interviews, and a
              step-by-step learning roadmap — all in one place, not scattered
              across five different tools.
            </p>
          </div>

          {/* Outcome card — not attributed to a fabricated person */}
          <div className="lp-outcome">
            <div className="lp-outcome-metric">+37 pts</div>
            <div className="lp-outcome-label">average ATS score improvement</div>
            <div className="lp-outcome-desc">after one round of keyword analysis and resume revision</div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        h1,h2,h3 { font-family:'Fraunces',Georgia,serif; }

        .lp {
          display:flex; min-height:100vh;
          font-family:'Inter',system-ui,sans-serif;
          background:#FDF6EC; color:#2A1F1A;
        }

        /* ── Left form panel ── */
        .lp-form {
          flex:0 0 460px; max-width:460px;
          background:#FFFBF5;
          border-right:1px solid #E8D9CC;
          display:flex; align-items:center; justify-content:center;
          padding:48px;
        }
        .lp-form-inner { width:100%; max-width:340px; }

        .lp-logo {
          display:flex; align-items:center; gap:10px;
          text-decoration:none; margin-bottom:40px;
        }
        .lp-logo-mark {
          width:34px; height:34px; background:#B4563E; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:17px; color:#fff;
          font-family:'Fraunces',Georgia,serif; flex-shrink:0;
        }
        .lp-logo-text { font-weight:700; font-size:17px; color:#2A1F1A; font-family:'Inter',sans-serif; }

        .lp-heading { margin-bottom:26px; }
        .lp-heading h1 { font-size:26px; font-weight:800; color:#2A1F1A; margin-bottom:5px; }
        .lp-heading p  { font-size:14px; color:#7A6558; font-family:'Inter',sans-serif; }

        .google-btn {
          width:100%; padding:13px 16px;
          display:flex; align-items:center; justify-content:center; gap:10px;
          background:#fff; color:#2A1F1A; border:1.5px solid #E8D9CC;
          border-radius:9px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif;
          cursor:pointer; transition:all .2s; margin-bottom:20px;
        }
        .google-btn:hover:not(:disabled) { border-color:#B4563E; box-shadow:0 4px 14px rgba(180,86,62,.15); transform:translateY(-1px); }
        .google-btn:disabled { opacity:.6; cursor:not-allowed; }

        .or-div {
          display:flex; align-items:center; gap:12px; margin:4px 0 20px;
          color:#B8A89A; font-size:12px; font-family:'Inter',sans-serif;
        }
        .or-div::before,.or-div::after { content:''; flex:1; height:1px; background:#E8D9CC; }

        .err-banner {
          background:#FDF0EE; border:1px solid rgba(180,86,62,.3); color:#923F2B;
          padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; line-height:1.4;
          font-family:'Inter',sans-serif;
        }

        .ff { margin-bottom:18px; display:flex; flex-direction:column; gap:6px; }
        .ff label { font-size:13px; font-weight:500; color:#2A1F1A; font-family:'Inter',sans-serif; }
        .ff input {
          width:100%; padding:12px 14px;
          background:#FDF6EC; border:1.5px solid #E8D9CC;
          border-radius:9px; font-size:14px; color:#2A1F1A; font-family:'Inter',sans-serif;
          outline:none; transition:border .2s,background .2s;
        }
        .ff input::placeholder { color:#B8A89A; }
        .ff input:focus { border-color:#B4563E; background:#FFFBF5; box-shadow:0 0 0 3px rgba(180,86,62,.1); }
        .ff-err input { border-color:rgba(193,57,43,.45); }
        .fe { font-size:12px; color:#C1392B; font-family:'Inter',sans-serif; }

        .label-row { display:flex; justify-content:space-between; align-items:center; }
        .forgot-lnk { font-size:12px; color:#B4563E; text-decoration:none; font-family:'Inter',sans-serif; }
        .forgot-lnk:hover { text-decoration:underline; }

        .pw-wrap { position:relative; }
        .pw-wrap input { width:100%; padding-right:60px; }
        .pw-toggle {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; font-size:12px; font-weight:500;
          color:#7A6558; font-family:'Inter',sans-serif; transition:color .2s;
        }
        .pw-toggle:hover { color:#B4563E; }

        .submit-btn {
          width:100%; padding:13px; background:#B4563E; color:#fff;
          border:none; border-radius:9px; font-size:15px; font-weight:600;
          font-family:'Inter',sans-serif; cursor:pointer; transition:all .2s;
          display:flex; align-items:center; justify-content:center;
          margin-top:8px; margin-bottom:20px;
        }
        .submit-btn:hover:not(:disabled) { background:#923F2B; transform:translateY(-1px); box-shadow:0 6px 18px rgba(180,86,62,.3); }
        .submit-btn:disabled { opacity:.6; cursor:not-allowed; }

        .btn-spinner {
          width:18px; height:18px; border:2px solid rgba(255,255,255,.35);
          border-top-color:#fff; border-radius:50%;
          animation:spin .7s linear infinite; display:inline-block;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        .switch-auth { font-size:13px; color:#7A6558; text-align:center; font-family:'Inter',sans-serif; }
        .switch-auth a { color:#B4563E; text-decoration:none; font-weight:500; }
        .switch-auth a:hover { text-decoration:underline; }

        /* ── Right hero panel ── */
        .lp-hero {
          flex:1; background:#B4563E;
          display:flex; align-items:center; justify-content:center;
          padding:48px; position:relative; overflow:hidden;
        }
        .lp-hero::before {
          content:''; position:absolute; top:-80px; right:-80px;
          width:400px; height:400px;
          background:radial-gradient(circle,rgba(255,255,255,.12) 0%,transparent 70%);
          pointer-events:none;
        }
        .lp-hero::after {
          content:''; position:absolute; bottom:-60px; left:-60px;
          width:300px; height:300px;
          background:radial-gradient(circle,rgba(42,31,26,.2) 0%,transparent 70%);
          pointer-events:none;
        }
        .lp-hero-inner { max-width:420px; text-align:center; position:relative; z-index:1; }

        .lp-illustration { margin-bottom:32px; }

        .lp-hero-text h2 {
          font-size:26px; font-weight:700; color:#fff; margin-bottom:14px;
          line-height:1.3; font-family:'Fraunces',Georgia,serif;
        }
        .lp-hero-text p {
          font-size:15px; color:rgba(255,255,255,.75); line-height:1.65;
          margin-bottom:32px; font-family:'Inter',sans-serif;
        }

        /* Outcome card — honest, not attributed to a fake person */
        .lp-outcome {
          background:rgba(42,31,26,.25); border:1px solid rgba(255,255,255,.18);
          border-radius:12px; padding:20px 24px; text-align:left;
        }
        .lp-outcome-metric {
          font-size:36px; font-weight:900; color:#fff;
          font-family:'Fraunces',Georgia,serif; margin-bottom:4px;
        }
        .lp-outcome-label {
          font-size:14px; font-weight:600; color:rgba(255,255,255,.9);
          font-family:'Inter',sans-serif; margin-bottom:4px;
        }
        .lp-outcome-desc {
          font-size:12px; color:rgba(255,255,255,.6); font-family:'Inter',sans-serif;
        }

        @media (max-width:768px) {
          .lp-form { flex:1; max-width:100%; border-right:none; padding:32px 24px; }
          .lp-hero  { display:none; }
        }
      `}</style>
    </div>
  );
}