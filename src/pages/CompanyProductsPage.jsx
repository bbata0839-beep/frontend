import { ArrowLeftOutlined, PlusOutlined, InboxOutlined, UploadOutlined, DeleteOutlined, EyeOutlined, MinusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Row, Space, Tag, Typography, message, Upload } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function CompanyProductsPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/products/${id}`);
          message.success("Product deleted successfully");
          load();
        } catch (e) {
          message.error("Failed to delete product");
        }
      }
    });
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    try {
      await api.put(`/products/${id}`, { quantity: newQuantity });
      message.success("Quantity updated");
      load();
    } catch (e) {
      message.error("Failed to update quantity");
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [companiesRes, productsRes] = await Promise.all([
        api.get(`/companies?q=`),
        api.get(`/products?companyId=${companyId}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ""}`)
      ]);

      const found = (companiesRes.data || []).find((c) => c.id === companyId) || null;
      setCompany(found);
      setProducts(productsRes.data || []);
    } catch (e) {
      message.error(e?.response?.data?.message || e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [companyId, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const inStockCount = useMemo(() => products.filter((p) => p.inStock).length, [products]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/companies">
          <Button icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
      </Space>

      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          {company?.name || "Company Products"}
        </Title>
        <Text type="secondary">
          {products.length} products
          {products.length ? ` • ${inStockCount} in stock` : ""}
        </Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Search products..."
            allowClear
            style={{ width: 320 }}
            onSearch={setSearchTerm}
            onChange={(e) => !e.target.value && setSearchTerm("")}
          />
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
            Import CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Add Product
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {products.map((p) => (
          <Col key={p.id} xs={24} sm={12} lg={8}>
            <Card hoverable loading={loading}>
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                  <Text strong>{p.name}</Text>
                  <Text type="danger">${parseFloat(p.price).toFixed(2)}</Text>
                </Space>

                {p.category && <Tag color="blue">{p.category}</Tag>}

                {p.description && (
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                    {p.description}
                  </Paragraph>
                )}

                {!p.inStock ? (
                  <Tag color="red">Sold Out</Tag>
                ) : (
                  <Tag color="green">In Stock</Tag>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Text type="secondary">Quantity:</Text>
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    disabled={p.quantity <= 0}
                    onClick={() => handleUpdateQuantity(p.id, p.quantity - 1)}
                  />
                  <Text strong>{p.quantity || 0}</Text>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleUpdateQuantity(p.id, (p.quantity || 0) + 1)}
                  />
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => { setSelectedProduct(p); setDetailsOpen(true); }}
                  >
                    Details
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {!loading && products.length === 0 && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <Text type="secondary">No products found</Text>
        </Card>
      )}

      <Modal
        title="Add Product"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Create"
        onOk={async () => {
          try {
            const values = await form.validateFields();
            if (values.quantity) {
              values.quantity = parseInt(values.quantity, 10);
            }
            await api.post("/products", { ...values, companyId });
            form.resetFields();
            setOpen(false);
            message.success("Product created!");
            load();
          } catch (e) {
            message.error(e?.response?.data?.message || e.message || "Failed to create product.");
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]} initialValue={10}>
            <Input type="number" min="0" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import Products (CSV Stream)"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Upload a CSV file to bulk import products. The system uses stream processing, so you can upload massive lists (10,000+ rows) without crashing the server.
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Button
            type="link"
            onClick={() => {
              window.open(`${import.meta.env.VITE_API_URL || "https://backend-j3u1.onrender.com"}/products/template/csv`, "_blank");
            }}
            style={{ padding: 0 }}
          >
            Download CSV Template
          </Button>
        </div>

        <Upload.Dragger
          name="file"
          accept=".csv"
          multiple={false}
          action={`${import.meta.env.VITE_API_URL || "https://backend-j3u1.onrender.com"}/products/import/csv`}
          headers={{
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }}
          data={{ companyId }}
          onChange={(info) => {
            const { status } = info.file;
            if (status === 'uploading') {
              setLoading(true);
            }
            if (status === 'done') {
              message.success(`Imported ${info.file.response.count || 0} products successfully!`);
              setImportModalOpen(false);
              setLoading(false);
              load();
            } else if (status === 'error') {
              message.error(info.file.response?.message || "Failed to import products.");
              setLoading(false);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag CSV file to this area to import</p>
          <p className="ant-upload-hint">
            Support for a single standard CSV upload. Ensure headers mach the template perfectly.
          </p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title="Product Details"
        open={detailsOpen}
        onCancel={() => setDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        ]}
      >
        {selectedProduct && (
          <div>
            <Title level={4}>{selectedProduct.name}</Title>
            <Text type="danger" style={{ fontSize: "20px", display: "block", marginBottom: 12 }}>
              ${parseFloat(selectedProduct.price).toFixed(2)}
            </Text>
            {selectedProduct.category && <Tag color="blue" style={{ marginBottom: 16 }}>{selectedProduct.category}</Tag>}

            {selectedProduct.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ maxWidth: '100%', borderRadius: 8 }} />
              </div>
            )}

            <Paragraph>{selectedProduct.description}</Paragraph>

            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Status: </Text>
              {selectedProduct.inStock ? <Text type="success" strong>In Stock</Text> : <Text type="danger" strong>Out of Stock</Text>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
