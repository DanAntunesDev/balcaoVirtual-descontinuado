import { Navigate } from "react-router-dom";
import { useAuth } from "@/domain/auth/useAuth";
import { canAccessRoute } from "@/domain/auth/permissionService";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoute(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
