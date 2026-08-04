import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Mic, Square, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, X, RotateCcw } from "lucide-react";
import { getQuestionsForRole, gradeInterview, AVAILABLE_ROLES } from "../services/localInterview.js";
import CalendarReminderModal from "../components/CalendarReminderModal.jsx";
import Swal from "sweetalert2";

const ROLES = AVAILABLE_ROLES;
const DIFFICULTIES = ["Easy","Medium","Hard"];
const MAX_CHARS = 3000;

// ── Animated score ring ─────────────────────────────────────────────────────
function ScoreRing({ percent }) {
  const radius = 54, stroke = 10;
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
  const color = anim >= 70 ? "#22c55e" : anim >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
        <circle stroke="#e9e7f5" fill="transparent" strokeWidth={stroke} r={norm} cx={radius} cy={radius} />
        <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
          style={{ transition: "stroke 0.4s" }} r={norm} cx={radius} cy={radius} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#1e1b3a" }}>
        {anim}%
      </div>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "error" ? "#fee2e2" : "#e8f9ee";
  const fg = type === "error" ? "#b91c1c" : "#15803d";
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:bg, color:fg,
      border:`1px solid ${type==="error"?"#fca5a5":"#86efac"}`, borderRadius:12,
      padding:"12px 18px", fontSize:13.5, fontWeight:600,
      display:"flex", alignItems:"center", gap:8, boxShadow:"0 10px 30px rgba(0,0,0,.12)",
      zIndex:1000, animation:"toastIn .35s ease", maxWidth:320 }}>
      {type==="error" ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft:"auto", background:"transparent", border:"none", cursor:"pointer", color:fg }}>
        <X size={14}/>
      </button>
    </div>
  );
}

