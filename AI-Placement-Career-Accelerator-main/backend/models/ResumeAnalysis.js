import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    atsScore: { type: Number, required: true },
    // Section scores out of 20 (matches ResumeAnalyzer.jsx score bars)
    scores: {
      keywords: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
    },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
