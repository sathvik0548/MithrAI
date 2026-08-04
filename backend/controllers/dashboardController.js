import { supabaseAdmin } from "../config/supabase.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all stats in parallel
    const [
      { data: resumeData },
      { data: interviewData },
      { data: roadmapData },
      { data: activities },
    ] = await Promise.all([
      supabaseAdmin
        .from("resume_analyses")
        .select("ats_score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabaseAdmin
        .from("interview_sessions")
        .select("overall_score, status")
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabaseAdmin
        .from("roadmaps")
        .select("id")
        .eq("user_id", userId),
      supabaseAdmin
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    const latestAts = resumeData?.[0]?.ats_score ?? 0;
    const completedInterviews = interviewData || [];
    const averageScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce((sum, s) => sum + (s.overall_score || 0), 0) /
              completedInterviews.length
          )
        : 0;

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
        targetRole: req.user.targetRole,
        avatarUrl: req.user.avatarUrl,
      },
      statistics: {
        atsScore: latestAts,
        interviewCount: completedInterviews.length,
        averageScore,
        roadmapCount: roadmapData?.length ?? 0,
      },
      activities: (activities || []).map((a) => ({
        id: a.id,
        type: a.type,
        label: a.label,
        sub: a.sub,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
