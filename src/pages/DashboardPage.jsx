import { ReloadOutlined, RocketOutlined, PercentageOutlined, CalendarOutlined, TrophyOutlined } from "@ant-design/icons";
import { Button, Card, Col, List, Row, Space, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const { Title, Text } = Typography;

const StatCard = ({ icon, title, value, color, suffix }) => (
  <Card style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderColor: `${color}40` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <Text style={{ color: "#8888aa", fontSize: 13, display: "block", marginBottom: 8 }}>{title}</Text>
        <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
          {value}{suffix && <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 2 }}>{suffix}</span>}
        </div>
      </div>
      <div style={{
        width: 52, height: 52,
        background: `${color}20`,
        borderRadius: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, color
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/summary");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Overview of your sales pipeline</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8 }}>
          <Text type="danger">{error}</Text>
        </div>
      )}

      {loading && !data ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}><Spin size="large" /></div>
      ) : data ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                icon={<TrophyOutlined />}
                title="Won Deal Amount"
                value={`$${parseFloat(data.wonAmount || 0).toLocaleString()}`}
                color="#00d4aa"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                icon={<PercentageOutlined />}
                title="Conversion Rate"
                value={((data.conversionRate || 0) * 100).toFixed(1)}
                suffix="%"
                color="#6c47ff"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                icon={<CalendarOutlined />}
                title="Upcoming Deadlines"
                value={data.upcomingDeadlines?.length || 0}
                color="#ff9f43"
              />
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <RocketOutlined style={{ color: "#6c47ff" }} />
                <Text strong>Upcoming Deadlines</Text>
              </Space>
            }
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={data.upcomingDeadlines || []}
              locale={{ emptyText: <Text type="secondary">No upcoming deadlines 🎉</Text> }}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Text strong style={{ color: "#00d4aa" }}>${parseFloat(item.amount || 0).toLocaleString()}</Text>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 36, height: 36,
                        background: "rgba(108,71,255,0.15)",
                        borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#a78bff", fontWeight: 700, fontSize: 14
                      }}>
                        {(item.title || "?")[0].toUpperCase()}
                      </div>
                    }
                    title={<Text strong>{item.title || "Untitled"}</Text>}
                    description={
                      <Space size="small">
                        <Text type="secondary" style={{ fontSize: 12 }}>Stage: {item.stage || "-"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>•</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Due: {item.deadline ? new Date(item.deadline).toLocaleDateString() : "-"}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}
