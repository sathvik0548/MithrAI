import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    score: Number, // 0-10
    feedback: String,
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true }, // e.g. "Java Developer"
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    questions: { type: [String], default: [] },
    answers: { type: [answerSchema], default: [] },
    overallScore: { type: Number, default: 0 }, // 0-100
    overallFeedback: { type: String, default: "" },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
