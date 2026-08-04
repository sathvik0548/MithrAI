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

  const FieldError = ({ k }) => fieldErrors[k] ? <span className="fe">{fieldErrors[k]}</span> : null;

  return (
    <div className="rp">
      {/* Left panel — hero / value props */}
      <motion.div
        className="rp-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55 }}
      >
        <div className="rp-hero-inner">
          <div className="rp-hero-steps">
            {[
              { icon: "📄", label: "Upload your resume", desc: "Get an instant ATS score and specific keyword suggestions." },
              { icon: "🎤", label: "Run a mock interview", desc: "Practice real questions and get detailed scoring feedback." },
              { icon: "🗺️", label: "Follow your roadmap", desc: "A phased learning plan built around your actual skill gaps." },
              { icon: "🤝", label: "Book an expert", desc: "1-on-1 mock interviews with industry practitioners." },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="hero-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.08, duration: 0.4 }}
              >
                <div className="hero-step-icon">{step.icon}</div>
                <div>
                  <div className="hero-step-label">{step.label}</div>
                  <div className="hero-step-desc">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rp-hero-brand">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
              <rect width="36" height="36" rx="10" fill="#B4563E"/>
              <path d="M 8 22 C 15 22 19 16 19 8" stroke="#FDF6EC" strokeWidth="3.2" strokeLinecap="round"/>
              <path d="M 28 14 C 21 14 17 20 17 28" stroke="#FDF6EC" strokeWidth="3.2" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3" fill="#E2A377"/>
            </svg>
            <span className="rp-logo-text">MithrAI</span>
          </div>
        </div>
      </motion.div>

      {/* Right panel — registration form */}
      <motion.div
        className="rp-form"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="rp-form-inner">
          <div className="rp-heading">
            <h1>Create your account</h1>
            <p>No credit card. No filler. Just the tools.</p>
          </div>

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

          <div className="or-div"><span>or sign up with email</span></div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="err-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            <div className={`ff ${fieldErrors.name ? "ff-err" : ""}`}>
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" autoComplete="name" placeholder="Riya Mehta" value={form.name} onChange={set("name")} />
              <FieldError k="name" />
            </div>

            <div className={`ff ${fieldErrors.email ? "ff-err" : ""}`}>
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              <FieldError k="email" />
            </div>

            <div className={`ff ${fieldErrors.password ? "ff-err" : ""}`}>
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} />
              <FieldError k="password" />
            </div>

            <div className={`ff ${fieldErrors.confirm ? "ff-err" : ""}`}>
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} />
              <FieldError k="confirm" />
            </div>

            <button type="submit" className="submit-btn" disabled={loading || googleLoading} id="register-submit-btn">
              {loading ? <span className="btn-spinner" /> : "Create Account →"}
            </button>
          </form>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; }

        .rp {
          display: flex; min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          background: #FDF6EC; color: #2A1F1A;
        }

        /* Hero Left Panel (Terracotta) */
        .rp-hero {
          flex: 1; background: #B4563E;
          display: flex; align-items: center; justify-content: center;
          padding: 48px; position: relative; overflow: hidden;
        }
        .rp-hero::before {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .rp-hero-inner { max-width: 420px; width: 100%; position: relative; z-index: 1; }

        .rp-hero-steps {
          display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px;
        }

        .hero-step { display: flex; align-items: flex-start; gap: 14px; }

        .hero-step-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0; color: #fff;
        }

        .hero-step-label { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; font-family: 'Fraunces', Georgia, serif; }
        .hero-step-desc { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.5; font-family: 'Inter', sans-serif; }

        .rp-hero-brand { display: flex; align-items: center; gap: 10px; }

        .rp-logo-mark {
          width: 34px; height: 34px; background: rgba(255,255,255,0.2); border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 17px; color: #fff; font-family: 'Fraunces', Georgia, serif;
        }

        .rp-logo-text { font-weight: 700; font-size: 17px; color: #fff; font-family: 'Inter', sans-serif; }

        /* Form Right Panel (Cream) */
        .rp-form {
          flex: 0 0 460px; max-width: 460px; background: #FFFBF5;
          border-left: 1px solid #E8D9CC; display: flex; align-items: center;
          justify-content: center; padding: 48px;
        }

        .rp-form-inner { width: 100%; max-width: 340px; }

        .rp-heading { margin-bottom: 24px; }
        .rp-heading h1 { font-size: 26px; font-weight: 800; color: #2A1F1A; margin-bottom: 5px; }
        .rp-heading p { font-size: 14px; color: #7A6558; font-family: 'Inter', sans-serif; }

        .google-btn {
          width: 100%; padding: 13px 16px; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #fff; color: #2A1F1A; border: 1.5px solid #E8D9CC;
          border-radius: 9px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.2s; margin-bottom: 18px;
        }
        .google-btn:hover:not(:disabled) { border-color: #B4563E; box-shadow: 0 4px 14px rgba(180,86,62,0.15); transform: translateY(-1px); }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .or-div {
          display: flex; align-items: center; gap: 12px; margin: 4px 0 18px;
          color: #B8A89A; font-size: 12px; font-family: 'Inter', sans-serif;
        }
        .or-div::before, .or-div::after { content: ''; flex: 1; height: 1px; background: #E8D9CC; }

        .err-banner {
          background: #FDF0EE; border: 1px solid rgba(180,86,62,0.3); color: #923F2B;
          padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; line-height: 1.4;
          font-family: 'Inter', sans-serif;
        }

        .ff { margin-bottom: 14px; display: flex; flex-direction: column; gap: 5px; }
        .ff label { font-size: 12.5px; font-weight: 600; color: #2A1F1A; font-family: 'Inter', sans-serif; }
        .ff input {
          width: 100%; padding: 11px 13px; background: #FDF6EC;
          border: 1.5px solid #E8D9CC; border-radius: 9px; font-size: 14px;
          color: #2A1F1A; font-family: 'Inter', sans-serif; outline: none;
          transition: border .2s, background .2s;
        }
        .ff input::placeholder { color: #B8A89A; }
        .ff input:focus { border-color: #B4563E; background: #FFFBF5; box-shadow: 0 0 0 3px rgba(180,86,62,0.1); }
        .ff-err input { border-color: rgba(193,57,43,0.45); }
        .fe { font-size: 12px; color: #C1392B; font-family: 'Inter', sans-serif; }

        .submit-btn {
          width: 100%; padding: 13px; background: #B4563E; color: #fff;
          border: none; border-radius: 9px; font-size: 15px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; margin-top: 6px; margin-bottom: 18px;
        }
        .submit-btn:hover:not(:disabled) { background: #923F2B; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(180,86,62,0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .switch-auth { font-size: 13px; color: #7A6558; text-align: center; font-family: 'Inter', sans-serif; }
        .switch-auth a { color: #B4563E; text-decoration: none; font-weight: 500; }
        .switch-auth a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .rp-hero { display: none; }
          .rp-form { flex: 1; max-width: 100%; border-left: none; padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}