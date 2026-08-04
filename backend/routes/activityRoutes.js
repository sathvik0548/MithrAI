import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/activity
router.get("/", protect, async (req, res, next) => {
  try {
    const { data: activities, error } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return res.status(500).json({ message: error.message });

    res.json(
      (activities || []).map((a) => ({
        id: a.id,
        type: a.type,
        label: a.label,
        sub: a.sub,
        createdAt: a.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
