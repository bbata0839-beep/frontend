import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Space, Statistic, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import CreateCompanyModal from "../components/CreateCompanyModal.jsx";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterVendor, setFilterVendor] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (filterVendor !== null) params.append("isVendor", filterVendor);

    setLoading(true);
    try {
      const response = await api.get(`/companies?${params}`);
      setCompanies(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [filterVendor, searchTerm]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const vendorCompanies = useMemo(() => companies.filter((c) => c.isVendor), [companies]);
  const regularCompanies = useMemo(() => companies.filter((c) => !c.isVendor), [companies]);

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={2}>Companies</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
          Add Company
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Companies" value={companies.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Vendors" value={vendorCompanies.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Regular Companies" value={regularCompanies.length} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Search
            placeholder="Search companies..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchTerm}
            onChange={(e) => !e.target.value && setSearchTerm("")}
          />
          <Button.Group>
            <Button 
              type={filterVendor === null ? "primary" : "default"}
              onClick={() => setFilterVendor(null)}
            >
              All
            </Button>
            <Button 
              type={filterVendor === true ? "primary" : "default"}
              onClick={() => setFilterVendor(true)}
            >
              Vendors
            </Button>
            <Button 
              type={filterVendor === false ? "primary" : "default"}
              onClick={() => setFilterVendor(false)}
            >
              Regular
            </Button>
          </Button.Group>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {companies.map((company) => (
          <Col key={company.id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              loading={loading}
              extra={company.isVendor && <Tag color="green">Vendor</Tag>}
              actions={[
                <Link to={`/companies/${company.id}/products`}>View Products</Link>
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    {company.logo && (
                      <img src={company.logo} alt={company.name} style={{ width: 24, height: 24, objectFit: "cover" }} />
                    )}
                    {company.name}
                  </Space>
                }
                description={
                  <div>
                    {company.industry && (
                      <Tag color="blue" style={{ marginBottom: 8 }}>
                        {company.industry}
                      </Tag>
                    )}
                    {company.description && (
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                        {company.description}
                      </Paragraph>
                    )}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {company._count?.products || 0} products
                      </Text>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <CreateCompanyModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadCompanies();
        }}
      />
    </div>
  );
}
