import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ContainerOutlined,
  FileTextOutlined,
  MessageOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.js";

const { Content, Sider } = Layout;

function items(role) {
  const base = [
    { key: "/marketplace", label: "Marketplace", icon: <ShopOutlined /> },
    { key: "/requests", label: "My Requests", icon: <FileTextOutlined /> },
    { key: "/orders", label: "My Orders", icon: <ContainerOutlined /> },
    { key: "/conversations", label: "Conversations", icon: <MessageOutlined /> },
    { key: "/profile", label: "Profile", icon: <UserOutlined /> },
  ];

  if (role === "admin" || role === "owner" || role === "sales" || role === "staff") {
    base.unshift(
      { key: "/", label: "Dashboard", icon: <AppstoreOutlined /> },
      { key: "/deals", label: "Deals Pipeline", icon: <RocketOutlined /> },
      { key: "/timeline", label: "Timeline", icon: <ClockCircleOutlined /> },
      { key: "/companies", label: "Companies", icon: <TeamOutlined /> }
    );
  }

  if (role === "owner" || role === "admin") {
    base.push({ key: "/users", label: "Users", icon: <SettingOutlined /> });
  }

  return base;
}

export default function LayoutShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = items(user?.role);
  const activeKey = menuItems.find((x) => x.key === location.pathname)?.key || "/";

  return (
    <Layout className="app-shell" style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 200,
          overflow: "auto",
        }}
      >
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚀</div>
          <span className="sidebar-logo-text">B2B Market</span>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
        />

        {/* User Badge at Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            background: "var(--bg-sidebar)",
          }}
          onClick={() => navigate("/profile")}
        >
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #6c47ff, #00d4aa)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {(user?.fullName || user?.email || "?")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(240,240,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.fullName || user?.email || "User"}
            </div>
            <div style={{ fontSize: 11, color: "#8888aa", textTransform: "capitalize" }}>
              {user?.role || "member"}
            </div>
          </div>
        </div>
      </Sider>

      {/* Main area offset by sidebar width */}
      <Layout style={{ marginLeft: 240, background: "var(--bg-content)", minHeight: "100vh" }}>
        {/* Fixed topbar */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 240,
          right: 0,
          height: 56,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          background: "#13131f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{
            background: "linear-gradient(90deg, #a78bff, #00d4aa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: "-0.3px",
          }}>
            B2B Marketplace & CRM
          </span>
        </div>

        {/* Page content with top padding for fixed header */}
        <Content style={{ marginTop: 56, padding: "24px", minHeight: "calc(100vh - 56px)" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
