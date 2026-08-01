export default function errorHandler(err, req, res, next) {
  console.error(err);
  // Mongo duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    return res.status(400).json({ message: "Email already registered" });
  }
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: Object.values(err.errors)[0]?.message || "Invalid data" });
  }
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Server error" });
}
