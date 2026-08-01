import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; }

  :root {
    --primary: #6c63ff;
    --primary-light: #ede9ff;
    --accent: #ff6584;
    --text: #1a1a2e;
    --muted: #6b7280;
    --border: #e5e7eb;
    --bg-light: #f8f7ff;
    --success: #10b981;
  }

  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(28px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
  @keyframes float   { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-12px) } }
  @keyframes pulse   { 0%,100%{ box-shadow:0 0 0 0 rgba(108,99,255,.4) } 50%{ box-shadow:0 0 0 10px rgba(108,99,255,0) } }
  @keyframes spin    { to{ transform:rotate(360deg) } }
  @keyframes scoreIn { from{ opacity:0;transform:scale(.5) } to{ opacity:1;transform:scale(1) } }

  /* ── OVERLAY & MODAL ── */
  .overlay {
    position:fixed; inset:0; z-index:1000;
    background:rgba(108,99,255,.13); backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center;
    animation:fadeIn .3s ease;
  }
  .modal {
    background:#fff; border-radius:24px; padding:40px 36px;
    width:440px; max-width:95vw;
    box-shadow:0 24px 80px rgba(108,99,255,.18);
    animation:slideUp .35s cubic-bezier(.34,1.56,.64,1);
    position:relative;
  }
  .modal-close {
    position:absolute; top:16px; right:18px;
    background:none; border:none; cursor:pointer;
    font-size:20px; color:var(--muted);
    width:32px; height:32px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    transition:background .2s;
  }
  .modal-close:hover { background:var(--bg-light); }
  .modal-logo { display:flex; align-items:center; gap:8px; margin-bottom:24px; justify-content:center; }
  .modal-logo-dot {
    width:32px; height:32px; border-radius:8px;
    background:linear-gradient(135deg,var(--primary),var(--accent));
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:800; font-size:14px;
  }
  .modal-logo span { font-weight:800; font-size:18px; color:var(--text); }
  .modal h2 { font-size:24px; font-weight:800; text-align:center; margin-bottom:6px; }
  .modal > p { text-align:center; color:var(--muted); font-size:14px; margin-bottom:28px; }

  .form-group { margin-bottom:16px; }
  .form-group label { display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:6px; }
  .form-group input {
    width:100%; padding:12px 14px; border:1.5px solid var(--border);
    border-radius:10px; font-size:14px; font-family:'Inter',sans-serif;
    outline:none; transition:border .2s,box-shadow .2s; background:#fafafa;
  }
  .form-group input:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(108,99,255,.12); background:#fff; }
  .form-group input.err { border-color:var(--accent); }
  .field-err { color:var(--accent); font-size:12px; margin-top:4px; }

  .btn-primary {
    width:100%; padding:14px;
    background:linear-gradient(135deg,var(--primary),#8b5cf6);
    color:#fff; border:none; border-radius:10px;
    font-size:15px; font-weight:700; cursor:pointer;
    transition:opacity .2s,transform .15s; margin-top:4px;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .btn-primary:hover  { opacity:.92; transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }

  .modal-switch { text-align:center; margin-top:20px; font-size:13px; color:var(--muted); }
  .modal-switch a { color:var(--primary); font-weight:600; cursor:pointer; text-decoration:none; }
  .modal-switch a:hover { text-decoration:underline; }

  .success-banner {
    background:#ecfdf5; border:1.5px solid #6ee7b7;
    border-radius:10px; padding:12px 14px; margin-bottom:16px;
    color:#065f46; font-size:13px; font-weight:500;
    display:flex; align-items:center; gap:8px;
  }

  /* ── NAV ── */
  nav {
    position:sticky; top:0; z-index:200;
    background:rgba(255,255,255,.95); backdrop-filter:blur(14px);
    border-bottom:1px solid var(--border);
    padding:0 6%; height:66px;
    display:flex; align-items:center; justify-content:space-between; gap:24px;
  }

  /* Logo */
  .nav-logo { display:flex; align-items:center; gap:9px; cursor:pointer; flex-shrink:0; }
  .nav-logo-icon {
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg,var(--primary),var(--accent));
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:900; font-size:15px;
  }
  .nav-logo-text { font-weight:800; font-size:18px; color:var(--text); }
  .nav-logo-text b { color:var(--primary); }

  /* Nav links – always visible */
  .nav-links {
    display:flex; align-items:center; gap:0; list-style:none;
    flex:1; justify-content:center;
  }
  .nav-links li a {
    display:block; padding:8px 18px;
    font-size:14px; font-weight:600; color:var(--muted);
    text-decoration:none; cursor:pointer; white-space:nowrap;
    border-bottom:2.5px solid transparent;
    transition:color .18s, border-color .18s;
  }
  .nav-links li a:hover  { color:var(--primary); }
  .nav-links li a.active { color:var(--primary); border-bottom-color:var(--primary); }

  /* Nav buttons */
  .nav-actions { display:flex; gap:10px; align-items:center; flex-shrink:0; }
  .btn-ghost {
    padding:9px 20px; border:1.5px solid var(--border);
    background:none; border-radius:8px; font-size:14px; font-weight:600;
    cursor:pointer; color:var(--text); transition:all .2s;
  }
  .btn-ghost:hover { border-color:var(--primary); color:var(--primary); }
  .btn-cta {
    padding:9px 22px;
    background:linear-gradient(135deg,var(--primary),#8b5cf6);
    color:#fff; border:none; border-radius:8px;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:opacity .2s,transform .15s;
    animation:pulse 2.5s infinite;
  }
  .btn-cta:hover { opacity:.9; transform:translateY(-1px); }

  /* ── HERO ── */
  #home {
    padding:80px 6% 64px;
    display:flex; align-items:center; justify-content:space-between; gap:40px;
    background:linear-gradient(135deg,#faf9ff 0%,#f0eeff 100%);
    min-height:520px;
  }
  .hero-left { max-width:520px; }
  .hero-badge {
    display:inline-flex; align-items:center; gap:7px;
    background:var(--primary-light); color:var(--primary);
    padding:6px 16px; border-radius:999px; font-size:13px; font-weight:600; margin-bottom:22px;
  }
  .hero-badge-dot { width:8px; height:8px; background:var(--primary); border-radius:50%; animation:pulse 1.5s infinite; }
  .hero-h1 { font-size:52px; font-weight:900; line-height:1.1; margin-bottom:18px; }
  .hero-h1 span { color:var(--primary); }
  .hero-desc { font-size:17px; color:var(--muted); line-height:1.7; margin-bottom:32px; }
  .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }
  .hero-btn-p {
    padding:14px 28px;
    background:linear-gradient(135deg,var(--primary),#8b5cf6);
    color:#fff; border:none; border-radius:10px;
    font-size:15px; font-weight:700; cursor:pointer;
    transition:opacity .2s,transform .15s;
  }
  .hero-btn-p:hover { opacity:.9; transform:translateY(-2px); }
  .hero-btn-s {
    padding:14px 28px; border:1.5px solid var(--border);
    background:#fff; border-radius:10px; font-size:15px;
    font-weight:600; cursor:pointer; color:var(--text);
    display:flex; align-items:center; gap:8px;
    transition:border-color .2s,color .2s;
  }
  .hero-btn-s:hover { border-color:var(--primary); color:var(--primary); }

  .hero-right { position:relative; flex-shrink:0; }
  .ats-card {
    background:#fff; border-radius:20px; padding:24px 28px;
    box-shadow:0 20px 60px rgba(108,99,255,.15);
    animation:float 4s ease-in-out infinite; width:220px;
  }
  .ats-label { font-size:11px; font-weight:700; color:var(--muted); margin-bottom:12px; letter-spacing:.07em; text-transform:uppercase; }
  .ats-ring {
    width:90px; height:90px; border-radius:50%;
    background:conic-gradient(var(--primary) 0deg 306deg,#e5e7eb 306deg 360deg);
    display:flex; align-items:center; justify-content:center; margin:0 auto 12px;
  }
  .ats-inner { width:66px; height:66px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column; }
  .ats-num { font-size:24px; font-weight:900; color:var(--primary); animation:scoreIn .8s ease; }
  .ats-sub { font-size:9px; color:var(--muted); font-weight:500; }
  .mini-badge {
    position:absolute; background:#fff; border-radius:12px; padding:10px 14px;
    box-shadow:0 8px 24px rgba(0,0,0,.1);
    font-size:12px; font-weight:600; display:flex; align-items:center; gap:6px;
  }
  .mini-badge.t { top:-20px; right:-30px; }
  .mini-badge.b { bottom:10px; left:-40px; animation:float 3.5s ease-in-out infinite .5s; }

  /* ── TRUST ── */
  .trust { padding:32px 6%; border-top:1px solid var(--border); border-bottom:1px solid var(--border); text-align:center; }
  .trust p { color:var(--muted); font-size:13px; font-weight:500; margin-bottom:18px; }
  .trust-logos { display:flex; justify-content:center; align-items:center; gap:40px; flex-wrap:wrap; }
  .trust-logos span { font-size:15px; font-weight:700; color:#adb5bd; }

  /* ── SECTION COMMON ── */
  .sec-tag { display:inline-block; background:var(--primary-light); color:var(--primary); padding:4px 14px; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; margin-bottom:14px; }
  .sec-title { font-size:36px; font-weight:900; margin-bottom:10px; }
  .sec-sub { color:var(--muted); font-size:16px; margin-bottom:48px; }

  /* ── FEATURES ── */
  #features { padding:80px 6%; text-align:center; }
  .features-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; max-width:1100px; margin:0 auto; }
  .feat-card {
    background:#fff; border:1.5px solid var(--border); border-radius:16px; padding:28px 22px; text-align:left;
    transition:transform .25s,box-shadow .25s,border-color .25s; cursor:pointer;
  }
  .feat-card:hover { transform:translateY(-6px); box-shadow:0 20px 50px rgba(108,99,255,.12); border-color:var(--primary); }
  .feat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:16px; }
  .feat-card h3 { font-size:15px; font-weight:700; margin-bottom:8px; }
  .feat-card p  { font-size:13px; color:var(--muted); line-height:1.6; }

  /* ── HOW IT WORKS ── */
  #how-it-works { padding:80px 6%; background:var(--bg-light); text-align:center; }
  .steps { display:flex; justify-content:center; max-width:900px; margin:0 auto; position:relative; }
  .steps::before { content:''; position:absolute; top:36px; left:15%; right:15%; height:2px; background:linear-gradient(90deg,var(--primary),#8b5cf6); z-index:0; }
  .step { flex:1; text-align:center; padding:0 16px; position:relative; z-index:1; }
  .step-num {
    width:72px; height:72px; border-radius:50%;
    background:linear-gradient(135deg,var(--primary),#8b5cf6);
    color:#fff; font-size:24px; font-weight:900;
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 16px; box-shadow:0 8px 20px rgba(108,99,255,.3);
  }
  .step h4 { font-size:15px; font-weight:700; margin-bottom:8px; }
  .step p  { font-size:13px; color:var(--muted); line-height:1.6; }

  /* ── TESTIMONIALS ── */
  #testimonials { padding:80px 6%; text-align:center; }
  .t-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; max-width:1000px; margin:0 auto; }
  .tcard { background:#fff; border:1.5px solid var(--border); border-radius:16px; padding:28px 22px; text-align:left; transition:box-shadow .2s; }
  .tcard:hover { box-shadow:0 12px 36px rgba(108,99,255,.1); }
  .stars { color:#f59e0b; font-size:14px; margin-bottom:12px; }
  .tcard p { font-size:14px; color:var(--muted); line-height:1.7; margin-bottom:16px; font-style:italic; }
  .tcard-author { display:flex; align-items:center; gap:10px; }
  .tcard-avatar { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--accent)); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:15px; }
  .tcard-name { font-weight:700; font-size:14px; }
  .tcard-role { font-size:12px; color:var(--muted); }

  /* ── CTA BANNER ── */
  .cta-banner {
    margin:80px 6%;
    background:linear-gradient(135deg,var(--primary) 0%,#8b5cf6 100%);
    border-radius:24px; padding:64px 48px; text-align:center; color:#fff;
  }
  .cta-banner h2 { font-size:36px; font-weight:900; margin-bottom:12px; }
  .cta-banner p  { opacity:.85; font-size:16px; margin-bottom:32px; }
  .cta-btn {
    padding:16px 36px; background:#fff; color:var(--primary);
    border:none; border-radius:10px; font-size:16px; font-weight:700;
    cursor:pointer; transition:transform .15s,box-shadow .2s;
    box-shadow:0 4px 16px rgba(0,0,0,.15);
  }
  .cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2); }

  /* ── CONTACT ── */
  #contact { padding:80px 6%; background:var(--bg-light); }
  .contact-inner { max-width:580px; margin:0 auto; text-align:center; }
  .contact-form { display:flex; flex-direction:column; gap:16px; text-align:left; margin-top:0; }
  .contact-form input,
  .contact-form textarea {
    width:100%; padding:13px 16px; border:1.5px solid var(--border);
    border-radius:10px; font-size:14px; font-family:'Inter',sans-serif;
    outline:none; transition:border .2s,box-shadow .2s; background:#fff; resize:none;
  }
  .contact-form input:focus,
  .contact-form textarea:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(108,99,255,.12); }
  .contact-submit {
    padding:14px; background:linear-gradient(135deg,var(--primary),#8b5cf6);
    color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:700;
    cursor:pointer; transition:opacity .2s,transform .15s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .contact-submit:hover   { opacity:.9; transform:translateY(-1px); }
  .contact-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* ── FOOTER ── */
  footer {
    background:#0f0d1a; color:#9ca3af; padding:40px 6% 28px;
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;
  }
  .footer-logo { display:flex; align-items:center; gap:8px; }
  .footer-logo span { color:#fff; font-weight:800; font-size:16px; }
  footer p { font-size:13px; }

  /* ── TOAST ── */
  .toast {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:#1a1a2e; color:#fff; padding:14px 20px; border-radius:12px;
    font-size:14px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,.2);
    display:flex; align-items:center; gap:10px;
    animation:slideUp .35s cubic-bezier(.34,1.56,.64,1);
  }
  .toast.success { border-left:4px solid var(--success); }
  .toast.error   { border-left:4px solid var(--accent); }

  /* ── MOBILE NAV TOGGLE ── */
  .nav-burger {
    display: none;
    background: none; border: none; cursor: pointer;
    width: 38px; height: 38px; border-radius: 8px;
    align-items: center; justify-content: center;
    color: var(--text); flex-shrink: 0;
  }
  .nav-burger:hover { background: var(--bg-light); }

  /* ── RESPONSIVE ── */
  @media (max-width:960px) {
    .features-grid { grid-template-columns:repeat(2,1fr); }
    .t-grid        { grid-template-columns:1fr; }
    #home          { flex-direction:column; padding:48px 6%; text-align:center; }
    .hero-h1       { font-size:36px; }
    .hero-btns     { justify-content:center; }
    .hero-right    { display:none; }
    .steps         { flex-direction:column; gap:32px; }
    .steps::before { display:none; }
  }
  @media (max-width:700px) {
    nav { padding:0 4%; gap:12px; flex-wrap:wrap; height:auto; min-height:66px; }
    .nav-burger { display:flex; }

    .nav-links {
      order: 3; flex-basis: 100%; justify-content: flex-start;
      flex-direction: column; align-items: stretch; gap: 2px;
      max-height: 0; overflow: hidden;
      transition: max-height .25s ease;
    }
    .nav-links.open { max-height: 320px; padding: 8px 0 12px; }
    .nav-links li { width: 100%; }
    .nav-links li a {
      display: block; padding: 12px 8px; font-size: 14px;
      border-bottom: 1px solid var(--border); border-radius: 0;
    }
    .nav-links li a.active { border-bottom-color: var(--border); background: var(--primary-light); }

    .nav-actions {
      order: 4; flex-basis: 100%; flex-direction: column; align-items: stretch;
      gap: 8px; max-height: 0; overflow: hidden; transition: max-height .25s ease;
    }
    .nav-actions.open { max-height: 220px; padding-bottom: 14px; }
    .nav-actions .btn-ghost, .nav-actions .btn-cta { width: 100%; }

    .features-grid { grid-template-columns:1fr; }
  }
`;

// ─── Data ────────────────────────────────────────────

const FEATURES = [
  { icon:"📄", color:"#ede9ff", label:"Resume Analyzer",     desc:"Get ATS score and AI-powered suggestions to improve your resume." },
  { icon:"🎯", color:"#fce7f3", label:"AI Mock Interview",   desc:"Practice with AI and receive real-time detailed feedback." },
  { icon:"🗺️", color:"#ecfdf5", label:"Personalized Roadmap",desc:"Get a custom career roadmap tailored exactly for your dream role." },
  { icon:"🤝", color:"#fff7ed", label:"Human Interview",      desc:"Book 1:1 mock interviews with seasoned industry experts." },
];

const TESTIMONIALS = [
  { name:"Priya M.",  role:"SWE @ Google",     text:"PlacementAI boosted my ATS score from 54 to 91. Landed my dream offer in 3 weeks!",          stars:5 },
  { name:"Rahul S.",  role:"PM @ Microsoft",   text:"The mock interviews were incredibly realistic. My confidence shot up before the real ones.",    stars:5 },
  { name:"Ananya K.", role:"Analyst @ Amazon", text:"The personalized roadmap was a game changer. I finally knew exactly where to focus.",           stars:5 },
];

const STEPS = [
  { num:"1", title:"Upload Your Resume",  desc:"Drop your resume and get an instant ATS analysis." },
  { num:"2", title:"Practice & Improve",  desc:"Use AI interviews and your roadmap to upskill fast." },
  { num:"3", title:"Get Hired",           desc:"Apply with confidence and land your dream job." },
];

// Only these 4 in the navbar — no "Home"
const NAV_LINKS = [
  { label:"Features",      href:"features"     },
  { label:"How It Works",  href:"how-it-works"  },
  { label:"Testimonials",  href:"testimonials"  },
  { label:"Contact",       href:"contact"       },
];

// ─── Helpers ─────────────────────────────────────────

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
}

// ─── Sub-components ──────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}><span>{type==="success"?"✅":"❌"}</span>{msg}</div>;
}

function RegisterModal({ onClose, onSwitchToLogin }) {
  const [form, setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name    = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 6)       e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm  = "Passwords don't match";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("pai_users") || "[]");
      users.push({ name:form.name, email:form.email, password:form.password });
      localStorage.setItem("pai_users", JSON.stringify(users));
      setLoading(false); setDone(true);
    }, 1400);
  };

  const upd = k => ev => { setForm(f=>({...f,[k]:ev.target.value})); setErrors(e=>({...e,[k]:undefined})); };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">
          <div className="modal-logo-dot">P</div>
          <span>Placement<b style={{color:"var(--primary)"}}>AI</b></span>
        </div>
        <h2>Create your account</h2>
        <p>Start your AI-powered career journey today</p>

        {done ? (
          <>
            <div className="success-banner">🎉 Account created! You can now log in.</div>
            <button className="btn-primary" onClick={onSwitchToLogin}>Go to Login →</button>
          </>
        ) : (
          <>
            {[
              { k:"name",    label:"Full Name",        type:"text",     ph:"Rahul Sharma" },
              { k:"email",   label:"Email",            type:"email",    ph:"you@email.com" },
              { k:"password",label:"Password",         type:"password", ph:"Min 6 characters" },
              { k:"confirm", label:"Confirm Password", type:"password", ph:"Repeat password" },
            ].map(({k,label,type,ph})=>(
              <div className="form-group" key={k}>
                <label>{label}</label>
                <input type={type} placeholder={ph} value={form[k]} onChange={upd(k)} className={errors[k]?"err":""} />
                {errors[k] && <div className="field-err">{errors[k]}</div>}
              </div>
            ))}
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? <><div className="spinner"/>Creating account…</> : "Create Account"}
            </button>
            <div className="modal-switch">Already have an account? <a onClick={onSwitchToLogin}>Log in</a></div>
          </>
        )}
      </div>
    </div>
  );
}

function LoginModal({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [form, setForm]     = useState({ email:"", password:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const upd = k => ev => { setForm(f=>({...f,[k]:ev.target.value})); setErrors(e=>({...e,[k]:undefined,global:undefined})); };

  const submit = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("pai_users") || "[]");
      const user  = users.find(u => u.email===form.email && u.password===form.password);
      setLoading(false);
      if (user) onLoginSuccess(user);
      else setErrors({ global:"Invalid credentials. Please register first." });
    }, 1200);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">
          <div className="modal-logo-dot">P</div>
          <span>Placement<b style={{color:"var(--primary)"}}>AI</b></span>
        </div>
        <h2>Welcome back 👋</h2>
        <p>Log in to continue your career journey</p>

        {errors.global && (
          <div className="success-banner" style={{background:"#fff1f2",borderColor:"#fca5a5",color:"#991b1b"}}>
            ⚠️ {errors.global}
          </div>
        )}
        {[
          { k:"email",    label:"Email",    type:"email",    ph:"you@email.com" },
          { k:"password", label:"Password", type:"password", ph:"Your password" },
        ].map(({k,label,type,ph})=>(
          <div className="form-group" key={k}>
            <label>{label}</label>
            <input type={type} placeholder={ph} value={form[k]} onChange={upd(k)} className={errors[k]?"err":""} />
            {errors[k] && <div className="field-err">{errors[k]}</div>}
          </div>
        ))}
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? <><div className="spinner"/>Logging in…</> : "Log In"}
        </button>
        <div className="modal-switch">New here? <a onClick={onSwitchToRegister}>Create an account</a></div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const [modal,   setModal]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [toast,   setToast]   = useState(null);
  const [active,  setActive]  = useState("");
  const [cForm,   setCForm]   = useState({ name:"", email:"", message:"" });
  const [cSending,setCsending]= useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg, type="success") => setToast({ msg, type });

  const handleNav = id => { setActive(id); scrollTo(id); setMobileMenuOpen(false); };

  const openRegister = () => setModal("register");
  const openLogin    = () => {
    const users = JSON.parse(localStorage.getItem("pai_users") || "[]");
    if (!users.length) { setModal("register"); showToast("Please register first to get access.","error"); }
    else setModal("login");
  };
  const openGetStarted = () => {
    if (user) { showToast("You're already logged in! 🚀"); return; }
    setModal("register");
  };
  const handleLoginSuccess = u => { setUser(u); setModal(null); showToast(`Welcome back, ${u.name}! 🎉`); navigate("/dashboard"); };

  const sendContact = () => {
    if (!cForm.name || !cForm.email || !cForm.message) { showToast("Please fill all fields.","error"); return; }
    setCsending(true);
    setTimeout(() => {
      setCsending(false);
      setCForm({ name:"", email:"", message:"" });
      showToast("Message sent! We'll get back to you soon. 📬");
    }, 1500);
  };

  return (
    <>
      <style>{style}</style>

      {modal==="register" && <RegisterModal onClose={()=>setModal(null)} onSwitchToLogin={()=>setModal("login")} />}
      {modal==="login"    && <LoginModal    onClose={()=>setModal(null)} onSwitchToRegister={()=>setModal("register")} onLoginSuccess={handleLoginSuccess} />}
      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}

      {/* ══ NAV ══ */}
      <nav>
        {/* Logo — click scrolls to top */}
        <div className="nav-logo" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>
          <div className="nav-logo-icon">P</div>
          <span className="nav-logo-text">Placement<b>AI</b></span>
        </div>

        {/* Hamburger toggle — mobile only */}
        <button
          className="nav-burger"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(o => !o)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* 4 nav links */}
        <ul className={"nav-links" + (mobileMenuOpen ? " open" : "")}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a
                className={active===l.href ? "active" : ""}
                onClick={() => handleNav(l.href)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Auth buttons */}
        <div className={"nav-actions" + (mobileMenuOpen ? " open" : "")}>
          {user ? (
            <>
              <span style={{fontSize:14,fontWeight:600,color:"var(--primary)"}}>👤 {user.name}</span>
              <button className="btn-ghost" onClick={()=>{setUser(null);showToast("Logged out successfully.");setMobileMenuOpen(false);}}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={()=>{openLogin();setMobileMenuOpen(false);}}>Login</button>
              <button className="btn-cta"   onClick={()=>{openRegister();setMobileMenuOpen(false);}}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="home">
        <div className="hero-left">
          <div className="hero-badge"><span className="hero-badge-dot"/>&nbsp;AI-Powered Career Platform</div>
          <h1 className="hero-h1">Your AI-Powered<br/><span>Career Success</span><br/>Starts Here</h1>
          <p className="hero-desc">AI tools to analyze your resume, practice interviews, get a personalized roadmap and land your dream job.</p>
          <div className="hero-btns">
            <button className="hero-btn-p" onClick={openGetStarted}>Get Started Free</button>
            <button className="hero-btn-s" onClick={()=>showToast("🎬 Demo coming soon!")}>▶ Watch Demo</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="ats-card">
            <div className="ats-label">ATS Score</div>
            <div className="ats-ring">
              <div className="ats-inner">
                <div className="ats-num">85</div>
                <div className="ats-sub">/ 100</div>
              </div>
            </div>
            <div style={{textAlign:"center",fontSize:13,color:"var(--muted)",fontWeight:500}}>Great match! 🎯</div>
          </div>
          <div className="mini-badge t">🚀 Interview Ready</div>
          <div className="mini-badge b">📈 +34% Score Boost</div>
        </div>
      </section>

      {/* ══ TRUST ══ */}
      <section className="trust">
        <p>Trusted by 10,000+ students and professionals</p>
        <div className="trust-logos">
          {["Google","Microsoft","amazon","TCS","Infosys"].map(b=><span key={b}>{b}</span>)}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features">
        <div className="sec-tag">Features</div>
        <h2 className="sec-title">Everything You Need to Get Hired</h2>
        <p className="sec-sub">All-in-one platform to ace your job search</p>
        <div className="features-grid">
          {FEATURES.map(f=>(
            <div className="feat-card" key={f.label} onClick={openGetStarted}>
              <div className="feat-icon" style={{background:f.color}}>{f.icon}</div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works">
        <div className="sec-tag">Process</div>
        <h2 className="sec-title">How It Works</h2>
        <p className="sec-sub">Three simple steps to your dream job</p>
        <div className="steps">
          {STEPS.map(s=>(
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section id="testimonials">
        <div className="sec-tag">Testimonials</div>
        <h2 className="sec-title">Success Stories</h2>
        <p className="sec-sub">Real results from real people</p>
        <div className="t-grid">
          {TESTIMONIALS.map(t=>(
            <div className="tcard" key={t.name}>
              <div className="stars">{"★".repeat(t.stars)}</div>
              <p>"{t.text}"</p>
              <div className="tcard-author">
                <div className="tcard-avatar">{t.name[0]}</div>
                <div>
                  <div className="tcard-name">{t.name}</div>
                  <div className="tcard-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <div className="cta-banner">
        <h2>Ready to Land Your Dream Job?</h2>
        <p>Join 10,000+ professionals who leveled up with PlacementAI</p>
        <button className="cta-btn" onClick={openGetStarted}>Start for Free — No Credit Card</button>
      </div>

      {/* ══ CONTACT ══ */}
      <section id="contact">
        <div className="contact-inner">
          <div className="sec-tag">Contact</div>
          <h2 className="sec-title">Get in Touch</h2>
          <p className="sec-sub">Have questions? We'd love to hear from you.</p>
          <div className="contact-form">
            <input placeholder="Your Name"  value={cForm.name}    onChange={e=>setCForm(f=>({...f,name:e.target.value}))} />
            <input placeholder="Your Email" value={cForm.email}   onChange={e=>setCForm(f=>({...f,email:e.target.value}))} type="email" />
            <textarea rows={5} placeholder="Your message…" value={cForm.message} onChange={e=>setCForm(f=>({...f,message:e.target.value}))} />
            <button className="contact-submit" onClick={sendContact} disabled={cSending}>
              {cSending ? <><div className="spinner"/>Sending…</> : "Send Message ✉️"}
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="footer-logo">
          <div className="nav-logo-icon" style={{width:28,height:28,fontSize:12}}>P</div>
          <span>PlacementAI</span>
        </div>
        <p>© 2024 PlacementAI. All rights reserved.</p>
        <p>Made with ❤️ for job seekers</p>
      </footer>
    </>
  );
}
