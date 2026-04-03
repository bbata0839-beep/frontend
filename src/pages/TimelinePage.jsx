import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, List, message, Row, Select, Space, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const { Title, Text } = Typography;

const activityTypes = ["call", "email", "meeting"];

export default function TimelinePage() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  const [filterContactId, setFilterContactId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  async function loadContacts() {
    const res = await api.get("/contacts?limit=1000&page=1");
    setContacts(res.data || []);
  }

  async function loadActivities() {
    setLoading(true);
    setError(null);
    try {
      const res = filterContactId
        ? await api.get(`/activities?contactId=${filterContactId}`)
        : await api.get("/activities");
      setActivities(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts()
      .then(() => loadActivities())
      .catch((e) => setError(e?.message || e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterContactId]);

  async function createActivity(values) {
    setCreating(true);
    try {
      const payload = {
        contactId: values.contactId,
        type: values.type,
        note: values.note,
        happenedAt: values.happenedAt ? values.happenedAt.toISOString() : new Date().toISOString(),
        durationMinutes: values.durationMinutes ?? null,
        outcome: values.outcome ?? null
      };
      await api.post("/activities", payload);
      form.resetFields();
      message.success("Activity created");
      await loadActivities();
    } catch (e) {
      message.error(e?.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  }

  const contactOptions = useMemo(() => contacts.map((c) => ({ value: c.id, label: c.name })), [contacts]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          Timeline / Activities
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadActivities} loading={loading}>
          Refresh
        </Button>
      </Space>

      {error ? (
        <Card className="page-card" title="Error">
          <Text type="danger">{error}</Text>
        </Card>
      ) : null}

      <Card className="page-card" title="Filter by contact">
        <Select
          allowClear
          showSearch
          style={{ width: 360 }}
          placeholder="All contacts"
          onChange={(v) => setFilterContactId(v || null)}
          options={contactOptions}
        />
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={14}>
          <Card className="page-card" title="Activity timeline">
            {loading ? (
              <Spin />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={activities}
                renderItem={(a) => (
                  <List.Item key={a.id}>
                    <Space direction="vertical" size={2}>
                      <Text strong>{a.type?.toUpperCase()}</Text>
                      <Text type="secondary">
                        {a.happenedAt ? new Date(a.happenedAt).toLocaleString() : ""}
                        {a.durationMinutes ? ` | Duration: ${a.durationMinutes} min` : ""}
                        {a.outcome ? ` | Outcome: ${a.outcome}` : ""}
                      </Text>
                      <div style={{ whiteSpace: "pre-wrap" }}>{a.note}</div>
                    </Space>
                  </List.Item>
                )}
                locale={{ emptyText: "No activities" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card className="page-card" title="Add activity">
            <Form form={form} layout="vertical" onFinish={createActivity}>
              <Form.Item name="contactId" label="Contact" rules={[{ required: true }]}>
                <Select showSearch options={contactOptions} />
              </Form.Item>
              <Form.Item name="type" label="Type" initialValue="call" rules={[{ required: true }]}>
                <Select options={activityTypes.map((t) => ({ value: t, label: t }))} />
              </Form.Item>
              <Form.Item name="happenedAt" label="Happened at" initialValue={dayjs()}>
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="note" label="Note" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="durationMinutes" label="Duration minutes (optional)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="outcome" label="Outcome (optional)">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={creating} block>
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

