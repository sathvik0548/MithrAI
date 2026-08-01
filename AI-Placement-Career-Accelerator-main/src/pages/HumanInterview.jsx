import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calendar,
  Video,
  Star,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import "../styles/HumanInterview.css";

/* ---------------- static config ---------------- */

const PAGE_BADGES = {
  dashboard: "1. DASHBOARD",
  resume: "2. RESUME ANALYZER",
  mock: "3. AI MOCK INTERVIEW",
  roadmap: "4. ROADMAP",
  human: "8. HUMAN INTERVIEW",
};

const ROLES = [
  "Java Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Product Manager",
  "DevOps Engineer",
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const EXPERTS = [
  {
    id: "e1",
    name: "Rohit Sharma",
    title: "SDE at Google",
    experience: "6+ Years Experience",
    interviewsTaken: "500+ Interviews Taken",
    badge: "Ex-Microsoft",
    rating: 4.9,
    reviews: 1120,
    initials: "RS",
    color: "#7c5cff",
  },
  {
    id: "e2",
    name: "Ananya Iyer",
    title: "Staff Engineer at Amazon",
    experience: "8+ Years Experience",
    interviewsTaken: "350+ Interviews Taken",
    badge: "Ex-Flipkart",
    rating: 4.8,
    reviews: 860,
    initials: "AI",
    color: "#ec4899",
  },
  {
    id: "e3",
    name: "Karan Mehta",
    title: "SDE-2 at Microsoft",
    experience: "4+ Years Experience",
    interviewsTaken: "210+ Interviews Taken",
    badge: "Ex-Adobe",
    rating: 4.7,
    reviews: 540,
    initials: "KM",
    color: "#06b6d4",
  },
];

const INITIAL_INTERVIEWS = [
  { id: "i1", expertId: "e1", role: "Java Developer", date: "2026-06-25", time: "11:00 AM" },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

/* ---------------- small reusable pieces ---------------- */

function Avatar({ initials, color, size = 44 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

function ExpertDropdown({ experts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = experts.find((e) => e.id === value);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="expert-dropdown">
      <button type="button" onClick={() => setOpen((o) => !o)} className="expert-trigger">
        {selected ? (
          <span className="expert-trigger-info">
            <Avatar initials={selected.initials} color={selected.color} size={36} />
            <span>
              <span className="expert-name">{selected.name}</span>
              <span className="expert-title">{selected.title}</span>
            </span>
          </span>
        ) : (
          <span className="expert-placeholder">Choose an expert</span>
        )}
        <ChevronDown size={18} className="chevron-icon" />
      </button>

      {open && (
        <div className="expert-dropdown-list">
          {experts.map((ex) => (
            <button
              type="button"
              key={ex.id}
              onClick={() => {
                onChange(ex.id);
                setOpen(false);
              }}
              className="expert-option"
            >
              <Avatar initials={ex.initials} color={ex.color} size={36} />
              <span>
                <span className="expert-name">{ex.name}</span>
                <span className="expert-title">{ex.title}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RescheduleModal({ interview, expert, onClose, onSave, onDelete }) {
  const [date, setDate] = useState(interview.date);
  const [time, setTime] = useState(interview.time);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{confirmingDelete ? "Delete interview?" : "Reschedule interview"}</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {confirmingDelete ? (
          <div>
            <p className="modal-text">
              This will permanently remove your {interview.role} mock interview with {expert.name} on{" "}
              {formatDate(interview.date)}. This can't be undone.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmingDelete(false)} className="btn btn-outline btn-flex">
                Cancel
              </button>
              <button onClick={() => onDelete(interview.id)} className="btn btn-danger btn-flex">
                Yes, delete
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="modal-expert-preview">
              <Avatar initials={expert.initials} color={expert.color} size={40} />
              <div>
                <p className="person-name">{expert.name}</p>
                <p className="person-role">{interview.role} Mock Interview</p>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">New date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="field-group field-group-lg">
              <label className="field-label">New time</label>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="field-input">
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={() => setConfirmingDelete(true)} className="btn btn-outline-danger">
                <Trash2 size={16} />
                Delete
              </button>
              <button onClick={() => onSave(interview.id, { date, time })} className="btn btn-primary btn-flex">
                Save changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Human Interview page ---------------- */

function HumanInterviewPage({ interviews, setInterviews }) {
  const [role, setRole] = useState("");
  const [expertId, setExpertId] = useState(EXPERTS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const selectedExpert = EXPERTS.find((e) => e.id === expertId) || EXPERTS[0];

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  function handleBook() {
    if (!role || !expertId || !date || !time) {
      setError("Please fill in role, expert, date and time before booking.");
      return;
    }
    setError("");
    const newInterview = { id: "i" + Date.now(), expertId, role, date, time };
    setInterviews((prev) => [newInterview, ...prev]);
    setDate("");
    setTime("");
    setSuccess(true);
  }

  function handleSaveReschedule(id, changes) {
    setInterviews((prev) => prev.map((iv) => (iv.id === id ? { ...iv, ...changes } : iv)));
    setEditingId(null);
  }

  function handleDelete(id) {
    setInterviews((prev) => prev.filter((iv) => iv.id !== id));
    setEditingId(null);
  }

  const editingInterview = interviews.find((iv) => iv.id === editingId);
  const editingExpert = editingInterview ? EXPERTS.find((e) => e.id === editingInterview.expertId) : null;

  return (
    <div className="interview-layout">
      <div className="interview-main">
        <h1 className="page-title">Book a 1:1 Mock Interview</h1>
        <p className="page-subtitle">Connect with industry experts and get real feedback.</p>

        <div className="booking-form">
          <div className="field-group">
            <label className="field-label">Select Role</label>
            <div className="select-wrapper">
              <select value={role} onChange={(e) => setRole(e.target.value)} className="field-input field-select">
                <option value="">Choose a role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="select-chevron" />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Select Expert</label>
            <ExpertDropdown experts={EXPERTS} value={expertId} onChange={setExpertId} />
          </div>

          <div className="field-row">
            <div className="field-col">
              <label className="field-label">Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
            </div>
            <div className="field-col">
              <label className="field-label">Time</label>
              <div className="select-wrapper">
                <select value={time} onChange={(e) => setTime(e.target.value)} className="field-input field-select">
                  <option value="">Select Time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="select-chevron" />
              </div>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button onClick={handleBook} className="btn btn-primary btn-self-start">
            <Calendar size={16} />
            Book Interview
          </button>

          {success && (
            <div className="form-success">
              <CheckCircle2 size={16} />
              Interview booked! Check it under Upcoming Interview below.
            </div>
          )}
        </div>

        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Interview{interviews.length !== 1 ? "s" : ""}</h2>
          {interviews.length === 0 ? (
            <p className="empty-text">No interviews booked yet. Fill the form above to schedule one.</p>
          ) : (
            <div className="interview-list">
              {interviews.map((iv) => {
                const ex = EXPERTS.find((e) => e.id === iv.expertId);
                if (!ex) return null;
                return (
                  <div key={iv.id} className="interview-row">
                    <div className="interview-person">
                      <Avatar initials={ex.initials} color={ex.color} size={40} />
                      <div>
                        <p className="person-name">{ex.name}</p>
                        <p className="person-role">{iv.role} Mock Interview</p>
                      </div>
                    </div>
                    <div className="interview-meta">
                      <Calendar size={15} />
                      {formatDate(iv.date)}
                    </div>
                    <div className="interview-meta">
                      <Clock size={15} />
                      {iv.time}
                    </div>
                    <div className="interview-meta interview-meta-meet">
                      <Video size={15} />
                      Google Meet
                    </div>
                    <button onClick={() => setEditingId(iv.id)} className="btn btn-outline btn-small reschedule-btn">
                      <Pencil size={13} />
                      Reschedule
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="about-expert-card">
        <h3 className="about-title">About Expert</h3>
        <div className="about-profile">
          <Avatar initials={selectedExpert.initials} color={selectedExpert.color} size={48} />
          <div>
            <p className="about-name">{selectedExpert.name}</p>
            <p className="about-role">{selectedExpert.title}</p>
          </div>
        </div>
        <ul className="about-list">
          <li className="about-list-item">
            <CheckCircle2 size={14} />
            {selectedExpert.experience}
          </li>
          <li className="about-list-item">
            <CheckCircle2 size={14} />
            {selectedExpert.interviewsTaken}
          </li>
          <li className="about-list-item">
            <CheckCircle2 size={14} />
            {selectedExpert.badge}
          </li>
        </ul>
        <div className="about-rating">
          <Star size={15} fill="#f59e0b" />
          {selectedExpert.rating} <span className="reviews-count">({selectedExpert.reviews} reviews)</span>
        </div>
      </div>

      {editingInterview && editingExpert && (
        <RescheduleModal
          interview={editingInterview}
          expert={editingExpert}
          onClose={() => setEditingId(null)}
          onSave={handleSaveReschedule}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* ---------------- app shell with sidebar navigation ---------------- */

export default function App() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f2fb", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <Sidebar />

      <div className="content-area">
        <div className="badge-wrapper">
          <span className="page-badge">{PAGE_BADGES.human}</span>
        </div>
        <HumanInterviewPage interviews={interviews} setInterviews={setInterviews} />
      </div>
    </div>
  );
}
