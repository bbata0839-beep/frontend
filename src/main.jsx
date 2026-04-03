import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import App from "./App.jsx";
import "antd/dist/reset.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#6c47ff",
            colorSuccess: "#00d4aa",
            colorWarning: "#ff9f43",
            colorError: "#ff6b6b",
            colorInfo: "#6c47ff",
            borderRadius: 8,
            colorBgContainer: "#1a1a2e",
            colorBgElevated: "#1f1f35",
            colorBgLayout: "#0d0d1a",
            colorBorder: "rgba(108,71,255,0.2)",
            colorBorderSecondary: "rgba(255,255,255,0.06)",
            colorText: "#e0e0f0",
            colorTextSecondary: "#8888aa",
            colorTextTertiary: "#555577",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          },
          components: {
            Menu: {
              itemBg: "transparent",
              itemSelectedBg: "rgba(108,71,255,0.2)",
              itemSelectedColor: "#a78bff",
              itemHoverBg: "rgba(108,71,255,0.1)",
              itemHoverColor: "#e0e0f0",
            },
            Card: {
              colorBgContainer: "#1a1a2e",
            },
            Table: {
              colorBgContainer: "transparent",
              headerBg: "rgba(108,71,255,0.08)",
            },
            Modal: {
              contentBg: "#1a1a2e",
              headerBg: "#1a1a2e",
            },
            Button: {
              primaryColor: "#fff",
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
