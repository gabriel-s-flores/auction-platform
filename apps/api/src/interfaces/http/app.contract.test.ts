/* eslint-disable sonarjs/no-hardcoded-passwords */
import { afterEach, describe, expect, test } from "bun:test";
import type { FastifyInstance } from "fastify";

import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const VALID_AUCTION_ID = "00000000-0000-4000-8000-000000000001";

const testEnv: Record<string, string> = {
  APP_ENV: "development",
  CLOUDINARY_API_KEY: "test-cloudinary-key",
  CLOUDINARY_API_SECRET: "test-cloudinary-secret",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  COOKIE_SECRET: "test-cookie-secret-with-at-least-32-chars",
  CORS_ORIGIN: "http://localhost:5173",
  CRON_SECRET: "test-cron-secret",
  DATABASE_URL: "postgresql://test:test@localhost:5432/auction_test?schema=public",
  JWT_SECRET: "test-jwt-secret-with-at-least-32-chars",
  LOG_LEVEL: "silent",
  NODE_ENV: "test",
  SECURE_COOKIES: "false",
};

Object.entries(testEnv).forEach(([key, value]) => {
  process.env[key] = value;
  Bun.env[key] = value;
});

let app: FastifyInstance | null = null;

async function makeApp(): Promise<FastifyInstance> {
  const { buildApp } = await import("#interfaces/http/app");
  const testApp = buildApp();
  await testApp.ready();
  app = testApp;

  return testApp;
}

function parseJson(response: { payload: string }): unknown {
  return JSON.parse(response.payload) as unknown;
}

function signCookie(
  testApp: FastifyInstance,
  cookieName: string,
  user: AuthenticatedUser
): string {
  const token = testApp.jwt.sign({
    sub: user.sub,
    email: user.email,
    role: user.role,
  });

  return `${cookieName}=${token}`;
}

afterEach(async () => {
  if (app) {
    await app.close();
    app = null;
  }
});

describe("HTTP auth and RBAC contracts", () => {
  test("rejects authenticated user-panel routes without an access token", async () => {
    const testApp = await makeApp();

    const response = await testApp.inject({
      method: "GET",
      url: "/api/users/me/dashboard",
    });

    expect(response.statusCode).toBe(401);
    expect(parseJson(response)).toEqual({ error: "Não autenticado" });
  });

  test("returns the current user from a valid access-token cookie", async () => {
    const testApp = await makeApp();
    const cookie = signCookie(testApp, ACCESS_TOKEN_COOKIE, {
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    });

    const response = await testApp.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/auth/me",
    });

    expect(response.statusCode).toBe(200);
    expect(parseJson(response)).toEqual({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          role: "USER",
        },
      },
    });
  });

  test("denies regular users from admin endpoints before controllers run", async () => {
    const testApp = await makeApp();
    const cookie = signCookie(testApp, ACCESS_TOKEN_COOKIE, {
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    });

    const response = await testApp.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/admin/users",
    });

    expect(response.statusCode).toBe(403);
    expect(parseJson(response)).toEqual({ error: "Acesso negado" });
  });

  test("denies admins from super-admin-only endpoints", async () => {
    const testApp = await makeApp();
    const cookie = signCookie(testApp, ACCESS_TOKEN_COOKIE, {
      sub: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });

    const response = await testApp.inject({
      headers: { cookie },
      method: "GET",
      url: "/api/admin/admins",
    });

    expect(response.statusCode).toBe(403);
    expect(parseJson(response)).toEqual({ error: "Acesso negado" });
  });
});

describe("HTTP validation and error contracts", () => {
  test("returns the shared validation error shape for invalid registration payloads", async () => {
    const testApp = await makeApp();

    const response = await testApp.inject({
      method: "POST",
      payload: {
        email: "not-an-email",
        name: "A",
        password: "short",
      },
      url: "/api/auth/register",
    });

    expect(response.statusCode).toBe(400);
    expect(parseJson(response)).toEqual({ error: "Dados inválidos" });
  });

  test("returns the shared validation error shape for invalid route params", async () => {
    const testApp = await makeApp();

    const response = await testApp.inject({
      method: "GET",
      url: "/api/auctions/not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
    expect(parseJson(response)).toEqual({ error: "Dados inválidos" });
  });

  test("validates bid payloads before the bid controller reaches persistence", async () => {
    const testApp = await makeApp();
    const cookie = signCookie(testApp, ACCESS_TOKEN_COOKIE, {
      sub: "bidder-1",
      email: "bidder@example.com",
      role: "USER",
    });

    const response = await testApp.inject({
      headers: { cookie },
      method: "POST",
      payload: { amount: 0 },
      url: `/api/auctions/${VALID_AUCTION_ID}/bids`,
    });

    expect(response.statusCode).toBe(400);
    expect(parseJson(response)).toEqual({ error: "Dados inválidos" });
  });

  test("rejects refresh attempts without a refresh token", async () => {
    const testApp = await makeApp();

    const response = await testApp.inject({
      method: "POST",
      url: "/api/auth/refresh",
    });

    expect(response.statusCode).toBe(401);
    expect(parseJson(response)).toEqual({ error: "Refresh token não encontrado" });
  });

  test("rotates a valid refresh token into fresh auth cookies", async () => {
    const testApp = await makeApp();
    const cookie = signCookie(testApp, REFRESH_TOKEN_COOKIE, {
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    });

    const response = await testApp.inject({
      headers: { cookie },
      method: "POST",
      url: "/api/auth/refresh",
    });

    expect(response.statusCode).toBe(200);
    expect(parseJson(response)).toEqual({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          role: "USER",
        },
      },
    });
    expect(response.cookies.map((cookieValue) => cookieValue.name)).toContain(ACCESS_TOKEN_COOKIE);
    expect(response.cookies.map((cookieValue) => cookieValue.name)).toContain(REFRESH_TOKEN_COOKIE);
  });

  test("protects the internal cron endpoint with the cron secret", async () => {
    const testApp = await makeApp();

    const response = await testApp.inject({
      method: "POST",
      url: "/api/internal/cron/close-expired-auctions",
    });

    expect(response.statusCode).toBe(401);
    expect(parseJson(response)).toEqual({ error: "Não autorizado" });
  });
});
