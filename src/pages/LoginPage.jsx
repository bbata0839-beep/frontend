import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined, BankOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Typography } from "antd";
import { useState } from "react";
import { setToken } from "../api/client.js";
import { api } from "../api/client.js";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/useAuth.js";

const { Text } = Typography;

function InputField({ label, type = "text", value, onChange, icon, placeholder, error }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#9999bb",
        marginBottom: 8,
        letterSpacing: 0.3,
      }}>
        {label}
      </label>
      {type === "password" ? (
        <Input.Password
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          prefix={icon}
          size="large"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid rgba(255,107,107,0.6)" : "1px solid rgba(108,71,255,0.25)",
            borderRadius: 10,
            color: "#e0e0f0",
            fontSize: 14,
          }}
        />
      ) : (
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          prefix={icon}
          type={type}
          size="large"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid rgba(255,107,107,0.6)" : "1px solid rgba(108,71,255,0.25)",
            borderRadius: 10,
            color: "#e0e0f0",
            fontSize: 14,
          }}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form state
  const [tenantName, setTenantName] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  function startGoogleLogin() {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    window.location.href = `${baseUrl}/auth/google`;
  }

  async function onLogin(e) {
    e?.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      login(res.data.token);
      navigate("/");
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e) {
    e?.preventDefault();
    if (!tenantName || !fullName || !regEmail || !regPassword) { setError("Please fill in all fields"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { tenantName, fullName, email: regEmail, password: regPassword });
      setToken(res.data.token);
      login(res.data.token);
      navigate("/");
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      width: "100vw", minHeight: "100vh",
      background: "#0d0d1a",
      display: "flex",
    }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #6c47ff 0%, #1ca7a0 60%, #00d4aa 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Blobs */}
        <div style={{
          position: "absolute", width: 300, height: 300,
          background: "rgba(255,255,255,0.08)", borderRadius: "50%",
          top: -80, right: -80, filter: "blur(60px)"
        }} />
        <div style={{
          position: "absolute", width: 200, height: 200,
          background: "rgba(0,212,170,0.2)", borderRadius: "50%",
          bottom: 40, left: -40, filter: "blur(50px)"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, border: "1px solid rgba(255,255,255,0.25)",
            }}>
              🚀
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>B2B Marketplace</span>
          </div>

          <h1 style={{
            color: "#fff", fontSize: 44, fontWeight: 800,
            margin: "0 0 16px", letterSpacing: -1.5,
            lineHeight: 1.1,
          }}>
            {mode === "register" ? "Start your\njourney today." : "Welcome\nback."}
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.75)", fontSize: 16,
            margin: "0 0 48px", lineHeight: 1.7, maxWidth: 380,
          }}>
            {mode === "register"
              ? "Create your account and get access to the most powerful B2B marketplace & CRM platform."
              : "Sign in to manage your deals, orders, companies, and entire business pipeline in one place."}
          </p>

          {/* Feature Pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["🏢 Multi-Tenant", "🔒 Secure JWT", "📦 Marketplace", "📊 CRM Pipeline"].map(f => (
              <span key={f} style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 20, padding: "6px 16px",
                fontSize: 12, fontWeight: 600, color: "#fff",
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 480,
        background: "#0d0d1a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        borderLeft: "1px solid rgba(108,71,255,0.12)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{
            color: "#f0f0ff", fontSize: 26, fontWeight: 800,
            margin: "0 0 8px", letterSpacing: -0.5,
          }}>
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <Text style={{ color: "#666688", fontSize: 14 }}>
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Fill in your details to get started"}
          </Text>
        </div>

        {/* Error */}
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 20, borderRadius: 10, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)" }}
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* FORM */}
        {mode === "login" ? (
          <form onSubmit={onLogin}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<MailOutlined style={{ color: "#6c47ff" }} />}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<LockOutlined style={{ color: "#6c47ff" }} />}
            />

            <div style={{ textAlign: "right", marginBottom: 24, marginTop: -8 }}>
              <Link to="/forgot-password" style={{ color: "#a78bff", fontSize: 13, fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{
                height: 50, borderRadius: 12,
                background: "linear-gradient(135deg, #6c47ff, #8b6aff)",
                border: "none",
                fontWeight: 700, fontSize: 15,
                boxShadow: "0 4px 20px rgba(108,71,255,0.5)",
                marginBottom: 16,
              }}
            >
              Sign In
            </Button>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(108,71,255,0.2)" }} />
              <span style={{ color: "#555577", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(108,71,255,0.2)" }} />
            </div>

            <Button
              size="large"
              block
              onClick={startGoogleLogin}
              icon={<GoogleOutlined />}
              style={{
                height: 50, borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(108,71,255,0.25)",
                color: "#e0e0f0", fontWeight: 600, fontSize: 14,
                marginBottom: 32,
              }}
            >
              Continue with Google
            </Button>

            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#555577", fontSize: 14 }}>
                Don&apos;t have an account?{" "}
                <a href="#" onClick={e => { e.preventDefault(); setMode("register"); setError(null); }}
                  style={{ color: "#a78bff", fontWeight: 700 }}>
                  Sign up
                </a>
              </Text>
            </div>
          </form>
        ) : (
          <form onSubmit={onRegister}>
            <InputField
              label="Organization Name"
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
              placeholder=""
              icon={<BankOutlined style={{ color: "#6c47ff" }} />}
            />
            <InputField
              label="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder=""
              icon={<UserOutlined style={{ color: "#6c47ff" }} />}
            />
            <InputField
              label="Email"
              type="email"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<MailOutlined style={{ color: "#6c47ff" }} />}
            />
            <InputField
              label="Password"
              type="password"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              placeholder="••••••••"
              icon={<LockOutlined style={{ color: "#6c47ff" }} />}
            />

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{
                height: 50, borderRadius: 12,
                background: "linear-gradient(135deg, #6c47ff, #8b6aff)",
                border: "none",
                fontWeight: 700, fontSize: 15,
                boxShadow: "0 4px 20px rgba(108,71,255,0.5)",
                marginBottom: 32, marginTop: 8,
              }}
            >
              Create Account
            </Button>

            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#555577", fontSize: 14 }}>
                Already have an account?{" "}
                <a href="#" onClick={e => { e.preventDefault(); setMode("login"); setError(null); }}
                  style={{ color: "#a78bff", fontWeight: 700 }}>
                  Sign in
                </a>
              </Text>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
