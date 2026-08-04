import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { Calendar, Video, Star, ChevronDown, Pencil, Trash2, X, CheckCircle2, Clock } from "lucide-react";
import CalendarReminderModal from "../components/CalendarReminderModal.jsx";
import API from "../services/api.js";
import Swal from "sweetalert2";
import "../styles/HumanInterview.css";

const ROLES = [
  "Java Developer", "Frontend Developer", "Backend Developer",
  "Data Analyst", "Product Manager", "DevOps Engineer",
  "Full Stack Developer", "Machine Learning Engineer",
];

const TIME_SLOTS = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "02:00 PM","03:00 PM","04:00 PM","05:00 PM",
];

const EXPERTS = [
  {
    id: "e1", name: "Rohit Sharma", title: "SDE at Google",
    experience: "6+ Years Experience", interviewsTaken: "500+ Interviews Taken",
    badge: "Ex-Microsoft", rating: 4.9, reviews: 1120, initials: "RS", color: "#7c5cff",
  },
  {
    id: "e2", name: "Ananya Iyer", title: "Staff Engineer at Amazon",
    experience: "8+ Years Experience", interviewsTaken: "350+ Interviews Taken",
    badge: "Ex-Flipkart", rating: 4.8, reviews: 860, initials: "AI", color: "#ec4899",
  },
  {
    id: "e3", name: "Karan Mehta", title: "SDE-2 at Microsoft",
    experience: "4+ Years Experience", interviewsTaken: "210+ Interviews Taken",
    badge: "Ex-Adobe", rating: 4.7, reviews: 540, initials: "KM", color: "#06b6d4",
  },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" });
}

function Avatar({ initials, color, size = 44 }) {
  return (
    <div className="avatar" style={{ width:size, height:size, background:color, fontSize:size*0.36 }}>
      {initials}
    </div>
  );
}

