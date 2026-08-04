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

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [k]: "" }));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tell us your name.";
    if (!form.email.trim()) errs.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "That doesn't look like a valid email.";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await signUp(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("An account with this email already exists. Try signing in instead.");
      } else if (msg.includes("Password should be at least")) {
        setError("Password must be at least 6 characters long.");
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
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  const FieldError = ({ k }) => fieldErrors[k] ? <span className="field-error">{fieldErrors[k]}</span> : null;

  return (
    <div className="register-page">
      {/* Left — hero panel */}
      <motion.div
        className="reg-hero-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="reg-hero-inner">
          <div className="reg-hero-steps">
            {[
              { emoji: "📄", label: "Upload your resume", desc: "Get an instant ATS score and specific suggestions." },
              { emoji: "🎤", label: "Run a mock interview", desc: "Claude asks real questions and grades your answers." },
              { emoji: "🗺️", label: "Follow your roadmap", desc: "A phased learning plan built around your actual gaps." },
              { emoji: "📅", label: "Book an expert", desc: "Human coaches for a final round practice session." },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="hero-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              >
                <div className="hero-step-icon">{step.emoji}</div>
                <div>
                  <div className="hero-step-label">{step.label}</div>
                  <div className="hero-step-desc">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="reg-hero-brand">
            <span className="reg-hero-logo-mark">R</span>
            <span className="reg-hero-logo-text">MithrAI</span>
          </div>
        </div>
      </motion.div>

      {/* Right — form panel */}
      <motion.div
        className="reg-form-panel"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="reg-form-inner">
          <div className="reg-heading">
            <h1>Create your account</h1>
            <p>No credit card. No filler. Just the tools.</p>
          </div>

          {/* Google */}
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            id="google-register-btn"
          >
            {googleLoading ? <span className="btn-spinner" /> : GOOGLE_ICON}
            Sign up with Google
          </button>

          <div className="or-divider"><span>or use email</span></div>

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
            <div className={`form-field ${fieldErrors.name ? "has-error" : ""}`}>
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" autoComplete="name" placeholder="Riya Mehta" value={form.name} onChange={set("name")} />
              <FieldError k="name" />
            </div>

            <div className={`form-field ${fieldErrors.email ? "has-error" : ""}`}>
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              <FieldError k="email" />
            </div>

            <div className={`form-field ${fieldErrors.password ? "has-error" : ""}`}>
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} />
              <FieldError k="password" />
            </div>

            <div className={`form-field ${fieldErrors.confirm ? "has-error" : ""}`}>
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} />
              <FieldError k="confirm" />
            </div>

            <button type="submit" className="submit-btn" disabled={loading || googleLoading} id="register-submit-btn">
              {loading ? <span className="btn-spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .register-page {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          background: #08070f;
          color: #e2e0ff;
        }

        /* Hero */
        .reg-hero-panel {
          flex: 1;
          background: linear-gradient(135deg, #0d0b1e 0%, #130f2e 60%, #0d0b1e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          border-right: 1px solid rgba(108,99,255,0.12);
          position: relative;
          overflow: hidden;
        }

        .reg-hero-panel::before {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-hero-inner {
          max-width: 420px;
          width: 100%;
        }

        .reg-hero-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 48px;
        }

        .hero-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .hero-step-icon {
          width: 42px;
          height: 42px;
          background: rgba(108,99,255,0.12);
          border: 1px solid rgba(108,99,255,0.25);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .hero-step-label {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 3px;
        }

        .hero-step-desc {
          font-size: 13px;
          color: rgba(226,224,255,0.45);
          line-height: 1.5;
        }

        .reg-hero-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reg-hero-logo-mark {
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
        }

        .reg-hero-logo-text {
          font-weight: 700;
          font-size: 18px;
          color: rgba(226,224,255,0.7);
        }

        /* Form panel */
        .reg-form-panel {
          flex: 0 0 480px;
          max-width: 480px;
          background: #0e0c1e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .reg-form-inner {
          width: 100%;
          max-width: 360px;
        }

        .reg-heading {
          margin-bottom: 28px;
        }

        .reg-heading h1 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }

        .reg-heading p {
          font-size: 14px;
          color: rgba(226,224,255,0.45);
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

        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
          margin-bottom: 16px;
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
          padding: 11px 14px;
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
        .form-field input:focus { border-color: #6c63ff; background: rgba(108,99,255,0.1); }
        .form-field.has-error input { border-color: rgba(239,68,68,0.5); }

        .field-error { font-size: 12px; color: #fca5a5; }

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

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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

        .switch-auth a { color: #a78bfa; text-decoration: none; font-weight: 500; }
        .switch-auth a:hover { color: #c4b5fd; text-decoration: underline; }

        @media (max-width: 768px) {
          .reg-hero-panel { display: none; }
          .reg-form-panel { flex: 1; max-width: 100%; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}