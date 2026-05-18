import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
  return <Navigate to="/unauthorized" replace />;
}

  return <Outlet />;
}

export default ProtectedRoute;
