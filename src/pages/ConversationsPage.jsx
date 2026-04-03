import { MessageOutlined, ReloadOutlined, SendOutlined, UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Form, Input, List, message, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../components/useAuth.js";

const { Title, Text } = Typography;

export default function ConversationsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const initialConvId = searchParams.get("conversationId");

  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(initialConvId || null);
  const [error, setError] = useState(null);

  const [formSend] = Form.useForm();

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  // Get the "other" user in the conversation
  const otherUser = useMemo(() => {
    if (!selected || !user) return null;
    return selected.userA?.id === user.userId ? selected.userB : selected.userA;
  }, [selected, user]);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/conversations");
      setConversations(res.data || []);
      if (initialConvId) {
        setSelectedConversationId(initialConvId);
      } else if (!selectedConversationId && res.data?.[0]?.id) {
        setSelectedConversationId(res.data[0].id);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId) {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await api.get(`/conversations/${conversationId}/messages?limit=50&offset=0`);
      setMessages(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversationId) loadMessages(selectedConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  async function sendMessage(values) {
    try {
      if (!selectedConversationId) return;
      await api.post(`/conversations/${selectedConversationId}/messages`, { body: values.body });
      formSend.resetFields();
      await loadMessages(selectedConversationId);
    } catch (e) {
      message.error(e?.response?.data?.message || e.message);
    }
  }

  const getStageColor = (stage) => {
    const colors = { prospect: "blue", discovery: "cyan", proposal: "purple", negotiation: "orange", won: "green", lost: "red" };
    return colors[stage] || "default";
  };

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Conversations</Title>
        <Button icon={<ReloadOutlined />} onClick={loadConversations} loading={loading}>Refresh</Button>
      </Space>

      {error && <Text type="danger" style={{ marginBottom: 12, display: "block" }}>{error}</Text>}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        {/* LEFT: Conversation List */}
        <Card
          title={<Text strong>Chats ({conversations.length})</Text>}
          bodyStyle={{ padding: 0, overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
        >
          {loading && conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24 }}><Spin /></div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <Text type="secondary">No conversations yet.</Text><br />
              <Link to="/marketplace">Browse Marketplace</Link> to start one!
            </div>
          ) : (
            <List
              dataSource={conversations}
              rowKey="id"
              renderItem={(c) => {
                const other = c.userA?.id === user?.userId ? c.userB : c.userA;
                const isActive = c.id === selectedConversationId;
                return (
                  <List.Item
                    style={{
                      cursor: "pointer",
                      background: isActive ? "rgba(108,71,255,0.15)" : "transparent",
                      borderLeft: isActive ? "3px solid #6c47ff" : "3px solid transparent",
                      padding: "12px 16px",
                      transition: "all 0.2s"
                    }}
                    onClick={() => setSelectedConversationId(c.id)}
                  >
                    <div style={{ width: "100%" }}>
                      <Space>
                        <Avatar icon={<UserOutlined />} style={{ background: isActive ? "#6c47ff" : "#444466" }} size="small" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {other?.fullName || other?.email || "Unknown User"}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>{other?.email}</Text>
                        </div>
                      </Space>
                      {c.deal && (
                        <div style={{ marginTop: 6, paddingLeft: 30 }}>
                          {c.deal.product && (
                            <div style={{ fontSize: 12, color: "#8888aa" }}>
                              <ShoppingOutlined style={{ marginRight: 4 }} />
                              {c.deal.product.name}
                            </div>
                          )}
                          <Tag color={getStageColor(c.deal.stage)} style={{ fontSize: 11, marginTop: 2 }}>
                            {c.deal.stage}
                          </Tag>
                          <Link
                            to={`/deals/${c.deal.id}`}
                            style={{ fontSize: 11, marginLeft: 4 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Deal
                          </Link>
                        </div>
                      )}
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {/* RIGHT: Messages */}
        <Card
          title={
            selected ? (
              <Space>
                <Avatar icon={<UserOutlined />} style={{ background: "#6c47ff" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{otherUser?.fullName || otherUser?.email || "Chat"}</div>
                  {selected.deal?.product && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ShoppingOutlined style={{ marginRight: 4 }} />
                      {selected.deal.product.name} — ${parseFloat(selected.deal.product.price).toFixed(2)}
                    </Text>
                  )}
                </div>
              </Space>
            ) : (
              <Text type="secondary">Select a conversation</Text>
            )
          }
          bodyStyle={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", padding: 0 }}
        >
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <MessageOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                <div style={{ marginTop: 12, color: "#8c8c8c" }}>Select a conversation to start chatting</div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 24 }}><Spin /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#8c8c8c", padding: 24 }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.userId;
                    const senderName = m.sender?.fullName || m.sender?.email || "Unknown";
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          flexDirection: isMe ? "row-reverse" : "row",
                          marginBottom: 12,
                          gap: 8,
                          alignItems: "flex-end"
                        }}
                      >
                        <Avatar
                          icon={<UserOutlined />}
                          size="small"
                          style={{ background: isMe ? "#6c47ff" : "#444466", flexShrink: 0 }}
                        />
                        <div style={{ maxWidth: "70%" }}>
                          <div style={{ textAlign: isMe ? "right" : "left", marginBottom: 2 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {isMe ? "You" : senderName}
                            </Text>
                          </div>
                          <div
                            style={{
                              background: isMe ? "linear-gradient(135deg, #6c47ff, #8b6aff)" : "rgba(255,255,255,0.08)",
                              color: isMe ? "#fff" : "#e0e0f0",
                              borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                              padding: "10px 14px",
                              fontSize: 14,
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              boxShadow: isMe ? "0 2px 8px rgba(108,71,255,0.4)" : "0 1px 4px rgba(0,0,0,0.3)"
                            }}
                          >
                            {m.body}
                          </div>
                          <div style={{ textAlign: isMe ? "right" : "left", marginTop: 2 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Divider style={{ margin: 0 }} />

              {/* Message input */}
              <div style={{ padding: 16 }}>
                <Form form={formSend} onFinish={sendMessage}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item name="body" style={{ flex: 1, margin: 0 }} rules={[{ required: true }]}>
                      <Input
                        placeholder="Write a message..."
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            formSend.submit();
                          }
                        }}
                      />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />}>Send</Button>
                  </Space.Compact>
                </Form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
