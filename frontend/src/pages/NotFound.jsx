import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #faf9ff 0%, #f0eeff 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: "clamp(64px, 18vw, 110px)",
          fontWeight: 900,
          lineHeight: 1,
          background: "linear-gradient(135deg, #6c63ff, #ff6584)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </div>

      <h1
        style={{
          fontSize: "clamp(20px, 4vw, 28px)",
          fontWeight: 800,
          color: "#1a1a2e",
          margin: "8px 0 8px",
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          color: "#6b7280",
          fontSize: 15,
          maxWidth: 380,
          margin: "0 0 28px",
          lineHeight: 1.6,
        }}
      >
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 28px",
            background: "#fff",
            color: "#1a1a2e",
            border: "1.5px solid #e5e7eb",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
