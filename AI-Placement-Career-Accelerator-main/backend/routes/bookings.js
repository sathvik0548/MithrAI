import { Router } from "express";
import Booking from "../models/Booking.js";
import Activity from "../models/Activity.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST /api/bookings  { expertId, expertName, role, date, time }
router.post("/", protect, async (req, res, next) => {
  try {
    const { expertId, expertName, role, date, time } = req.body;
    if (!expertId || !role || !date || !time) {
      return res
        .status(400)
        .json({ message: "expertId, role, date and time are required" });
    }
    const booking = await Booking.create({
      user: req.user._id,
      expertId,
      expertName,
      role,
      date,
      time,
    });
    await Activity.create({
      user: req.user._id,
      type: "human",
      label: "Human Interview Booked",
      sub: `${role} with ${expertName || "expert"}`,
    });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings
router.get("/", protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      status: { $ne: "cancelled" },
    }).sort("date");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id  — cancel
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    next(err);
  }
});

export default router;
