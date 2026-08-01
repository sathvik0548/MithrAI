import { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
const C = {
  primary: "#6C63FF", primaryDark: "#4B44D6", primaryLight: "#EEF0FF",
  bg: "#F4F5FF", sidebar: "#1A1D2E", sidebarHover: "#252842",
  white: "#FFFFFF", text: "#1A1D2E", muted: "#8B8FA8",
  green: "#10B981", greenLight: "#ECFDF5", orange: "#F59E0B", orangeLight: "#FFFBEB",
  red: "#EF4444", teal: "#06B6D4", border: "#E8EAFF", lockedBg: "#F1F2FA",
};

const Icon = ({ d, color = "currentColor", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  resume:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  chat:    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  map:     "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  gear:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  check:   "M20 6L9 17l-5-5",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  clock:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  square:  "M3 3h18v18H3z",
  rocket:  "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.04-2.96a2.17 2.17 0 0 0-2.96-.04z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  x:       "M18 6L6 18 M6 6l12 12",
  chevronDown: "M6 9l6 6 6-6",
};


// ── Roadmap templates ────────────────────────────────────────────────────────
// Each goal has its own set of phases; each phase has a topic checklist.
// "status" on a topic is derived live from "done" — never hardcoded — except
// the very first phase's first couple of topics, which start pre-completed
// to mirror "you've already begun" the way the reference screenshot shows.
const ROADMAP_TEMPLATES = {
  "Full Stack Developer": [
    {
      title: "Fundamentals",
      topics: [
        { label: "Programming Basics (Variables, Loops, Functions)", done: true },
        { label: "Data Structures & Algorithms Basics", done: true },
        { label: "Git & Version Control", done: true },
        { label: "Command Line Basics", done: true },
      ],
    },
    {
      title: "Frontend Development",
      topics: [
        { label: "HTML, CSS, JavaScript", done: true },
        { label: "React.js Basics", done: true },
        { label: "State Management", done: false },
        { label: "Responsive Design", done: false },
        { label: "Frontend Projects", done: false },
      ],
    },
    {
      title: "Backend Development",
      topics: [
        { label: "Node.js & Express", done: false },
        { label: "REST API Design", done: false },
        { label: "Databases (SQL & NoSQL)", done: false },
        { label: "Authentication & Authorization", done: false },
        { label: "Backend Projects", done: false },
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        { label: "System Design Basics", done: false },
        { label: "Docker & Containerization", done: false },
        { label: "CI/CD Pipelines", done: false },
        { label: "Testing (Unit & Integration)", done: false },
      ],
    },
    {
      title: "Projects",
      topics: [
        { label: "Build a Full-Stack Capstone Project", done: false },
        { label: "Deploy to Production", done: false },
        { label: "Open Source Contribution", done: false },
      ],
    },
  ],
  "Frontend Developer": [
    {
      title: "Fundamentals",
      topics: [
        { label: "HTML & Semantic Markup", done: true },
        { label: "CSS Fundamentals & Flexbox/Grid", done: true },
        { label: "JavaScript Basics", done: true },
      ],
    },
    {
      title: "Modern Frontend",
      topics: [
        { label: "React.js Fundamentals", done: false },
        { label: "Hooks & State Management", done: false },
        { label: "TypeScript Basics", done: false },
        { label: "Component Libraries (Tailwind, MUI)", done: false },
      ],
    },
    {
      title: "Tooling & Performance",
      topics: [
        { label: "Build Tools (Vite, Webpack)", done: false },
        { label: "Performance Optimization", done: false },
        { label: "Testing (Jest, React Testing Library)", done: false },
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        { label: "Animations & Micro-interactions", done: false },
        { label: "Accessibility (a11y)", done: false },
        { label: "Server-Side Rendering (Next.js)", done: false },
      ],
    },
    {
      title: "Projects",
      topics: [
        { label: "Build a Portfolio Site", done: false },
        { label: "Build a Production-Grade Web App", done: false },
      ],
    },
  ],
  "Data Analyst": [
    {
      title: "Fundamentals",
      topics: [
        { label: "Excel & Spreadsheet Skills", done: true },
        { label: "Statistics Basics", done: true },
        { label: "SQL Fundamentals", done: true },
      ],
    },
    {
      title: "Data Analysis Tools",
      topics: [
        { label: "Advanced SQL (Joins, Window Functions)", done: false },
        { label: "Python for Data Analysis (Pandas)", done: false },
        { label: "Data Visualization (Tableau / Power BI)", done: false },
        { label: "Data Cleaning Techniques", done: false },
      ],
    },
    {
      title: "Analytics Depth",
      topics: [
        { label: "A/B Testing & Experimentation", done: false },
        { label: "Dashboarding", done: false },
        { label: "Storytelling with Data", done: false },
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        { label: "Intro to Machine Learning", done: false },
        { label: "Forecasting & Time Series", done: false },
      ],
    },
    {
      title: "Projects",
      topics: [
        { label: "End-to-End Analysis Case Study", done: false },
        { label: "Build a Public Dashboard Portfolio", done: false },
      ],
    },
  ],
  "Data Scientist": [
    {
      title: "Fundamentals",
      topics: [
        { label: "Python Programming", done: true },
        { label: "Statistics & Probability", done: true },
        { label: "Linear Algebra Basics", done: true },
      ],
    },
    {
      title: "Core Machine Learning",
      topics: [
        { label: "Supervised Learning Algorithms", done: false },
        { label: "Unsupervised Learning", done: false },
        { label: "Feature Engineering", done: false },
        { label: "Model Evaluation Metrics", done: false },
      ],
    },
    {
      title: "Deep Learning",
      topics: [
        { label: "Neural Network Fundamentals", done: false },
        { label: "CNNs & RNNs", done: false },
        { label: "Frameworks (PyTorch / TensorFlow)", done: false },
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        { label: "MLOps & Model Deployment", done: false },
        { label: "NLP & Transformers", done: false },
      ],
    },
    {
      title: "Projects",
      topics: [
        { label: "Kaggle Competition Project", done: false },
        { label: "End-to-End ML Pipeline", done: false },
      ],
    },
  ],
  "DevOps Engineer": [
    {
      title: "Fundamentals",
      topics: [
        { label: "Linux & Shell Scripting", done: true },
        { label: "Networking Basics", done: true },
        { label: "Git & Version Control", done: true },
      ],
    },
    {
      title: "Infrastructure & Automation",
      topics: [
        { label: "Docker & Containers", done: false },
        { label: "Kubernetes Basics", done: false },
        { label: "Infrastructure as Code (Terraform)", done: false },
        { label: "Configuration Management (Ansible)", done: false },
      ],
    },
    {
      title: "CI/CD & Cloud",
      topics: [
        { label: "CI/CD Pipelines (GitHub Actions, Jenkins)", done: false },
        { label: "Cloud Platforms (AWS / Azure / GCP)", done: false },
        { label: "Monitoring & Logging", done: false },
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        { label: "Security & Compliance", done: false },
        { label: "Site Reliability Engineering", done: false },
      ],
    },
    {
      title: "Projects",
      topics: [
        { label: "Build a Full CI/CD Pipeline", done: false },
        { label: "Deploy a Kubernetes Cluster Project", done: false },
      ],
    },
  ],
};

const GOALS = Object.keys(ROADMAP_TEMPLATES);

// ── Helpers ──────────────────────────────────────────────────────────────────
function computePhaseProgress(phase) {
  const total = phase.topics.length;
  const done = phase.topics.filter((t) => t.done).length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function deriveTopicStatus(topic, topicIndex, phaseTopics) {
  if (topic.done) return "completed";
  // The first not-done topic in a phase counts as "in progress",
  // everything after that is "pending" — mirrors the reference screenshot.
  const firstIncompleteIndex = phaseTopics.findIndex((t) => !t.done);
  if (topicIndex === firstIncompleteIndex) return "in-progress";
  return "pending";
}

function buildPhasesWithState(rawPhases) {
  // Returns phases enriched with progress %, overall status, and lock state.
  let previousComplete = true;
  return rawPhases.map((phase) => {
    const progress = computePhaseProgress(phase);
    const completed = progress === 100;
    const locked = !previousComplete;
    const status = locked ? "locked" : completed ? "completed" : progress > 0 ? "in-progress" : "upcoming";
    previousComplete = completed; // next phase unlocks only if this one is fully done
    return { ...phase, progress, completed, locked, status };
  });
}

// ── Left timeline node ───────────────────────────────────────────────────────
function PhaseNode({ phase, index, isLast, isSelected, onSelect }) {
  const dotColor =
    phase.status === "completed" ? C.green :
    phase.status === "in-progress" ? C.primary :
    C.muted;

  const dotBg =
    phase.status === "completed" ? C.green :
    phase.status === "in-progress" ? C.primary :
    C.lockedBg;

  const lineColor = phase.completed ? C.green : C.border;

  return (
    <div
      onClick={() => !phase.locked && onSelect(index)}
      style={{
        display:"flex", gap:14, padding:"10px 14px", borderRadius:14,
        cursor: phase.locked ? "not-allowed" : "pointer",
        background: isSelected ? C.primaryLight : "transparent",
        transition:"background .15s",
        opacity: phase.locked ? 0.65 : 1,
      }}
      onMouseEnter={e => { if (!isSelected && !phase.locked) e.currentTarget.style.background = "#F7F8FF"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", background:dotBg,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: phase.status === "locked" || phase.status === "upcoming" ? C.muted : "#fff",
          border: phase.status === "upcoming" ? `2px solid ${C.border}` : "none",
          boxShadow: isSelected ? `0 0 0 4px ${C.primaryLight}` : "none",
          transition:"box-shadow .2s",
        }}>
          {phase.status === "completed"
            ? <Icon d={ICONS.check} color="#fff" size={14} />
            : phase.locked
              ? <Icon d={ICONS.lock} color={C.muted} size={13} />
              : <span style={{ fontSize:12, fontWeight:700 }}>{index + 1}</span>
          }
        </div>
        {!isLast && <div style={{ width:2, flex:1, minHeight:34, background:lineColor, marginTop:4 }} />}
      </div>

      <div style={{ paddingTop:2 }}>
        <div style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Phase {index + 1}</div>
        <div style={{
          fontSize:14, fontWeight:700,
          color: phase.locked ? C.muted : isSelected ? C.primary : C.text,
          marginTop:1,
        }}>
          {phase.title}
        </div>
        <div style={{
          fontSize:11, fontWeight:600, marginTop:2,
          color: phase.status === "completed" ? C.green
               : phase.status === "in-progress" ? C.orange
               : C.muted,
        }}>
          {phase.status === "completed" && "✓ Completed"}
          {phase.status === "in-progress" && "In Progress"}
          {phase.status === "upcoming" && "Not started"}
          {phase.locked && "Locked"}
        </div>
      </div>
    </div>
  );
}

// ── Topic row (right panel) ──────────────────────────────────────────────────
function TopicRow({ topic, status, onToggle }) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  const badge =
    isCompleted ? { text: "✓ Completed", color: C.green } :
    isInProgress ? { text: "○ In Progress", color: C.orange } :
    { text: "Pending", color: C.muted };

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"12px 4px",
      borderBottom:`1px solid ${C.border}`,
    }}>
      <button
        onClick={onToggle}
        aria-label={isCompleted ? "Mark as not done" : "Mark as done"}
        style={{
          width:20, height:20, borderRadius:6, flexShrink:0,
          border: isCompleted ? "none" : `2px solid ${isInProgress ? C.orange : C.border}`,
          background: isCompleted ? C.green : "#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", transition:"all .15s",
        }}
      >
        {isCompleted && <Icon d={ICONS.check} color="#fff" size={13} />}
        {isInProgress && !isCompleted && <Icon d={ICONS.clock} color={C.orange} size={11} />}
      </button>

      <span style={{
        flex:1, fontSize:13.5, fontWeight:600,
        color: isCompleted ? C.text : C.text,
        textDecoration: "none",
      }}>
        {topic.label}
      </span>

      <span style={{ fontSize:11.5, fontWeight:700, color: badge.color, flexShrink:0 }}>
        {badge.text}
      </span>
    </div>
  );
}

