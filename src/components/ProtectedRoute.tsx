import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "@/lib/store";

export const ProtectedRoute = () => {
  const { session } = useStore();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