function ExpertDropdown({ experts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = experts.find(e => e.id === value);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="expert-dropdown">
      <button type="button" onClick={() => setOpen(o => !o)} className="expert-trigger">
        {selected ? (
          <span className="expert-trigger-info">
            <Avatar initials={selected.initials} color={selected.color} size={36}/>
            <span>
              <span className="expert-name">{selected.name}</span>
              <span className="expert-title">{selected.title}</span>
            </span>
          </span>
        ) : (
          <span className="expert-placeholder">Choose an expert</span>
        )}
        <ChevronDown size={18} className="chevron-icon"/>
      </button>
      {open && (
        <div className="expert-dropdown-list">
          {experts.map(ex => (
            <button type="button" key={ex.id} onClick={() => { onChange(ex.id); setOpen(false); }} className="expert-option">
              <Avatar initials={ex.initials} color={ex.color} size={36}/>
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
          <button onClick={onClose} className="modal-close"><X size={20}/></button>
        </div>
        {confirmingDelete ? (
          <div>
            <p className="modal-text">
              This will cancel your {interview.role} mock interview with {expert.name} on {formatDate(interview.date)}.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmingDelete(false)} className="btn btn-outline btn-flex">Keep it</button>
              <button onClick={() => onDelete(interview.id)} disabled={loading} className="btn btn-danger btn-flex">
                {loading ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="modal-expert-preview">
              <Avatar initials={expert.initials} color={expert.color} size={40}/>
              <div>
                <p className="person-name">{expert.name}</p>
                <p className="person-role">{interview.role} Mock Interview</p>
              </div>
            </div>
            <div style={{ marginTop:14, fontSize:13.5, color:"#3d3a55" }}>
              <p style={{ margin:"0 0 6px" }}>📅 {formatDate(interview.date)} at {interview.time}</p>
              <p style={{ margin:0, color:"#7a7f95" }}>📹 Session will be on Google Meet</p>
            </div>
            <div className="modal-actions" style={{ marginTop:20 }}>
              <button onClick={() => setConfirmingDelete(true)} className="btn btn-outline-danger">
                <Trash2 size={16}/> Cancel Booking
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
  const [role, setRole] = useState("");
  const [expertId, setExpertId] = useState(EXPERTS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDefaults, setCalendarDefaults] = useState({ title:"", description:"" });

  const selectedExpert = EXPERTS.find(e => e.id === expertId) || EXPERTS[0];

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/bookings");
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  async function handleBook() {
    if (!role || !expertId || !date || !time) {
      setFieldError("Please fill in role, expert, date and time.");
      return;
    }
    setFieldError("");
    setBookingLoading(true);
    try {
      const expert = EXPERTS.find(e => e.id === expertId);
      const { data } = await API.post("/bookings", {
        expertId,
        expertName: expert?.name || "",
        role,
        date,
        time,
      });
      setBookings(prev => [data, ...prev]);
      setDate(""); setTime(""); setRole("");

      // Offer calendar reminder
      setCalendarDefaults({
        title: `Mock Interview: ${role} with ${expert?.name}`,
        description: `1:1 human mock interview session on Google Meet — ${role}`,
      });
      setCalendarOpen(true);
    } catch (err) {
      Swal.fire({
        title: "Booking failed",
        text: err?.response?.data?.message || "Something went wrong. Please try again.",
        icon: "error",
        background: "#fff",
        confirmButtonColor: "#B4563E",
      });
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancelLoading(true);
    try {
      await API.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => (b.id||b._id) !== id));
      setEditingId(null);
    } catch (err) {
      Swal.fire({
        title: "Couldn't cancel",
        text: err?.response?.data?.message || "Please try again.",
        icon: "error",
        background: "#fff",
        confirmButtonColor: "#B4563E",
      });
    } finally {
      setCancelLoading(false);
    }
  }

  const editingBooking = bookings.find(b => (b.id||b._id) === editingId);
  const editingExpert = editingBooking ? EXPERTS.find(e => e.id === editingBooking.expertId) || { name: editingBooking.expertName, initials: "?", color:"#aaa" } : null;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#FDF6EC", fontFamily:"Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <Sidebar/>
      <div className="content-area">
        <div className="interview-layout">
          <div className="interview-main">
            <h1 className="page-title">Book a 1:1 Mock Interview</h1>
            <p className="page-subtitle">Connect with industry experts and get real feedback on your interview skills.</p>

            <div className="booking-form">
              <div className="field-group">
                <label className="field-label">Select Role</label>
                <div className="select-wrapper">
                  <select value={role} onChange={e => setRole(e.target.value)} className="field-input field-select">
                    <option value="">Choose a role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={18} className="select-chevron"/>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Select Expert</label>
                <ExpertDropdown experts={EXPERTS} value={expertId} onChange={setExpertId}/>
              </div>

              <div className="field-row">
                <div className="field-col">
                  <label className="field-label">Select Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="field-input" min={new Date().toISOString().split("T")[0]}/>
                </div>
                <div className="field-col">
                  <label className="field-label">Time</label>
                  <div className="select-wrapper">
                    <select value={time} onChange={e => setTime(e.target.value)} className="field-input field-select">
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={18} className="select-chevron"/>
                  </div>
                </div>
              </div>

              {fieldError && <p className="form-error">{fieldError}</p>}

              <button onClick={handleBook} disabled={bookingLoading} className="btn btn-primary btn-self-start">
                {bookingLoading ? "Booking…" : <><Calendar size={16}/> Book Interview</>}
              </button>
            </div>

            <div className="upcoming-section">
              <h2 className="section-title">Upcoming Interview{bookings.length !== 1 ? "s" : ""}</h2>
              {loading ? (
                <p className="empty-text">Loading your bookings…</p>
              ) : bookings.length === 0 ? (
                <p className="empty-text">No interviews booked yet. Fill the form above to schedule one.</p>
              ) : (
                <div className="interview-list">
                  {bookings.map(b => {
                    const ex = EXPERTS.find(e => e.id === b.expertId) || { name: b.expertName||"Expert", initials:"?", color:"#aaa" };
                    return (
                      <div key={b.id||b._id} className="interview-row">
                        <div className="interview-person">
                          <Avatar initials={ex.initials} color={ex.color} size={40}/>
                          <div>
                            <p className="person-name">{ex.name}</p>
                            <p className="person-role">{b.role} Mock Interview</p>
                          </div>
                        </div>
                        <div className="interview-meta"><Calendar size={15}/>{formatDate(b.date)}</div>
                        <div className="interview-meta"><Clock size={15}/>{b.time}</div>
                        <div className="interview-meta interview-meta-meet"><Video size={15}/>Google Meet</div>
                        <button onClick={() => setEditingId(b.id||b._id)} className="btn btn-outline btn-small reschedule-btn">
                          <Pencil size={13}/> Manage
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Expert profile card */}
          <div className="about-expert-card">
            <h3 className="about-title">About Expert</h3>
            <div className="about-profile">
              <Avatar initials={selectedExpert.initials} color={selectedExpert.color} size={48}/>
              <div>
                <p className="about-name">{selectedExpert.name}</p>
                <p className="about-role">{selectedExpert.title}</p>
              </div>
            </div>
            <ul className="about-list">
              <li className="about-list-item"><CheckCircle2 size={14}/>{selectedExpert.experience}</li>
              <li className="about-list-item"><CheckCircle2 size={14}/>{selectedExpert.interviewsTaken}</li>
              <li className="about-list-item"><CheckCircle2 size={14}/>{selectedExpert.badge}</li>
            </ul>
            <div className="about-rating">
              <Star size={15} fill="#f59e0b"/>
              {selectedExpert.rating} <span className="reviews-count">({selectedExpert.reviews} reviews)</span>
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
