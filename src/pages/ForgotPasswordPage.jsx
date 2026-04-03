import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);

  async function onSubmit(values) {
    setError(null);
    setDevUrl(null);
    try {
      const res = await api.post("/auth/forgot-password", { email: values.email });
      setSent(true);
      setDevUrl(res.data?.devResetUrl || null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="main-container is-login">
        <div className="welcome-section">
          <h1>RESET PASSWORD</h1>
          <p>Enter your email and we will send you a reset link.</p>
        </div>

        <div className="form-box">
          <Title level={3} style={{ margin: 0, color: "inherit" }}>
            SRM SaaS Mini
          </Title>

          {error ? <Alert style={{ marginTop: 16 }} type="error" message={error} /> : null}

          {sent ? (
            <div style={{ marginTop: 16 }}>
              <Text>Если энэ имэйл бүртгэлтэй бол password reset линк очно.</Text>
              {devUrl ? (
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">Dev reset URL:</Text>
                  <div>
                    <a href={devUrl}>{devUrl}</a>
                  </div>
                </div>
              ) : null}
              <div style={{ marginTop: 16 }}>
                <Link to="/login">Back to login</Link>
              </div>
            </div>
          ) : (
            <Form layout="vertical" style={{ marginTop: 16 }} onFinish={onSubmit}>
              <h2>Forgot password</h2>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input autoComplete="email" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="btn">
                Send reset link
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
