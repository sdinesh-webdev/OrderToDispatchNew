import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";

import Dashboard from "./pages/admin/Dashboard";
import Order from "./pages/admin/Order";
import DispatchPlanning from "./pages/admin/DispatchPlanning";
import InformToParty from "./pages/admin/InformToParty";
import DispatchComplete from "./pages/admin/DispatchComplete";
import AfterDispatchInformToParty from "./pages/admin/AfterDispatchInformToParty";
import Settings from "./pages/admin/Settings";

import AdminLayout from "./layouts/AdminLayout";

function App() {
  const { user } = useAuth();

  // Helper to check if user has access to a specific page name
  const hasAccess = (pageName) => {
    return user?.pageAccess?.includes(pageName);
  };

  // Helper to find the first allowed admin route
  const getFirstAllowedAdminRoute = () => {
    const adminRoutes = [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Order", path: "/admin/order" },
      { name: "Disp Plan", path: "/admin/dispatch-planning" },
      { name: "Notify Party", path: "/admin/notify-party" },
      { name: "Disp Done", path: "/admin/dispatch-done" },
      { name: "Post-Disp Notify", path: "/admin/post-dispatch-notify" },
      { name: "Settings", path: "/admin/settings" },
    ];

    const allowed = adminRoutes.find(r => hasAccess(r.name));
    return allowed ? allowed.path : "/login"; // Fallback to login if somehow no access
  };

  // Protected Route component for specific pages
  const ProtectedRoute = ({ children, pageName }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!hasAccess(pageName)) {
      return <Navigate to={getFirstAllowedAdminRoute()} replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin" ? getFirstAllowedAdminRoute() : "/user/dashboard"
              }
            />
          ) : (
            <Login />
          )
        }
      />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to={getFirstAllowedAdminRoute()} replace />} />

        <Route path="dashboard" element={
          <ProtectedRoute pageName="Dashboard">
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="order" element={
          <ProtectedRoute pageName="Order">
            <Order />
          </ProtectedRoute>
        } />

        <Route path="dispatch-planning" element={
          <ProtectedRoute pageName="Disp Plan">
            <DispatchPlanning />
          </ProtectedRoute>
        } />

        <Route path="notify-party" element={
          <ProtectedRoute pageName="Notify Party">
            <InformToParty />
          </ProtectedRoute>
        } />

        <Route path="dispatch-done" element={
          <ProtectedRoute pageName="Disp Done">
            <DispatchComplete />
          </ProtectedRoute>
        } />

        <Route path="post-dispatch-notify" element={
          <ProtectedRoute pageName="Post-Disp Notify">
            <AfterDispatchInformToParty />
          </ProtectedRoute>
        } />

        <Route path="settings" element={
          <ProtectedRoute pageName="Settings">
            <Settings />
          </ProtectedRoute>
        } />
      </Route>

      {/* USER ROUTES */}
      <Route path="/user" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* ROOT */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin" ? getFirstAllowedAdminRoute() : "/user/dashboard"
              }
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;