import { Router } from "express";
import multer from "multer";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";
import { analyzeResume } from "../services/claude.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are allowed"));
  },
});

// POST /api/resume/analyze
router.post(
  "/analyze",
  protect,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const targetRole = req.body.targetRole || req.user.targetRole || "";
      let pdfBase64, resumeText;

      if (req.file) {
        pdfBase64 = req.file.buffer.toString("base64");
      } else if (req.body.resumeText) {
        resumeText = req.body.resumeText;
      } else {
        return res
          .status(400)
          .json({ message: "Upload a PDF file or provide resumeText" });
      }

      const result = await analyzeResume({ pdfBase64, resumeText, targetRole });

      const { data: analysis, error: insertError } = await supabaseAdmin
        .from("resume_analyses")
        .insert({
          user_id: req.user.id,
          file_name: req.file?.originalname || "Uploaded Resume",
          target_role: targetRole,
          ats_score: result.atsScore || 0,
          scores: result.scores || {},
          strengths: result.strengths || [],
          improvements: result.improvements || [],
          missing_keywords: result.missingKeywords || [],
          summary: result.summary || "",
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({ message: insertError.message });
      }

      await supabaseAdmin.from("activities").insert({
        user_id: req.user.id,
        type: "resume",
        label: "Resume Analyzed",
        sub: `ATS score: ${result.atsScore}/100`,
      });

      // Format for frontend
      res.json({
        id: analysis.id,
        _id: analysis.id,
        fileName: analysis.file_name,
        targetRole: analysis.target_role,
        atsScore: analysis.ats_score,
        scores: analysis.scores,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        missingKeywords: analysis.missing_keywords,
        summary: analysis.summary,
        createdAt: analysis.created_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/resume/history
router.get("/history", protect, async (req, res, next) => {
  try {
    const { data: analyses, error } = await supabaseAdmin
      .from("resume_analyses")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const formatted = (analyses || []).map((a) => ({
      id: a.id,
      _id: a.id,
      fileName: a.file_name,
      targetRole: a.target_role,
      atsScore: a.ats_score,
      scores: a.scores,
      strengths: a.strengths,
      improvements: a.improvements,
      missingKeywords: a.missing_keywords,
      summary: a.summary,
      createdAt: a.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
