import { MessageOutlined, ShoppingCartOutlined, SearchOutlined, FilterOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select, Space, Tag, Typography, Image, Rate, message, Modal, Divider, Form } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);

  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();

  const loadCompanies = useCallback(async () => {
    const response = await api.get("/companies?isVendor=true");
    setCompanies(response.data || []);
  }, []);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedCompany) params.append("companyId", selectedCompany);
    if (inStockOnly) params.append("inStock", true);

    setLoading(true);
    try {
      const response = await api.get(`/products?${params}`);
      setProducts(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [inStockOnly, searchTerm, selectedCategory, selectedCompany]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
    unique.sort((a, b) => String(a).localeCompare(String(b)));
    return unique;
  }, [products]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      message.success(`${product.name} added to cart!`);
    } catch (error) {
      message.error("Failed to add product to cart");
    }
  };

  const handleProductCardClick = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  const handleStartDealAndChat = async () => {
    if (!selectedProduct) return;
    setStartingChat(true);
    try {
      const otherUserId = selectedProduct.createdBy || selectedProduct.company?.createdBy;
      if (!otherUserId) throw new Error("Cannot find the seller's user ID to chat.");

      // 1. Auto-create Contact (best-effort)
      let contactId = null;
      try {
        const contactRes = await api.post("/contacts", {
          name: "Marketplace Buyer",
          companyId: selectedProduct.companyId,
          status: "lead"
        });
        contactId = contactRes.data.id;
      } catch (_) { /* best-effort */ }

      // 2. Create Deal linked to Product + Contact
      const dealRes = await api.post("/deals", {
        title: `Interested in: ${selectedProduct.name}`,
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        stage: "discovery",
        contactId: contactId || undefined
      });
      const newDealId = dealRes.data.id;

      // 3. Create Conversation with dealId + productId + contactId
      const convRes = await api.post("/conversations", {
        otherUserId,
        dealId: newDealId,
        productId: selectedProduct.id,
        contactId: contactId || undefined
      });
      const convId = convRes.data.id;

      message.success("Deal & Contact created! Starting chat with seller...");
      setIsModalVisible(false);
      navigate(`/conversations?conversationId=${convId}&dealId=${newDealId}`);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || "Failed to start chat.");
    } finally {
      setStartingChat(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    setPlacingOrder(true);
    try {
      // 1. Create a Deal at discovery stage
      const dealRes = await api.post("/deals", {
        title: `Order: ${selectedProduct.name}`,
        productId: selectedProduct.id,
        amount: selectedProduct.price,
        stage: "discovery"
      });
      const newDealId = dealRes.data.id;

      // 2. Create the Order (this auto-updates Deal to 'won')
      const orderRes = await api.post("/orders", {
        items: [{ productId: selectedProduct.id, quantity: 1 }],
        dealId: newDealId,
        notes: `Order for ${selectedProduct.name}`
      });

      message.success(`Order placed! Total: $${parseFloat(orderRes.data.totalAmount).toFixed(2)}. Deal marked as Won! 🎉`);
      setIsModalVisible(false);
      navigate("/orders");
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Marketplace</Title>
        <Paragraph>Browse products from our vendor companies</Paragraph>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap size="large">
          <Search
            placeholder="Search products..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchTerm}
            onChange={(e) => !e.target.value && setSearchTerm("")}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="All Categories"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory || undefined}
            onChange={setSelectedCategory}
          >
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>

          <Select
            placeholder="All Companies"
            allowClear
            style={{ width: 200 }}
            value={selectedCompany || undefined}
            onChange={setSelectedCompany}
          >
            {companies.map(company => (
              <Option key={company.id} value={company.id}>{company.name}</Option>
            ))}
          </Select>

          <Button
            type={inStockOnly ? "primary" : "default"}
            onClick={() => setInStockOnly(!inStockOnly)}
          >
            In Stock Only
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              loading={loading}
              onClick={() => handleProductCardClick(product)}
              cover={
                product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ height: 200, objectFit: "cover" }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L"
                  />
                ) : (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
                    <Text type="secondary">No Image</Text>
                  </div>
                )
              }
              actions={[
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductCardClick(product);
                  }}
                >
                  View Details
                </Button>
              ]}
            >
              <Card.Meta
                title={
                  <Space direction="vertical" size="small">
                    <Text strong>{product.name}</Text>
                    <Text type="danger" style={{ fontSize: "18px" }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {product.category && (
                      <Tag color="blue">{product.category}</Tag>
                    )}
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {product.description}
                    </Paragraph>
                    <div>
                      <Text type="secondary">
                        Sold by: <Link to={`/companies/${product.company.id}`}>{product.company.name}</Link>
                      </Text>
                    </div>
                    {!product.inStock ? (
                      <Tag color="red">Sold Out</Tag>
                    ) : (
                      <Text type="success" style={{ fontSize: "12px", display: "inline-block", marginTop: "4px" }}>
                        In Stock ({product.quantity || 0} available)
                      </Text>
                    )}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {products.length === 0 && !loading && (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Text type="secondary">No products found matching your criteria</Text>
        </Card>
      )}

      <Modal
        title="Product Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        {selectedProduct && (
          <div>
            <Row gutter={24}>
              <Col span={10}>
                {selectedProduct.imageUrl ? (
                  <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: "100%", borderRadius: 8 }} />
                ) : (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", borderRadius: 8 }}>
                    <Text type="secondary">No Image</Text>
                  </div>
                )}
              </Col>
              <Col span={14}>
                <Title level={4}>{selectedProduct.name}</Title>
                <Text type="danger" style={{ fontSize: "24px", display: "block", marginBottom: 12 }}>
                  ${parseFloat(selectedProduct.price).toFixed(2)}
                </Text>
                {selectedProduct.category && <Tag color="blue" style={{ marginBottom: 16 }}>{selectedProduct.category}</Tag>}
                <Paragraph>{selectedProduct.description}</Paragraph>
              </Col>
            </Row>

            <Divider />
            
            <Title level={5}>Seller Information</Title>
            <Paragraph>
              Company: <Link onClick={handleModalClose} to={`/companies/${selectedProduct.company.id}`}>{selectedProduct.company.name}</Link>
              {selectedProduct.company.website && (
                <span>
                  {" "}| <a href={selectedProduct.company.website.startsWith('http') ? selectedProduct.company.website : `https://${selectedProduct.company.website}`} target="_blank" rel="noreferrer">Website</a>
                </span>
              )}<br/>
              Seller Rep: {selectedProduct.creator?.fullName || "Unknown"} ({selectedProduct.creator?.email})<br/>
              Status: {selectedProduct.inStock ? <Text type="success">In Stock ({selectedProduct.quantity || 0} available)</Text> : <Text type="danger">Out of Stock</Text>}
            </Paragraph>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button onClick={handleModalClose}>Close</Button>
              <Button 
                icon={<MessageOutlined />} 
                loading={startingChat}
                onClick={handleStartDealAndChat}
                disabled={!selectedProduct.inStock}
              >
                Negotiate & Chat
              </Button>
              <Button 
                type="primary"
                icon={<ShoppingOutlined />} 
                loading={placingOrder}
                onClick={() => {
                  setIsModalVisible(false);
                  setIsPaymentModalVisible(true);
                }}
                disabled={!selectedProduct.inStock}
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Secure Payment"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        okText={`Pay $${selectedProduct ? parseFloat(selectedProduct.price).toFixed(2) : "0.00"}`}
        onOk={() => paymentForm.submit()}
        confirmLoading={placingOrder}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">You are purchasing: </Text>
          <Text strong>{selectedProduct?.name}</Text>
        </div>
        <Form 
          form={paymentForm} 
          layout="vertical"
          onFinish={async () => {
            await handlePlaceOrder();
            setIsPaymentModalVisible(false);
            paymentForm.resetFields();
          }}
        >
          <Form.Item name="cardNumber" label="Card Number" rules={[{ required: true, len: 16, message: "Must be 16 digits" }]}>
            <Input placeholder="1234 5678 9101 1121" maxLength={16} />
          </Form.Item>
          <Space style={{ display: 'flex', width: '100%', gap: 16 }}>
            <Form.Item style={{ flex: 1 }} name="expiry" label="Expiry Date" rules={[{ required: true, message: "MM/YY" }]}>
              <Input placeholder="MM/YY" maxLength={5} />
            </Form.Item>
            <Form.Item style={{ flex: 1 }} name="cvv" label="CVV" rules={[{ required: true, len: 3, message: "3 digits" }]}>
              <Input placeholder="123" maxLength={3} />
            </Form.Item>
          </Space>
          <Form.Item name="cardholder" label="Cardholder Name" rules={[{ required: true }]}>
            <Input placeholder="Name on card" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
