import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/shared/auth/auth-context";

type AdminRouteProps = {
 requireSuperAdmin?: boolean;
};

export function AdminRoute({ requireSuperAdmin = false }: AdminRouteProps) {
 const { user, isAuthenticated } = useAuth();

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 if (!user) {
 return <Navigate to="/login" replace />;
 }

 const role = user.role;

 if (requireSuperAdmin && role !== "SUPER_ADMIN") {
 return <Navigate to="/" replace />;
 }

 if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
 return <Navigate to="/" replace />;
 }

 return <Outlet />;
}
