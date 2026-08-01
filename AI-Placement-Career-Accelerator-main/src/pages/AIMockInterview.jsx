import React, { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import {
  Mic,
  Square,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

/* ----------------------------------------------------------------
   QUESTION BANK
   Keyed by role + difficulty. Each question carries the keywords
   the AI grader looks for, so feedback is tied to real answer text.
------------------------------------------------------------------*/
const QUESTION_BANK = {
  "Java Developer": {
    Easy: [
      {
        q: "What is the difference between JDK, JRE, and JVM?",
        keywords: ["jdk", "jre", "jvm", "compile", "runtime", "bytecode"],
      },
      {
        q: "What are the main principles of Object-Oriented Programming?",
        keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"],
      },
      {
        q: "What is the difference between == and .equals() in Java?",
        keywords: ["reference", "value", "equals", "==", "object", "content"],
      },
      {
        q: "What is a constructor and how does it differ from a method?",
        keywords: ["constructor", "initialize", "no return type", "object creation"],
      },
      {
        q: "Explain the difference between an array and an ArrayList.",
        keywords: ["fixed size", "dynamic", "arraylist", "array", "resiz"],
      },
    ],
    Medium: [
      {
        q: "What is Java's memory management system? Explain the allocation of memory in Java.",
        keywords: [
          "heap",
          "stack",
          "garbage collector",
          "garbage collection",
          "metaspace",
          "permgen",
          "allocation",
          "jvm",
        ],
      },
      {
        q: "Explain the difference between abstract classes and interfaces.",
        keywords: ["abstract class", "interface", "multiple inheritance", "default method", "implements", "extends"],
      },
      {
        q: "What are checked and unchecked exceptions in Java?",
        keywords: ["checked", "unchecked", "runtimeexception", "compile time", "try", "catch"],
      },
      {
        q: "How does HashMap work internally in Java?",
        keywords: ["hash", "bucket", "hashcode", "equals", "collision", "load factor", "linked list", "treeify"],
      },
      {
        q: "Explain multithreading and how synchronization works in Java.",
        keywords: ["thread", "synchronized", "lock", "race condition", "concurrency", "monitor"],
      },
      {
        q: "What is the difference between String, StringBuilder, and StringBuffer?",
        keywords: ["immutable", "mutable", "thread-safe", "stringbuilder", "stringbuffer", "performance"],
      },
      {
        q: "What are Java Streams and how do they improve collection processing?",
        keywords: ["stream", "lambda", "functional", "map", "filter", "reduce", "collect"],
      },
    ],
    Hard: [
      {
        q: "Explain JVM garbage collection algorithms (G1, CMS, ZGC) and when you'd choose each.",
        keywords: ["g1", "cms", "zgc", "pause time", "throughput", "tenured", "young generation", "concurrent"],
      },
      {
        q: "How would you design a thread-safe, high-throughput cache in Java without using third-party libraries?",
        keywords: ["concurrenthashmap", "lock", "eviction", "lru", "thread-safe", "atomic", "synchronization"],
      },
      {
        q: "Explain the Java Memory Model and the role of the 'volatile' keyword.",
        keywords: ["volatile", "visibility", "happens-before", "memory model", "reordering", "cache"],
      },
      {
        q: "How does class loading work in Java, and what are classloader hierarchies used for?",
        keywords: ["classloader", "bootstrap", "delegation", "namespace", "hierarchy", "custom classloader"],
      },
    ],
  },
  "Frontend Developer": {
    Easy: [
      { q: "What is the difference between HTML and HTML5?", keywords: ["semantic", "tags", "html5", "api"] },
      { q: "What is the box model in CSS?", keywords: ["margin", "border", "padding", "content", "box-sizing"] },
      { q: "What is the difference between var, let, and const in JavaScript?", keywords: ["scope", "hoisting", "block", "reassign", "var", "let", "const"] },
      { q: "What is the virtual DOM in React?", keywords: ["virtual dom", "diffing", "reconciliation", "real dom"] },
    ],
    Medium: [
      { q: "Explain the concept of closures in JavaScript with an example.", keywords: ["closure", "scope", "lexical", "function", "variable"] },
      { q: "How does React's reconciliation algorithm work?", keywords: ["diffing", "fiber", "key", "virtual dom", "reconciliation"] },
      { q: "What is event delegation and why is it useful?", keywords: ["bubbling", "delegation", "event listener", "performance"] },
      { q: "Explain the difference between controlled and uncontrolled components in React.", keywords: ["controlled", "uncontrolled", "state", "ref", "form"] },
      { q: "What are React hooks and why were they introduced?", keywords: ["hooks", "usestate", "useeffect", "functional component", "lifecycle"] },
    ],
    Hard: [
      { q: "How would you optimize a React application for performance at scale?", keywords: ["memo", "lazy", "code splitting", "virtualization", "rerender", "usememo", "usecallback"] },
      { q: "Explain how the browser's critical rendering path works.", keywords: ["dom", "cssom", "render tree", "layout", "paint", "composite"] },
      { q: "Design a state management approach for a large multi-team frontend application.", keywords: ["redux", "context", "normalization", "modular", "scalability", "state management"] },
    ],
  },
  "Data Analyst": {
    Easy: [
      { q: "What is the difference between WHERE and HAVING in SQL?", keywords: ["where", "having", "group by", "aggregate", "filter"] },
      { q: "What is the difference between mean, median, and mode?", keywords: ["mean", "median", "mode", "average", "central tendency"] },
      { q: "What is a pivot table and when would you use one?", keywords: ["pivot", "summarize", "aggregate", "rows", "columns"] },
    ],
    Medium: [
      { q: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN.", keywords: ["inner join", "left join", "outer join", "matching rows", "null"] },
      { q: "How would you detect and handle outliers in a dataset?", keywords: ["outlier", "z-score", "iqr", "standard deviation", "boxplot"] },
      { q: "What is the difference between correlation and causation?", keywords: ["correlation", "causation", "confounding", "relationship"] },
      { q: "How do you handle missing data in a dataset?", keywords: ["missing", "imputation", "null", "drop", "mean", "median"] },
    ],
    Hard: [
      { q: "How would you design an A/B test to measure a new feature's impact on retention?", keywords: ["hypothesis", "control group", "sample size", "significance", "p-value", "retention"] },
      { q: "Explain how you'd build a churn prediction pipeline from raw transactional data.", keywords: ["feature engineering", "churn", "model", "label", "pipeline", "training"] },
    ],
  },
};

const ROLES = Object.keys(QUESTION_BANK);
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOTAL_QUESTIONS = 5; // questions per interview session
const MAX_CHARS = 3000;

/* ----------------------------------------------------------------
   Build a session's question set for a given role + difficulty.
   Deterministic-ish shuffle so repeated selections feel fresh.
------------------------------------------------------------------*/
function buildSession(role, difficulty) {
  const pool = QUESTION_BANK[role]?.[difficulty] || QUESTION_BANK["Java Developer"]["Medium"];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = [];
  while (picked.length < TOTAL_QUESTIONS) {
    picked.push(shuffled[picked.length % shuffled.length]);
  }
  return picked.slice(0, TOTAL_QUESTIONS);
}

/* ----------------------------------------------------------------
   Lightweight "AI" grading heuristic.
   Scores an answer 0-100 based on: length/effort, keyword coverage,
   and structure (sentences). Deterministic, no network calls.
------------------------------------------------------------------*/
function gradeAnswer(answerText, keywords) {
  const text = (answerText || "").trim();
  if (!text) {
    return { score: 0, matched: [], missed: keywords, length: 0 };
  }

  const lower = text.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const missed = keywords.filter((k) => !lower.includes(k.toLowerCase()));

  const coverageScore = keywords.length ? (matched.length / keywords.length) * 70 : 40;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lengthScore = Math.min(20, (wordCount / 60) * 20); // up to 20 pts for thoroughness

  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  const structureScore = Math.min(10, sentenceCount * 2.5); // up to 10 pts for structure

  const total = Math.round(Math.min(100, coverageScore + lengthScore + structureScore));

  return { score: total, matched, missed, length: wordCount };
}

/* ----------------------------------------------------------------
   Aggregate per-question grades into overall feedback panel data.
------------------------------------------------------------------*/
function buildFeedback(questions, answers) {
  const grades = questions.map((qObj, i) => gradeAnswer(answers[i], qObj.keywords));
  const answeredGrades = grades.filter((g, i) => (answers[i] || "").trim().length > 0);

  const overall =
    answeredGrades.length > 0
      ? Math.round(answeredGrades.reduce((sum, g) => sum + g.score, 0) / questions.length)
      : 0;

  // Collect strengths: matched keywords across answered questions, deduped, capitalized.
  const strengthSet = new Set();
  const improvementSet = new Set();

  grades.forEach((g, i) => {
    const answered = (answers[i] || "").trim().length > 0;
    if (!answered) {
      improvementSet.add(`Answer Question ${i + 1}`);
      return;
    }
    g.matched.slice(0, 2).forEach((m) => strengthSet.add(capitalize(m)));
    if (g.score < 60) {
      g.missed.slice(0, 2).forEach((m) => improvementSet.add(`Mention ${capitalize(m)}`));
    } else if (g.missed.length > 0) {
      improvementSet.add(`Add more on ${capitalize(g.missed[0])}`);
    }
    if (g.length < 15) {
      improvementSet.add(`Expand Question ${i + 1} with more detail`);
    }
  });

  if (strengthSet.size === 0) strengthSet.add("Attempted the interview");

  let verdict = "Needs Work";
  if (overall >= 85) verdict = "Excellent!";
  else if (overall >= 70) verdict = "Good Attempt!";
  else if (overall >= 50) verdict = "Fair Attempt";
  else if (overall > 0) verdict = "Needs Improvement";
  else verdict = "Not Started";

  let verdictSub = "Keep practicing — every answer helps.";
  if (overall >= 85) verdictSub = "Outstanding grasp of the concepts.";
  else if (overall >= 70) verdictSub = "You covered most of the key points.";
  else if (overall >= 50) verdictSub = "You're on the right track, add more depth.";
  else if (overall > 0) verdictSub = "Try covering more key concepts in detail.";

  return {
    overall,
    verdict,
    verdictSub,
    strengths: Array.from(strengthSet).slice(0, 4),
    improvements: Array.from(improvementSet).slice(0, 4),
    grades,
  };
}

function capitalize(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ----------------------------------------------------------------
   Animated circular score ring (SVG, smooth transition on change)
------------------------------------------------------------------*/
function ScoreRing({ percent }) {
  const radius = 54;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let frame;
    const start = animatedPercent;
    const end = percent;
    const duration = 700;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setAnimatedPercent(Math.round(start + (end - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);

  const offset = circumference - (animatedPercent / 100) * circumference;

  let color = "#ef4444"; // red
  if (animatedPercent >= 70) color = "#22c55e"; // green
  else if (animatedPercent >= 40) color = "#f59e0b"; // amber

  return (
    <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
        <circle
          stroke="#e9e7f5"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{
            strokeDashoffset: offset,
            transition: "stroke 0.4s ease",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 800,
          color: "#1e1b3a",
          letterSpacing: "-0.5px",
        }}
      >
        {animatedPercent}%
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Toast (small transient notification)
------------------------------------------------------------------*/
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "error" ? "#fee2e2" : "#e8f9ee";
  const fg = type === "error" ? "#b91c1c" : "#15803d";
  const border = type === "error" ? "#fca5a5" : "#86efac";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "12px 18px",
        fontSize: 13.5,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        zIndex: 1000,
        animation: "toastIn 0.35s ease",
        maxWidth: 320,
      }}
    >
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "auto",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: fg,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------*/
export default function AIMockInterview() {
  const [role, setRole] = useState("Java Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState(() => buildSession("Java Developer", "Medium"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(TOTAL_QUESTIONS).fill(""));
  const [interviewActive, setInterviewActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const [questionAnim, setQuestionAnim] = useState("in");
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);

  const currentAnswer = answers[currentIndex] || "";

  // Live feedback recomputes any time answers change.
  const feedback = useMemo(() => buildFeedback(questions, answers), [questions, answers]);

  /* ---------------- Role / Difficulty change -> new session ---------------- */
  function handleRoleChange(newRole) {
    setRole(newRole);
    resetSession(newRole, difficulty);
  }

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    resetSession(role, newDifficulty);
  }

  function resetSession(r, d) {
    const newQuestions = buildSession(r, d);
    setQuestions(newQuestions);
    setAnswers(Array(TOTAL_QUESTIONS).fill(""));
    setCurrentIndex(0);
    setInterviewActive(true);
    setSubmitted(false);
    setShowDetailedFeedback(false);
    stopRecording();
  }

  /* ---------------- Answer text handling ---------------- */
  function handleAnswerChange(value) {
    if (value.length > MAX_CHARS) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = value;
      return copy;
    });
  }

  /* ---------------- Navigation ---------------- */
  function goToQuestion(targetIndex) {
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    setQuestionAnim("out");
    stopRecording();
    setTimeout(() => {
      setCurrentIndex(targetIndex);
      setQuestionAnim("in");
    }, 180);
  }

  function handleNext() {
    if (!interviewActive) return;
    if (currentIndex === questions.length - 1) {
      handleSubmitAll();
      return;
    }
    goToQuestion(currentIndex + 1);
  }

  function handlePrevious() {
    if (!interviewActive) return;
    goToQuestion(currentIndex - 1);
  }

  /* ---------------- Submit all ---------------- */
  function handleSubmitAll() {
    stopRecording();
    setInterviewActive(false);
    setSubmitted(true);
    const answeredCount = answers.filter((a) => a.trim().length > 0).length;
    setToast({
      type: answeredCount === questions.length ? "success" : "error",
      message:
        answeredCount === questions.length
          ? "Interview submitted! Check your feedback."
          : `Submitted with ${questions.length - answeredCount} unanswered question(s).`,
    });
  }

  /* ---------------- End interview ---------------- */
  function handleEndInterview() {
    stopRecording();
    setInterviewActive(false);
    setSubmitted(true);
    setToast({ type: "success", message: "Interview ended. Here's your feedback." });
  }

  function handleRestart() {
    resetSession(role, difficulty);
    setToast({ type: "success", message: "New interview session started." });
  }

  /* ---------------- Speech-to-text recording ---------------- */
  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast({ type: "error", message: "Voice input isn't supported in this browser." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let baseText = answers[currentIndex] || "";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final) {
        baseText = (baseText + " " + final).trim();
        handleAnswerChange(baseText.slice(0, MAX_CHARS));
      } else if (interim) {
        handleAnswerChange((baseText + " " + interim).trim().slice(0, MAX_CHARS));
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        /* no-op */
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }

  function toggleRecording() {
    if (!interviewActive) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  useEffect(() => {
    return () => stopRecording();
  }, []);

  const currentQuestionObj = questions[currentIndex];
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div
      className="ai-mock-shell"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#f6f5fb",
        minHeight: 600,
        display: "flex",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(20,16,60,0.06)",
        border: "1px solid #eceaf6",
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-14px); }
        }
        @keyframes pulseRec {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
          70% { box-shadow: 0 0 0 9px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .qa-card-in { animation: fadeSlideIn 0.22s ease forwards; }
        .qa-card-out { animation: fadeSlideOut 0.18s ease forwards; }
        .ai-textarea:focus { outline: none; border-color: #8a5cf6 !important; box-shadow: 0 0 0 3px rgba(138,92,246,0.15); }
        .ai-select:focus { outline: none; border-color: #8a5cf6 !important; }
        .ai-btn-press:active { transform: scale(0.97); }
        .strength-row, .improve-row { animation: popIn 0.3s ease forwards; }

        /* ---------------- Responsive: AI Mock Interview ---------------- */
        @media (max-width: 1024px) {
          .ai-mock-shell { flex-direction: column; border-radius: 0; }
          .ai-mock-feedback { width: 100% !important; border-left: none !important; border-top: 1px solid #ece9f7; }
        }
        @media (max-width: 640px) {
          .ai-mock-main { padding: 18px 16px !important; }
          .ai-mock-controls { flex-wrap: wrap; }
          .ai-mock-controls .ai-record-btn { order: -1; flex: 1 1 100%; min-width: 0 !important; }
          .ai-mock-controls > button:not(.ai-record-btn) { flex: 1 1 auto; margin-left: 0 !important; }
        }
      `}</style>

      {/* ---------------- SIDEBAR ---------------- */}
      <Sidebar />

      {/* ---------------- MAIN PANEL ---------------- */}
      <div className="ai-mock-main" style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
        <div
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #6d4ff2, #8a5cf6)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: "7px 16px",
            borderRadius: 8,
            marginBottom: 18,
          }}
        >
          6. AI MOCK INTERVIEW
        </div>

        <h2 style={{ margin: "0 0 4px 0", fontSize: 21, fontWeight: 800, color: "#1e1b3a" }}>
          AI Mock Interview
        </h2>
        <p style={{ margin: "0 0 20px 0", fontSize: 13.5, color: "#7a7f95" }}>
          Practice interviews with AI and improve your skills.
        </p>

        {/* Role / difficulty selectors */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#3d3a55", display: "block", marginBottom: 6 }}>
              Select Role
            </label>
            <select
              className="ai-select"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={selectStyle}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#3d3a55", display: "block", marginBottom: 6 }}>
              Select Difficulty
            </label>
            <select
              className="ai-select"
              value={difficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
              style={selectStyle}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3d3a55" }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: 11.5, color: "#9a9eb3" }}>
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <button
            className="ai-btn-press"
            onClick={handleEndInterview}
            disabled={!interviewActive}
            style={{
              border: "1px solid #fca5a5",
              color: interviewActive ? "#dc2626" : "#d8b4b4",
              background: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              padding: "7px 14px",
              borderRadius: 8,
              cursor: interviewActive ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            End Interview
          </button>
        </div>

        {/* Question card */}
        <div
          key={currentIndex}
          className={questionAnim === "in" ? "qa-card-in" : "qa-card-out"}
          style={{
            background: "#f1effa",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 18,
            border: "1px solid #e6e3f6",
          }}
        >
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#231f44", lineHeight: 1.55 }}>
            {currentQuestionObj.q}
          </p>
        </div>

        {/* Answer box */}
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#3d3a55", display: "block", marginBottom: 6 }}>
          Your Answer
        </label>
        <div style={{ position: "relative" }}>
          <textarea
            ref={textAreaRef}
            className="ai-textarea"
            value={currentAnswer}
            disabled={!interviewActive}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type or speak your answer..."
            style={{
              width: "100%",
              minHeight: 130,
              resize: "vertical",
              border: "1.5px solid #e3e1ef",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13.5,
              fontFamily: "inherit",
              color: "#1e1b3a",
              background: interviewActive ? "#fff" : "#f7f6fb",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 14,
              fontSize: 11,
              color: "#a7abbe",
            }}
          >
            {currentAnswer.length}/{MAX_CHARS}
          </div>
        </div>

        {/* Controls */}
        <div className="ai-mock-controls" style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "center" }}>
          <button
            className="ai-btn-press"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || !interviewActive}
            style={{
              ...secondaryBtnStyle,
              opacity: currentIndex === 0 || !interviewActive ? 0.5 : 1,
              cursor: currentIndex === 0 || !interviewActive ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <button
            className="ai-btn-press ai-record-btn"
            onClick={toggleRecording}
            disabled={!interviewActive}
            style={{
              ...primaryBtnStyle,
              background: isRecording ? "#dc2626" : "linear-gradient(90deg,#6d4ff2,#8a5cf6)",
              animation: isRecording ? "pulseRec 1.6s infinite" : "none",
              opacity: interviewActive ? 1 : 0.55,
              cursor: interviewActive ? "pointer" : "not-allowed",
              minWidth: 170,
            }}
          >
            {isRecording ? <Square size={14} /> : <Mic size={14} />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          <button
            className="ai-btn-press"
            onClick={handleNext}
            disabled={!interviewActive}
            style={{
              ...primaryBtnStyle,
              opacity: interviewActive ? 1 : 0.55,
              cursor: interviewActive ? "pointer" : "not-allowed",
              marginLeft: "auto",
            }}
          >
            {isLast ? "Submit" : "Next"}
            {!isLast && <ChevronRight size={15} />}
          </button>
        </div>

        {!interviewActive && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
            }}
          >
            <button
              className="ai-btn-press"
              onClick={handleRestart}
              style={{
                ...primaryBtnStyle,
                background: "linear-gradient(90deg,#6d4ff2,#8a5cf6)",
              }}
            >
              Start New Interview
            </button>
          </div>
        )}
      </div>

      {/* ---------------- AI FEEDBACK PANEL ---------------- */}
      <div
        className="ai-mock-feedback"
        style={{
          width: 240,
          background: "#fff",
          borderLeft: "1px solid #ece9f7",
          padding: "22px 18px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ margin: "0 0 18px 0", fontSize: 14.5, fontWeight: 800, color: "#1e1b3a" }}>
          AI Feedback
        </h3>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <ScoreRing percent={feedback.overall} />
        </div>

        <p
          key={feedback.verdict}
          style={{
            textAlign: "center",
            margin: "8px 0 2px 0",
            fontSize: 14,
            fontWeight: 800,
            color: "#1e1b3a",
            animation: "popIn 0.3s ease",
          }}
        >
          {feedback.verdict}
        </p>
        <p style={{ textAlign: "center", margin: "0 0 18px 0", fontSize: 11.5, color: "#9a9eb3", lineHeight: 1.5 }}>
          {feedback.verdictSub}
        </p>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", margin: "0 0 8px 0" }}>Strengths</p>
          {feedback.strengths.map((s, i) => (
            <div
              key={s + i}
              className="strength-row"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                fontSize: 12,
                color: "#3d3a55",
                marginBottom: 6,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <CheckCircle2 size={13} color="#16a34a" style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#dc2626", margin: "0 0 8px 0" }}>Improvements</p>
          {feedback.improvements.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9a9eb3" }}>Nothing major — nice work!</p>
          ) : (
            feedback.improvements.map((s, i) => (
              <div
                key={s + i}
                className="improve-row"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  fontSize: 12,
                  color: "#3d3a55",
                  marginBottom: 6,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <AlertCircle size={13} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{s}</span>
              </div>
            ))
          )}
        </div>

        <button
          className="ai-btn-press"
          onClick={() => setShowDetailedFeedback(true)}
          style={{
            ...primaryBtnStyle,
            width: "100%",
            justifyContent: "center",
            marginTop: "auto",
          }}
        >
          View Detailed Feedback
        </button>
      </div>

      {/* ---------------- Detailed feedback modal ---------------- */}
      {showDetailedFeedback && (
        <div
          onClick={() => setShowDetailedFeedback(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,16,45,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            animation: "toastIn 0.25s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 26,
              width: "min(560px, 90vw)",
              maxHeight: "80vh",
              overflowY: "auto",
              animation: "popIn 0.25s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e1b3a" }}>
                Detailed Feedback — {feedback.overall}% overall
              </h3>
              <button
                onClick={() => setShowDetailedFeedback(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888" }}
              >
                <X size={18} />
              </button>
            </div>

            {questions.map((qObj, i) => {
              const g = feedback.grades[i];
              const answered = (answers[i] || "").trim().length > 0;
              return (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ece9f7",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1b3a" }}>
                      Q{i + 1}. {qObj.q}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: g.score >= 70 ? "#16a34a" : g.score >= 40 ? "#d97706" : "#dc2626",
                        flexShrink: 0,
                        marginLeft: 10,
                      }}
                    >
                      {answered ? `${g.score}%` : "Skipped"}
                    </span>
                  </div>
                  {answered && (
                    <>
                      {g.matched.length > 0 && (
                        <p style={{ fontSize: 11.5, color: "#16a34a", margin: "4px 0" }}>
                          ✓ Covered: {g.matched.map(capitalize).join(", ")}
                        </p>
                      )}
                      {g.missed.length > 0 && (
                        <p style={{ fontSize: 11.5, color: "#dc2626", margin: "4px 0" }}>
                          ✗ Missing: {g.missed.map(capitalize).join(", ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ---------------- shared inline styles ---------------- */
const selectStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13.5,
  borderRadius: 9,
  border: "1.5px solid #e3e1ef",
  background: "#fff",
  color: "#1e1b3a",
  cursor: "pointer",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

const primaryBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  background: "linear-gradient(90deg, #6d4ff2, #8a5cf6)",
  color: "#fff",
  border: "none",
  borderRadius: 9,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  transition: "transform 0.12s ease, box-shadow 0.2s ease",
};

const secondaryBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  background: "#fff",
  color: "#3d3a55",
  border: "1.5px solid #e3e1ef",
  borderRadius: 9,
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 700,
  transition: "transform 0.12s ease, background 0.2s ease",
};
