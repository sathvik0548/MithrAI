import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid #e0e0e0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  color: "#333",
  background: "#fafafa",
  transition: "border 0.2s",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  marginBottom: 6,
  display: "block",
};

const btnPrimary = {
  width: "100%",
  padding: "13px",
  borderRadius: 10,
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
  marginTop: 4,
};

const socialBtn = {
  flex: 1,
  padding: "11px",
  borderRadius: 10,
  border: "1.5px solid #e0e0e0",
  background: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: "#333",
};

const Card = ({ children }) => (
  <div style={{
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 40px rgba(79,70,229,0.12)",
    boxSizing: "border-box",
  }}>
    {children}
  </div>
);

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
    <span style={{ fontSize: 22 }}>🧠</span>
    <span style={{ fontWeight: 800, fontSize: 18, color: "#4f46e5" }}>PlacementAI</span>
  </div>
);

const FieldGroup = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 42 }}
        onFocus={e => e.target.style.border = "1.5px solid #4f46e5"}
        onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"}
      />
      <span
        onClick={() => setShow(s => !s)}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, color: "#aaa", userSelect: "none" }}
      >
        {show ? "🙈" : "👁️"}
      </span>
    </div>
  );
};

// ─── REGISTER PAGE ──────────────────────────────────────
function RegisterPage({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", agree: false });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.includes("@")) e.email = "Enter a valid email.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    if (!form.agree) e.agree = "You must agree to the terms.";
    return e;
  };
const handleSubmit = async () => {

    const errors = validate();
    setErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {

        const response = await API.post("/auth/register", {
            name: form.name,
            email: form.email,
            password: form.password,
        });

        localStorage.setItem("token", response.data.token);

        localStorage.setItem(
            "currentUser",
            JSON.stringify(response.data.user)
        );

        alert("Registration Successful");

        onRegistered(response.data.user);

    } catch (err) {

        alert(err.response?.data?.message || "Registration Failed");

    }

};

  if (success) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5f3ff, #e0e7ff)" }}>
      <Card>
        <Logo />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Account Created!</h2>
          <p style={{ color: "#666", marginBottom: 28 }}>You can now log in with your credentials.</p>
          <button style={btnPrimary} onClick={onGoLogin}>Go to Login</button>
        </div>
      </Card>
    </div>
  );

  const err = (k) => errors[k] ? <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors[k]}</div> : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5f3ff, #e0e7ff)", padding: 16 }}>
      <Card>
        <Logo />
        <h2 style={{ textAlign: "center", fontWeight: 800, fontSize: 26, margin: "0 0 4px" }}>Create Your Account</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginBottom: 28 }}>Start your journey to success</p>

        <FieldGroup label="Full Name">
          <input style={inputStyle} placeholder="Enter your full name" value={form.name} onChange={set("name")}
            onFocus={e => e.target.style.border = "1.5px solid #4f46e5"}
            onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"} />
          {err("name")}
        </FieldGroup>

        <FieldGroup label="Email Address">
          <input style={inputStyle} placeholder="Enter your email" value={form.email} onChange={set("email")}
            onFocus={e => e.target.style.border = "1.5px solid #4f46e5"}
            onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"} />
          {err("email")}
        </FieldGroup>

        <FieldGroup label="Password">
          <PasswordInput value={form.password} onChange={set("password")} placeholder="Create a password" />
          {err("password")}
        </FieldGroup>

        <FieldGroup label="Confirm Password">
          <PasswordInput value={form.confirm} onChange={set("confirm")} placeholder="Confirm your password" />
          {err("confirm")}
        </FieldGroup>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <input type="checkbox" checked={form.agree} onChange={set("agree")} style={{ marginTop: 3, accentColor: "#4f46e5" }} />
          <span style={{ fontSize: 13, color: "#555" }}>
            I agree to the <span style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>Terms & Conditions</span> and{" "}
            <span style={{ color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>
          </span>
        </div>
        {err("agree")}

        <button style={{ ...btnPrimary, marginTop: 20 }} onClick={handleSubmit}>Create Account</button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" }}>
          Already have an account?{" "}
          <span style={{ color: "#4f46e5", fontWeight: 700, cursor: "pointer" }} onClick={onGoLogin}>Login</span>
        </p>
      </Card>
    </div>
  );
}

// ─── LOGIN PAGE ─────────────────────────────────────────
function LoginPage({ registeredUser, onLoginSuccess, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {

    setError("");

    try {

        const response = await API.post("/auth/login",{

            email,
            password

        });

        localStorage.setItem("token",response.data.token);

        localStorage.setItem(

            "currentUser",

            JSON.stringify(response.data.user)

        );

        onLoginSuccess(response.data.user);

    }

    catch(err){

        setError(

            err.response?.data?.message ||

            "Invalid Email or Password"

        );

    }

};
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5f3ff, #e0e7ff)", padding: 16 }}>
      <Card>
        <Logo />
        <h2 style={{ textAlign: "center", fontWeight: 800, fontSize: 26, margin: "0 0 4px" }}>Welcome Back! 👋</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginBottom: 28 }}>Login to your account</p>

        <FieldGroup label="Email Address">
          <input style={inputStyle} placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
            onFocus={e => e.target.style.border = "1.5px solid #4f46e5"}
            onBlur={e => e.target.style.border = "1.5px solid #e0e0e0"} />
        </FieldGroup>

        <FieldGroup label="Password">
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
        </FieldGroup>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555", cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "#4f46e5" }} />
            Remember Me
          </label>
          <span style={{ color: "#4f46e5", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Forgot Password?</span>
        </div>

        {error && <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        {!registeredUser && (
          <div style={{ background: "#fff7ed", border: "1px solid #fcd34d", color: "#b45309", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            ⚠️ Please <span style={{ fontWeight: 700, cursor: "pointer", textDecoration: "underline" }} onClick={onGoRegister}>register</span> first to access login.
          </div>
        )}

        <button style={btnPrimary} onClick={handleLogin}>Login</button>

        <div style={{ textAlign: "center", margin: "18px 0 14px", color: "#bbb", fontSize: 13 }}>or continue with</div>

        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="https://accounts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...socialBtn, textDecoration: "none", flex: 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </a>
          <a
            href="https://github.com/login"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...socialBtn, textDecoration: "none", flex: 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#333">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
            </svg>
            GitHub
          </a>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" }}>
          Don't have an account?{" "}
          <span style={{ color: "#4f46e5", fontWeight: 700, cursor: "pointer" }} onClick={onGoRegister}>Sign up</span>
        </p>
      </Card>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const [page, setPage] = useState("register"); // "register" | "login"
  const [registeredUser, setRegisteredUser] = useState(null);

  if (page === "register") return (
    <RegisterPage
  onRegistered={(user) => {
    setRegisteredUser(user);
    setPage("login");
  }}
  onGoLogin={() => setPage("login")}
/>
  );

  if (page === "login") return (
    <LoginPage
  registeredUser={registeredUser}
  onLoginSuccess={(user) => {
    setRegisteredUser(user);
    navigate("/dashboard");
  }}
  onGoRegister={() => setPage("register")}
/>
  );
}