import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";
import {
  generateQuestions,
  gradeAnswer,
  gradeInterview,
} from "../services/claude.js";

const router = Router();

// POST /api/interview/start
router.post("/start", protect, async (req, res, next) => {
  try {
    const { role, difficulty = "Medium", count = 5 } = req.body;
    if (!role) return res.status(400).json({ message: "role is required" });

    const { questions } = await generateQuestions({ role, difficulty, count });

    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .insert({
        user_id: req.user.id,
        role,
        difficulty,
        questions,
        answers: [],
        status: "in_progress",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({
      sessionId: session.id,
      _id: session.id,
      role,
      difficulty,
      questions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/:id/answer
router.post("/:id/answer", protect, async (req, res, next) => {
  try {
    const { questionIndex, answer } = req.body;

    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

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

    const currentAnswers = session.answers || [];
    currentAnswers[questionIndex] = { question, answer, score, feedback };

    const { error: updateError } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        answers: currentAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    res.json({ score, feedback });
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/:id/finish
router.post("/:id/finish", protect, async (req, res, next) => {
  try {
    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const { overallScore, overallFeedback } = await gradeInterview({
      role: session.role,
      difficulty: session.difficulty,
      answers: session.answers || [],
    });

    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        overall_score: overallScore,
        overall_feedback: overallFeedback,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    await supabaseAdmin.from("activities").insert({
      user_id: req.user.id,
      type: "interview",
      label: "AI Mock Interview",
      sub: `${session.role} — ${overallScore}%`,
    });

    res.json({
      id: updatedSession.id,
      _id: updatedSession.id,
      role: updatedSession.role,
      difficulty: updatedSession.difficulty,
      questions: updatedSession.questions,
      answers: updatedSession.answers,
      overallScore: updatedSession.overall_score,
      overallFeedback: updatedSession.overall_feedback,
      status: updatedSession.status,
      createdAt: updatedSession.created_at,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/interview/history
router.get("/history", protect, async (req, res, next) => {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const formatted = (sessions || []).map((s) => ({
      id: s.id,
      _id: s.id,
      role: s.role,
      difficulty: s.difficulty,
      questions: s.questions,
      answers: s.answers,
      overallScore: s.overall_score,
      overallFeedback: s.overall_feedback,
      status: s.status,
      createdAt: s.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
