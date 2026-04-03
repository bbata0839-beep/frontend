import { Alert, Button, Card, Form, Input, Modal, Select, Space, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../components/useAuth.js";

const { Title, Text } = Typography;

function roleLabel(role) {
  if (role === "owner") return "System Owner";
  if (role === "admin") return "Admin";
  if (role === "staff" || role === "sales") return "Staff";
  return "User";
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/users");
      setUsers(res.data?.users || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(
    () => [
      { title: "Name", dataIndex: "fullName", key: "fullName" },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (v) => <Text>{roleLabel(v)}</Text>
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, row) => (
          <Space>
            {me?.role === "owner" && row.role !== "owner" ? (
              <Select
                size="small"
                value={row.role === "sales" ? "staff" : row.role}
                style={{ width: 120 }}
                onChange={async (nextRole) => {
                  try {
                    await api.patch(`/users/${row.id}/role`, { role: nextRole });
                    load();
                  } catch (e) {
                    setError(e?.response?.data?.message || e.message);
                  }
                }}
                options={[
                  { value: "user", label: "User" },
                  { value: "staff", label: "Staff" },
                  { value: "admin", label: "Admin" }
                ]}
              />
            ) : null}

            {row.role !== "owner" ? (
              <Button
                size="small"
                danger
                disabled={me?.role !== "owner" && row.role === "admin"}
                onClick={async () => {
                  try {
                    await api.delete(`/users/${row.id}`);
                    load();
                  } catch (e) {
                    setError(e?.response?.data?.message || e.message);
                  }
                }}
              >
                Disable
              </Button>
            ) : null}
          </Space>
        )
      }
    ],
    [me?.role]
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Users
          </Title>
          <Space>
            <Button onClick={() => load()} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" onClick={() => setOpen(true)}>
              Add user
            </Button>
          </Space>
        </div>

        {error ? <Alert type="error" message={error} style={{ marginTop: 12 }} /> : null}

        <Table
          style={{ marginTop: 12 }}
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Add user"
        open={open}
        onCancel={() => setOpen(false)}
        okText="Create"
        onOk={async () => {
          const values = await form.validateFields();
          try {
            await api.post("/users", values);
            form.resetFields();
            setOpen(false);
            load();
          } catch (e) {
            setError(e?.response?.data?.message || e.message);
          }
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ role: "user" }}>
          <Form.Item name="fullName" label="Full name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Temporary password" rules={[{ required: true, min: 4 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "user", label: "User" },
                { value: "staff", label: "Staff (CRM Access)" },
                { value: "admin", label: "Admin" }
              ]}
              disabled={me?.role !== "owner" && me?.role !== "admin"}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
