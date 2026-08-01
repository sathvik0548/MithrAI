import { Router } from "express";
import InterviewSession from "../models/InterviewSession.js";
import Activity from "../models/Activity.js";
import { protect } from "../middleware/auth.js";
import {
  generateQuestions,
  gradeAnswer,
  gradeInterview,
} from "../services/claude.js";

const router = Router();

// POST /api/interview/start  { role, difficulty, count? }
router.post("/start", protect, async (req, res, next) => {
  try {
    const { role, difficulty = "Medium", count = 5 } = req.body;
    if (!role) return res.status(400).json({ message: "role is required" });

    const { questions } = await generateQuestions({ role, difficulty, count });

    const session = await InterviewSession.create({
      user: req.user._id,
      role,
      difficulty,
      questions,
    });

    res.status(201).json({
      sessionId: session._id,
      role,
      difficulty,
      questions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/:id/answer  { questionIndex, answer }
router.post("/:id/answer", protect, async (req, res, next) => {
  try {
    const { questionIndex, answer } = req.body;
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }
    const question = session.questions[questionIndex];
    if (question === undefined) {
      return res.status(400).json({ message: "Invalid questionIndex" });
    }

    const { score, feedback } = await gradeAnswer({
      role: session.role,
      question,
      answer,
    });

    session.answers[questionIndex] = { question, answer, score, feedback };
    session.markModified("answers");
    await session.save();

    res.json({ score, feedback });
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/:id/finish
router.post("/:id/finish", protect, async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { overallScore, overallFeedback } = await gradeInterview({
      role: session.role,
      difficulty: session.difficulty,
      answers: session.answers,
    });

    session.overallScore = overallScore;
    session.overallFeedback = overallFeedback;
    session.status = "completed";
    await session.save();

    await Activity.create({
      user: req.user._id,
      type: "interview",
      label: "AI Mock Interview",
      sub: `${session.role} — ${overallScore}%`,
    });

    res.json(session);
  } catch (err) {
    next(err);
  }
});

// GET /api/interview/history
router.get("/history", protect, async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(20);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

export default router;
