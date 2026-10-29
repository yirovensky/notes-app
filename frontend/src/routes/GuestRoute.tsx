import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import FullPageLoader from "../components/FullPageLoader";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}