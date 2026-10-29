import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import FullPageLoader from "../components/FullPageLoader";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}