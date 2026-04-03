import { Alert, Card, Divider, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../components/useAuth.js";

const { Title, Text } = Typography;

function roleLabel(role) {
  if (role === "owner") return "System Owner";
  if (role === "admin") return "Admin";
  if (role === "staff" || role === "sales") return "Staff";
  return "User";
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/auth/me");
        if (!mounted) return;
        setUser(res.data?.user || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function onSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Card className="page-card" style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Profile
        </Title>

      {error ? <Alert type="error" message={error} /> : null}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : user ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Text type="secondary">Full name</Text>
            <Text strong>{user.fullName || "-"}</Text>
          </div>
          <Divider style={{ margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Text type="secondary">Email</Text>
            <Text strong>{user.email || "-"}</Text>
          </div>
          <Divider style={{ margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Text type="secondary">Role</Text>
            <Text strong>{roleLabel(user.role)}</Text>
          </div>
        </div>
      ) : null}

        <Divider />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Text
            type="danger"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={onSignOut}
          >
            Sign out
          </Text>
        </div>
      </Card>
    </div>
  );
}
