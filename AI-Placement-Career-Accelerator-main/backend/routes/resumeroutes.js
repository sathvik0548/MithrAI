import { Router } from "express";
import multer from "multer";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import Activity from "../models/Activity.js";
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
// multipart/form-data: file=<pdf>, targetRole=<string>
// OR JSON: { resumeText, targetRole }
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

      const analysis = await ResumeAnalysis.create({
        user: req.user._id,
        fileName: req.file?.originalname || "",
        targetRole,
        ...result,
      });

      await Activity.create({
        user: req.user._id,
        type: "resume",
        label: "Resume Analyzed",
        sub: `ATS score: ${result.atsScore}/100`,
      });

      res.json(analysis);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/resume/history
router.get("/history", protect, async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(20);
    res.json(analyses);
  } catch (err) {
    next(err);
  }
});

export default router;