// ── Goal switch modal ────────────────────────────────────────────────────────
function ChangeGoalModal({ currentGoal, onClose, onConfirm }) {
  const [selected, setSelected] = useState(currentGoal);
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(20,16,45,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:999,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:C.white, borderRadius:18, padding:26, width:"min(420px, 90vw)",
        boxShadow:"0 20px 60px rgba(20,16,45,0.25)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.text }}>Change Your Goal</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}>
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>
        <p style={{ fontSize:12.5, color:C.muted, margin:"0 0 18px 0", lineHeight:1.5 }}>
          Choosing a new goal will generate a fresh roadmap. Your current progress on this roadmap won't carry over.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setSelected(g)}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 14px", borderRadius:12, textAlign:"left", cursor:"pointer",
                border: `1.5px solid ${selected === g ? C.primary : C.border}`,
                background: selected === g ? C.primaryLight : "#fff",
                fontSize:13.5, fontWeight:600, color: selected === g ? C.primary : C.text,
                transition:"all .15s",
              }}
            >
              {g}
              {selected === g && <Icon d={ICONS.check} color={C.primary} size={16} />}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"11px 0", borderRadius:10, border:`1px solid ${C.border}`,
            background:"#fff", color:C.text, fontSize:13, fontWeight:700, cursor:"pointer",
          }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(selected)} style={{
            flex:1, padding:"11px 0", borderRadius:10, border:"none",
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
            color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:"0 4px 16px rgba(108,99,255,.35)",
          }}>
            Generate Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function RoadmapGenerator() {
  const [goal, setGoal] = useState("Full Stack Developer");
  const [rawPhases, setRawPhases] = useState(() =>
    ROADMAP_TEMPLATES["Full Stack Developer"].map((p) => ({
      ...p,
      topics: p.topics.map((t) => ({ ...t })),
    }))
  );
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(1); // start on Phase 2, like the reference
  const [showGoalModal, setShowGoalModal] = useState(false);

  const phases = useMemo(() => buildPhasesWithState(rawPhases), [rawPhases]);
  const selectedPhase = phases[selectedPhaseIndex];

  const overallProgress = useMemo(() => {
    const totalTopics = phases.reduce((sum, p) => sum + p.topics.length, 0);
    const doneTopics = phases.reduce((sum, p) => sum + p.topics.filter((t) => t.done).length, 0);
    return totalTopics === 0 ? 0 : Math.round((doneTopics / totalTopics) * 100);
  }, [phases]);

  function toggleTopic(phaseIndex, topicIndex) {
    setRawPhases((prev) => {
      const copy = prev.map((p) => ({ ...p, topics: p.topics.map((t) => ({ ...t })) }));
      copy[phaseIndex].topics[topicIndex].done = !copy[phaseIndex].topics[topicIndex].done;
      return copy;
    });
  }

  function handleGoalChange(newGoal) {
    setGoal(newGoal);
    setRawPhases(
      ROADMAP_TEMPLATES[newGoal].map((p) => ({
        ...p,
        topics: p.topics.map((t) => ({ ...t })),
      }))
    );
    setSelectedPhaseIndex(0);
    setShowGoalModal(false);
  }

  const encouragement =
    overallProgress >= 100 ? "Roadmap complete! You're ready. 🎉" :
    overallProgress >= 60 ? "Keep going! You're doing great! 🚀" :
    overallProgress >= 25 ? "Solid start — keep the momentum going! 💪" :
    "Let's get started on your journey! 🌱";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg,
      fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px" }}>
          <div style={{ display:"inline-flex", background:C.primary,
            borderRadius:"0 0 14px 14px", padding:"8px 20px" }}>
            <span style={{ fontSize:12, fontWeight:800, color:"#fff",
              letterSpacing:1, textTransform:"uppercase" }}>7. Roadmap Generator</span>
          </div>
        </div>

        <div style={{ padding:"28px 32px", flex:1, overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:C.text }}>Your Personalized Roadmap</h1>
              <p style={{ margin:"4px 0 0", fontSize:14, fontWeight:700, color:C.primary }}>{goal}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Overall Progress</div>
                <div style={{ fontSize:16, fontWeight:800, color:C.primary }}>{overallProgress}%</div>
              </div>
              <button onClick={() => setShowGoalModal(true)} style={{
                background:C.primaryLight, color:C.primary, border:"none",
                borderRadius:10, padding:"10px 18px", fontSize:12.5, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:6,
              }}>
                Change Goal
              </button>
            </div>
          </div>

          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {/* Left timeline */}
            <div style={{
              flex:"0 0 260px", minWidth:240, background:C.white, borderRadius:16,
              padding:"14px 8px", boxShadow:"0 2px 12px rgba(108,99,255,.06)",
              display:"flex", flexDirection:"column",
            }}>
              {phases.map((phase, i) => (
                <PhaseNode
                  key={i}
                  phase={phase}
                  index={i}
                  isLast={i === phases.length - 1}
                  isSelected={i === selectedPhaseIndex}
                  onSelect={setSelectedPhaseIndex}
                />
              ))}
            </div>

            {/* Right detail panel */}
            <div style={{
              flex:1, minWidth:300, background:C.white, borderRadius:16,
              padding:"22px 24px", boxShadow:"0 2px 12px rgba(108,99,255,.06)",
              display:"flex", flexDirection:"column",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.text }}>
                  Phase {selectedPhaseIndex + 1}: {selectedPhase.title}
                </h2>
                <span style={{
                  fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20,
                  background: selectedPhase.status === "completed" ? C.greenLight
                            : selectedPhase.status === "in-progress" ? C.orangeLight
                            : C.lockedBg,
                  color: selectedPhase.status === "completed" ? C.green
                       : selectedPhase.status === "in-progress" ? C.orange
                       : C.muted,
                }}>
                  {selectedPhase.status === "completed" ? "Completed"
                    : selectedPhase.status === "in-progress" ? "In Progress"
                    : "Not Started"}
                </span>
              </div>

              <div style={{ marginTop:14, marginBottom:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Progress</span>
                  <span style={{ fontSize:13, fontWeight:800, color:C.text }}>{selectedPhase.progress}%</span>
                </div>
                <div style={{ height:9, borderRadius:8, background:C.border, overflow:"hidden" }}>
                  <div style={{
                    width:`${selectedPhase.progress}%`, height:"100%", borderRadius:8,
                    background: selectedPhase.progress === 100 ? C.green : C.primary,
                    transition:"width .6s cubic-bezier(.4,0,.2,1)",
                  }} />
                </div>
              </div>

              <div style={{ flex:1 }}>
                {selectedPhase.topics.map((topic, i) => (
                  <TopicRow
                    key={i}
                    topic={topic}
                    status={deriveTopicStatus(topic, i, selectedPhase.topics)}
                    onToggle={() => toggleTopic(selectedPhaseIndex, i)}
                  />
                ))}
              </div>

              <div style={{
                marginTop:18, background:C.primaryLight, borderRadius:12,
                padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.primary }}>{encouragement}</span>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button
                  disabled={selectedPhaseIndex === 0}
                  onClick={() => setSelectedPhaseIndex((i) => Math.max(0, i - 1))}
                  style={{
                    flex:1, padding:"11px 0", borderRadius:10,
                    border:`1px solid ${C.border}`, background:"#fff",
                    color: selectedPhaseIndex === 0 ? C.muted : C.text,
                    fontSize:13, fontWeight:700,
                    cursor: selectedPhaseIndex === 0 ? "not-allowed" : "pointer",
                    opacity: selectedPhaseIndex === 0 ? 0.5 : 1,
                  }}
                >
                  Previous Phase
                </button>
                <button
                  disabled={selectedPhaseIndex === phases.length - 1 || phases[selectedPhaseIndex + 1]?.locked}
                  onClick={() => setSelectedPhaseIndex((i) => Math.min(phases.length - 1, i + 1))}
                  style={{
                    flex:1, padding:"11px 0", borderRadius:10, border:"none",
                    background: (selectedPhaseIndex === phases.length - 1 || phases[selectedPhaseIndex + 1]?.locked)
                      ? C.border
                      : `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                    color: (selectedPhaseIndex === phases.length - 1 || phases[selectedPhaseIndex + 1]?.locked)
                      ? C.muted : "#fff",
                    fontSize:13, fontWeight:700,
                    cursor: (selectedPhaseIndex === phases.length - 1 || phases[selectedPhaseIndex + 1]?.locked)
                      ? "not-allowed" : "pointer",
                  }}
                >
                  Next Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGoalModal && (
        <ChangeGoalModal
          currentGoal={goal}
          onClose={() => setShowGoalModal(false)}
          onConfirm={handleGoalChange}
        />
      )}
    </div>
  );
}
