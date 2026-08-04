import { supabaseAdmin } from "../config/supabase.js";

// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      college: profile.college,
      branch: profile.branch,
      graduationYear: profile.graduation_year,
      targetRole: profile.target_role,
      skills: profile.skills,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
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

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (college !== undefined) updates.college = college;
    if (branch !== undefined) updates.branch = branch;
    if (graduationYear !== undefined) updates.graduation_year = graduationYear;
    if (targetRole !== undefined) updates.target_role = targetRole;
    if (skills !== undefined) updates.skills = skills;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      college: profile.college,
      branch: profile.branch,
      graduationYear: profile.graduation_year,
      targetRole: profile.target_role,
      skills: profile.skills,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};