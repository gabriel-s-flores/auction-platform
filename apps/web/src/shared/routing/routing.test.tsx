import type { LoginUser } from "@auction/shared-types";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useAuth } from "@/shared/auth/auth-context";

import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

vi.mock("@/shared/auth/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function makeUser(role: LoginUser["role"]): LoginUser {
  return {
    email: `${role.toLowerCase()}@auction.local`,
    id: `${role.toLowerCase()}-1`,
    role,
  };
}

function setAuthState({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user: LoginUser | null;
}) {
  mockedUseAuth.mockReturnValue({
    checkAuth: vi.fn(async () => undefined),
    isAuthenticated,
    login: vi.fn(),
    logout: vi.fn(async () => undefined),
    user,
  });
}

describe("routing guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects anonymous users away from protected pages", () => {
    setAuthState({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <div>Account dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Account dashboard")).not.toBeInTheDocument();
  });

  test("renders protected pages for authenticated users", () => {
    setAuthState({ isAuthenticated: true, user: makeUser("USER") });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <div>Account dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Account dashboard")).toBeInTheDocument();
  });

  test("keeps regular users out of admin routes", () => {
    setAuthState({ isAuthenticated: true, user: makeUser("USER") });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Public home</div>} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<div>Admin dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Public home")).toBeInTheDocument();
    expect(screen.queryByText("Admin dashboard")).not.toBeInTheDocument();
  });

  test("allows admins into admin routes and reserves super-admin routes", () => {
    setAuthState({ isAuthenticated: true, user: makeUser("ADMIN") });

    const { unmount } = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Public home</div>} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<div>Admin dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={["/admin/admins"]}>
        <Routes>
          <Route path="/" element={<div>Public home</div>} />
          <Route path="/admin/admins" element={<AdminRoute requireSuperAdmin />}>
            <Route index element={<div>Admin management</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Public home")).toBeInTheDocument();
    expect(screen.queryByText("Admin management")).not.toBeInTheDocument();
  });

  test("allows super admins into super-admin routes", () => {
    setAuthState({ isAuthenticated: true, user: makeUser("SUPER_ADMIN") });

    render(
      <MemoryRouter initialEntries={["/admin/admins"]}>
        <Routes>
          <Route path="/" element={<div>Public home</div>} />
          <Route path="/admin/admins" element={<AdminRoute requireSuperAdmin />}>
            <Route index element={<div>Admin management</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin management")).toBeInTheDocument();
  });
});
