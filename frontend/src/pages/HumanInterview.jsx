import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { Calendar, Video, Star, ChevronDown, Trash2, X, CheckCircle2, Clock, HelpCircle, ShieldCheck } from "lucide-react";
import CalendarReminderModal from "../components/CalendarReminderModal.jsx";
import API from "../services/api.js";
import Swal from "sweetalert2";
import "../styles/HumanInterview.css";

/* ── Terracotta & Cream Palette Tokens ──────────────────────────────────── */
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
  error:        "#C1392B",
  serif:        "'Fraunces', Georgia, serif",
  sans:         "'Inter', system-ui, sans-serif",
};

const ROLES = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer",
  "Java Developer", "Data Analyst", "Product Manager",
  "DevOps Engineer", "Machine Learning Engineer",
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

const EXPERTS = [
  {
    id: "e1",
    name: "Rohit Sharma",
    title: "Senior Staff SDE at Google",
    roles: ["Java Developer", "Backend Developer", "Full Stack Developer"],
    experience: "8+ Years Experience",
    interviewsTaken: "520+ Interviews Taken",
    badge: "Ex-Microsoft",
    rating: 4.9,
    reviews: 1120,
    initials: "RS",
    color: "#B4563E",
  },
  {
    id: "e2",
    name: "Ananya Iyer",
    title: "Staff Frontend Architect at Amazon",
    roles: ["Frontend Developer", "Full Stack Developer"],
    experience: "9+ Years Experience",
    interviewsTaken: "410+ Interviews Taken",
    badge: "Ex-Flipkart",
    rating: 4.9,
    reviews: 890,
    initials: "AI",
    color: "#E2A377",
  },
  {
    id: "e3",
    name: "Karan Mehta",
    title: "Lead Data Scientist & Analyst at Microsoft",
    roles: ["Data Analyst", "Machine Learning Engineer"],
    experience: "6+ Years Experience",
    interviewsTaken: "310+ Interviews Taken",
    badge: "Ex-Adobe",
    rating: 4.8,
    reviews: 640,
    initials: "KM",
    color: "#2D9E6B",
  },
  {
    id: "e4",
    name: "Pooja Deshmukh",
    title: "Group Product Manager at Swiggy",
    roles: ["Product Manager"],
    experience: "7+ Years Experience",
    interviewsTaken: "280+ Interviews Taken",
    badge: "Ex-Uber",
    rating: 4.9,
    reviews: 430,
    initials: "PD",
    color: "#C87B2E",
  },
  {
    id: "e5",
    name: "Vikram Sengupta",
    title: "Principal DevOps Lead at Razorpay",
    roles: ["DevOps Engineer", "Backend Developer"],
    experience: "10+ Years Experience",
    interviewsTaken: "490+ Interviews Taken",
    badge: "Ex-AWS",
    rating: 4.9,
    reviews: 770,
    initials: "VS",
    color: "#923F2B",
  },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function Avatar({ initials, color, size = 44 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function ExpertDropdown({ experts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = experts.find((e) => e.id === value) || experts[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
            <button type="button" key={ex.id} onClick={() => { onChange(ex.id); setOpen(false); }} className="expert-option">
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

function RescheduleModal({ interview, expert, onClose, onDelete, loading }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">{confirmingDelete ? "Cancel booking?" : "Booking Details"}</h3>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>
        {confirmingDelete ? (
          <div>
            <p className="modal-text">
              This will cancel your {interview.role} mock interview session with {expert.name} on {formatDate(interview.date)}.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmingDelete(false)} className="btn btn-outline btn-flex">Keep it</button>
              <button onClick={() => onDelete(interview.id || interview._id)} disabled={loading} className="btn btn-danger btn-flex">
                {loading ? "Cancelling…" : "Yes, cancel"}
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
            <div style={{ marginTop: 14, fontSize: 13.5, color: C.text, fontFamily: C.sans }}>
              <p style={{ margin: "0 0 6px" }}>📅 {formatDate(interview.date)} at {interview.time}</p>
              <p style={{ margin: 0, color: C.muted }}>📹 Session via Google Meet</p>
            </div>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button onClick={() => setConfirmingDelete(true)} className="btn btn-outline-danger">
                <Trash2 size={16} /> Cancel Booking
              </button>
              <button onClick={onClose} className="btn btn-primary btn-flex">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HumanInterview() {
  const [role, setRole] = useState("Full Stack Developer");
  const [expertId, setExpertId] = useState("e1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDefaults, setCalendarDefaults] = useState({ title: "", description: "" });

  // Filter experts by selected role dynamically
  const availableExperts = role
    ? EXPERTS.filter((e) => e.roles.includes(role))
    : EXPERTS;

  // Auto-sync expert selection when role changes
  useEffect(() => {
    if (availableExperts.length > 0) {
      const match = availableExperts.find((e) => e.id === expertId);
      if (!match) {
        setExpertId(availableExperts[0].id);
      }
    }
  }, [role]);

  // Selected expert object for right panel (always reflects current expertId)
  const selectedExpert = EXPERTS.find((e) => e.id === expertId) || availableExperts[0] || EXPERTS[0];

  const isFormValid = Boolean(role && expertId && date && time);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem("mithrai_human_bookings") || "[]");
      setBookings(stored);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  async function handleBook() {
    if (!isFormValid) {
      setFieldError("Please select a role, expert, date and time.");
      return;
    }
    setFieldError("");
    setBookingLoading(true);
    try {
      const newBooking = {
        id: `h-booking-${Date.now()}`,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        role,
        date,
        time,
        createdAt: new Date().toISOString(),
      };

      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem("mithrai_human_bookings", JSON.stringify(updated));

      setDate("");
      setTime("");

      setCalendarDefaults({
        title: `1:1 Interview: ${role} with ${selectedExpert.name}`,
        description: `1-on-1 human mock interview session on Google Meet — ${role}`,
      });
      setCalendarOpen(true);
    } catch (err) {
      Swal.fire({
        title: "Booking failed",
        text: "Something went wrong. Please try again.",
        icon: "error",
        background: "#fff",
        confirmButtonColor: C.primary,
      });
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancelLoading(true);
    try {
      const updated = bookings.filter((b) => (b.id || b._id) !== id);
      setBookings(updated);
      localStorage.setItem("mithrai_human_bookings", JSON.stringify(updated));
      setEditingId(null);
    } catch (err) {
      Swal.fire({
        title: "Couldn't cancel",
        text: "Please try again.",
        icon: "error",
        background: "#fff",
        confirmButtonColor: C.primary,
      });
    } finally {
      setCancelLoading(false);
    }
  }

  const editingBooking = bookings.find((b) => (b.id || b._id) === editingId);
  const editingExpert = editingBooking ? EXPERTS.find((e) => e.id === editingBooking.expertId) || { name: editingBooking.expertName, initials: "?", color: C.primary } : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <Sidebar />
      <div className="content-area">
        
        <div className="interview-layout">
          {/* Main Booking Panel */}
          <div className="interview-main">
            <h1 className="page-title">Book a 1:1 Mock Interview</h1>
            <p className="page-subtitle">Connect with seasoned industry practitioners for real-time interview coaching.</p>

            <div className="booking-form">
              <div className="field-group">
                <label className="field-label">Select Role</label>
                <div className="select-wrapper">
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="field-input field-select">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={18} className="select-chevron" />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Select Expert ({availableExperts.length} available)</label>
                <ExpertDropdown experts={availableExperts} value={expertId} onChange={setExpertId} />
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label className="field-label">Select Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="field-col">
                  <label className="field-label">Select Time</label>
                  <div className="select-wrapper">
                    <select value={time} onChange={(e) => setTime(e.target.value)} className="field-input field-select">
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={18} className="select-chevron" />
                  </div>
                </div>
              </div>

              {fieldError && <p className="form-error">{fieldError}</p>}

              {/* Book Button — disabled state with tooltip styling */}
              <button
                onClick={handleBook}
                disabled={!isFormValid || bookingLoading}
                className={`btn btn-primary btn-self-start ${!isFormValid ? "btn-disabled" : ""}`}
              >
                {bookingLoading ? "Booking…" : <><Calendar size={16} /> Book Interview</>}
              </button>
            </div>

            {/* Upcoming Interviews Section */}
            <div className="upcoming-section">
              <h2 className="section-title">Upcoming Interviews</h2>
              {loading ? (
                <p className="empty-text">Loading your bookings…</p>
              ) : bookings.length === 0 ? (
                /* Styled Vector Empty State */
                <div className="upcoming-empty-card">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 12px" }}>
                    <rect width="64" height="64" rx="32" fill={C.primaryLight} />
                    <path d="M22 26H42M22 34H36M26 18V22M38 18V22M20 22H44C45.1046 22 46 22.8954 46 24V44C46 45.1046 45.1046 46 44 46H20C18.8954 46 18 45.1046 18 44V24C18 22.8954 18.8954 22 20 22Z" stroke={C.primary} strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  <p className="empty-title">No upcoming interviews scheduled</p>
                  <p className="empty-desc">Choose a role and time slot above to reserve your 1-on-1 coaching session.</p>
                </div>
              ) : (
                <div className="interview-list">
                  {bookings.map((b) => {
                    const ex = EXPERTS.find((e) => e.id === b.expertId) || { name: b.expertName || "Expert", initials: "?", color: C.primary };
                    return (
                      <div key={b.id || b._id} className="interview-row">
                        <div className="interview-person">
                          <Avatar initials={ex.initials} color={ex.color} size={40} />
                          <div>
                            <p className="person-name">{ex.name}</p>
                            <p className="person-role">{b.role} Mock Interview</p>
                          </div>
                        </div>
                        <div className="interview-meta"><Calendar size={15} />{formatDate(b.date)}</div>
                        <div className="interview-meta"><Clock size={15} />{b.time}</div>
                        <div className="interview-meta interview-meta-meet"><Video size={15} />Google Meet</div>
                        <button onClick={() => setEditingId(b.id || b._id)} className="btn btn-outline btn-small reschedule-btn">
                          Manage
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Expert Card & 3-Step Strip */}
          <div className="right-column">
            
            {/* Dynamic Expert Card */}
            <div className="about-expert-card">
              <h3 className="about-title">Selected Expert</h3>
              <div className="about-profile">
                <Avatar initials={selectedExpert.initials} color={selectedExpert.color} size={48} />
                <div>
                  <p className="about-name">{selectedExpert.name}</p>
                  <p className="about-role">{selectedExpert.title}</p>
                </div>
              </div>
              <ul className="about-list">
                <li className="about-list-item"><CheckCircle2 size={14} />{selectedExpert.experience}</li>
                <li className="about-list-item"><CheckCircle2 size={14} />{selectedExpert.interviewsTaken}</li>
                <li className="about-list-item"><CheckCircle2 size={14} />{selectedExpert.badge}</li>
              </ul>
              <div className="about-rating">
                <Star size={15} fill="#f59e0b" />
                {selectedExpert.rating} <span className="reviews-count">({selectedExpert.reviews} reviews)</span>
              </div>
            </div>

            {/* How Booking Works 3-Step Strip */}
            <div className="how-works-card">
              <h4 className="how-works-title">How 1:1 Coaching Works</h4>
              <div className="how-steps">
                <div className="how-step">
                  <div className="how-step-num">1</div>
                  <div>
                    <div className="how-step-heading">Choose Role & Expert</div>
                    <div className="how-step-text">Pick your target domain and an experienced industry coach.</div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-num">2</div>
                  <div>
                    <div className="how-step-heading">Select Date & Time</div>
                    <div className="how-step-text">Choose a slot that fits smoothly into your schedule.</div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-num">3</div>
                  <div>
                    <div className="how-step-heading">Get Meet Invite</div>
                    <div className="how-step-text">Receive an instant 1-on-1 Google Meet calendar link.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {editingBooking && editingExpert && (
          <RescheduleModal
            interview={editingBooking}
            expert={editingExpert}
            onClose={() => setEditingId(null)}
            onDelete={handleCancel}
            loading={cancelLoading}
          />
        )}

        <CalendarReminderModal
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          defaultTitle={calendarDefaults.title}
          defaultDescription={calendarDefaults.description}
        />
      </div>
    </div>
  );
}
