import { Modal, Form, Input, Switch, Upload, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { api } from "../api/client.js";

const { TextArea } = Input;
const { Dragger } = Upload;

export default function CreateCompanyModal({ visible, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      try {
        await api.post("/companies", {
          ...values,
          logo: logoUrl
        });
        message.success("Company created successfully");
        form.resetFields();
        setLogoUrl("");
        onSuccess();
      } catch (error) {
        message.error(error.response?.data?.message || "Failed to create company");
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    customRequest: ({ file, onSuccess }) => {
      // For now, just create a temporary URL
      // In production, you'd upload to a cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target.result);
        onSuccess();
      };
      reader.readAsDataURL(file);
    },
    showUploadList: false
  };

  return (
    <Modal
      title="Create New Company"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitting}
          onClick={handleSubmit}
        >
          Create Company
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isVendor: false
        }}
      >
        <Form.Item
          name="name"
          label="Company Name"
          rules={[{ required: true, message: "Please enter company name" }]}
        >
          <Input placeholder="Enter company name" />
        </Form.Item>

        <Form.Item
          name="industry"
          label="Industry"
        >
          <Input placeholder="e.g., Technology, Healthcare, Finance" />
        </Form.Item>

        <Form.Item
          name="website"
          label="Website"
          rules={[{ type: "url", message: "Please enter a valid URL" }]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={3} placeholder="Brief description of the company" />
        </Form.Item>

        <Form.Item label="Company Logo">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to upload logo</p>
            <p className="ant-upload-hint">Support for single image upload</p>
          </Dragger>
          {logoUrl && (
            <div style={{ marginTop: 16 }}>
              <img src={logoUrl} alt="Logo preview" style={{ maxWidth: 100, maxHeight: 100 }} />
            </div>
          )}
        </Form.Item>

        <Form.Item
          name="isVendor"
          label="Is Vendor"
          valuePropName="checked"
        >
          <Switch checkedChildren="Yes" unCheckedChildren="No" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
