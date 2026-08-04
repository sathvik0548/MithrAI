import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST /api/bookings
router.post("/", protect, async (req, res, next) => {
  try {
    const { expertId, expertName, role, date, time } = req.body;
    if (!expertId || !role || !date || !time) {
      return res
        .status(400)
        .json({ message: "expertId, role, date, and time are required" });
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: req.user.id,
        expert_id: expertId,
        expert_name: expertName || "",
        role,
        date,
        time,
        status: "upcoming",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await supabaseAdmin.from("activities").insert({
      user_id: req.user.id,
      type: "human",
      label: "Human Interview Booked",
      sub: `${role} with ${expertName || "expert"}`,
    });

    res.status(201).json({
      id: booking.id,
      _id: booking.id,
      expertId: booking.expert_id,
      expertName: booking.expert_name,
      role: booking.role,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      createdAt: booking.created_at,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings
router.get("/", protect, async (req, res, next) => {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("user_id", req.user.id)
      .neq("status", "cancelled")
      .order("date", { ascending: true });

    if (error) return res.status(500).json({ message: error.message });

    const formatted = (bookings || []).map((b) => ({
      id: b.id,
      _id: b.id,
      expertId: b.expert_id,
      expertName: b.expert_name,
      role: b.role,
      date: b.date,
      time: b.time,
      status: b.status,
      createdAt: b.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id (cancel)
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    next(err);
  }
});

export default router;
