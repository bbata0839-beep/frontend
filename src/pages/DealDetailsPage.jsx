import { ArrowLeftOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, List, Space, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

export default function DealDetailsPage() {
  const navigate = useNavigate();
  const { dealId } = useParams();

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  const [sending, setSending] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/deals/${dealId}/comments`);
      setComments(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  async function addComment(values) {
    setSending(true);
    try {
      await api.post(`/deals/${dealId}/comments`, { body: values.body });
      form.resetFields();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/deals")} />
        <Title level={3} style={{ margin: 0 }}>
          Deal Details
        </Title>
        <Text type="secondary">#{dealId}</Text>
      </Space>

      {error ? (
        <Card type="inner" className="page-card" title="Error">
          <Text type="danger">{error}</Text>
        </Card>
      ) : null}

      <Card title="Deal Comments" className="page-card">
        {loading ? (
          <Spin />
        ) : (
          <>
            <List
              dataSource={comments}
              itemLayout="horizontal"
              renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Comment`}
                    description={<div style={{ whiteSpace: "pre-wrap" }}>{c.body}</div>}
                  />
                  <Text type="secondary">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</Text>
                </List.Item>
              )}
              locale={{ emptyText: "No comments yet" }}
            />

            <Card type="inner" style={{ marginTop: 16 }} title="Add comment">
              <Form form={form} layout="vertical" onFinish={addComment}>
                <Form.Item
                  name="body"
                  label="Comment"
                  rules={[{ required: true, message: "Comment is required" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}

