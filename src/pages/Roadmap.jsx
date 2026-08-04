import { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api.js";
import CalendarReminderModal from "../components/CalendarReminderModal.jsx";

const C = {
  primary: "#6C63FF", primaryDark: "#4B44D6", primaryLight: "#EEF0FF",
  bg: "#F4F5FF", white: "#FFFFFF", text: "#1A1D2E", muted: "#8B8FA8",
  green: "#10B981", greenLight: "#ECFDF5", orange: "#F59E0B", orangeLight: "#FFFBEB",
  red: "#EF4444", border: "#E8EAFF", lockedBg: "#F1F2FA",
};

const Icon = ({ d, color = "currentColor", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const ICONS = {
  check:    "M20 6L9 17l-5-5",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  clock:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  x:        "M18 6L6 18 M6 6l12 12",
  calendar: "M3 9h18 M16 2v4 M8 2v4 M3 4h18v18H3V4z",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

const GOALS = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer",
  "Data Analyst", "Data Scientist", "DevOps Engineer",
  "Machine Learning Engineer", "Mobile Developer", "Product Manager",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeProgress(topics) {
  if (!topics?.length) return 0;
  return Math.round((topics.filter(t => t.done).length / topics.length) * 100);
}

function buildPhasesWithState(rawPhases) {
  let prevComplete = true;
  return (rawPhases || []).map((phase) => {
    const progress = computeProgress(phase.topics);
    const completed = progress === 100;
    const locked = !prevComplete;
    const status = locked ? "locked" : completed ? "completed" : progress > 0 ? "in-progress" : "upcoming";
    prevComplete = completed;
    return { ...phase, progress, completed, locked, status };
  });
}

// ── Phase timeline node ───────────────────────────────────────────────────────
function PhaseNode({ phase, index, isLast, isSelected, onSelect }) {
  const dotBg =
    phase.status === "completed" ? C.green :
    phase.status === "in-progress" ? C.primary : C.lockedBg;
  const lineColor = phase.completed ? C.green : C.border;

  return (
    <div
      onClick={() => !phase.locked && onSelect(index)}
      style={{
        display:"flex", gap:14, padding:"10px 14px", borderRadius:14,
        cursor: phase.locked ? "not-allowed" : "pointer",
        background: isSelected ? C.primaryLight : "transparent",
        transition:"background .15s", opacity: phase.locked ? 0.65 : 1,
      }}
    >
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", background:dotBg,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: phase.status === "locked" || phase.status === "upcoming" ? C.muted : "#fff",
          border: phase.status === "upcoming" ? `2px solid ${C.border}` : "none",
          boxShadow: isSelected ? `0 0 0 4px ${C.primaryLight}` : "none",
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
        <div style={{ fontSize:14, fontWeight:700, color: phase.locked ? C.muted : isSelected ? C.primary : C.text, marginTop:1 }}>
          {phase.title}
        </div>
        <div style={{ fontSize:11, fontWeight:600, marginTop:2,
          color: phase.status==="completed" ? C.green : phase.status==="in-progress" ? C.orange : C.muted }}>
          {phase.status==="completed" && "✓ Completed"}
          {phase.status==="in-progress" && "In Progress"}
          {phase.status==="upcoming" && "Not started"}
          {phase.locked && "Locked"}
        </div>
      </div>
    </div>
  );
}

// ── Topic row ─────────────────────────────────────────────────────────────────
function TopicRow({ topic, phaseIndex, topicIndex, locked, onToggle }) {
  const done = topic.done;
  const topicName = topic.name || topic.label || "Topic";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 4px", borderBottom:`1px solid ${C.border}` }}>
      <button onClick={() => !locked && onToggle(phaseIndex, topicIndex, !done)}
        disabled={locked}
        style={{
          width:20, height:20, borderRadius:6, flexShrink:0,
          border: done ? "none" : `2px solid ${C.border}`,
          background: done ? C.green : "#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor: locked ? "not-allowed" : "pointer", transition:"all .15s",
        }}>
        {done && <Icon d={ICONS.check} color="#fff" size={13} />}
      </button>
      <span style={{ flex:1, fontSize:13.5, fontWeight:600, color:C.text, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
        {topicName}
      </span>
      <span style={{ fontSize:11.5, fontWeight:700, flexShrink:0,
        color: done ? C.green : C.muted }}>
        {done ? "✓ Done" : "Pending"}
      </span>
    </div>
  );
}

// ── Generate modal ────────────────────────────────────────────────────────────
function GenerateModal({ currentGoal, onClose, onGenerate, loading }) {
  const [selected, setSelected] = useState(currentGoal || GOALS[0]);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(20,16,45,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, backdropFilter:"blur(2px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:18, padding:26, width:"min(440px, 92vw)", boxShadow:"0 20px 60px rgba(20,16,45,0.22)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.text }}>Generate AI Roadmap</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}>
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>
        <p style={{ fontSize:12.5, color:C.muted, margin:"0 0 18px", lineHeight:1.5 }}>
          Claude will generate a phased learning roadmap personalized to your goal.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20, maxHeight:300, overflowY:"auto" }}>
          {GOALS.map((g) => (
            <button key={g} onClick={() => setSelected(g)} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 14px", borderRadius:12, textAlign:"left", cursor:"pointer",
              border:`1.5px solid ${selected===g ? C.primary : C.border}`,
              background: selected===g ? C.primaryLight : "#fff",
              fontSize:13.5, fontWeight:600, color: selected===g ? C.primary : C.text, transition:"all .15s",
            }}>
              {g}
              {selected===g && <Icon d={ICONS.check} color={C.primary} size={16}/>}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px 0", borderRadius:10, border:`1px solid ${C.border}`, background:"#fff", color:C.text, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={() => onGenerate(selected)} disabled={loading} style={{
            flex:2, padding:"11px 0", borderRadius:10, border:"none",
            background: loading ? C.border : `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
            color: loading ? C.muted : "#fff", fontSize:13, fontWeight:700,
            cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            {loading ? (
              <><div style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",animation:"spin .7s linear infinite" }}/> Generating…</>
            ) : (
              <><Icon d={ICONS.zap} color="#fff" size={14}/> Generate Roadmap</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RoadmapGenerator() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);

  // Load existing roadmaps from backend
  const loadRoadmaps = useCallback(async () => {
    setLoadingRoadmaps(true);
    try {
      const { data } = await API.get("/roadmap");
      setRoadmaps(data || []);
      if (data?.length > 0 && !activeRoadmapId) {
        setActiveRoadmapId(data[0].id || data[0]._id);
      }
    } catch {
      // If unauthorized or error, show empty state with generate button
    } finally {
      setLoadingRoadmaps(false);
    }
  }, [activeRoadmapId]);

  useEffect(() => { loadRoadmaps(); }, []);

  const activeRoadmap = useMemo(
    () => roadmaps.find(r => (r.id || r._id) === activeRoadmapId),
    [roadmaps, activeRoadmapId]
  );

  const phases = useMemo(
    () => buildPhasesWithState(activeRoadmap?.phases || []),
    [activeRoadmap]
  );

  const selectedPhase = phases[selectedPhaseIndex] || phases[0];

  const overallProgress = useMemo(() => {
    const all = phases.flatMap(p => p.topics || []);
    if (!all.length) return 0;
    return Math.round((all.filter(t => t.done).length / all.length) * 100);
  }, [phases]);

  // Generate a new roadmap via Claude
  async function handleGenerate(goal) {
    setGenerating(true);
    try {
      const { data } = await API.post("/roadmap/generate", { goal });
      setRoadmaps(prev => {
        const existing = prev.findIndex(r => r.goal === goal);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = data;
          return copy;
        }
        return [data, ...prev];
      });
      setActiveRoadmapId(data.id || data._id);
      setSelectedPhaseIndex(0);
      setShowModal(false);
    } catch (err) {
      // Show inline error — keep modal open
      alert(err?.response?.data?.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // Toggle a topic done/undone and persist to backend
  async function handleTopicToggle(phaseIndex, topicIndex, done) {
    if (!activeRoadmapId || savingTopic) return;
    // Optimistic update
    setRoadmaps(prev => prev.map(r => {
      if ((r.id || r._id) !== activeRoadmapId) return r;
      const phases = (r.phases || []).map((p, pi) => {
        if (pi !== phaseIndex) return p;
        const topics = (p.topics || []).map((t, ti) => ti === topicIndex ? { ...t, done } : t);
        return { ...p, topics };
      });
      return { ...r, phases };
    }));
    setSavingTopic(true);
    try {
      const { data: updated } = await API.patch(`/roadmap/${activeRoadmapId}/topic`, {
        phaseIndex, topicIndex, done,
      });
      setRoadmaps(prev => prev.map(r =>
        (r.id || r._id) === activeRoadmapId ? updated : r
      ));
    } catch {
      // Revert on failure
      loadRoadmaps();
    } finally {
      setSavingTopic(false);
    }
  }

  const encouragement =
    overallProgress >= 100 ? "Roadmap complete! You're ready. 🎉" :
    overallProgress >= 60  ? "Keep going! You're doing great! 🚀" :
    overallProgress >= 25  ? "Solid start — keep the momentum going! 💪" :
    "Let's get started on your journey! 🌱";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <Sidebar />

      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px" }}>
          <div style={{ display:"inline-flex", background:C.primary, borderRadius:"0 0 14px 14px", padding:"8px 20px" }}>
            <span style={{ fontSize:12, fontWeight:800, color:"#fff", letterSpacing:1, textTransform:"uppercase" }}>Roadmap Generator</span>
          </div>
        </div>

        <div style={{ padding:"28px 32px", flex:1, overflowY:"auto" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:12 }}>
            <div>
              <h1 style={{ margin:0, fontSize:21, fontWeight:800, color:C.text }}>Your Personalized Roadmap</h1>
              {activeRoadmap && (
                <p style={{ margin:"4px 0 0", fontSize:14, fontWeight:700, color:C.primary }}>Goal: {activeRoadmap.goal}</p>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {activeRoadmap && (
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Overall Progress</div>
                  <div style={{ fontSize:16, fontWeight:800, color:C.primary }}>{overallProgress}%</div>
                </div>
              )}
              <button onClick={() => setCalendarOpen(true)} style={{
                background:C.greenLight, color:C.green, border:"none",
                borderRadius:10, padding:"10px 14px", fontSize:12.5, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:6,
              }}>
                <Icon d={ICONS.calendar} color={C.green} size={14}/> Reminder
              </button>
              <button onClick={() => setShowModal(true)} style={{
                background:C.primaryLight, color:C.primary, border:"none",
                borderRadius:10, padding:"10px 18px", fontSize:12.5, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center", gap:6,
              }}>
                <Icon d={ICONS.zap} color={C.primary} size={14}/>
                {roadmaps.length === 0 ? "Generate Roadmap" : "New Roadmap"}
              </button>
            </div>
          </div>

          {/* Roadmap tabs (if multiple) */}
          {roadmaps.length > 1 && (
            <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {roadmaps.map(r => (
                <button key={r.id || r._id} onClick={() => { setActiveRoadmapId(r.id||r._id); setSelectedPhaseIndex(0); }}
                  style={{
                    padding:"7px 16px", borderRadius:20, border:"1.5px solid",
                    borderColor: (r.id||r._id)===activeRoadmapId ? C.primary : C.border,
                    background: (r.id||r._id)===activeRoadmapId ? C.primaryLight : C.white,
                    color: (r.id||r._id)===activeRoadmapId ? C.primary : C.muted,
                    fontWeight:600, fontSize:12.5, cursor:"pointer", flexShrink:0, transition:"all .15s",
                  }}>
                  {r.goal}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loadingRoadmaps && (
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:80, borderRadius:14, background:"linear-gradient(90deg,#e8e6f5 25%,#f3f1fb 50%,#e8e6f5 75%)", flex:1, minWidth:200, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingRoadmaps && roadmaps.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
              <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>No roadmap yet</h2>
              <p style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
                Generate a personalized, phased roadmap powered by Claude AI — built around your goal.
              </p>
              <button onClick={() => setShowModal(true)} style={{
                padding:"14px 28px", background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                cursor:"pointer", boxShadow:"0 4px 18px rgba(108,99,255,.35)",
              }}>
                Generate My Roadmap →
              </button>
            </div>
          )}

          {/* Roadmap layout */}
          {!loadingRoadmaps && activeRoadmap && phases.length > 0 && (
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {/* Left timeline */}
              <div style={{ flex:"0 0 260px", minWidth:240, background:C.white, borderRadius:16, padding:"14px 8px", boxShadow:"0 2px 12px rgba(108,99,255,.06)", display:"flex", flexDirection:"column" }}>
                {phases.map((phase, i) => (
                  <PhaseNode key={i} phase={phase} index={i} isLast={i===phases.length-1}
                    isSelected={i===selectedPhaseIndex} onSelect={setSelectedPhaseIndex} />
                ))}
              </div>

              {/* Right detail panel */}
              {selectedPhase && (
                <div style={{ flex:1, minWidth:300, background:C.white, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 12px rgba(108,99,255,.06)", display:"flex", flexDirection:"column" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.text }}>
                      Phase {selectedPhaseIndex + 1}: {selectedPhase.title}
                    </h2>
                    {selectedPhase.duration && (
                      <span style={{ fontSize:11.5, color:C.muted, fontWeight:600 }}>⏱ {selectedPhase.duration}</span>
                    )}
                    <span style={{
                      fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20,
                      background: selectedPhase.status==="completed" ? C.greenLight : selectedPhase.status==="in-progress" ? C.orangeLight : C.lockedBg,
                      color: selectedPhase.status==="completed" ? C.green : selectedPhase.status==="in-progress" ? C.orange : C.muted,
                    }}>
                      {selectedPhase.status==="completed" ? "Completed" : selectedPhase.status==="in-progress" ? "In Progress" : "Not Started"}
                    </span>
                  </div>

                  <div style={{ marginTop:14, marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Progress</span>
                      <span style={{ fontSize:13, fontWeight:800, color:C.text }}>{selectedPhase.progress}%</span>
                    </div>
                    <div style={{ height:9, borderRadius:8, background:C.border, overflow:"hidden" }}>
                      <div style={{ width:`${selectedPhase.progress}%`, height:"100%", borderRadius:8, background: selectedPhase.progress===100 ? C.green : C.primary, transition:"width .6s ease" }} />
                    </div>
                  </div>

                  <div style={{ flex:1 }}>
                    {(selectedPhase.topics || []).map((topic, i) => (
                      <TopicRow
                        key={i} topic={topic} phaseIndex={selectedPhaseIndex} topicIndex={i}
                        locked={selectedPhase.locked}
                        onToggle={handleTopicToggle}
                      />
                    ))}
                  </div>

                  <div style={{ marginTop:18, background:C.primaryLight, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:C.primary }}>{encouragement}</span>
                  </div>

                  <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    <button disabled={selectedPhaseIndex===0} onClick={() => setSelectedPhaseIndex(i => Math.max(0,i-1))} style={{
                      flex:1, padding:"11px 0", borderRadius:10, border:`1px solid ${C.border}`,
                      background:"#fff", color: selectedPhaseIndex===0 ? C.muted : C.text,
                      fontSize:13, fontWeight:700, cursor: selectedPhaseIndex===0 ? "not-allowed" : "pointer",
                      opacity: selectedPhaseIndex===0 ? 0.5 : 1,
                    }}>Previous Phase</button>
                    <button disabled={selectedPhaseIndex===phases.length-1||phases[selectedPhaseIndex+1]?.locked}
                      onClick={() => setSelectedPhaseIndex(i => Math.min(phases.length-1,i+1))}
                      style={{
                        flex:1, padding:"11px 0", borderRadius:10, border:"none",
                        background: (selectedPhaseIndex===phases.length-1||phases[selectedPhaseIndex+1]?.locked) ? C.border : `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
                        color: (selectedPhaseIndex===phases.length-1||phases[selectedPhaseIndex+1]?.locked) ? C.muted : "#fff",
                        fontSize:13, fontWeight:700,
                        cursor: (selectedPhaseIndex===phases.length-1||phases[selectedPhaseIndex+1]?.locked) ? "not-allowed" : "pointer",
                      }}>Next Phase</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <GenerateModal
          currentGoal={activeRoadmap?.goal}
          onClose={() => !generating && setShowModal(false)}
          onGenerate={handleGenerate}
          loading={generating}
        />
      )}

      <CalendarReminderModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        defaultTitle={`Study: ${activeRoadmap?.goal || "Learning Roadmap"}`}
        defaultDescription={`Dedicated study time for ${activeRoadmap?.goal || "your learning roadmap"}.`}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
