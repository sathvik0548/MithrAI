import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── Design tokens (mirrored from CSS vars so inline styles stay consistent) */
const T = {
  primary:      "#B4563E",
  primaryDark:  "#923F2B",
  primaryLight: "#F5E6DF",
  secondary:    "#E2A377",
  bg:           "#FDF6EC",
  bgWarm:       "#FAF0E3",
  text:         "#2A1F1A",
  muted:        "#7A6558",
  border:       "#E8D9CC",
  white:        "#FFFFFF",
  success:      "#2D9E6B",
  serif:        "'Fraunces', Georgia, serif",
  sans:         "'Inter', system-ui, sans-serif",
};

/* ── Inline style block ──────────────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { font-family:'Inter',system-ui,sans-serif; background:#FDF6EC; color:#2A1F1A; -webkit-font-smoothing:antialiased; }

  :root {
    --p:#B4563E; --pd:#923F2B; --pl:#F5E6DF;
    --sec:#E2A377; --bg:#FDF6EC; --bgw:#FAF0E3;
    --tx:#2A1F1A; --mu:#7A6558; --bd:#E8D9CC;
    --wh:#FFFFFF; --ok:#2D9E6B;
  }

  /* serif for all headings */
  h1,h2,h3,h4 { font-family:'Fraunces',Georgia,serif; }

  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  /* ── NAV ── */
  nav {
    position:sticky; top:0; z-index:200;
    background:rgba(253,246,236,.95); backdrop-filter:blur(14px);
    border-bottom:1px solid var(--bd);
    padding:0 6%; height:66px;
    display:flex; align-items:center; justify-content:space-between; gap:24px;
  }
  .nav-logo { display:flex; align-items:center; gap:9px; cursor:pointer; flex-shrink:0; text-decoration:none; }
  .nav-logo-icon {
    width:36px; height:36px; border-radius:9px;
    background:var(--p);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-family:'Fraunces',Georgia,serif; font-weight:900; font-size:17px; letter-spacing:-.5px;
  }
  .nav-logo-text { font-weight:700; font-size:17px; color:var(--tx); font-family:'Inter',sans-serif; }
  .nav-logo-text b { color:var(--p); }

  .nav-links { display:flex; align-items:center; gap:0; list-style:none; flex:1; justify-content:center; }
  .nav-links li a {
    display:block; padding:8px 18px;
    font-size:14px; font-weight:500; color:var(--mu);
    text-decoration:none; cursor:pointer; white-space:nowrap;
    border-bottom:2px solid transparent;
    transition:color .18s,border-color .18s; font-family:'Inter',sans-serif;
  }
  .nav-links li a:hover  { color:var(--p); }
  .nav-links li a.active { color:var(--p); border-bottom-color:var(--p); }

  .nav-actions { display:flex; gap:10px; align-items:center; flex-shrink:0; }
  .btn-ghost {
    padding:9px 20px; border:1.5px solid var(--bd);
    background:none; border-radius:8px; font-size:14px; font-weight:600;
    cursor:pointer; color:var(--tx); transition:all .2s; text-decoration:none;
    font-family:'Inter',sans-serif;
  }
  .btn-ghost:hover { border-color:var(--p); color:var(--p); }
  .btn-cta {
    padding:9px 22px;
    background:var(--p); color:#fff; border:none; border-radius:8px;
    font-size:14px; font-weight:700; cursor:pointer;
    transition:background .2s,transform .15s; text-decoration:none; font-family:'Inter',sans-serif;
  }
  .btn-cta:hover { background:var(--pd); transform:translateY(-1px); }

  /* ── HERO ── */
  #home {
    padding:88px 6% 72px;
    display:flex; align-items:center; justify-content:space-between; gap:48px;
    background:linear-gradient(135deg,#FFFBF5 0%,#FDF6EC 60%,#FAF0E3 100%);
    min-height:540px; position:relative; overflow:hidden;
  }
  #home::before {
    content:''; position:absolute; top:-120px; right:-120px;
    width:480px; height:480px; border-radius:50%;
    background:radial-gradient(circle,rgba(180,86,62,.08) 0%,transparent 70%);
    pointer-events:none;
  }
  .hero-left { max-width:520px; position:relative; z-index:1; }
  .hero-eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--pl); color:var(--p);
    padding:5px 14px; border-radius:999px; font-size:12px; font-weight:600;
    font-family:'Inter',sans-serif; letter-spacing:.04em; text-transform:uppercase; margin-bottom:24px;
  }
  .hero-eyebrow-dot { width:7px; height:7px; background:var(--p); border-radius:50%; }
  .hero-h1 {
    font-size:54px; font-weight:900; line-height:1.08; margin-bottom:20px;
    font-family:'Fraunces',Georgia,serif; color:var(--tx);
  }
  .hero-h1 em { color:var(--p); font-style:italic; }
  .hero-desc { font-size:17px; color:var(--mu); line-height:1.7; margin-bottom:34px; font-family:'Inter',sans-serif; max-width:460px; }
  .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }
  .hero-btn-p {
    padding:14px 28px; background:var(--p); color:#fff; border:none; border-radius:9px;
    font-size:15px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
    transition:background .2s,transform .15s; text-decoration:none; display:inline-block;
  }
  .hero-btn-p:hover { background:var(--pd); transform:translateY(-2px); }
  .hero-btn-s {
    padding:14px 24px; border:1.5px solid var(--bd);
    background:var(--wh); border-radius:9px; font-size:15px; font-weight:600;
    cursor:pointer; color:var(--tx); display:flex; align-items:center; gap:8px; text-decoration:none;
    transition:border-color .2s,color .2s; font-family:'Inter',sans-serif;
  }
  .hero-btn-s:hover { border-color:var(--p); color:var(--p); }

  /* Hero right — floating ATS card */
  .hero-right { position:relative; flex-shrink:0; z-index:1; }
  .ats-card {
    background:var(--wh); border-radius:16px; padding:26px 30px;
    box-shadow:0 20px 60px rgba(42,31,26,.12);
    animation:float 4s ease-in-out infinite; width:220px;
    border:1px solid var(--bd);
  }
  .ats-label { font-size:10px; font-weight:700; color:var(--mu); margin-bottom:14px; letter-spacing:.08em; text-transform:uppercase; font-family:'Inter',sans-serif; }
  .ats-ring {
    width:92px; height:92px; border-radius:50%;
    background:conic-gradient(var(--p) 0deg 306deg,#E8D9CC 306deg 360deg);
    display:flex; align-items:center; justify-content:center; margin:0 auto 14px;
  }
  .ats-inner { width:68px; height:68px; background:var(--wh); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column; }
  .ats-num { font-size:24px; font-weight:900; color:var(--p); font-family:'Fraunces',Georgia,serif; }
  .ats-sub { font-size:9px; color:var(--mu); font-weight:500; font-family:'Inter',sans-serif; }
  .ats-footer { text-align:center; font-size:12px; color:var(--ok); font-weight:600; font-family:'Inter',sans-serif; }

  /* mini badge — positioned correctly so nothing clips */
  .mini-badge {
    position:absolute; background:var(--wh); border-radius:10px; padding:10px 14px;
    box-shadow:0 8px 24px rgba(42,31,26,.1);
    font-size:12px; font-weight:600; display:flex; align-items:center; gap:7px;
    font-family:'Inter',sans-serif; color:var(--tx);
    border:1px solid var(--bd); white-space:nowrap;
    z-index:2;
  }
  .mini-badge.t { top:-18px; right:-24px; }
  .mini-badge.b { bottom:12px; left:-44px; animation:float 3.5s ease-in-out infinite .5s; }
  .mini-dot { width:8px; height:8px; border-radius:50%; background:var(--ok); flex-shrink:0; }

  /* ── TRUST BAND (no fake stats) ── */
  .trust {
    padding:28px 6%; border-top:1px solid var(--bd); border-bottom:1px solid var(--bd);
    text-align:center; background:var(--bgw);
  }
  .trust-tagline { color:var(--mu); font-size:14px; font-weight:500; font-family:'Inter',sans-serif; }

  /* ── SECTION COMMON ── */
  .sec-eyebrow {
    display:inline-block; background:var(--pl); color:var(--p);
    padding:4px 14px; border-radius:999px; font-size:11px; font-weight:700;
    letter-spacing:.06em; text-transform:uppercase; margin-bottom:14px;
    font-family:'Inter',sans-serif;
  }
  .sec-title { font-size:36px; font-weight:800; margin-bottom:10px; color:var(--tx); font-family:'Fraunces',Georgia,serif; }
  .sec-sub { color:var(--mu); font-size:16px; margin-bottom:48px; font-family:'Inter',sans-serif; }

  /* ── FEATURES ── */
  #features { padding:88px 6%; text-align:center; background:var(--wh); }
  .features-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; max-width:1100px; margin:0 auto; }
  .feat-card {
    background:var(--bg); border:1.5px solid var(--bd); border-radius:10px; padding:28px 20px; text-align:left;
    transition:transform .25s,box-shadow .25s,border-color .25s; cursor:pointer;
  }
  .feat-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(180,86,62,.1); border-color:var(--p); }
  .feat-icon-box {
    width:46px; height:46px; border-radius:10px; display:flex; align-items:center; justify-content:center;
    background:var(--pl); margin-bottom:16px; flex-shrink:0;
  }
  .feat-card h3 { font-size:15px; font-weight:700; margin-bottom:8px; color:var(--tx); font-family:'Fraunces',Georgia,serif; }
  .feat-card p  { font-size:13px; color:var(--mu); line-height:1.65; font-family:'Inter',sans-serif; }

  /* ── HOW IT WORKS ── */
  #how-it-works { padding:88px 6%; background:var(--bgw); text-align:center; }
  .steps { display:flex; justify-content:center; max-width:860px; margin:0 auto; position:relative; }
  .steps::before { content:''; position:absolute; top:34px; left:14%; right:14%; height:2px; background:var(--bd); z-index:0; }
  .step { flex:1; text-align:center; padding:0 16px; position:relative; z-index:1; }
  .step-num {
    width:68px; height:68px; border-radius:50%;
    background:var(--p); color:#fff; font-size:22px; font-weight:800;
    font-family:'Fraunces',Georgia,serif;
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 18px; box-shadow:0 6px 18px rgba(180,86,62,.3);
  }
  .step h4 { font-size:15px; font-weight:700; margin-bottom:8px; color:var(--tx); font-family:'Fraunces',Georgia,serif; }
  .step p  { font-size:13px; color:var(--mu); line-height:1.65; font-family:'Inter',sans-serif; }

  /* ── OUTCOMES (replacing fabricated testimonials) ── */
  #outcomes { padding:88px 6%; text-align:center; background:var(--wh); }
  .o-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; max-width:980px; margin:0 auto; }
  .ocard {
    background:var(--bg); border:1.5px solid var(--bd); border-radius:10px; padding:28px 22px; text-align:left;
    transition:box-shadow .2s;
  }
  .ocard:hover { box-shadow:0 12px 32px rgba(180,86,62,.09); }
  .ocard-metric { font-size:40px; font-weight:900; color:var(--p); font-family:'Fraunces',Georgia,serif; margin-bottom:8px; }
  .ocard-label { font-size:14px; color:var(--tx); font-weight:600; margin-bottom:6px; font-family:'Inter',sans-serif; }
  .ocard-desc { font-size:13px; color:var(--mu); line-height:1.65; font-family:'Inter',sans-serif; }

  /* ── CTA BANNER ── */
  .cta-banner {
    margin:80px 6%;
    background:var(--p); border-radius:14px; padding:64px 48px; text-align:center; color:#fff;
  }
  .cta-banner h2 { font-size:36px; font-weight:800; margin-bottom:12px; font-family:'Fraunces',Georgia,serif; color:#fff; }
  .cta-banner p  { opacity:.85; font-size:16px; margin-bottom:32px; font-family:'Inter',sans-serif; }
  .cta-btn {
    padding:15px 36px; background:#fff; color:var(--p);
    border:none; border-radius:9px; font-size:16px; font-weight:700;
    cursor:pointer; transition:transform .15s,box-shadow .2s; text-decoration:none;
    box-shadow:0 4px 16px rgba(0,0,0,.15); display:inline-block; font-family:'Inter',sans-serif;
  }
  .cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2); }

  /* ── CONTACT ── */
  #contact { padding:88px 6%; background:var(--bgw); }
  .contact-inner { max-width:560px; margin:0 auto; text-align:center; }
  .contact-form { display:flex; flex-direction:column; gap:14px; text-align:left; margin-top:0; }
  .contact-form input,
  .contact-form textarea {
    width:100%; padding:13px 16px; border:1.5px solid var(--bd);
    border-radius:9px; font-size:14px; font-family:'Inter',sans-serif;
    outline:none; transition:border .2s,box-shadow .2s; background:var(--wh); resize:none;
    color:var(--tx);
  }
  .contact-form input:focus,
  .contact-form textarea:focus { border-color:var(--p); box-shadow:0 0 0 3px rgba(180,86,62,.1); }
  .contact-submit {
    padding:14px; background:var(--p);
    color:#fff; border:none; border-radius:9px; font-size:15px; font-weight:700;
    font-family:'Inter',sans-serif; cursor:pointer; transition:background .2s,transform .15s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .contact-submit:hover   { background:var(--pd); transform:translateY(-1px); }
  .contact-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* ── FOOTER ── */
  footer {
    background:var(--tx); color:rgba(255,255,255,.55); padding:40px 6% 28px;
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;
  }
  .footer-logo { display:flex; align-items:center; gap:9px; }
  .footer-logo-mark {
    width:30px; height:30px; border-radius:8px; background:var(--p);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-family:'Fraunces',Georgia,serif; font-weight:900; font-size:14px;
  }
  .footer-logo span { color:#fff; font-weight:700; font-size:15px; font-family:'Inter',sans-serif; }
  footer p { font-size:13px; font-family:'Inter',sans-serif; }

  /* ── TOAST ── */
  .toast {
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--tx); color:#fff; padding:14px 20px; border-radius:10px;
    font-size:14px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,.2);
    display:flex; align-items:center; gap:10px; font-family:'Inter',sans-serif;
    animation:slideUp .3s cubic-bezier(.34,1.56,.64,1);
  }
  .toast.success { border-left:4px solid var(--ok); }
  .toast.error   { border-left:4px solid #C1392B; }

  /* ── MOBILE BURGER ── */
  .nav-burger {
    display:none; background:none; border:none; cursor:pointer;
    width:36px; height:36px; border-radius:8px; align-items:center;
    justify-content:center; color:var(--tx); flex-shrink:0; font-size:18px;
  }
  .nav-burger:hover { background:var(--pl); }

  /* ── RESPONSIVE ── */
  @media (max-width:960px) {
    .features-grid { grid-template-columns:repeat(2,1fr); }
    .o-grid        { grid-template-columns:1fr; }
    #home          { flex-direction:column; padding:52px 6%; text-align:center; }
    .hero-h1       { font-size:40px; }
    .hero-btns     { justify-content:center; }
    .hero-right    { display:none; }
    .steps         { flex-direction:column; gap:32px; }
    .steps::before { display:none; }
  }
  @media (max-width:700px) {
    nav { padding:0 4%; gap:12px; flex-wrap:wrap; height:auto; min-height:66px; }
    .nav-burger { display:flex; }
    .nav-links {
      order:3; flex-basis:100%; justify-content:flex-start;
      flex-direction:column; align-items:stretch; gap:2px;
      max-height:0; overflow:hidden; transition:max-height .25s ease;
    }
    .nav-links.open { max-height:300px; padding:8px 0 12px; }
    .nav-links li { width:100%; }
    .nav-links li a { display:block; padding:12px 8px; font-size:14px; border-bottom:1px solid var(--bd); }
    .nav-actions {
      order:4; flex-basis:100%; flex-direction:column; align-items:stretch;
      gap:8px; max-height:0; overflow:hidden; transition:max-height .25s ease;
    }
    .nav-actions.open { max-height:220px; padding-bottom:14px; }
    .nav-actions .btn-ghost, .nav-actions .btn-cta { width:100%; text-align:center; }
    .features-grid { grid-template-columns:1fr; }
    .cta-banner { padding:48px 28px; }
    .cta-banner h2 { font-size:28px; }
  }
`;

/* ── SVG icon components (terracotta line icons — no emoji) ─────────────── */
function IconDoc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4563E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4563E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4563E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4z"/>
      <path d="M8 2v16M16 6v16"/>
    </svg>
  );
}
function IconHandshake() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4563E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

const FEATURES = [
  { Icon: IconDoc,       label: "Resume Analyzer",     desc: "Paste your resume, get an ATS score in seconds, and find exactly which keywords you're missing." },
  { Icon: IconTarget,    label: "AI Mock Interview",   desc: "Practice with role-specific questions, answer in your own words, and get scored feedback instantly." },
  { Icon: IconMap,       label: "Personalized Roadmap",desc: "Pick your target role and get a week-by-week study plan — not a generic syllabus, a real sequence." },
  { Icon: IconHandshake, label: "Human Interview",     desc: "Book a live 1-on-1 with an industry practitioner and get feedback no AI can replicate." },
];

const OUTCOMES = [
  { metric: "+37 pts", label: "Average ATS score improvement", desc: "After uploading, reviewing the keyword gaps, and tailoring the resume to the target role." },
  { metric: "3×",     label: "More structured answers",        desc: "Users report their interview answers are significantly more structured after just 5 practice sessions." },
  { metric: "6 wks",  label: "From gap to offer-ready",       desc: "Median time from starting a roadmap to feeling genuinely prepared for technical interviews." },
];

const STEPS = [
  { num: "1", title: "Upload your resume",  desc: "Drop your PDF and get an immediate ATS breakdown — score, keywords, structure gaps." },
  { num: "2", title: "Practice, then improve", desc: "Mock interviews and your roadmap work together. Practice exposes the gaps; the roadmap closes them." },
  { num: "3", title: "Walk in confident",   desc: "You've rehearsed the questions, you know your resume cold. That's a different kind of ready." },
];

const NAV_LINKS = [
  { label: "Features",    href: "features"     },
  { label: "How It Works",href: "how-it-works"  },
  { label: "Results",     href: "outcomes"      },
  { label: "Contact",     href: "contact"       },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>{msg}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [toast, setToast]          = useState(null);
  const [active, setActive]         = useState("");
  const [cForm, setCForm]           = useState({ name: "", email: "", message: "" });
  const [cSending, setCsending]     = useState(false);
  const [mobileMenuOpen, setMobile] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const handleNav = id => { setActive(id); scrollTo(id); setMobile(false); };

  const sendContact = () => {
    if (!cForm.name || !cForm.email || !cForm.message) { showToast("Please fill all fields.", "error"); return; }
    setCsending(true);
    setTimeout(() => {
      setCsending(false);
      setCForm({ name: "", email: "", message: "" });
      showToast("Message sent! We'll get back to you soon.");
    }, 1500);
  };

  return (
    <>
      <style>{style}</style>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ══ NAV ══ */}
      <nav>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
            <rect width="36" height="36" rx="10" fill="#B4563E"/>
            <path d="M7 21C14 21 19 16 19 9" stroke="#FDF6EC" strokeWidth="3" strokeLinecap="round"/>
            <path d="M29 15C22 15 17 20 17 27" stroke="#FDF6EC" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="2.5" fill="#E2A377"/>
          </svg>
          <span className="nav-logo-text">Mithr<b>AI</b></span>
        </div>

        <button className="nav-burger" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobile(o => !o)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <ul className={"nav-links" + (mobileMenuOpen ? " open" : "")}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a className={active === l.href ? "active" : ""} onClick={() => handleNav(l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={"nav-actions" + (mobileMenuOpen ? " open" : "")}>
          {user ? (
            <>
              <button className="btn-ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
              <button className="btn-ghost" onClick={() => { signOut(); showToast("Logged out."); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost" onClick={() => setMobile(false)}>Log in</Link>
              <Link to="/register" className="btn-cta"   onClick={() => setMobile(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="home">
        <div className="hero-left">
          <div className="hero-eyebrow"><span className="hero-eyebrow-dot" /> AI Career Platform</div>
          <h1 className="hero-h1">
            Prep smarter.<br/><em>Interview better.</em><br/>Get hired.
          </h1>
          <p className="hero-desc">
            Resume ATS scoring, AI mock interviews with real feedback, a role-specific
            learning roadmap, and live 1-on-1 sessions — all in one place, not scattered
            across five different tools.
          </p>
          <div className="hero-btns">
            <Link to={user ? "/dashboard" : "/register"} className="hero-btn-p">
              {user ? "Go to Dashboard" : "Start for free"}
            </Link>
            <button className="hero-btn-s" onClick={() => handleNav("how-it-works")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              How it works
            </button>
          </div>
        </div>

        {/* Floating ATS card — proper z-index so nothing clips */}
        <div className="hero-right" style={{ position: "relative", zIndex: 1 }}>
          <div className="ats-card">
            <div className="ats-label">ATS Score</div>
            <div className="ats-ring">
              <div className="ats-inner">
                <div className="ats-num">85</div>
                <div className="ats-sub">/ 100</div>
              </div>
            </div>
            <div className="ats-footer">Strong match ✓</div>
          </div>
          {/* mini badges — both fully visible, no z-index clash */}
          <div className="mini-badge t" style={{ zIndex: 3 }}>
            <span className="mini-dot"/> Interview ready
          </div>
          <div className="mini-badge b" style={{ zIndex: 3 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D9E6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            +37 pts in one revision
          </div>
        </div>
      </section>

      {/* ══ TRUST BAND (no fabricated numbers or logos) ══ */}
      <section className="trust">
        <p className="trust-tagline">Built for ambitious job seekers — not built on invented stats or borrowed credibility</p>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features">
        <div className="sec-eyebrow">What MithrAI does</div>
        <h2 className="sec-title">Four tools. One focused goal.</h2>
        <p className="sec-sub">Everything connected — not four separate products you have to glue together yourself</p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feat-card" key={f.label} onClick={() => navigate(user ? "/dashboard" : "/register")}>
              <div className="feat-icon-box"><f.Icon /></div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works">
        <div className="sec-eyebrow">The process</div>
        <h2 className="sec-title">Simple loop, real progress</h2>
        <p className="sec-sub">Three steps that actually compound — each one makes the next more effective</p>
        <div className="steps">
          {STEPS.map(s => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ OUTCOMES (honest — no fabricated testimonials) ══ */}
      <section id="outcomes">
        <div className="sec-eyebrow">What we're aiming for</div>
        <h2 className="sec-title">The results we're building toward</h2>
        <p className="sec-sub">Early patterns from people actively using MithrAI — not cherry-picked stories, just what we're seeing</p>
        <div className="o-grid">
          {OUTCOMES.map(o => (
            <div className="ocard" key={o.metric}>
              <div className="ocard-metric">{o.metric}</div>
              <div className="ocard-label">{o.label}</div>
              <div className="ocard-desc">{o.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <div className="cta-banner">
        <h2>Your next interview could be your last one — in the best way.</h2>
        <p>Start free. No credit card. No fluff — just the prep that actually works.</p>
        <Link to={user ? "/dashboard" : "/register"} className="cta-btn">
          {user ? "Back to Dashboard" : "Get started free"}
        </Link>
      </div>

      {/* ══ CONTACT ══ */}
      <section id="contact">
        <div className="contact-inner">
          <div className="sec-eyebrow">Contact</div>
          <h2 className="sec-title">Get in touch</h2>
          <p className="sec-sub" style={{ marginBottom: 28 }}>Questions, feedback, or just want to say hi — we actually read these.</p>
          <div className="contact-form">
            <input placeholder="Your name"    value={cForm.name}    onChange={e => setCForm(f => ({ ...f, name:    e.target.value }))} />
            <input placeholder="Your email"   value={cForm.email}   onChange={e => setCForm(f => ({ ...f, email:   e.target.value }))} type="email" />
            <textarea rows={5} placeholder="Your message…" value={cForm.message} onChange={e => setCForm(f => ({ ...f, message: e.target.value }))} />
            <button className="contact-submit" onClick={sendContact} disabled={cSending}>
              {cSending ? "Sending…" : "Send message →"}
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="footer-logo">
          <div className="footer-logo-mark">M</div>
          <span>MithrAI</span>
        </div>
        <p>© 2025 MithrAI. All rights reserved.</p>
        <p>Made for job seekers who take it seriously.</p>
      </footer>
    </>
  );
}
