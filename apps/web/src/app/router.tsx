import { createBrowserRouter,Navigate, RouterProvider } from "react-router-dom";

import { App } from "@/app/App";
import { AuctionDetailPage } from "@/pages/AuctionDetailPage";
import { AuctionsPage } from "@/pages/AuctionsPage";
import { CreateAuctionPage } from "@/pages/CreateAuctionPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
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
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
