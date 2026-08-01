import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { protect } from "../middleware/auth.js";
const router = Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    college: user.college,
    branch: user.branch,
    graduationYear: user.graduationYear,
    targetRole: user.targetRole,
    skills: user.skills,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "phone",
      "college",
      "branch",
      "graduationYear",
      "targetRole",
      "skills",
      "bio",
      "avatarUrl",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    }
    await req.user.save();
    await Activity.create({
      user: req.user._id,
      type: "profile",
      label: "Profile Updated",
    });
    res.json({ user: userResponse(req.user) });
  } catch (err) {
    next(err);
  }
});

export default router;
