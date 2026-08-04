import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Mic, Square, ChevronRight, ChevronLeft, CheckCircle2,
  AlertCircle, X, RotateCcw, Calendar, ArrowRight, BookOpen, UserCheck, HelpCircle
} from "lucide-react";
import { getQuestionsForRole, gradeInterview, AVAILABLE_ROLES } from "../services/localInterview.js";
import CalendarReminderModal from "../components/CalendarReminderModal.jsx";
import Swal from "sweetalert2";

/* ── Terracotta & Cream Design System Tokens ────────────────────────────── */
const C = {
  primary:      "#B4563E",
  primaryDark:  "#923F2B",
  primaryLight: "#F5E6DF",
  secondary:    "#E2A377",
  bg:           "#FDF6EC",
  bgWarm:       "#FAF0E3",
  white:        "#FFFFFF",
  text:         "#2A1F1A",
  muted:        "#7A6558",
  border:       "#E8D9CC",
  success:      "#2D9E6B",
  warning:      "#C87B2E",
  error:        "#C1392B",
  serif:        "'Fraunces', Georgia, serif",
  sans:         "'Inter', system-ui, sans-serif",
};

const ROLES = AVAILABLE_ROLES;
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [3, 5, 7];
const MAX_CHARS = 3000;

/* ── Animated Score Ring ─────────────────────────────────────────────────── */
function ScoreRing({ percent }) {
  const radius = 54, stroke = 9;
  const norm = radius - stroke / 2;
  const circ = norm * 2 * Math.PI;
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let frame;
    const start = 0, end = percent, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 900);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnim(Math.round(start + (end - start) * ease));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  const offset = circ - (anim / 100) * circ;
  const color = anim >= 75 ? C.success : anim >= 45 ? C.warning : C.error;

  return (
    <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
        <circle stroke={C.border} fill="transparent" strokeWidth={stroke} r={norm} cx={radius} cy={radius} />
        <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
          style={{ transition: "stroke 0.4s" }} r={norm} cx={radius} cy={radius} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: C.serif, lineHeight: 1 }}>
          {anim}%
        </span>
        <span style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: C.sans, marginTop: 2 }}>
          Overall
        </span>
      </div>
    </div>
  );
}

/* ── Toast Notification ──────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const isErr = type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: isErr ? "#FDF0EE" : "#E8F7F0",
      color: isErr ? C.error : C.success,
      border: `1.5px solid ${isErr ? "rgba(193,57,43,.3)" : "rgba(45,158,107,.3)"}`,
      borderRadius: 10, padding: "12px 18px", fontSize: 13.5, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 10px 30px rgba(42,31,26,.12)", zIndex: 1000,
      fontFamily: C.sans, maxWidth: 360,
    }}>
      {isErr ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

/* ── Empty State Vector Graphic ──────────────────────────────────────────── */
function InterviewEmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "44px 20px", background: C.white,
      borderRadius: 12, border: `1.5px dashed ${C.border}`,
    }}>
      <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
        <rect width="84" height="84" rx="42" fill={C.primaryLight} />
        <path d="M30 42C30 35.3726 35.3726 30 42 30C48.6274 30 54 35.3726 54 42C54 48.6274 48.6274 54 42 54" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 36V43L46 47" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="52" cy="32" r="5" fill={C.secondary} />
      </svg>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 6px", fontFamily: C.serif }}>
        Your completed interviews will show up here
      </h4>
      <p style={{ fontSize: 13, color: C.muted, margin: 0, fontFamily: C.sans, maxWidth: 360, margin: "0 auto" }}>
        Select your role and difficulty above, then click Start Interview to practice and track your progress.
      </p>
    </div>
  );
}

