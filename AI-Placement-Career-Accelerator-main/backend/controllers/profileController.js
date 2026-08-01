import User from "../models/User.js";

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, location, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        email,
        phone,
        location,
        bio,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};