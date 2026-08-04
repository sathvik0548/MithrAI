import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api.js";
import Swal from "sweetalert2";

/**
 * CalendarReminderModal
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   defaultTitle: string
 *   defaultDescription: string
 */
export default function CalendarReminderModal({ isOpen, onClose, defaultTitle = "", defaultDescription = "" }) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [dateTime, setDateTime] = useState("");
  const [minutesBefore, setMinutesBefore] = useState(30);
  const [loading, setLoading] = useState(false);

  const REMINDER_OPTIONS = [
    { label: "5 minutes before", value: 5 },
    { label: "15 minutes before", value: 15 },
    { label: "30 minutes before", value: 30 },
    { label: "1 hour before", value: 60 },
    { label: "1 day before", value: 1440 },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !dateTime) {
      Swal.fire({ title: "Missing fields", text: "Please fill in the event title and date/time.", icon: "warning", background: "#0e0c1e", color: "#e2e0ff", confirmButtonColor: "#6c63ff" });
      return;
    }

    setLoading(true);
    try {
      await API.post("/calendar/reminder", {
        title: title.trim(),
        description: description.trim(),
        dateTimeISO: new Date(dateTime).toISOString(),
        minutesBefore,
      });

      onClose();
      Swal.fire({
        title: "Reminder set! 📅",
        text: `A Google Calendar event has been created with a ${minutesBefore < 60 ? `${minutesBefore}-minute` : minutesBefore === 60 ? "1-hour" : "1-day"} reminder.`,
        icon: "success",
        background: "#0e0c1e",
        color: "#e2e0ff",
        confirmButtonColor: "#6c63ff",
      });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.code === "CALENDAR_NO_ACCESS") {
        onClose();
        Swal.fire({
          title: "Calendar access needed",
          text: "Sign in with Google and grant Calendar permissions so MithrAI can create reminders for you.",
          icon: "info",
          background: "#0e0c1e",
          color: "#e2e0ff",
          confirmButtonColor: "#6c63ff",
          confirmButtonText: "Got it",
        });
      } else {
        Swal.fire({
          title: "Couldn't create reminder",
          text: data?.message || "Something went wrong. Please try again.",
          icon: "error",
          background: "#0e0c1e",
          color: "#e2e0ff",
          confirmButtonColor: "#6c63ff",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1001,
              width: "100%",
              maxWidth: 460,
              padding: "0 16px",
            }}
          >
            <div style={{
              background: "#0e0c1e",
              border: "1px solid rgba(108,99,255,0.25)",
              borderRadius: 18,
              padding: "32px 28px",
              fontFamily: "Inter, system-ui, sans-serif",
              color: "#e2e0ff",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 22 }}>📅</span>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Set Calendar Reminder</h2>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(226,224,255,0.45)" }}>Creates an event in your Google Calendar.</p>
                </div>
                <button
                  onClick={onClose}
                  style={{ background: "none", border: "none", color: "rgba(226,224,255,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Title */}
                <div className="cr-field">
                  <label>Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Mock Interview — React"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="cr-field">
                  <label>Description <span style={{ color: "rgba(226,224,255,0.3)", fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    rows={2}
                    placeholder="Additional notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Date & Time */}
                <div className="cr-field">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Reminder offset */}
                <div className="cr-field">
                  <label>Remind me</label>
                  <select value={minutesBefore} onChange={(e) => setMinutesBefore(Number(e.target.value))}>
                    {REMINDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={onClose} style={{
                    flex: 1, padding: "12px", background: "rgba(108,99,255,0.08)",
                    border: "1px solid rgba(108,99,255,0.2)", borderRadius: 10, color: "#e2e0ff",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                  }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{
                    flex: 2, padding: "12px",
                    background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg, #6c63ff, #a855f7)",
                    border: "none", borderRadius: 10, color: "#fff",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {loading ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating…</> : "📅 Add to Calendar"}
                  </button>
                </div>
              </form>
            </div>

            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              @keyframes spin { to { transform: rotate(360deg); } }
              .cr-field { display: flex; flex-direction: column; gap: 6px; }
              .cr-field label { font-size: 13px; font-weight: 500; color: rgba(226,224,255,0.8); }
              .cr-field input, .cr-field textarea, .cr-field select {
                width: 100%; padding: 10px 13px;
                background: rgba(108,99,255,0.06);
                border: 1.5px solid rgba(108,99,255,0.2);
                border-radius: 10px; font-size: 14px;
                color: #e2e0ff; font-family: inherit; outline: none;
                transition: border-color 0.2s;
              }
              .cr-field input::placeholder, .cr-field textarea::placeholder { color: rgba(226,224,255,0.25); }
              .cr-field input:focus, .cr-field textarea:focus, .cr-field select:focus { border-color: #6c63ff; }
              .cr-field select { cursor: pointer; }
              .cr-field select option { background: #1a1830; }
              .cr-field input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
