import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { protect } from "../middleware/auth.js";
import { sendWelcomeEmail } from "../utils/SendEmail.js";

const router = Router();

function formatUserResponse(user, profile = {}) {
  return {
    id: user.id,
    _id: user.id,
    name: profile.name || user.user_metadata?.name || user.user_metadata?.full_name || "",
    email: user.email,
    phone: profile.phone || "",
    college: profile.college || "",
    branch: profile.branch || "",
    graduationYear: profile.graduation_year || "",
    targetRole: profile.target_role || "",
    skills: profile.skills || [],
    bio: profile.bio || "",
    avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url || "",
  };
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const { data: authData, error: signUpError } =
      await supabaseAdmin.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: { name },
        },
      });

    if (signUpError) {
      return res.status(400).json({ message: signUpError.message });
    }

    const user = authData.user;
    const session = authData.session;

    if (user) {
      // Upsert profile
      await supabaseAdmin.from("profiles").upsert({
        id: user.id,
        email: user.email,
        name,
        updated_at: new Date().toISOString(),
      });

      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, name).catch(() => {});
    }

    res.status(201).json({
      token: session?.access_token || "",
      user: formatUserResponse(user, { name }),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error || !data.session) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({
      token: data.session.access_token,
      user: formatUserResponse(data.user, profile || {}),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const {
      name,
      phone,
      college,
      branch,
      graduationYear,
      targetRole,
      skills,
      bio,
      avatarUrl,
    } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (college !== undefined) updatePayload.college = college;
    if (branch !== undefined) updatePayload.branch = branch;
    if (graduationYear !== undefined)
      updatePayload.graduation_year = graduationYear;
    if (targetRole !== undefined) updatePayload.target_role = targetRole;
    if (skills !== undefined) updatePayload.skills = skills;
    if (bio !== undefined) updatePayload.bio = bio;
    if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Log Activity
    await supabaseAdmin.from("activities").insert({
      user_id: req.user.id,
      type: "profile",
      label: "Profile Updated",
      sub: `Target role: ${updatedProfile.target_role || "Not specified"}`,
    });

    res.json({
      user: formatUserResponse(
        { id: req.user.id, email: req.user.email },
        updatedProfile
      ),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/google-token (Save Google OAuth Refresh Token)
router.post("/google-token", protect, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const { error } = await supabaseAdmin.from("user_google_tokens").upsert({
      user_id: req.user.id,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ success: true, message: "Google refresh token saved" });
  } catch (err) {
    next(err);
  }
});

export default router;
