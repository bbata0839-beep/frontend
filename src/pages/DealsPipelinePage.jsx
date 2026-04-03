import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, List, message, Modal, Row, Select, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const stages = ["prospect", "qualified", "proposal", "won", "lost"];

const stageConfig = {
  prospect:  { label: "Prospect",  color: "#6c47ff", bg: "rgba(108,71,255,0.12)", border: "rgba(108,71,255,0.3)" },
  qualified: { label: "Qualified", color: "#00b4d8", bg: "rgba(0,180,216,0.12)",  border: "rgba(0,180,216,0.3)" },
  proposal:  { label: "Proposal",  color: "#ff9f43", bg: "rgba(255,159,67,0.12)", border: "rgba(255,159,67,0.3)" },
  won:       { label: "Won ✅",    color: "#00d4aa", bg: "rgba(0,212,170,0.12)",  border: "rgba(0,212,170,0.3)" },
  lost:      { label: "Lost",      color: "#ff6b6b", bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.3)" },
};

export default function DealsPipelinePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [d, c] = await Promise.all([api.get("/deals"), api.get("/contacts?limit=1000&page=1")]);
      setDeals(d.data);
      setContacts(c.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m = {};
    stages.forEach((s) => (m[s] = []));
    for (const deal of deals) {
      const s = deal.stage || "prospect";
      m[s] = m[s] || [];
      m[s].push(deal);
    }
    return m;
  }, [deals]);

  async function moveStage(dealId, nextStage) {
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: nextStage });
      message.success("Stage updated");
      await load();
    } catch (e) {
      message.error(e?.response?.data?.message || e.message);
    }
  }

  async function createDeal(values) {
    setCreating(true);
    try {
      const res = await api.post("/deals", {
        title: values.title,
        amount: values.amount ? Number(values.amount) : 0,
        stage: values.stage,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
        contactId: values.contactId || null
      });
      message.success("Deal created");
      setShowCreate(false);
      form.resetFields();
      await load();
      if (res.data?.id) navigate(`/deals/${res.data.id}`);
    } catch (e) {
      message.error(e?.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Deals Pipeline</Title>
          <Text type="secondary">{deals.length} active deals across {stages.length} stages</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>New Deal</Button>
        </Space>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8 }}>
          <Text type="danger">{error}</Text>
        </div>
      )}

      <Modal open={showCreate} title="Create Deal" onCancel={() => setShowCreate(false)} footer={null} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={createDeal}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Amount"><Input prefix="$" type="number" /></Form.Item>
          <Form.Item name="stage" label="Stage" initialValue="prospect">
            <Select>
              {stages.map((s) => (
                <Select.Option key={s} value={s}>{stageConfig[s]?.label || s}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="deadline" label="Deadline (optional)"><Input type="datetime-local" /></Form.Item>
          <Form.Item name="contactId" label="Contact (optional)">
            <Select allowClear showSearch optionFilterProp="children">
              {contacts.map((ct) => <Select.Option key={ct.id} value={ct.id}>{ct.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>Create Deal</Button>
          </Form.Item>
        </Form>
      </Modal>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spin size="large" /></div>
      ) : (
        <Row gutter={16}>
          {stages.map((s) => {
            const cfg = stageConfig[s];
            const stageDeals = grouped[s] || [];
            return (
              <Col key={s} xs={24} md={12} lg={24 / stages.length}>
                {/* Column Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  padding: "10px 14px",
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: "10px 10px 0 0",
                }}>
                  <Text strong style={{ color: cfg.color, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                    {cfg.label}
                  </Text>
                  <Tag style={{
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    color: cfg.color, borderRadius: 20, fontSize: 11
                  }}>
                    {stageDeals.length}
                  </Tag>
                </div>

                {/* Cards */}
                <div style={{
                  minHeight: 420,
                  padding: "8px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${cfg.border}`,
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                }}>
                  {stageDeals.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 32, color: "#555577", fontSize: 13 }}>
                      No deals
                    </div>
                  ) : (
                    <List
                      dataSource={stageDeals}
                      split={false}
                      renderItem={(deal) => (
                        <List.Item style={{ padding: "4px 0" }}>
                          <Card
                            size="small"
                            style={{
                              width: "100%",
                              background: "rgba(26,26,46,0.9)",
                              border: `1px solid ${cfg.border}`,
                              borderLeft: `3px solid ${cfg.color}`,
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                            hoverable
                            bodyStyle={{ padding: "10px 12px" }}
                            onClick={() => navigate(`/deals/${deal.id}`)}
                          >
                            <Text strong style={{ display: "block", fontSize: 13, marginBottom: 6, color: "#e0e0f0" }}>
                              {deal.title}
                            </Text>
                            {deal.amount > 0 && (
                              <Text style={{ color: "#00d4aa", fontWeight: 600, fontSize: 13 }}>
                                ${parseFloat(deal.amount).toLocaleString()}
                              </Text>
                            )}
                            {deal.deadline && (
                              <div style={{ marginTop: 4 }}>
                                <Text style={{ fontSize: 11, color: "#8888aa" }}>
                                  📅 {new Date(deal.deadline).toLocaleDateString()}
                                </Text>
                              </div>
                            )}
                            <Select
                              value={deal.stage}
                              size="small"
                              style={{ width: "100%", marginTop: 8 }}
                              onChange={(v) => { e?.stopPropagation?.(); moveStage(deal.id, v); }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {stages.map((ns) => (
                                <Select.Option key={ns} value={ns}>{stageConfig[ns]?.label || ns}</Select.Option>
                              ))}
                            </Select>
                          </Card>
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