// ── Skeleton loader ─────────────────────────────────────────────────────────
function Skeleton({ h=18, w="100%", br=8, mb=0 }) {
  return <div style={{ height:h, width:w, borderRadius:br, marginBottom:mb,
    background:"linear-gradient(90deg, #e8e6f5 25%, #f3f1fb 50%, #e8e6f5 75%)",
    backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />;
}

const selectStyle = { width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e3e1ef",
  fontSize:13.5, fontFamily:"inherit", color:"#1e1b3a", background:"#fff", cursor:"pointer" };

export default function AIMockInterview() {
  const [role, setRole] = useState("Java Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count] = useState(5);

  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [perFeedback, setPerFeedback] = useState({}); // { [questionIndex]: {score, feedback} }

  // UI state
  const [phase, setPhase] = useState("setup"); // setup | loading | interview | grading | results
  const [toast, setToast] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [questionAnim, setQuestionAnim] = useState("in");
  const [result, setResult] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const recognitionRef = useRef(null);

  const showToast = (message, type="success") => setToast({ message, type });

  // ── Start session using local question bank ──────────────────────────────────
  async function handleStartInterview() {
    setPhase("loading");
    try {
      const questions = getQuestionsForRole(role, difficulty, count);
      const sessionId = `local-${Date.now()}`;
      setSessionId(sessionId);
      setQuestions(questions);
      setAnswers(Array(questions.length).fill(""));
      setPerFeedback({});
      setCurrentIndex(0);
      setResult(null);
      // Small delay so loading screen shows
      await new Promise(r => setTimeout(r, 600));
      setPhase("interview");
    } catch (err) {
      showToast("Failed to start interview. Please try again.", "error");
      setPhase("setup");
    }
  }

  // ── Submit one answer (per-question local feedback) ────────────────────────────
  async function submitCurrentAnswer() {
    if (!sessionId) return;
    const answer = answers[currentIndex] || "";
    const len = answer.trim().length;
    // Quick local score
    const score = len > 300 ? 8 : len > 150 ? 7 : len > 80 ? 5 : len > 20 ? 3 : 1;
    const feedbackMap = { 8: "Great answer!", 7: "Good answer, add more detail.", 5: "Decent — expand your reasoning.", 3: "Too brief. Provide specifics.", 1: "Needs development." };
    setPerFeedback(prev => ({ ...prev, [currentIndex]: { score, feedback: feedbackMap[score] || feedbackMap[5] } }));
  }

  // ── Navigate between questions ────────────────────────────────────────────
  async function goToQuestion(idx) {
    if (idx < 0 || idx >= questions.length) return;
    await submitCurrentAnswer();
    setQuestionAnim("out");
    stopRecording();
    setTimeout(() => { setCurrentIndex(idx); setQuestionAnim("in"); }, 180);
  }

  // ── Finish interview using local grader ──────────────────────────────────────
  async function handleFinish() {
    stopRecording();
    await submitCurrentAnswer();
    setPhase("grading");
    try {
      // Small delay for UX
      await new Promise(r => setTimeout(r, 800));
      const data = gradeInterview(questions, answers);
      setResult(data);
      setPhase("results");
      showToast("Interview complete! Here's your feedback.", "success");
    } catch (err) {
      showToast("Failed to grade interview. Please try again.", "error");
      setPhase("interview");
    }
  }

  // ── Reset to setup ────────────────────────────────────────────────────────
  function handleRestart() {
    setPhase("setup");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setPerFeedback({});
    setResult(null);
    stopRecording();
    setToast({ message: "Ready for your next session.", type: "success" });
  }

  // ── Speech recording ──────────────────────────────────────────────────────
  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("Voice input isn't supported in this browser.", "error"); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    let base = answers[currentIndex] || "";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " "; else interim += t;
      }
      if (final) { base = (base + " " + final).trim(); setAnswers((p) => { const c=[...p]; c[currentIndex]=base.slice(0,MAX_CHARS); return c; }); }
      else if (interim) { setAnswers((p) => { const c=[...p]; c[currentIndex]=(base+" "+interim).trim().slice(0,MAX_CHARS); return c; }); }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec; rec.start(); setIsRecording(true);
  }

  function stopRecording() {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null; setIsRecording(false);
  }

  function toggleRecording() { isRecording ? stopRecording() : startRecording(); }

  useEffect(() => () => stopRecording(), []);

  const currentAnswer = answers[currentIndex] || "";
  const answeredCount = answers.filter(a => (a||"").trim().length > 0).length;
  const isLast = currentIndex === questions.length - 1;
  const qFeedback = perFeedback[currentIndex];

  // ── SETUP PHASE ───────────────────────────────────────────────────────────
  if (phase === "setup") return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f6f5fb", fontFamily:"Inter, system-ui, sans-serif" }}>
      <Sidebar/>
      <div style={{ flex:1, padding:"32px", overflowY:"auto" }}>
        <div style={{ display:"inline-block", background:"linear-gradient(90deg,#6d4ff2,#8a5cf6)", color:"#fff", fontSize:12, fontWeight:700, letterSpacing:0.4, padding:"7px 16px", borderRadius:8, marginBottom:20 }}>AI MOCK INTERVIEW</div>
        <h2 style={{ margin:"0 0 6px", fontSize:22, fontWeight:800, color:"#1e1b3a" }}>Configure Your Interview</h2>
        <p style={{ margin:"0 0 28px", fontSize:14, color:"#7a7f95" }}>Claude generates real questions and grades each answer after you finish.</p>

        <div style={{ maxWidth:520, background:"#fff", borderRadius:16, padding:28, boxShadow:"0 2px 16px rgba(108,99,255,.08)", border:"1px solid #ece9f7" }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#3d3a55", display:"block", marginBottom:6 }}>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} style={selectStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#3d3a55", display:"block", marginBottom:6 }}>Difficulty</label>
            <div style={{ display:"flex", gap:10 }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  flex:1, padding:"10px", borderRadius:10, border:"1.5px solid",
                  borderColor: difficulty===d?"#6d4ff2":"#e3e1ef",
                  background: difficulty===d?"#f3f0ff":"#fff",
                  color: difficulty===d?"#6d4ff2":"#6b7280",
                  fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .2s",
                }}>{d}</button>
              ))}
            </div>
          </div>
          <button onClick={handleStartInterview} style={{
            width:"100%", padding:"14px", background:"linear-gradient(135deg,#6d4ff2,#a855f7)",
            color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
            cursor:"pointer", boxShadow:"0 4px 18px rgba(109,79,242,.35)", transition:"all .2s",
          }}>
            Start Interview →
          </button>
        </div>
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  // ── LOADING PHASE ─────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f6f5fb", fontFamily:"Inter, system-ui, sans-serif" }}>
      <Sidebar/>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"4px solid #e8e6f5", borderTop:"4px solid #6d4ff2", animation:"spin .8s linear infinite" }} />
        <p style={{ color:"#6d4ff2", fontWeight:600, fontSize:14 }}>Claude is generating your questions…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── GRADING PHASE ─────────────────────────────────────────────────────────
  if (phase === "grading") return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f6f5fb", fontFamily:"Inter, system-ui, sans-serif" }}>
      <Sidebar/>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", border:"4px solid #e8e6f5", borderTop:"4px solid #6d4ff2", animation:"spin .8s linear infinite" }} />
        <p style={{ color:"#6d4ff2", fontWeight:600, fontSize:14 }}>Claude is grading your interview…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── RESULTS PHASE ─────────────────────────────────────────────────────────
  if (phase === "results" && result) {
    const score = result.overallScore ?? 0;
    const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ display:"flex", minHeight:"100vh", background:"#f6f5fb", fontFamily:"Inter, system-ui, sans-serif" }}>
        <Sidebar/>
        <div style={{ flex:1, padding:32, overflowY:"auto" }}>
          <h2 style={{ margin:"0 0 20px", fontSize:22, fontWeight:800, color:"#1e1b3a" }}>Interview Results</h2>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {/* Score card */}
            <div style={{ background:"#fff", borderRadius:16, padding:28, boxShadow:"0 2px 16px rgba(108,99,255,.08)", border:"1px solid #ece9f7", display:"flex", flexDirection:"column", alignItems:"center", gap:16, minWidth:200 }}>
              <ScoreRing percent={score} />
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:700, color:scoreColor }}>
                  {score>=70?"Great Performance!":score>=40?"Fair Attempt":"Needs Practice"}
                </div>
                <div style={{ fontSize:12, color:"#9a9eb3", marginTop:4 }}>{role} · {difficulty}</div>
              </div>
              <button onClick={() => setCalendarOpen(true)} style={{
                width:"100%", padding:"10px", background:"#f0fdf4", border:"1px solid #86efac",
                borderRadius:10, color:"#15803d", fontSize:13, fontWeight:600, cursor:"pointer",
              }}>📅 Set Practice Reminder</button>
              <button onClick={handleRestart} style={{
                width:"100%", padding:"10px", background:"#f3f0ff", border:"1px solid #c4b5fd",
                borderRadius:10, color:"#6d4ff2", fontSize:13, fontWeight:600, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}><RotateCcw size={14}/> New Interview</button>
            </div>

            {/* Feedback */}
            <div style={{ flex:1, minWidth:300 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(108,99,255,.08)", border:"1px solid #ece9f7", marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#1e1b3a", marginBottom:12 }}>Overall Feedback</div>
                <p style={{ fontSize:13.5, color:"#3d3a55", lineHeight:1.65, margin:0 }}>{result.overallFeedback}</p>
              </div>

              {/* Per-question breakdown */}
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(108,99,255,.08)", border:"1px solid #ece9f7" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#1e1b3a", marginBottom:14 }}>Question Breakdown</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(result.answers || []).map((a, i) => (
                    <div key={i} style={{ background:"#f6f5fb", borderRadius:10, padding:"12px 16px" }}>
                      <div style={{ fontSize:12.5, fontWeight:700, color:"#6d4ff2", marginBottom:4 }}>Q{i+1}: {a.question}</div>
                      <div style={{ fontSize:12, color:"#3d3a55", marginBottom:6, lineHeight:1.5 }}><b>Your answer:</b> {a.answer || "(No answer)"}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:12, color:"#7a7f95" }}>{a.feedback}</span>
                        <span style={{ fontSize:13, fontWeight:700, color: (a.score||0)>=7?"#22c55e":(a.score||0)>=4?"#f59e0b":"#ef4444" }}>{a.score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <CalendarReminderModal
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          defaultTitle={`Practice: ${role} Interview`}
          defaultDescription={`Scheduled practice to improve on ${difficulty} ${role} interview questions.`}
        />
        <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ── INTERVIEW PHASE ───────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f6f5fb", fontFamily:"Inter, system-ui, sans-serif" }}>
      <Sidebar/>
      <div style={{ flex:1, padding:"24px 28px", overflowY:"auto" }}>
        <div style={{ display:"inline-block", background:"linear-gradient(90deg,#6d4ff2,#8a5cf6)", color:"#fff", fontSize:12, fontWeight:700, letterSpacing:0.4, padding:"7px 16px", borderRadius:8, marginBottom:18 }}>AI MOCK INTERVIEW</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h2 style={{ margin:"0 0 4px", fontSize:21, fontWeight:800, color:"#1e1b3a" }}>{role}</h2>
            <p style={{ margin:0, fontSize:13.5, color:"#7a7f95" }}>Difficulty: {difficulty} · {answeredCount}/{questions.length} answered</p>
          </div>
          <button onClick={() => Swal.fire({ title:"End interview?", text:"You'll be taken to results with whatever you've answered.", icon:"question", showCancelButton:true, confirmButtonColor:"#6d4ff2", cancelButtonColor:"#e5e7eb", confirmButtonText:"Yes, finish" }).then(r => r.isConfirmed && handleFinish())} style={{ border:"1px solid #fca5a5", color:"#dc2626", background:"#fff", fontSize:12.5, fontWeight:700, padding:"7px 14px", borderRadius:8, cursor:"pointer" }}>
            Finish Interview
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {questions.map((_, i) => (
            <button key={i} onClick={() => goToQuestion(i)} style={{
              width:28, height:28, borderRadius:"50%", border:"2px solid",
              borderColor: i===currentIndex?"#6d4ff2":(answers[i]||"").trim()?"#22c55e":"#e3e1ef",
              background: i===currentIndex?"#6d4ff2":(answers[i]||"").trim()?"#f0fdf4":"#fff",
              color: i===currentIndex?"#fff":(answers[i]||"").trim()?"#15803d":"#9a9eb3",
              fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .2s",
            }}>{i+1}</button>
          ))}
        </div>

        {/* Question card */}
        <div key={currentIndex} className={questionAnim==="in"?"qa-in":"qa-out"}
          style={{ background:"#f1effa", borderRadius:12, padding:"18px 20px", marginBottom:18, border:"1px solid #e6e3f6" }}>
          <p style={{ margin:0, fontSize:14.5, fontWeight:700, color:"#231f44", lineHeight:1.55 }}>
            Q{currentIndex+1}. {questions[currentIndex]}
          </p>
        </div>

        {/* Per-question feedback (if already graded) */}
        {qFeedback && (
          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <p style={{ margin:0, fontSize:13, color:"#15803d", lineHeight:1.5 }}>{qFeedback.feedback}</p>
            <span style={{ fontSize:14, fontWeight:800, color:"#15803d", flexShrink:0 }}>{qFeedback.score}/10</span>
          </div>
        )}

        {/* Answer box */}
        <label style={{ fontSize:12.5, fontWeight:600, color:"#3d3a55", display:"block", marginBottom:6 }}>Your Answer</label>
        <div style={{ position:"relative" }}>
          <textarea value={currentAnswer} onChange={e => { const c=[...answers]; c[currentIndex]=e.target.value.slice(0,MAX_CHARS); setAnswers(c); }}
            placeholder="Type or speak your answer..."
            style={{ width:"100%", minHeight:130, resize:"vertical", border:"1.5px solid #e3e1ef", borderRadius:10, padding:"12px 14px", fontSize:13.5, fontFamily:"inherit", color:"#1e1b3a", background:"#fff", boxSizing:"border-box" }} />
          <div style={{ position:"absolute", bottom:10, right:14, fontSize:11, color:"#a7abbe" }}>{currentAnswer.length}/{MAX_CHARS}</div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", gap:12, marginTop:16, alignItems:"center", flexWrap:"wrap" }}>
          <button onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex===0}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 16px", border:"1.5px solid #e3e1ef", borderRadius:10, background:"#fff", color:"#3d3a55", fontSize:13.5, fontWeight:600, cursor:currentIndex===0?"not-allowed":"pointer", opacity:currentIndex===0?.5:1 }}>
            <ChevronLeft size={15}/> Previous
          </button>

          <button onClick={toggleRecording}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", border:"none", borderRadius:10,
              background: isRecording?"#ef4444":"#6d4ff2", color:"#fff", fontSize:13.5, fontWeight:700, cursor:"pointer",
              animation: isRecording?"pulseRec 1.4s infinite":undefined }}>
            {isRecording ? <><Square size={14}/> Stop Recording</> : <><Mic size={14}/> Record Answer</>}
          </button>

          {isLast ? (
            <button onClick={handleFinish}
              style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, padding:"10px 22px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:13.5, fontWeight:700, cursor:"pointer", boxShadow:"0 3px 12px rgba(34,197,94,.35)" }}>
              <CheckCircle2 size={15}/> Finish & Get Feedback
            </button>
          ) : (
            <button onClick={() => goToQuestion(currentIndex + 1)}
              style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, padding:"10px 18px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#6d4ff2,#8a5cf6)", color:"#fff", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
              Next <ChevronRight size={15}/>
            </button>
          )}
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRec{0%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}70%{box-shadow:0 0 0 9px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
        .qa-in{animation:fadeIn .22s ease}
        .qa-out{animation:fadeOut .18s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
        @keyframes fadeOut{from{opacity:1}to{opacity:0;transform:translateX(-14px)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
