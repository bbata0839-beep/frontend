import { MessageOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography, Image, message, Empty } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text, Paragraph } = Typography;

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      // By default, our backend dealController lists deals where createdBy = req.user.userId
      const response = await api.get(`/deals`);
      setRequests(response.data || []);
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getUserStatus = (stage) => {
    switch (stage) {
      case "prospect":
      case "discovery":
        return { text: "New request", color: "orange" };
      case "qualified":
      case "negotiation":
        return { text: "In progress", color: "blue" };
      case "proposal":
        return { text: "Offer sent", color: "purple" };
      case "won":
        return { text: "Confirmed", color: "green" };
      case "lost":
        return { text: "Closed", color: "red" };
      default:
        return { text: "Unknown", color: "default" };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          My Requests
        </Title>
        <Text type="secondary">
          Track the status of the products you are interested in purchasing.
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {requests.map((req) => {
          const status = getUserStatus(req.stage);
          const product = req.product;
          
          return (
            <Col key={req.id} xs={24} sm={12} lg={8} xl={6}>
              <Card hoverable loading={loading}>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {product?.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", borderRadius: 4 }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L"
                        />
                      ) : (
                        <div style={{ width: 48, height: 48, background: "#f0f0f0", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ShoppingOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
                        </div>
                      )}
                      <div>
                        <Text strong style={{ display: "block" }}>
                          {product?.name || req.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary">Status: </Text>
                    <Tag color={status.color} style={{ margin: 0 }}>
                      {status.text}
                    </Tag>
                  </div>

                  <Button 
                    type="primary" 
                    icon={<MessageOutlined />} 
                    block
                    onClick={() => navigate(`/conversations?dealId=${req.id}`)}
                  >
                    Open Chat
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {requests.length === 0 && !loading && (
        <Empty description="You have no active requests." style={{ margin: "48px 0" }} />
      )}
    </div>
  );
}
