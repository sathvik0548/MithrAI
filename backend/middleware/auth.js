import { supabaseAdmin } from "../config/supabase.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authorization token.",
      });
    }

    const authUser = data.user;

    // Fetch user profile details
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    req.user = {
      id: authUser.id,
      _id: authUser.id, // for backwards compatibility
      email: authUser.email,
      name: profile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || "",
      phone: profile?.phone || "",
      college: profile?.college || "",
      branch: profile?.branch || "",
      graduationYear: profile?.graduation_year || "",
      targetRole: profile?.target_role || "",
      skills: profile?.skills || [],
      bio: profile?.bio || "",
      avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url || "",
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

export default protect;