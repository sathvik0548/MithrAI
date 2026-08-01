import { Router } from "express";
import Roadmap from "../models/Roadmap.js";
import Activity from "../models/Activity.js";
import { protect } from "../middleware/auth.js";
import { generateRoadmap } from "../services/claude.js";

const router = Router();

// POST /api/roadmap/generate  { goal }
router.post("/generate", protect, async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ message: "goal is required" });

    const { phases } = await generateRoadmap({
      goal,
      currentSkills: req.user.skills,
    });

    // One roadmap per goal per user — regenerate replaces it
    const roadmap = await Roadmap.findOneAndUpdate(
      { user: req.user._id, goal },
      {
        user: req.user._id,
        goal,
        phases: phases.map((p) => ({
          title: p.title,
          duration: p.duration,
          topics: p.topics.map((name) => ({ name, done: false })),
        })),
      },
      { upsert: true, new: true }
    );

    await Activity.create({
      user: req.user._id,
      type: "roadmap",
      label: "Roadmap Generated",
      sub: goal,
    });

    res.status(201).json(roadmap);
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmap  — all roadmaps for the user
router.get("/", protect, async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort(
      "-updatedAt"
    );
    res.json(roadmaps);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/roadmap/:id/topic  { phaseIndex, topicIndex, done }
router.patch("/:id/topic", protect, async (req, res, next) => {
  try {
    const { phaseIndex, topicIndex, done } = req.body;
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    const topic = roadmap.phases[phaseIndex]?.topics[topicIndex];
    if (!topic) {
      return res.status(400).json({ message: "Invalid phase/topic index" });
    }
    topic.done = Boolean(done);
    roadmap.markModified("phases");
    await roadmap.save();

    res.json(roadmap);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/roadmap/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const deleted = await Roadmap.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Roadmap not found" });
    res.json({ message: "Roadmap deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
