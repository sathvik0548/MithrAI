export default function errorHandler(err, req, res, next) {
  // Log stack in development only
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err.message, err.stack);
  } else {
    console.error("[ERROR]", err.message);
  }

  // Supabase / Postgres unique violation
  if (err?.code === "23505") {
    return res.status(409).json({ message: "A record with that value already exists." });
  }

  // Zod validation errors forwarded manually
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors?.map((e) => e.message),
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
}
