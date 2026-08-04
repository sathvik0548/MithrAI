import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";
import { generateRoadmap } from "../services/claude.js";

const router = Router();

// POST /api/roadmap/generate
router.post("/generate", protect, async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ message: "goal is required" });

    const { phases } = await generateRoadmap({
      goal,
      currentSkills: req.user.skills || [],
    });

    const formattedPhases = phases.map((p) => ({
      title: p.title,
      duration: p.duration,
      topics: p.topics.map((name) => ({ name, done: false })),
    }));

    // Check if roadmap for goal exists for user
    const { data: existing } = await supabaseAdmin
      .from("roadmaps")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("goal", goal)
      .single();

    let roadmap;
    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from("roadmaps")
        .update({
          phases: formattedPhases,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return res.status(500).json({ message: error.message });
      roadmap = updated;
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("roadmaps")
        .insert({
          user_id: req.user.id,
          goal,
          phases: formattedPhases,
        })
        .select()
        .single();
      if (error) return res.status(500).json({ message: error.message });
      roadmap = inserted;
    }

    await supabaseAdmin.from("activities").insert({
      user_id: req.user.id,
      type: "roadmap",
      label: "Roadmap Generated",
      sub: goal,
    });

    res.status(201).json({
      id: roadmap.id,
      _id: roadmap.id,
      goal: roadmap.goal,
      phases: roadmap.phases,
      createdAt: roadmap.created_at,
      updatedAt: roadmap.updated_at,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmap
router.get("/", protect, async (req, res, next) => {
  try {
    const { data: roadmaps, error } = await supabaseAdmin
      .from("roadmaps")
      .select("*")
      .eq("user_id", req.user.id)
      .order("updated_at", { ascending: false });

    if (error) return res.status(500).json({ message: error.message });

    const formatted = (roadmaps || []).map((r) => ({
      id: r.id,
      _id: r.id,
      goal: r.goal,
      phases: r.phases,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/roadmap/:id/topic
router.patch("/:id/topic", protect, async (req, res, next) => {
  try {
    const { phaseIndex, topicIndex, done } = req.body;
    const { data: roadmap, error } = await supabaseAdmin
      .from("roadmaps")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const phases = [...(roadmap.phases || [])];
    const topic = phases[phaseIndex]?.topics?.[topicIndex];

    if (!topic) {
      return res.status(400).json({ message: "Invalid phase or topic index" });
    }

    phases[phaseIndex].topics[topicIndex].done = Boolean(done);

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("roadmaps")
      .update({
        phases,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roadmap.id)
      .select()
      .single();

    if (updateError) return res.status(500).json({ message: updateError.message });

    res.json({
      id: updated.id,
      _id: updated.id,
      goal: updated.goal,
      phases: updated.phases,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/roadmap/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from("roadmaps")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: "Roadmap deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
