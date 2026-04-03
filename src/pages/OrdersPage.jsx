import { EyeOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Card, Col, Image, Row, Select, Space, Tag, Typography, Table, Divider } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedStatus) params.append("status", selectedStatus);

    setLoading(true);
    try {
      const response = await api.get(`/orders/my-orders?${params}`);
      setOrders(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      confirmed: "blue",
      shipped: "purple",
      delivered: "green",
      cancelled: "red"
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text code>{id.substring(0, 8)}</Text>
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Items",
      key: "items",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.orderItems.map((item, index) => (
            <div key={index}>
              <Text>{item.quantity}x {item.product.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                from {item.product.company.name}
              </Text>
            </div>
          ))}
        </Space>
      )
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text strong>${parseFloat(amount).toFixed(2)}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isExpanded = expandedRowKeys.includes(record.id);
        return (
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              if (isExpanded) {
                setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
              } else {
                setExpandedRowKeys([...expandedRowKeys, record.id]);
              }
            }}
          >
            {isExpanded ? "Hide Details" : "View"}
          </Button>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>My Orders</Title>
        <Text type="secondary">View your purchase history and order status</Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space>
          <FilterOutlined />
          <Text>Filter by status:</Text>
          <Select
            placeholder="All Status"
            allowClear
            style={{ width: 200 }}
            value={selectedStatus || undefined}
            onChange={setSelectedStatus}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) setExpandedRowKeys([...expandedRowKeys, record.id]);
              else setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
            },
            expandedRowRender: (record) => (
              <div style={{ padding: "20px", background: "#fafafa" }}>
                <Title level={5}>Order Details</Title>
                <Row gutter={[16, 16]}>
                  {record.orderItems.map((item, index) => (
                    <Col key={index} xs={24} sm={12} md={8}>
                      <Card size="small">
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                          {item.product.imageUrl && (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              style={{ width: "100%", height: 120, objectFit: "cover" }}
                            />
                          )}
                          <Text strong>{item.product.name}</Text>
                          <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                            {item.product.description}
                          </Paragraph>
                          <Space>
                            <Text>Quantity: {item.quantity}</Text>
                            <Text>× ${parseFloat(item.unitPrice).toFixed(2)}</Text>
                          </Space>
                          <Text strong>
                            ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                          </Text>
                          <div>
                            <Text type="secondary">
                              Sold by: <Link to={`/companies/${item.product.company.id}`}>
                                {item.product.company.name}
                              </Link>
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                {record.shippingAddress && (
                  <>
                    <Divider />
                    <div>
                      <Title level={5}>Shipping Address</Title>
                      <pre style={{ background: "white", padding: "10px", border: "1px solid #f0f0f0" }}>
                        {JSON.stringify(record.shippingAddress, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
                
                {record.notes && (
                  <>
                    <Divider />
                    <div>
                      <Title level={5}>Notes</Title>
                      <Text>{record.notes}</Text>
                    </div>
                  </>
                )}
              </div>
            ),
            rowExpandable: (record) => record.orderItems.length > 0
          }}
        />
      </Card>

      {orders.length === 0 && !loading && (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Title level={4} type="secondary">No orders found</Title>
          <Text type="secondary">
            {selectedStatus ? "No orders with this status" : (
              <>
                You haven't placed any orders yet. 
                <Link to="/marketplace"> Start shopping</Link> in the marketplace!
              </>
            )}
          </Text>
        </Card>
      )}
    </div>
  );
}
