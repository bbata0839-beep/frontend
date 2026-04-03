import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DealsPipelinePage from "./pages/DealsPipelinePage.jsx";
import DealDetailsPage from "./pages/DealDetailsPage.jsx";
import TimelinePage from "./pages/TimelinePage.jsx";
import CompaniesPage from "./pages/CompaniesPage.jsx";
import CompanyProductsPage from "./pages/CompanyProductsPage.jsx";
import MarketplacePage from "./pages/MarketplacePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ConversationsPage from "./pages/ConversationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import MyRequestsPage from "./pages/MyRequestsPage.jsx";
import { useAuth } from "./components/useAuth.js";
import { Spin } from "antd";

export default function App() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={token ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={user?.role === "user" ? <Navigate to="/marketplace" replace /> : <DashboardPage />} />
        <Route path="dashboard" element={user?.role === "user" ? <Navigate to="/marketplace" replace /> : <DashboardPage />} />
        <Route path="deals" element={<DealsPipelinePage />} />
        <Route path="deals/:dealId" element={<DealDetailsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:companyId/products" element={<CompanyProductsPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="users"
          element={user?.role === "owner" || user?.role === "admin" ? <UsersPage /> : <Navigate to="/" replace />}
        />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}

