import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const phaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, default: "" }, // e.g. "2 weeks"
    topics: { type: [topicSchema], default: [] },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: String, required: true }, // e.g. "Backend Developer"
    phases: { type: [phaseSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);
