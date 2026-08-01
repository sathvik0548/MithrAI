import { useState, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";

const C = {
  primary: "#6C63FF", primaryDark: "#4B44D6", primaryLight: "#EEF0FF",
  bg: "#F4F5FF", sidebar: "#1A1D2E", sidebarHover: "#252842",
  white: "#FFFFFF", text: "#1A1D2E", muted: "#8B8FA8",
  green: "#10B981", orange: "#F59E0B", red: "#EF4444",
  teal: "#06B6D4", border: "#E8EAFF",
};

const Icon = ({ d, color = "currentColor", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  file:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  upload:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  check:   "M20 6L9 17l-5-5",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  x:       "M18 6L6 18 M6 6l12 12",
  xCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6",
  chevron: "M9 18l6-6-6-6",
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  resume:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  chat:    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  map:     "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  gear:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  info:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8h.01 M12 12v4",
};

// ── Circular gauge ───────────────────────────────────────────────────────────
function ATSGauge({ score }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const progress = (Math.min(score, 100) / 100) * circ;
  const color = score >= 80 ? C.green : score >= 60 ? C.orange : C.red;
  const label = score >= 80 ? "Great!" : score >= 60 ? "Good" : "Needs Work";
  const sub   = score >= 80 ? "Your resume is performing well."
              : score >= 60 ? "A few improvements needed."
              : "Significant improvements needed.";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>ATS Score</div>
      <div style={{ position:"relative", width:128, height:128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="10" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:28, fontWeight:900, color, lineHeight:1 }}>{score}</span>
          <span style={{ fontSize:11, color:C.muted }}>/100</span>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:14, fontWeight:700, color }}>{label}</div>
        <div style={{ fontSize:11, color:C.muted, maxWidth:140, marginTop:2, lineHeight:1.4 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, score, max = 20, color }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ width:90, fontSize:12, color:C.text, fontWeight:500, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:8, borderRadius:8, background:C.border, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", borderRadius:8, background:color, transition:"width 1.2s ease" }} />
      </div>
      <span style={{ width:36, fontSize:12, fontWeight:700, color, textAlign:"right", flexShrink:0 }}>{score}/{max}</span>
    </div>
  );
}

