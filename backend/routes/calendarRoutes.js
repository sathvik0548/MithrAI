import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { createCalendarReminder } from "../services/calendar.js";
import { z } from "zod";

const router = Router();

const reminderSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional().default(""),
  dateTimeISO: z.string().min(1, "dateTimeISO is required"),
  minutesBefore: z.number().int().min(0).max(10080).optional().default(30),
});

// POST /api/calendar/reminder
router.post("/reminder", protect, async (req, res, next) => {
  try {
    const parsed = reminderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const result = await createCalendarReminder(req.user.id, parsed.data);

    res.json({
      success: true,
      eventId: result.eventId,
      htmlLink: result.htmlLink,
    });
  } catch (err) {
    if (err.code === "CALENDAR_NO_ACCESS") {
      return res.status(403).json({
        success: false,
        code: "CALENDAR_NO_ACCESS",
        message:
          "Google Calendar access not granted. Please sign in with Google and allow Calendar permissions.",
      });
    }
    next(err);
  }
});

export default router;
