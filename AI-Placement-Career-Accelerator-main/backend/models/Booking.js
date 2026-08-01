import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expertId: { type: String, required: true }, // matches HumanInterview.jsx expert list ids (e1, e2, ...)
    expertName: { type: String, default: "" },
    role: { type: String, required: true }, // e.g. "Java Developer"
    date: { type: String, required: true }, // "2026-06-25"
    time: { type: String, required: true }, // "11:00 AM"
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
