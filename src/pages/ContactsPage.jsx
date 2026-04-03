import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Select, Space, Spin, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const { Title } = Typography;

export default function ContactsPage() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.id, label: c.name })),
    [companies]
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cRes, coRes] = await Promise.all([
        api.get("/contacts?limit=100&page=1"),
        api.get("/companies")
      ]);
      setContacts(cRes.data || []);
      setCompanies(coRes.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createContact(values) {
    try {
      await api.post("/contacts", values);
      message.success("Contact created");
      form.resetFields();
      await load();
    } catch (e) {
      message.error(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          Contacts
        </Title>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          Refresh
        </Button>
      </Space>

      {error ? <Card type="inner" className="page-card" title="Error">
        {error}
      </Card> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <Card className="page-card" title="Add contact">
          <Form form={form} layout="vertical" onFinish={createContact}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
            <Form.Item name="companyId" label="Company">
              <Select allowClear options={companyOptions} />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="lead">
              <Select options={[
                { value: "lead", label: "lead" },
                { value: "active", label: "active" },
                { value: "inactive", label: "inactive" }
              ]} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="page-card" title="Contacts list">
          {loading ? (
            <Spin />
          ) : (
            <Table
              rowKey="id"
              dataSource={contacts}
              pagination={false}
              columns={[
                { title: "Name", dataIndex: "name" },
                { title: "Phone", dataIndex: "phone" },
                { title: "Email", dataIndex: "email" },
                { title: "CompanyId", dataIndex: "companyId" },
                { title: "Status", dataIndex: "status" }
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

