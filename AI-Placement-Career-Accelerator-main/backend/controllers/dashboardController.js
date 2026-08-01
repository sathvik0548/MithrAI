import User from "../models/User.js";
import Progress from "../models/Progress.js";
export const getDashboard = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
      },
      statistics: {
        atsScore: 0,
        interviewCount: 0,
        averageScore: 0,
        roadmapCount: 0,
      },
      activities: [],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
  const progress = await Progress.find({

    user:req.user._id

}).sort({

    date:1

});
};