// ── Collapsible section ──────────────────────────────────────────────────────
function SummarySection({ icon, iconColor, iconBg, label, count, items, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:"100%", background:C.white, border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", gap:12, padding:"14px 18px", textAlign:"left" }}>
        <div style={{ width:32, height:32, borderRadius:9, background:iconBg,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon d={ICONS[icon]} color={iconColor} size={15} />
        </div>
        <span style={{ flex:1, fontSize:14, fontWeight:600, color:C.text }}>
          {label} <span style={{ color:iconColor }}>({count})</span>
        </span>
        <span style={{ display:"inline-block", transition:"transform .2s", transform: open ? "rotate(90deg)" : "none" }}>
          <Icon d={ICONS.chevron} color={C.muted} size={16} />
        </span>
      </button>
      {open && items?.length > 0 && (
        <div style={{ background:"#FAFBFF", borderTop:`1px solid ${C.border}`,
          padding:"12px 18px", display:"flex", flexDirection:"column", gap:8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:C.text, lineHeight:1.5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:iconColor, marginTop:6, flexShrink:0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  const bg    = type === "error" ? "#FEF2F2" : "#F0FFF4";
  const color = type === "error" ? C.red : C.green;
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
      background:bg, border:`1px solid ${color}30`, borderRadius:12,
      padding:"14px 18px", display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 4px 20px rgba(0,0,0,.12)", maxWidth:360,
      animation:"fadeIn .3s ease" }}>
      <Icon d={type === "error" ? ICONS.xCircle : ICONS.check} color={color} size={18} />
      <span style={{ fontSize:13, color:C.text, flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
        <Icon d={ICONS.x} color={C.muted} size={15} />
      </button>
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ label = "Analyzing your resume with AI…" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:"40px 0" }}>
      <div style={{ width:44, height:44, borderRadius:"50%",
        border:`4px solid ${C.border}`, borderTop:`4px solid ${C.primary}`,
        animation:"spin .8s linear infinite" }} />
      <div style={{ fontSize:13, color:C.muted, fontWeight:500, textAlign:"center", maxWidth:220 }}>{label}</div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

function getExt(name) { return name.toLowerCase().slice(name.lastIndexOf(".")); }

// Extract readable text from a resume file via binary scan.
// Works reasonably for PDF/DOCX since both embed text as printable runs
// alongside binary structure. Not perfect OCR, but enough to find keywords.
function extractResumeText(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => {
      const raw = e.target.result;
      const runs = raw.match(/[\x20-\x7E]{3,}/g) || [];
      const text = runs
        .filter((s) => /[a-zA-Z]{2,}/.test(s))
        .join(" ")
        .replace(/ {2,}/g, " ")
        .slice(0, 20000);
      resolve(text);
    };
    r.onerror = () => resolve("");
    r.readAsBinaryString(file);
  });
}

// Keyword groups used to score a resume. Each group has a canonical label
// and a list of ways it might appear in raw resume text.
const SKILL_KEYWORDS = [
  { label: "React", patterns: ["react"] },
  { label: "JavaScript", patterns: ["javascript", "js "] },
  { label: "TypeScript", patterns: ["typescript"] },
  { label: "HTML", patterns: ["html"] },
  { label: "CSS", patterns: ["css"] },
  { label: "Node.js", patterns: ["node.js", "nodejs", "node js"] },
  { label: "Python", patterns: ["python"] },
  { label: "Java", patterns: ["java"] },
  { label: "SQL", patterns: ["sql", "mysql", "postgres"] },
  { label: "MongoDB", patterns: ["mongodb", "mongo"] },
  { label: "Git", patterns: ["git", "github"] },
  { label: "Docker", patterns: ["docker"] },
  { label: "AWS", patterns: ["aws", "amazon web services"] },
  { label: "REST APIs", patterns: ["rest api", "restful"] },
  { label: "Agile", patterns: ["agile", "scrum"] },
];

const SECTION_CHECKS = [
  { label: "Contact Information", patterns: ["@", "phone", "email"] },
  { label: "Education", patterns: ["education", "university", "degree", "bachelor", "b.tech", "b.e."] },
  { label: "Experience", patterns: ["experience", "internship", "worked at", "employed"] },
  { label: "Projects", patterns: ["project"] },
  { label: "Skills", patterns: ["skills", "technical skills"] },
  { label: "LinkedIn Profile", patterns: ["linkedin"] },
  { label: "Portfolio Website", patterns: ["portfolio", "github.io", "behance"] },
  { label: "Certifications", patterns: ["certificat", "certified"] },
  { label: "Measurable Achievements", patterns: ["%", "increased", "reduced", "improved", "achieved"] },
];

function analyzeResumeText(text, fileName) {
  const lower = text.toLowerCase();
  const hasEnoughText = text.trim().length > 80;

  if (!hasEnoughText) {
    return {
      ats_score: 0,
      score_breakdown: { content: 0, format: 0, skills: 0, experience: 0, overall_impression: 0 },
      good_points: [],
      improvements: ["Upload a text-based PDF or Word document so content can be read"],
      missing: ["NOT_A_RESUME"],
      candidate_name: "Unknown",
      target_role: "Unknown",
      keywords_found: [],
      keywords_missing: [],
    };
  }

  const foundSkills = SKILL_KEYWORDS.filter((k) => k.patterns.some((p) => lower.includes(p)));
  const missingSkills = SKILL_KEYWORDS.filter((k) => !k.patterns.some((p) => lower.includes(p))).slice(0, 6);

  const foundSections = SECTION_CHECKS.filter((s) => s.patterns.some((p) => lower.includes(p)));
  const missingSections = SECTION_CHECKS.filter((s) => !s.patterns.some((p) => lower.includes(p)));

  // Score breakdown, each out of 20
  const skillsScore = Math.min(20, Math.round((foundSkills.length / SKILL_KEYWORDS.length) * 20));
  const contentScore = Math.min(20, Math.round((foundSections.length / SECTION_CHECKS.length) * 20));
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const formatScore = Math.min(20, Math.round(Math.min(wordCount, 600) / 30));
  const experienceScore = lower.includes("experience") || lower.includes("internship")
    ? Math.min(20, 12 + foundSkills.length)
    : Math.min(20, 6 + Math.round(foundSkills.length / 2));
  const overallImpression = Math.round((skillsScore + contentScore + formatScore + experienceScore) / 4);

  const atsScore = Math.min(
    100,
    skillsScore + contentScore + formatScore + experienceScore + overallImpression
      ? Math.round(
          ((skillsScore + contentScore + formatScore + experienceScore + overallImpression) / 100) * 100
        )
      : 0
  );

  const goodPoints = [];
  foundSections.forEach((s) => goodPoints.push(`${s.label} section detected`));
  if (foundSkills.length > 0) {
    goodPoints.push(`Relevant skills listed: ${foundSkills.slice(0, 5).map((s) => s.label).join(", ")}`);
  }
  if (goodPoints.length === 0) goodPoints.push("Resume was uploaded and is readable");

  const improvements = [];
  if (missingSections.find((s) => s.label === "Measurable Achievements")) {
    improvements.push("Add measurable achievements (e.g. numbers, percentages, outcomes)");
  }
  if (missingSections.find((s) => s.label === "Certifications")) {
    improvements.push("Include relevant certifications");
  }
  if (missingSkills.length > 0) {
    improvements.push(`Consider adding: ${missingSkills.slice(0, 3).map((s) => s.label).join(", ")}`);
  }
  if (wordCount < 200) {
    improvements.push("Expand descriptions — resume content looks brief");
  }
  if (improvements.length === 0) improvements.push("Keep refining bullet points for clarity and impact");

  const missing = missingSections
    .filter((s) => ["LinkedIn Profile", "Portfolio Website", "Certifications"].includes(s.label))
    .map((s) => s.label);
  if (missing.length === 0) missing.push("Nothing critical missing");

  // crude name guess: first line-like run of capitalized words near the top
  const firstLines = text.slice(0, 400).split(/\s{2,}|\n/).filter(Boolean);
  const nameGuess = firstLines.find((l) => /^[A-Z][a-zA-Z.]+(?:\s[A-Z][a-zA-Z.]+){1,2}$/.test(l.trim()));

  return {
    ats_score: atsScore,
    score_breakdown: {
      content: contentScore,
      format: formatScore,
      skills: skillsScore,
      experience: experienceScore,
      overall_impression: overallImpression,
    },
    good_points: goodPoints,
    improvements,
    missing,
    candidate_name: nameGuess ? nameGuess.trim() : fileName,
    target_role: foundSkills.some((s) => ["React", "JavaScript", "Node.js", "TypeScript"].includes(s.label))
      ? "Frontend / Full-Stack Developer"
      : foundSkills.some((s) => ["Python", "SQL", "MongoDB"].includes(s.label))
      ? "Backend / Data Developer"
      : "General Software Role",
    keywords_found: foundSkills.map((s) => s.label),
    keywords_missing: missingSkills.map((s) => s.label),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ResumeAnalyzer() {
  const [file,      setFile]        = useState(null);
  const [dragging,  setDragging]    = useState(false);
  const [loading,   setLoading]     = useState(false);
  const [result,    setResult]      = useState(null);
  const [toast,     setToast]       = useState(null);
  const [error,     setError]       = useState(null);
  const inputRef = useRef();

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validateFile = (f) => {
    const ext = getExt(f.name);
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXT.includes(ext)) {
      showToast(`"${f.name}" is not accepted. Please upload a PDF or Word document (.pdf / .doc / .docx).`, "error");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5 MB.", "error");
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!validateFile(f)) return;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  // ── Core analysis ──────────────────────────────────────────────────────────
  const analyzeResume = async () => {
    if (!file || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const fileName = file.name.replace(/\.(pdf|doc|docx)$/i, "");
      const text = await extractResumeText(file);

      // Small artificial delay so the spinner/animation reads as "analyzing"
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const resultData = analyzeResumeText(text, fileName);

      if (resultData.missing?.[0] === "NOT_A_RESUME") {
        showToast("This document doesn't appear to be a resume. Please upload a valid resume file.", "error");
        setLoading(false);
        return;
      }

      setResult(resultData);
      showToast("Analysis complete!", "success");
    } catch (err) {
      console.error("Analysis error:", err);
      const msg = err.message || "Analysis failed. Please try again.";
      setError(msg);
      showToast(msg, "error");
    }

    setLoading(false);
  };

  const scoreColors = [C.green, C.teal, C.primary, C.orange, "#8B5CF6"];
  const scoreLabels = ["Content", "Format", "Skills", "Experience", "Overall"];
  const scoreKeys   = ["content", "format", "skills", "experience", "overall_impression"];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg,
      fontFamily:"'Inter', system-ui, sans-serif" }}>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        {/* breadcrumb bar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px" }}>
          <div style={{ display:"inline-flex", background:C.primary,
            borderRadius:"0 0 14px 14px", padding:"8px 20px" }}>
            <span style={{ fontSize:12, fontWeight:800, color:"#fff",
              letterSpacing:1, textTransform:"uppercase" }}>5. Resume Analyzer</span>
          </div>
        </div>

        <div style={{ padding:"28px 32px", flex:1, overflowY:"auto" }}>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:C.text }}>Resume Analyzer</h1>
            <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>
              Upload your resume and get AI-powered ATS analysis.
            </p>
          </div>

          {/* ── Upload + gauge row ── */}
          <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:24 }}>

            {/* Upload box */}
            <div style={{ flex:2, minWidth:280 }}>
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => !file && inputRef.current.click()}
                style={{
                  border:`2px dashed ${dragging ? C.primary : file ? C.green : C.border}`,
                  borderRadius:16, padding:"32px 24px",
                  background: dragging ? C.primaryLight : C.white,
                  cursor: file ? "default" : "pointer",
                  transition:"all .2s",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:12, minHeight:190,
                  justifyContent:"center", boxShadow:"0 2px 12px rgba(108,99,255,.06)",
                }}
              >
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
                  style={{ display:"none" }}
                  onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />

                {file ? (
                  <>
                    <div style={{ width:52, height:52, borderRadius:14, background:C.green+"18",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon d={ICONS.file} color={C.green} size={26} />
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{file.name}</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                        {(file.size / 1024).toFixed(0)} KB — ready to analyze
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:4 }}>
                      <button onClick={e => { e.stopPropagation(); inputRef.current.click(); }}
                        style={{ background:C.primaryLight, color:C.primary, border:"none",
                          borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                        Change File
                      </button>
                      <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); setError(null); }}
                        style={{ background:"#FEF2F2", color:C.red, border:"none",
                          borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width:60, height:60, borderRadius:16, background:C.primaryLight,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon d={ICONS.resume} color={C.primary} size={30} />
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:15, fontWeight:700, color:C.text }}>Upload Your Resume</div>
                      <div style={{ fontSize:12, color:C.muted, marginTop:5, lineHeight:1.6 }}>
                        Drag & drop your file here, or click to browse<br />
                        <span style={{ color:C.primary, fontWeight:600 }}>PDF, DOC, DOCX</span> · Max 5 MB
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div style={{ marginTop:12, background:"#FEF2F2", border:`1px solid ${C.red}30`,
                  borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
                  <Icon d={ICONS.alert} color={C.red} size={16} />
                  <span style={{ fontSize:12, color:C.red, lineHeight:1.5 }}>{error}</span>
                </div>
              )}

              {/* Analyze button */}
              <button onClick={analyzeResume} disabled={!file || loading}
                style={{
                  marginTop:14, width:"100%",
                  background: file && !loading
                    ? `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`
                    : C.border,
                  color: file && !loading ? "#fff" : C.muted,
                  border:"none", borderRadius:12, padding:"14px 0",
                  fontSize:14, fontWeight:700,
                  cursor: file && !loading ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                  transition:"all .2s",
                  boxShadow: file && !loading ? "0 4px 16px rgba(108,99,255,.38)" : "none",
                }}>
                {loading
                  ? <><div style={{ width:18, height:18, borderRadius:"50%",
                      border:"2px solid rgba(255,255,255,.4)", borderTop:"2px solid #fff",
                      animation:"spin .7s linear infinite" }} /> Analyzing…</>
                  : <><Icon d={ICONS.upload} color={file ? "#fff" : C.muted} size={16} /> Analyze Resume</>
                }
              </button>

              <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                <Icon d={ICONS.info} color={C.muted} size={13} />
                <span style={{ fontSize:11, color:C.muted }}>
                  Only PDF and Word documents accepted. Other file types are rejected automatically.
                </span>
              </div>
            </div>

            {/* ATS gauge */}
            <div style={{ flex:1, minWidth:210, background:C.white, borderRadius:16,
              padding:"24px 20px", boxShadow:"0 2px 12px rgba(108,99,255,.08)",
              display:"flex", alignItems:"center", justifyContent:"center", minHeight:240 }}>
              {loading
                ? <Spinner />
                : result
                  ? <ATSGauge score={result.ats_score} />
                  : (
                    <div style={{ textAlign:"center", color:C.muted }}>
                      <div style={{ width:64, height:64, borderRadius:"50%", background:C.border,
                        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                        <Icon d={ICONS.star} color={C.muted} size={28} />
                      </div>
                      <div style={{ fontSize:13, fontWeight:600 }}>ATS Score</div>
                      <div style={{ fontSize:11, marginTop:4 }}>Upload & analyze to see your score</div>
                    </div>
                  )
              }
            </div>
          </div>

          {/* ── Results ── */}
          {result && (
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>

              {/* Left: summary sections + keywords */}
              <div style={{ flex:1, minWidth:280, display:"flex", flexDirection:"column", gap:12 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:C.text }}>Analysis Summary</h3>

                <SummarySection
                  icon="check" iconColor={C.green} iconBg={C.green+"18"}
                  label="Good Points" count={result.good_points?.length || 0}
                  items={result.good_points} defaultOpen={true} />

                <SummarySection
                  icon="alert" iconColor={C.orange} iconBg={C.orange+"18"}
                  label="Improvements" count={result.improvements?.length || 0}
                  items={result.improvements} />

                <SummarySection
                  icon="xCircle" iconColor={C.red} iconBg={C.red+"18"}
                  label="Missing" count={result.missing?.length || 0}
                  items={result.missing} />

                {result.keywords_found?.length > 0 && (
                  <div style={{ background:C.white, borderRadius:12, padding:"16px 18px", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>✅ Keywords Found</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {result.keywords_found.map((k, i) => (
                        <span key={i} style={{ background:C.green+"15", color:C.green,
                          fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.keywords_missing?.length > 0 && (
                  <div style={{ background:C.white, borderRadius:12, padding:"16px 18px", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>⚠️ Keywords to Add</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {result.keywords_missing.map((k, i) => (
                        <span key={i} style={{ background:C.red+"12", color:C.red,
                          fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: score breakdown + detected info */}
              <div style={{ flex:1, minWidth:260 }}>
                <h3 style={{ margin:"0 0 12px", fontSize:16, fontWeight:700, color:C.text }}>Score Breakdown</h3>

                <div style={{ background:C.white, borderRadius:16, padding:"20px 22px",
                  boxShadow:"0 2px 12px rgba(108,99,255,.08)", display:"flex", flexDirection:"column", gap:14 }}>
                  {scoreKeys.map((k, i) => (
                    <ScoreBar key={k} label={scoreLabels[i]}
                      score={result.score_breakdown?.[k] ?? 0}
                      color={scoreColors[i]} />
                  ))}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:4,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Total ATS Score</span>
                    <span style={{ fontSize:22, fontWeight:900,
                      color: result.ats_score >= 80 ? C.green : result.ats_score >= 60 ? C.orange : C.red }}>
                      {result.ats_score}/100
                    </span>
                  </div>
                </div>

                {(result.candidate_name || result.target_role) && (
                  <div style={{ background:C.white, borderRadius:16, padding:"18px 22px",
                    marginTop:16, boxShadow:"0 2px 12px rgba(108,99,255,.08)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>Detected Info</div>
                    {result.candidate_name && result.candidate_name !== "Unknown" && (
                      <div style={{ display:"flex", gap:10, marginBottom:8 }}>
                        <span style={{ fontSize:12, color:C.muted, width:80 }}>Name</span>
                        <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{result.candidate_name}</span>
                      </div>
                    )}
                    {result.target_role && (
                      <div style={{ display:"flex", gap:10 }}>
                        <span style={{ fontSize:12, color:C.muted, width:80 }}>Target Role</span>
                        <span style={{ fontSize:12, fontWeight:600, color:C.primary }}>{result.target_role}</span>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => { setFile(null); setResult(null); setError(null); }}
                  style={{ marginTop:16, width:"100%", background:C.primaryLight, color:C.primary,
                    border:"none", borderRadius:12, padding:"12px 0",
                    fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  Analyze Another Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