export default function AIMockInterview() {
  const navigate = useNavigate();

  // Setup state
  const [role, setRole] = useState(ROLES[0] || "Full Stack Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);

  // History state
  const [history, setHistory] = useState([]);

  // Active session state
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [perFeedback, setPerFeedback] = useState({});

  // UI state
  const [phase, setPhase] = useState("setup"); // setup | loading | interview | grading | results
  const [toast, setToast] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [questionAnim, setQuestionAnim] = useState("in");
  const [result, setResult] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const recognitionRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Load past interviews from localStorage
  const loadHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("mithrai_interviews") || "[]");
      setHistory(stored.reverse());
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [phase]);

  // ── Start session ──────────────────────────────────────────────────────────
  async function handleStartInterview() {
    setPhase("loading");
    try {
      const qList = getQuestionsForRole(role, difficulty, count);
      const sId = `session-${Date.now()}`;
      setSessionId(sId);
      setQuestions(qList);
      setAnswers(Array(qList.length).fill(""));
      setPerFeedback({});
      setCurrentIndex(0);
      setResult(null);
      await new Promise((r) => setTimeout(r, 600));
      setPhase("interview");
    } catch (err) {
      showToast("Failed to start interview. Please try again.", "error");
      setPhase("setup");
    }
  }

  // ── Submit current answer feedback ───────────────────────────────────────
  async function submitCurrentAnswer() {
    if (!sessionId) return;
    const answer = answers[currentIndex] || "";
    const len = answer.trim().length;
    const score = len > 300 ? 9 : len > 180 ? 8 : len > 90 ? 6 : len > 30 ? 4 : 2;
    const feedbackMap = {
      9: "Excellent answer with strong structure and clear depth.",
      8: "Great answer! Covered key details well.",
      6: "Good explanation. Consider adding more concrete examples.",
      4: "Answer is brief. Try to elaborate on technical aspects.",
      2: "Very brief response. Expand your reasoning step by step.",
    };
    setPerFeedback((prev) => ({
      ...prev,
      [currentIndex]: { score, feedback: feedbackMap[score] || feedbackMap[6] },
    }));
  }

  // ── Navigate questions ─────────────────────────────────────────────────────
  async function goToQuestion(idx) {
    if (idx < 0 || idx >= questions.length) return;
    await submitCurrentAnswer();
    setQuestionAnim("out");
    stopRecording();
    setTimeout(() => {
      setCurrentIndex(idx);
      setQuestionAnim("in");
    }, 180);
  }

  // ── Finish interview & save to history ─────────────────────────────────────
  async function handleFinish() {
    stopRecording();
    await submitCurrentAnswer();
    setPhase("grading");
    try {
      await new Promise((r) => setTimeout(r, 850));
      const data = gradeInterview(questions, answers);
      setResult(data);

      // Save complete session to history in localStorage
      const newSession = {
        id: `session-${Date.now()}`,
        role,
        difficulty,
        score: data.overallScore,
        completedAt: new Date().toISOString(),
        questions,
        answers,
        result: data,
      };

      try {
        const stored = JSON.parse(localStorage.getItem("mithrai_interviews") || "[]");
        stored.push(newSession);
        localStorage.setItem("mithrai_interviews", JSON.stringify(stored));
      } catch {}

      setPhase("results");
      showToast("Interview complete! Here is your feedback.", "success");
    } catch (err) {
      showToast("Failed to grade interview. Please try again.", "error");
      setPhase("interview");
    }
  }

  // View past session feedback from history list
  function handleViewPastSession(past) {
    if (past.result && past.questions) {
      setRole(past.role || role);
      setDifficulty(past.difficulty || difficulty);
      setQuestions(past.questions || []);
      setAnswers(past.answers || []);
      setResult(past.result);
      setPhase("results");
    }
  }

  function handleRestart() {
    setPhase("setup");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setPerFeedback({});
    setResult(null);
    stopRecording();
  }

  // Voice recording
  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Speech recognition is not supported in this browser.", "error");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let base = answers[currentIndex] || "";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " "; else interim += t;
      }
      if (final) {
        base = (base + " " + final).trim();
        setAnswers((p) => { const c = [...p]; c[currentIndex] = base.slice(0, MAX_CHARS); return c; });
      } else if (interim) {
        setAnswers((p) => { const c = [...p]; c[currentIndex] = (base + " " + interim).trim().slice(0, MAX_CHARS); return c; });
      }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  }

  function stopRecording() {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setIsRecording(false);
  }

  function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
  }

  useEffect(() => () => stopRecording(), []);

  const currentAnswer = answers[currentIndex] || "";
  const answeredCount = answers.filter((a) => (a || "").trim().length > 0).length;
  const isLast = currentIndex === questions.length - 1;
  const qFeedback = perFeedback[currentIndex];

  // ── 1. CONFIGURE / SETUP PHASE ─────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
          
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.text, fontFamily: C.serif }}>
              AI Mock Interview
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: C.muted, fontFamily: C.sans }}>
              Practice realistic technical & behavioral questions, answer in your own words, and get detailed scoring.
            </p>
          </div>

          {/* Config Card */}
          <div style={{
            background: C.white, borderRadius: 12, padding: 32,
            border: `1.5px solid ${C.border}`, maxWidth: 640, marginBottom: 40,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 20, fontFamily: C.serif }}>
              Configure your practice session
            </h3>

            {/* Role Select */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: C.sans }}>
                Target Role
              </label>
              <select
                value={role} onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 9,
                  border: `1.5px solid ${C.border}`, background: C.bg,
                  fontSize: 14, color: C.text, fontFamily: C.sans, outline: "none", cursor: "pointer",
                }}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: C.sans }}>
                Difficulty Level
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {DIFFICULTIES.map((d) => {
                  const active = difficulty === d;
                  return (
                    <button key={d} onClick={() => setDifficulty(d)} style={{
                      flex: 1, padding: "11px", borderRadius: 9,
                      border: `1.5px solid ${active ? C.primary : C.border}`,
                      background: active ? C.primaryLight : C.white,
                      color: active ? C.primary : C.text,
                      fontWeight: active ? 700 : 500, fontSize: 13.5,
                      cursor: "pointer", fontFamily: C.sans, transition: "all .18s",
                    }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count Selector */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: C.sans }}>
                Number of Questions
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {QUESTION_COUNTS.map((cnt) => {
                  const active = count === cnt;
                  return (
                    <button key={cnt} onClick={() => setCount(cnt)} style={{
                      flex: 1, padding: "10px", borderRadius: 9,
                      border: `1.5px solid ${active ? C.primary : C.border}`,
                      background: active ? C.primaryLight : C.white,
                      color: active ? C.primary : C.text,
                      fontWeight: active ? 700 : 500, fontSize: 13,
                      cursor: "pointer", fontFamily: C.sans, transition: "all .18s",
                    }}>
                      {cnt} Questions
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start CTA Button */}
            <button onClick={handleStartInterview} style={{
              width: "100%", padding: "14px", background: C.primary,
              color: "#fff", border: "none", borderRadius: 9, fontSize: 15,
              fontWeight: 700, cursor: "pointer", fontFamily: C.sans,
              transition: "background .2s, transform .15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
              onMouseEnter={(e) => e.target.style.background = C.primaryDark}
              onMouseLeave={(e) => e.target.style.background = C.primary}
            >
              Start Interview →
            </button>
          </div>

          {/* Past Interviews Section */}
          <div style={{ maxWidth: 880 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, fontFamily: C.serif }}>
                Past Interviews
              </h3>
              {history.length > 0 && (
                <span style={{ fontSize: 12, color: C.muted, fontFamily: C.sans }}>
                  {history.length} session{history.length > 1 ? "s" : ""} completed
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <InterviewEmptyState />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((sess, idx) => {
                  const score = sess.score ?? 0;
                  const scoreBg = score >= 75 ? "#E8F7F0" : score >= 45 ? "#FDF3E8" : "#FDF0EE";
                  const scoreFg = score >= 75 ? C.success : score >= 45 ? C.warning : C.error;
                  const dateStr = sess.completedAt
                    ? new Date(sess.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Recent";

                  return (
                    <div key={sess.id || idx} style={{
                      background: C.white, borderRadius: 10, padding: "16px 20px",
                      border: `1.5px solid ${C.border}`, display: "flex",
                      alignItems: "center", justifyContent: "space-between", gap: 16,
                      flexWrap: "wrap",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 9, background: C.primaryLight,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <HelpCircle size={20} color={C.primary} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
                            {sess.role}
                          </div>
                          <div style={{ fontSize: 12, color: C.muted, fontFamily: C.sans, marginTop: 2 }}>
                            {sess.difficulty} · {dateStr}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          padding: "6px 14px", borderRadius: 999, background: scoreBg, color: scoreFg,
                          fontSize: 13, fontWeight: 800, fontFamily: C.serif,
                        }}>
                          {score}% Score
                        </div>
                        {sess.result && (
                          <button onClick={() => handleViewPastSession(sess)} style={{
                            padding: "8px 16px", background: C.primaryLight, color: C.primary,
                            border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13,
                            fontWeight: 600, cursor: "pointer", fontFamily: C.sans,
                            transition: "all .18s",
                          }}>
                            View Feedback →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ── LOADING / GRADING PHASE ──────────────────────────────────────────────
  if (phase === "loading" || phase === "grading") {
    const isGrading = phase === "grading";
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: `4px solid ${C.primaryLight}`, borderTopColor: C.primary,
            animation: "spin .8s linear infinite",
          }} />
          <p style={{ color: C.text, fontWeight: 700, fontSize: 16, fontFamily: C.serif }}>
            {isGrading ? "Evaluating your answers…" : "Preparing your interview questions…"}
          </p>
          <p style={{ color: C.muted, fontSize: 13, fontFamily: C.sans }}>
            {isGrading ? "Scoring structure, keywords, and relevance." : `Customized for ${role} (${difficulty}).`}
          </p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // ── 3. RESULTS PHASE ──────────────────────────────────────────────────────
  if (phase === "results" && result) {
    const score = result.overallScore ?? 0;

    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
          
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.text, fontFamily: C.serif }}>
              Interview Results & Feedback
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: C.muted, fontFamily: C.sans }}>
              {role} · {difficulty} Level
            </p>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", maxWidth: 1060 }}>
            
            {/* Score & Verdict Card */}
            <div style={{
              background: C.white, borderRadius: 12, padding: 28,
              border: `1.5px solid ${C.border}`, display: "flex",
              flexDirection: "column", alignItems: "center", gap: 18,
              flex: "0 0 260px", width: 260,
            }}>
              <ScoreRing percent={score} />
              
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.serif }}>
                  {score >= 75 ? "Outstanding Performance!" : score >= 45 ? "Good Foundation" : "Needs Practice"}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: C.sans }}>
                  {answeredCount} of {questions.length} questions answered
                </div>
              </div>

              <button onClick={() => setCalendarOpen(true)} style={{
                width: "100%", padding: "10px", background: C.primaryLight,
                border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.primary,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.sans,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Calendar size={14} /> Schedule Practice
              </button>

              <button onClick={handleRestart} style={{
                width: "100%", padding: "11px", background: C.primary,
                border: "none", borderRadius: 9, color: "#fff",
                fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: C.sans,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <RotateCcw size={14} /> Try Another Session
              </button>
            </div>

            {/* Feedback & Per-question breakdown */}
            <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Overall Feedback */}
              <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1.5px solid ${C.border}` }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
                  Overall Assessment
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.65, fontFamily: C.sans }}>
                  {result.overallFeedback}
                </p>
              </div>

              {/* Question Breakdown */}
              <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1.5px solid ${C.border}` }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
                  Question Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {(result.answers || []).map((a, i) => (
                    <div key={i} style={{
                      background: C.bg, borderRadius: 10, padding: 18,
                      border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
                          Q{i + 1}. {a.question}
                        </div>
                        <div style={{
                          padding: "4px 10px", borderRadius: 999,
                          background: (a.score || 0) >= 7 ? "#E8F7F0" : (a.score || 0) >= 4 ? "#FDF3E8" : "#FDF0EE",
                          color: (a.score || 0) >= 7 ? C.success : (a.score || 0) >= 4 ? C.warning : C.error,
                          fontSize: 12, fontWeight: 800, fontFamily: C.sans, flexShrink: 0,
                        }}>
                          {a.score}/10
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, fontFamily: C.sans, lineHeight: 1.5 }}>
                        <strong style={{ color: C.text }}>Your answer: </strong>
                        {a.answer ? `"${a.answer}"` : <em>(No answer provided)</em>}
                      </div>

                      <div style={{ fontSize: 13, color: C.primary, fontFamily: C.sans, background: C.white, padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}` }}>
                        <strong style={{ color: C.text }}>Feedback: </strong>{a.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upsell Next Steps */}
              <div style={{
                background: C.bgWarm, borderRadius: 12, padding: 24,
                border: `1.5px solid ${C.border}`, display: "flex",
                gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
                    Ready for the next step?
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted, fontFamily: C.sans }}>
                    Close your skill gaps with a custom roadmap or book a live 1-on-1 with an expert.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => navigate("/roadmap")} style={{
                    padding: "10px 18px", background: C.white, color: C.text,
                    border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: C.sans,
                  }}>
                    View Roadmap →
                  </button>
                  <button onClick={() => navigate("/human-interview")} style={{
                    padding: "10px 18px", background: C.primary, color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", fontFamily: C.sans,
                  }}>
                    Book Human Expert →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <CalendarReminderModal
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          defaultTitle={`Practice: ${role} Mock Interview`}
          defaultDescription={`Dedicated practice session to sharpen answers for ${difficulty} ${role} interview questions.`}
        />
      </div>
    );
  }

  // ── 2. ACTIVE INTERVIEW PHASE ─────────────────────────────────────────────
  const currentQ = questions[currentIndex] || "";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto" }}>
        
        {/* Top Header & Finish Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.text, fontFamily: C.serif }}>
              {role} Interview
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.muted, fontFamily: C.sans }}>
              {difficulty} Level · Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <button
            onClick={() =>
              Swal.fire({
                title: "Finish interview early?",
                text: "You'll receive feedback on all questions answered so far.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: C.primary,
                cancelButtonColor: C.border,
                confirmButtonText: "Yes, finish session",
              }).then((r) => r.isConfirmed && handleFinish())
            }
            style={{
              padding: "9px 18px", background: C.white, color: C.error,
              border: `1.5px solid ${C.border}`, borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.sans,
            }}>
            Finish Session
          </button>
        </div>

        {/* Progress Bar & Question Pills */}
        <div style={{ marginBottom: 28, maxWidth: 840 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {questions.map((_, i) => {
              const isCurrent = i === currentIndex;
              const isDone = (answers[i] || "").trim().length > 0;
              return (
                <button
                  key={i} onClick={() => goToQuestion(i)}
                  style={{
                    flex: 1, height: 36, borderRadius: 8,
                    border: `1.5px solid ${isCurrent ? C.primary : isDone ? C.success : C.border}`,
                    background: isCurrent ? C.primary : isDone ? "#E8F7F0" : C.white,
                    color: isCurrent ? "#fff" : isDone ? C.success : C.muted,
                    fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                    fontFamily: C.sans, transition: "all .18s",
                  }}>
                  Q{i + 1}
                </button>
              );
            })}
          </div>

          {/* Visual Progress Bar */}
          <div style={{ height: 6, background: C.border, borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: C.primary,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              transition: "width .3s ease",
            }} />
          </div>
        </div>

        {/* Question & Answer Container */}
        <div style={{ maxWidth: 840 }}>
          
          {/* Question Card */}
          <div className={questionAnim === "in" ? "qa-in" : "qa-out"} style={{
            background: C.white, borderRadius: 12, padding: 28,
            border: `1.5px solid ${C.border}`, marginBottom: 22,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".06em", fontFamily: C.sans, display: "block", marginBottom: 8 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, fontFamily: C.serif, lineHeight: 1.45 }}>
              {currentQ}
            </h2>
          </div>

          {/* Answer Box */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.sans }}>
                Your Answer
              </label>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: C.sans }}>
                {currentAnswer.length} / {MAX_CHARS} characters
              </span>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => {
                const c = [...answers];
                c[currentIndex] = e.target.value.slice(0, MAX_CHARS);
                setAnswers(c);
              }}
              placeholder="Type your response or use voice recording below..."
              style={{
                width: "100%", minHeight: 180, padding: 16,
                borderRadius: 10, border: `1.5px solid ${C.border}`,
                background: C.white, fontSize: 14, color: C.text,
                fontFamily: C.sans, lineHeight: 1.6, outline: "none",
                resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Controls Bar */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{
                padding: "11px 18px", border: `1.5px solid ${C.border}`,
                borderRadius: 9, background: C.white, color: C.text,
                fontSize: 13.5, fontWeight: 600, cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                opacity: currentIndex === 0 ? 0.5 : 1, fontFamily: C.sans,
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Voice Input Button */}
            <button
              onClick={toggleRecording}
              style={{
                padding: "11px 20px", border: "none", borderRadius: 9,
                background: isRecording ? C.error : C.primaryLight,
                color: isRecording ? "#fff" : C.primary,
                fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                fontFamily: C.sans, display: "flex", alignItems: "center", gap: 8,
                transition: "all .2s",
              }}>
              {isRecording ? <><Square size={14} /> Stop Recording</> : <><Mic size={15} /> Voice Input</>}
            </button>

            {/* Next / Finish Button */}
            {isLast ? (
              <button
                onClick={handleFinish}
                style={{
                  marginLeft: "auto", padding: "12px 26px", background: C.primary,
                  color: "#fff", border: "none", borderRadius: 9,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: C.sans, display: "flex", alignItems: "center", gap: 8,
                }}>
                <CheckCircle2 size={16} /> Finish & Grade Session
              </button>
            ) : (
              <button
                onClick={() => goToQuestion(currentIndex + 1)}
                style={{
                  marginLeft: "auto", padding: "12px 24px", background: C.primary,
                  color: "#fff", border: "none", borderRadius: 9,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: C.sans, display: "flex", alignItems: "center", gap: 6,
                }}>
                Next Question <ChevronRight size={16} />
              </button>
            )}
          </div>

        </div>

      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <style>{`
        .qa-in{animation:fadeIn .22s ease}
        .qa-out{animation:fadeOut .18s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
        @keyframes fadeOut{from{opacity:1}to{opacity:0;transform:translateX(-14px)}}
      `}</style>
    </div>
  );
}
