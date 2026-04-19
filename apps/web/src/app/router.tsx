import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import { App } from "@/app/App";
import { AdminAdminsPage } from "@/pages/admin/AdminAdminsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminLogsPage } from "@/pages/admin/AdminLogsPage";
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage";
import { AdminPendingAuctionsPage } from "@/pages/admin/AdminPendingAuctionsPage";
import { AdminPendingEditsPage } from "@/pages/admin/AdminPendingEditsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AuctionDetailPage } from "@/pages/AuctionDetailPage";
import { AuctionsPage } from "@/pages/AuctionsPage";
import { CreateAuctionPage } from "@/pages/CreateAuctionPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AdminRoute } from "@/shared/routing/AdminRoute";
import { ProtectedRoute } from "@/shared/routing/ProtectedRoute";

const router = createBrowserRouter([
 {
 path: "/",
 element: <App />,
 children: [
 { index: true, element: <Navigate replace to="/auctions" /> },
 { path: "login", element: <LoginPage /> },
 { path: "register", element: <RegisterPage /> },
 { path: "auctions", element: <AuctionsPage /> },
 { path: "auctions/:auctionId", element: <AuctionDetailPage /> },
 {
 path: "auctions/new",
 element: (
 <ProtectedRoute>
 <CreateAuctionPage />
 </ProtectedRoute>
 )
 },
 // Admin routes
 {
 path: "admin",
 element: <AdminRoute />,
 children: [
 { index: true, element: <AdminDashboardPage /> },
  {
  path: "admins",
  element: <AdminRoute requireSuperAdmin />,
  children: [{ index: true, element: <AdminAdminsPage /> }]
  },
  { path: "logs", element: <AdminLogsPage /> },
  { path: "notifications", element: <AdminNotificationsPage /> },
  { path: "edits/pending", element: <AdminPendingEditsPage /> },
  { path: "users", element: <AdminUsersPage /> },
 { path: "auctions/pending", element: <AdminPendingAuctionsPage /> }
 ]
 }
 ]
 }
]);

export function AppRouter() {
 return <RouterProvider router={router} />;
}
