import { Alert, Button, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(params.get("token") || "");
  }, [params]);

  async function onSubmit(values) {
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, newPassword: values.newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 600);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="main-container is-login">
        <div className="welcome-section">
          <h1>NEW PASSWORD</h1>
          <p>Set a new password for your account.</p>
        </div>

        <div className="form-box">
          <Title level={3} style={{ margin: 0, color: "inherit" }}>
            SRM SaaS Mini
          </Title>

          {error ? <Alert style={{ marginTop: 16 }} type="error" message={error} /> : null}

          {done ? (
            <div style={{ marginTop: 16 }}>
              <Text>Password updated. Redirecting to login...</Text>
              <div style={{ marginTop: 16 }}>
                <Link to="/login">Go to login</Link>
              </div>
            </div>
          ) : (
            <Form layout="vertical" style={{ marginTop: 16 }} onFinish={onSubmit}>
              <h2>Reset password</h2>
              <Form.Item label="Token" required>
                <Input value={token} onChange={(e) => setToken(e.target.value)} />
              </Form.Item>
              <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 4 }]}>
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="btn" disabled={!token}>
                Update password
              </Button>
              <div className="link-group">
                <p>
                  <Link to="/login">Back to login</Link>
                </p>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
