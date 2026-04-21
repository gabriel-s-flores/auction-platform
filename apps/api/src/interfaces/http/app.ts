/* eslint-disable sonarjs/deprecation */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import compress from "@fastify/compress";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import type { FastifyReply, FastifyRequest } from "fastify";
import Fastify from "fastify";
import { z, ZodError } from "zod";

import { AppError } from "#application/errors/app-error";
import { AuditService } from "#application/services/audit-service";
import { ALLOWED_MIME_TYPES } from "#application/services/storage-service";
import { ApproveAuctionUseCase } from "#application/use-cases/admin/approve-auction.use-case";
import { ApprovePendingEditUseCase } from "#application/use-cases/admin/approve-pending-edit.use-case";
import { BanUserUseCase } from "#application/use-cases/admin/ban-user.use-case";
import { CreateAdminUseCase } from "#application/use-cases/admin/create-admin.use-case";
import { DemoteAdminUseCase } from "#application/use-cases/admin/demote-admin.use-case";
import { ExportActivityLogsUseCase } from "#application/use-cases/admin/export-activity-logs.use-case";
import { GetDashboardStatsUseCase } from "#application/use-cases/admin/get-dashboard-stats.use-case";
import { GetUserDetailUseCase } from "#application/use-cases/admin/get-user-detail.use-case";
import { ListActivityLogsUseCase } from "#application/use-cases/admin/list-activity-logs.use-case";
import { ListAdminNotificationsUseCase } from "#application/use-cases/admin/list-admin-notifications.use-case";
import { ListAdminsUseCase } from "#application/use-cases/admin/list-admins.use-case";
import { ListDashboardRecentAuctionsUseCase } from "#application/use-cases/admin/list-dashboard-recent-auctions.use-case";
import { ListPendingAuctionsUseCase } from "#application/use-cases/admin/list-pending-auctions.use-case";
import { ListPendingEditsUseCase } from "#application/use-cases/admin/list-pending-edits.use-case";
import { ListUsersUseCase } from "#application/use-cases/admin/list-users.use-case";
import { MarkAdminNotificationReadUseCase } from "#application/use-cases/admin/mark-admin-notification-read.use-case";
import { MarkAdminNotificationUnreadUseCase } from "#application/use-cases/admin/mark-admin-notification-unread.use-case";
import { PromoteUserUseCase } from "#application/use-cases/admin/promote-user.use-case";
import { RejectAuctionUseCase } from "#application/use-cases/admin/reject-auction.use-case";
import { RejectPendingEditUseCase } from "#application/use-cases/admin/reject-pending-edit.use-case";
import { UnbanUserUseCase } from "#application/use-cases/admin/unban-user.use-case";
import { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";
import { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";
import { CloseExpiredAuctionsUseCase } from "#application/use-cases/close-expired-auctions.use-case";
import { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import { DeleteAuctionImageUseCase } from "#application/use-cases/delete-auction-image.use-case";
import { GetAuctionByIdUseCase } from "#application/use-cases/get-auction-by-id.use-case";
import { GetUserDashboardSummaryUseCase } from "#application/use-cases/get-user-dashboard-summary.use-case";
import { ListOpenAuctionsUseCase } from "#application/use-cases/list-open-auctions.use-case";
import { ListUserAuctionsUseCase } from "#application/use-cases/list-user-auctions.use-case";
import { ListUserBidsUseCase } from "#application/use-cases/list-user-bids.use-case";
import { ListUserPendingEditsUseCase } from "#application/use-cases/list-user-pending-edits.use-case";
import { ListUserWinsUseCase } from "#application/use-cases/list-user-wins.use-case";
import { LoginUserUseCase } from "#application/use-cases/login-user.use-case";
import { PlaceBidUseCase } from "#application/use-cases/place-bid.use-case";
import { RegisterUserUseCase } from "#application/use-cases/register-user.use-case";
import { ReorderAuctionImagesUseCase } from "#application/use-cases/reorder-auction-images.use-case";
import { SubmitAuctionEditUseCase } from "#application/use-cases/submit-auction-edit.use-case";
import { UploadAuctionImagesUseCase } from "#application/use-cases/upload-auction-images.use-case";
import { env } from "#infrastructure/config/env";
import { PrismaActivityLogRepository } from "#infrastructure/repositories/prisma-activity-log.repository";
import { PrismaAdminNotificationReadRepository } from "#infrastructure/repositories/prisma-admin-notification-read.repository";
import { PrismaAuctionRepository } from "#infrastructure/repositories/prisma-auction.repository";
import { PrismaImageRepository } from "#infrastructure/repositories/prisma-image.repository";
import { PrismaPendingEditRepository } from "#infrastructure/repositories/prisma-pending-edit.repository";
import { PrismaUserRepository } from "#infrastructure/repositories/prisma-user.repository";
import { BunPasswordHasher } from "#infrastructure/security/bun-password-hasher";
import { FastifyTokenService } from "#infrastructure/security/fastify-token-service";
import { CloudinaryStorage } from "#infrastructure/storage/cloudinary-storage";
import { ApproveAuctionController } from "#interfaces/http/controllers/admin/approve-auction.controller";
import { ApprovePendingEditController } from "#interfaces/http/controllers/admin/approve-pending-edit.controller";
import { BanUserController } from "#interfaces/http/controllers/admin/ban-user.controller";
import { CreateAdminController } from "#interfaces/http/controllers/admin/create-admin.controller";
import { DemoteAdminController } from "#interfaces/http/controllers/admin/demote-admin.controller";
import { ExportActivityLogsController } from "#interfaces/http/controllers/admin/export-activity-logs.controller";
import { GetDashboardStatsController } from "#interfaces/http/controllers/admin/get-dashboard-stats.controller";
import { GetUserDetailController } from "#interfaces/http/controllers/admin/get-user-detail.controller";
import { ListActivityLogsController } from "#interfaces/http/controllers/admin/list-activity-logs.controller";
import { ListAdminNotificationsController } from "#interfaces/http/controllers/admin/list-admin-notifications.controller";
import { ListAdminsController } from "#interfaces/http/controllers/admin/list-admins.controller";
import { ListDashboardRecentAuctionsController } from "#interfaces/http/controllers/admin/list-dashboard-recent-auctions.controller";
import { ListPendingAuctionsController } from "#interfaces/http/controllers/admin/list-pending-auctions.controller";
import { ListPendingEditsController } from "#interfaces/http/controllers/admin/list-pending-edits.controller";
import { ListUsersController } from "#interfaces/http/controllers/admin/list-users.controller";
import { MarkAdminNotificationReadController } from "#interfaces/http/controllers/admin/mark-admin-notification-read.controller";
import { MarkAdminNotificationUnreadController } from "#interfaces/http/controllers/admin/mark-admin-notification-unread.controller";
import { PromoteUserController } from "#interfaces/http/controllers/admin/promote-user.controller";
import { RejectAuctionController } from "#interfaces/http/controllers/admin/reject-auction.controller";
import { RejectPendingEditController } from "#interfaces/http/controllers/admin/reject-pending-edit.controller";
import { UnbanUserController } from "#interfaces/http/controllers/admin/unban-user.controller";
import { CloseAuctionController } from "#interfaces/http/controllers/auctions/close-auction.controller";
import { CloseExpiredAuctionsController } from "#interfaces/http/controllers/auctions/close-expired-auctions.controller";
import { CreateAuctionController } from "#interfaces/http/controllers/auctions/create-auction.controller";
import { GetAuctionByIdController } from "#interfaces/http/controllers/auctions/get-auction-by-id.controller";
import { ListOpenAuctionsController } from "#interfaces/http/controllers/auctions/list-open-auctions.controller";
import { SubmitAuctionEditController } from "#interfaces/http/controllers/auctions/submit-auction-edit.controller";
import { LoginController } from "#interfaces/http/controllers/auth/login.controller";
import { RegisterController } from "#interfaces/http/controllers/auth/register.controller";
import { PlaceBidController } from "#interfaces/http/controllers/bids/place-bid.controller";
import { DeleteAuctionImageController } from "#interfaces/http/controllers/images/delete-auction-image.controller";
import { GetAuctionImagesController } from "#interfaces/http/controllers/images/get-auction-images.controller";
import { ReorderAuctionImagesController } from "#interfaces/http/controllers/images/reorder-auction-images.controller";
import { UploadAuctionImagesController } from "#interfaces/http/controllers/images/upload-auction-images.controller";
import { GetUserDashboardController } from "#interfaces/http/controllers/users/get-user-dashboard.controller";
import { ListUserAuctionsController } from "#interfaces/http/controllers/users/list-user-auctions.controller";
import { ListUserBidsController } from "#interfaces/http/controllers/users/list-user-bids.controller";
import { ListUserPendingEditsController } from "#interfaces/http/controllers/users/list-user-pending-edits.controller";
import { ListUserWinsController } from "#interfaces/http/controllers/users/list-user-wins.controller";
import { requireAdmin, requireAuthenticated, requireSuperAdmin } from "#interfaces/http/middleware/require-role";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

const registerSchema = z.object({
 name: z.string().min(2).max(100),
 email: z.string().email({}).max(255),
 password: z.string().min(8).max(128),
});

const loginSchema = z.object({
 email: z.string().email({}).max(255),
 password: z.string().min(1),
});

const createAuctionSchema = z.object({
 title: z.string().min(3).max(200),
 description: z.string().max(5000).nullable().optional().default(null),
 startingPrice: z.number().int().positive(),
 endsAt: z.string().datetime({}),
});

const auctionIdSchema = z.object({
 auctionId: z.string().uuid({}),
});

const placeBidSchema = z.object({
 amount: z.number().int().positive(),
});

const reorderImagesSchema = z.object({
 positions: z.array(
 z.object({
 id: z.string().uuid(),
 position: z.number().int().min(0),
 isPrimary: z.boolean(),
 })
 ),
});

const imageIdSchema = z.object({
 auctionId: z.string().uuid(),
 imageId: z.string().uuid(),
});

const rejectAuctionSchema = z.object({
 reason: z.string().min(5).max(500),
});

const createAdminSchema = z.object({
 name: z.string().min(2).max(100),
 email: z.string().email({}).max(255),
 password: z.string().min(8).max(128),
});

const adminIdSchema = z.object({
 adminId: z.string().uuid({}),
});

// Cookie names
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const FRONTEND_DIST_PATH = fileURLToPath(new URL("../../../../web/dist", import.meta.url));

function getAllowedOrigins(): string[] {
 return env.CORS_ORIGIN.split(",")
 .map((origin) => origin.trim())
 .filter(Boolean);
}

function isApiRequest(pathname: string): boolean {
 return pathname === "/api" || pathname.startsWith("/api/") || pathname.startsWith("/socket.io");
}

function isStaticAssetRequest(pathname: string): boolean {
 return extname(pathname) !== "";
}

function resolveStaticFilePath(pathname: string): string | null {
 const normalizedPathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  let decodedPathname: string;

  try {
    decodedPathname = decodeURIComponent(normalizedPathname);
  } catch {
    return null;
  }

 const resolvedPath = resolve(join(FRONTEND_DIST_PATH, decodedPathname));
  const relativePath = relative(FRONTEND_DIST_PATH, resolvedPath);

  if (relativePath.startsWith("..") || relativePath === "") {
 return null;
 }

 return resolvedPath;
}

async function sendStaticFile(reply: FastifyReply, filePath: string): Promise<FastifyReply> {
 const file = Bun.file(filePath);
 const content = Buffer.from(await file.arrayBuffer());

 reply.type(file.type || "application/octet-stream");
 return reply.send(content);
}

export function buildApp() {
 const app = Fastify({
 logger: {
 level: env.LOG_LEVEL,
 base: {
 service: "auction-api",
 appEnv: env.APP_ENV,
 nodeEnv: env.NODE_ENV,
 },
 },
 });

 app.setErrorHandler((error, request, reply) => {
 request.log.error({ error }, "Unhandled error");
 if (error instanceof AppError) {
 return reply.status(error.statusCode).send({ error: error.message });
 }
 if (error instanceof ZodError) {
 return reply.status(400).send({ error: "Dados inválidos" });
 }
 return reply.status(500).send({ error: "Erro interno" });
 });

 const allowedOrigins = getAllowedOrigins();

 app.register(cors, {
 origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
 methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
 allowedHeaders: ["Content-Type", "Authorization", "X-Cron-Secret"],
 credentials: true,
 });

 // Compression (Brotli > gzip > deflate)
 app.register(compress, {
 global: true,
 encodings: ["br", "gzip", "deflate"],
 });

 // Security headers including X-Content-Type-Options: nosniff
 app.register(helmet, {
 contentSecurityPolicy: {
 directives: {
 defaultSrc: ["'self'"],
 imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
 scriptSrc: ["'self'"],
 // 'unsafe-inline' required for Tailwind CSS runtime styling
 styleSrc: ["'self'", "'unsafe-inline'"],
 connectSrc: ["'self'"],
 fontSrc: ["'self'"],
 objectSrc: ["'none'"],
 baseUri: ["'self'"],
 formAction: ["'self'"],
 frameAncestors: ["'none'"],
 upgradeInsecureRequests: [],
 },
 },
 crossOriginEmbedderPolicy: false,
 hsts: {
 maxAge: 31536000, // 1 year
 includeSubDomains: true,
 preload: true,
 },
 referrerPolicy: {
 policy: "strict-origin-when-cross-origin",
 },
 });

 app.register(jwt, {
 secret: env.JWT_SECRET,
 });

 app.register(cookie, {
 secret: env.COOKIE_SECRET,
 parseOptions: {
 httpOnly: true,
 secure: env.SECURE_COOKIES,
 sameSite: "lax",
 path: "/",
 },
 });

 // Global rate limiting: 100 requests per 15 minutes per IP
 app.register(rateLimit, {
 max: 100,
 timeWindow: "15 minutes",
 keyGenerator: (request) => request.ip,
 addHeaders: {
 "x-ratelimit-limit": true,
 "x-ratelimit-remaining": true,
 "x-ratelimit-reset": true,
 "retry-after": true,
 },
 });

 app.register(multipart, {
 limits: {
 fileSize: env.UPLOAD_MAX_SIZE,
 files: 10, // Max 10 files per request
 },
 });

 // Permissions-Policy: disable sensitive APIs not used by the application
 app.addHook("onSend", async (_request, reply) => {
 reply.header(
 "Permissions-Policy",
 "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
 );
 });

 // Cache-Control for API responses: prevent caching of sensitive/dynamic data
 app.addHook("onSend", async (_request, reply) => {
 const current = reply.getHeader("cache-control");
 if (!current) {
 reply.header(
 "Cache-Control",
 "no-store, no-cache, must-revalidate, proxy-revalidate"
 );
 reply.header("Pragma", "no-cache");
 reply.header("Expires", "0");
 }
 });

 const userRepository = new PrismaUserRepository();
 const auctionRepository = new PrismaAuctionRepository();
 const imageRepository = new PrismaImageRepository();
 const pendingEditRepository = new PrismaPendingEditRepository();
 const activityLogRepository = new PrismaActivityLogRepository();
 const adminNotificationReadRepository = new PrismaAdminNotificationReadRepository();
 const storageService = new CloudinaryStorage();
 const passwordHasher = new BunPasswordHasher();
 const tokenService = new FastifyTokenService(app, env.JWT_EXPIRES_IN, env.JWT_REFRESH_EXPIRES_IN);
 const auditService = new AuditService(activityLogRepository);

 const registerController = new RegisterController(
 new RegisterUserUseCase(userRepository, passwordHasher)
 );
 const loginController = new LoginController(
 new LoginUserUseCase(new AuthenticateUserUseCase(userRepository, passwordHasher), tokenService)
 );

 const listAuctionsController = new ListOpenAuctionsController(
 new ListOpenAuctionsUseCase(auctionRepository)
 );
 const getAuctionByIdController = new GetAuctionByIdController(
 new GetAuctionByIdUseCase(auctionRepository)
 );
 const createAuctionController = new CreateAuctionController(
 new CreateAuctionUseCase(auctionRepository)
 );
 const submitAuctionEditController = new SubmitAuctionEditController(
 new SubmitAuctionEditUseCase(auctionRepository, pendingEditRepository, auditService)
 );
 const closeAuctionController = new CloseAuctionController(
 new CloseAuctionUseCase(auctionRepository)
 );
 const closeExpiredAuctionsController = new CloseExpiredAuctionsController(
 new CloseExpiredAuctionsUseCase(auctionRepository)
 );
 const placeBidController = new PlaceBidController(new PlaceBidUseCase(auctionRepository));
  const getUserDashboardController = new GetUserDashboardController(
    new GetUserDashboardSummaryUseCase(userRepository, auctionRepository)
  );
  const listUserAuctionsController = new ListUserAuctionsController(
    new ListUserAuctionsUseCase(auctionRepository)
  );
  const listUserWinsController = new ListUserWinsController(
    new ListUserWinsUseCase(auctionRepository)
  );
  const listUserBidsController = new ListUserBidsController(
    new ListUserBidsUseCase(auctionRepository)
  );
  const listUserPendingEditsController = new ListUserPendingEditsController(
    new ListUserPendingEditsUseCase(pendingEditRepository)
  );

 // Image controllers
 const uploadImagesController = new UploadAuctionImagesController(
 new UploadAuctionImagesUseCase(
 imageRepository,
 auctionRepository,
 storageService,
 env.UPLOAD_MAX_SIZE
 )
 );
 const getImagesController = new GetAuctionImagesController(imageRepository, storageService);
 const deleteImageController = new DeleteAuctionImageController(
 new DeleteAuctionImageUseCase(imageRepository, auctionRepository, storageService)
 );
 const reorderImagesController = new ReorderAuctionImagesController(
 new ReorderAuctionImagesUseCase(imageRepository, auctionRepository)
 );

 // Admin controllers
 const exportActivityLogsController = new ExportActivityLogsController(
 new ExportActivityLogsUseCase(activityLogRepository)
 );
 const approvePendingEditController = new ApprovePendingEditController(
 new ApprovePendingEditUseCase(pendingEditRepository, auditService)
 );
 const createAdminController = new CreateAdminController(
 new CreateAdminUseCase(userRepository, passwordHasher, auditService)
 );
 const demoteAdminController = new DemoteAdminController(
 new DemoteAdminUseCase(userRepository, auditService)
 );
 const getDashboardStatsController = new GetDashboardStatsController(
 new GetDashboardStatsUseCase()
 );
 const getUserDetailController = new GetUserDetailController(
 new GetUserDetailUseCase(userRepository)
 );
 const listActivityLogsController = new ListActivityLogsController(
 new ListActivityLogsUseCase(activityLogRepository)
 );
 const listAdminNotificationsController = new ListAdminNotificationsController(
 new ListAdminNotificationsUseCase(activityLogRepository, adminNotificationReadRepository)
 );
 const listPendingEditsController = new ListPendingEditsController(
 new ListPendingEditsUseCase(pendingEditRepository)
 );
 const listAdminsController = new ListAdminsController(
 new ListAdminsUseCase(userRepository)
 );
 const listDashboardRecentAuctionsController = new ListDashboardRecentAuctionsController(
 new ListDashboardRecentAuctionsUseCase()
 );
 const listPendingAuctionsController = new ListPendingAuctionsController(
 new ListPendingAuctionsUseCase()
 );
 const listUsersController = new ListUsersController(
 new ListUsersUseCase(userRepository)
 );
 const markAdminNotificationReadController = new MarkAdminNotificationReadController(
 new MarkAdminNotificationReadUseCase(activityLogRepository, adminNotificationReadRepository)
 );
 const markAdminNotificationUnreadController = new MarkAdminNotificationUnreadController(
 new MarkAdminNotificationUnreadUseCase(activityLogRepository, adminNotificationReadRepository)
 );
 const approveAuctionController = new ApproveAuctionController(
 new ApproveAuctionUseCase(auctionRepository, auditService)
 );
 const banUserController = new BanUserController(
 new BanUserUseCase(userRepository, auditService)
 );
 const promoteUserController = new PromoteUserController(
 new PromoteUserUseCase(userRepository, auditService)
 );
 const rejectAuctionController = new RejectAuctionController(
 new RejectAuctionUseCase(auctionRepository, auditService)
 );
 const rejectPendingEditController = new RejectPendingEditController(
 new RejectPendingEditUseCase(pendingEditRepository, auditService)
 );
 const unbanUserController = new UnbanUserController(
 new UnbanUserUseCase(userRepository, auditService)
 );

 const hasFrontendBuild = existsSync(FRONTEND_DIST_PATH);

 // Helper to set auth cookies
 function setAuthCookies(
 reply: FastifyReply,
 accessToken: string,
 refreshToken: string
 ) {
 reply.setCookie(ACCESS_TOKEN_COOKIE, accessToken, {
 httpOnly: true,
 secure: env.SECURE_COOKIES,
 sameSite: "lax",
 path: "/",
 maxAge: 900, // 15 minutes
 });
 reply.setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
 httpOnly: true,
 secure: env.SECURE_COOKIES,
 sameSite: "lax",
 path: "/",
 maxAge: 604800, // 7 days
 });
 }

 // Helper to clear auth cookies
 function clearAuthCookies(reply: FastifyReply) {
 reply.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
 reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
 }

 // Custom authentication hook that reads from cookie
 // Note: @fastify/jwt already decorates request with 'user', so we don't need decorateRequest here
 app.addHook("onRequest", async (request, reply) => {
 const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];
 if (!accessToken) {
 return;
 }

 try {
 const decoded = await app.jwt.verify(accessToken) as { sub: string; email: string; role: string };
 request.user = {
 sub: decoded.sub,
 email: decoded.email,
 role: decoded.role as AuthenticatedUser["role"],
 };
 } catch {
 // Token invalid or expired, clear the cookie
 reply.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
 }
 });

 app.get("/api/health", async () => ({
 status: "ok",
 timestamp: new Date().toISOString(),
 }));

 app.post("/api/auth/register", {
 config: {
 rateLimit: {
 max: 5,
 timeWindow: "15 minutes",
 keyGenerator: (request) => (request.body as { email?: string })?.email || request.ip,
 },
 },
 }, async (request, reply) => {
 const body = registerSchema.parse(request.body);
 const user = await registerController.handle(body);
 return reply.status(201).send({ data: user });
 });

 app.post("/api/auth/login", {
 config: {
 rateLimit: {
 max: 5,
 timeWindow: "15 minutes",
 keyGenerator: (request) => (request.body as { email?: string })?.email || request.ip,
 },
 },
 }, async (request, reply) => {
 const body = loginSchema.parse(request.body);
 try {
 const { accessToken, refreshToken, user } = await loginController.handle(body);
 setAuthCookies(reply, accessToken, refreshToken);
 await auditService.log(
 "USER_LOGIN",
 "user",
 user.id,
 null,
 {
 actorId: user.id,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );
 return { data: { user } };
 } catch (error) {
 await auditService.log(
 "LOGIN_FAILED",
 "auth_attempt",
 randomUUID(),
 { email: body.email },
 {
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );
 throw error;
 }
 });

 app.post("/api/auth/refresh", async (request, reply) => {
 const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
 if (!refreshToken) {
 return reply.status(401).send({ error: "Refresh token não encontrado" });
 }

 try {
 const decoded = await app.jwt.verify(refreshToken) as { sub: string; email: string; role: string };
 const accessToken = await tokenService.signAccessToken({
 sub: decoded.sub,
 email: decoded.email,
  role: decoded.role as AuthenticatedUser["role"],
 });
 const newRefreshToken = await tokenService.signRefreshToken({
 sub: decoded.sub,
 email: decoded.email,
  role: decoded.role as AuthenticatedUser["role"],
 });
 setAuthCookies(reply, accessToken, newRefreshToken);
 return { data: { user: { id: decoded.sub, email: decoded.email, role: decoded.role } } };
 } catch {
 clearAuthCookies(reply);
 return reply.status(401).send({ error: "Refresh token inválido" });
 }
 });

 app.post("/api/auth/logout", async (request, reply) => {
 if (request.user) {
 await auditService.log(
 "USER_LOGOUT",
 "user",
 request.user.sub,
 null,
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );
 }
 clearAuthCookies(reply);
 return { data: { message: "Logout realizado com sucesso" } };
 });

 app.get("/api/auth/me", async (request, reply) => {
 const accessToken = request.cookies[ACCESS_TOKEN_COOKIE];
 if (!accessToken) {
 return reply.status(401).send({ error: "Não autenticado" });
 }

 try {
 const decoded = await app.jwt.verify(accessToken) as { sub: string; email: string; role: string };
 return {
 data: {
 user: {
 id: decoded.sub,
 email: decoded.email,
 role: decoded.role,
 },
 },
 };
 } catch {
 return reply.status(401).send({ error: "Token inválido" });
 }
 });

 app.get("/api/auctions", async () => {
 const auctions = await listAuctionsController.handle();
 // Fetch images for each auction
 const auctionsWithImages = await Promise.all(
 auctions.map(async (auction) => ({
 ...auction,
 images: await getImagesController.handle(auction.id),
 }))
 );
 return { data: auctionsWithImages };
 });

 app.get("/api/auctions/:auctionId", async (request) => {
 const params = auctionIdSchema.parse(request.params);
 const auction = await getAuctionByIdController.handle(params.auctionId);
 const images = await getImagesController.handle(params.auctionId);
 return { data: { ...auction, images } };
 });

 app.post("/api/auctions", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }
 const body = createAuctionSchema.parse(request.body);

 const auction = await createAuctionController.handle({
 ...body,
 sellerId: request.user.sub,
 });

 await auditService.log(
 "AUCTION_CREATED",
 "auction",
 auction.id,
 { title: auction.title },
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );

 return reply.status(201).send({ data: auction });
 });

 app.post("/api/auctions/:auctionId/edits", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }

 return submitAuctionEditController.handle(request, reply);
 });

 app.patch("/api/auctions/:auctionId/close", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }
 const params = auctionIdSchema.parse(request.params);

 await closeAuctionController.handle({
 auctionId: params.auctionId,
 userId: request.user.sub,
  isAdmin: request.user.role === "ADMIN" || request.user.role === "SUPER_ADMIN",
 });

 await auditService.log(
 "AUCTION_CLOSED",
 "auction",
 params.auctionId,
 null,
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );

 return reply.status(204).send();
 });

 app.post("/api/auctions/:auctionId/bids", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }

 const params = auctionIdSchema.parse(request.params);
 const body = placeBidSchema.parse(request.body);

 const result = await placeBidController.handle({
 auctionId: params.auctionId,
 bidderId: request.user.sub,
 amount: body.amount,
 });

 await auditService.log(
 "BID_PLACED",
 "bid",
 result.bid.id,
 {
 auctionId: params.auctionId,
 amount: result.bid.amount,
 },
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );

 return reply.status(201).send({ data: result });
 });

 // Image routes
 app.get("/api/auctions/:auctionId/images", async (request) => {
 const params = auctionIdSchema.parse(request.params);
 return { data: await getImagesController.handle(params.auctionId) };
 });

 app.post("/api/auctions/:auctionId/images", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }
 const params = auctionIdSchema.parse(request.params);

 const parts = request.parts();
 const files: Array<{ buffer: Buffer; filename: string; mimeType: string }> = [];

 for await (const part of parts) {
 if (part.type === "file") {
 const buffer = await part.toBuffer();
 // Validate MIME type
 if (!ALLOWED_MIME_TYPES.includes(part.mimetype as typeof ALLOWED_MIME_TYPES[number])) {
 return reply.status(400).send({
 error: `Tipo de arquivo não permitido: ${part.mimetype}. Use JPEG, PNG ou WebP`,
 });
 }
 files.push({
 buffer,
 filename: part.filename,
 mimeType: part.mimetype,
 });
 }
 }

 if (files.length === 0) {
 return reply.status(400).send({ error: "Nenhum arquivo enviado" });
 }

 const result = await uploadImagesController.handle({
 auctionId: params.auctionId,
 files,
 userId: request.user.sub,
 });

 await Promise.all(
 result.map((image) => auditService.log(
 "IMAGE_UPLOADED",
 "image",
 image.id,
 {
 auctionId: params.auctionId,
 url: image.url,
 },
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 ))
 );

 return reply.status(201).send({ data: result });
 });

 app.delete("/api/auctions/:auctionId/images/:imageId", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }
 const params = imageIdSchema.parse(request.params);

 await deleteImageController.handle({
 auctionId: params.auctionId,
 imageId: params.imageId,
 userId: request.user.sub,
 });

 await auditService.log(
 "IMAGE_DELETED",
 "image",
 params.imageId,
 {
 auctionId: params.auctionId,
 },
 {
 actorId: request.user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 );

 return reply.status(204).send();
 });

 app.patch("/api/auctions/:auctionId/images/reorder", async (request, reply) => {
 if (!request.user) {
 return reply.status(401).send({ error: "Não autenticado" });
 }
 const params = auctionIdSchema.parse(request.params);
 const body = reorderImagesSchema.parse(request.body);

 await reorderImagesController.handle({
 auctionId: params.auctionId,
 userId: request.user.sub,
 positions: body.positions,
 });

 return reply.status(204).send();
 });

  // ==================== USER PANEL ROUTES ====================

  app.get("/api/users/me/dashboard", { preHandler: requireAuthenticated() }, async (request, reply) => {
  return getUserDashboardController.handle(request, reply);
  });

  app.get("/api/users/me/auctions", { preHandler: requireAuthenticated() }, async (request, reply) => {
  return listUserAuctionsController.handle(request, reply);
  });

  app.get("/api/users/me/wins", { preHandler: requireAuthenticated() }, async (request, reply) => {
  return listUserWinsController.handle(request, reply);
  });

  app.get("/api/users/me/bids", { preHandler: requireAuthenticated() }, async (request, reply) => {
  return listUserBidsController.handle(request, reply);
  });

  app.get("/api/users/me/edits", { preHandler: requireAuthenticated() }, async (request, reply) => {
  return listUserPendingEditsController.handle(request, reply);
  });

 // ==================== ADMIN ROUTES ====================

 // Dashboard stats
 app.get("/api/admin/dashboard/stats", { preHandler: requireAdmin() }, async (_request, reply) => {
 return getDashboardStatsController.handle(reply);
 });

 // Dashboard recent auctions
 app.get("/api/admin/dashboard/recent-auctions", { preHandler: requireAdmin() }, async (_request, reply) => {
 return listDashboardRecentAuctionsController.handle(reply);
 });

 // Activity logs
 app.get("/api/admin/logs", { preHandler: requireAdmin() }, async (request, reply) => {
 return listActivityLogsController.handle(request, reply);
 });

 // Activity logs export
 app.get("/api/admin/logs/export", { preHandler: requireAdmin() }, async (request, reply) => {
 return exportActivityLogsController.handle(request, reply);
 });

 // Admin notifications
 app.get("/api/admin/notifications", { preHandler: requireAdmin() }, async (request, reply) => {
 return listAdminNotificationsController.handle(request, reply);
 });

 app.patch("/api/admin/notifications/:notificationId/read", { preHandler: requireAdmin() }, async (request, reply) => {
 return markAdminNotificationReadController.handle(request, reply);
 });

 app.patch("/api/admin/notifications/:notificationId/unread", { preHandler: requireAdmin() }, async (request, reply) => {
 return markAdminNotificationUnreadController.handle(request, reply);
 });

 // Pending auction edits review
 app.get("/api/admin/edits/pending", { preHandler: requireAdmin() }, async (request, reply) => {
 return listPendingEditsController.handle(request, reply);
 });

 app.patch("/api/admin/edits/:editId/approve", { preHandler: requireAdmin() }, async (request, reply) => {
 return approvePendingEditController.handle(request, reply);
 });

 app.patch("/api/admin/edits/:editId/reject", { preHandler: requireAdmin() }, async (request, reply) => {
 return rejectPendingEditController.handle(request, reply);
 });

 // Admin management (SUPER_ADMIN)
 app.get("/api/admin/admins", { preHandler: requireSuperAdmin() }, async (_request, reply) => {
 return listAdminsController.handle(reply);
 });

 app.post("/api/admin/admins", { preHandler: requireSuperAdmin() }, async (request, reply) => {
 request.body = createAdminSchema.parse(request.body);
 return createAdminController.handle(
 request as FastifyRequest<{ Body: { name: string; email: string; password: string } }>,
 reply
 );
 });

 app.patch("/api/admin/admins/:adminId/demote", { preHandler: requireSuperAdmin() }, async (request, reply) => {
 request.params = adminIdSchema.parse(request.params);
 return demoteAdminController.handle(
 request as FastifyRequest<{ Params: { adminId: string } }>,
 reply
 );
 });

 // Users management
 app.get("/api/admin/users", { preHandler: requireAdmin() }, async (request, reply) => {
 return listUsersController.handle(request, reply);
 });

 app.get("/api/admin/users/:userId", { preHandler: requireAdmin() }, async (request, reply) => {
 return getUserDetailController.handle(request, reply);
 });

 app.patch("/api/admin/users/:userId/ban", { preHandler: requireAdmin() }, async (request, reply) => {
 return banUserController.handle(request, reply);
 });

 app.patch("/api/admin/users/:userId/unban", { preHandler: requireAdmin() }, async (request, reply) => {
 return unbanUserController.handle(request, reply);
 });

 app.patch("/api/admin/users/:userId/promote", { preHandler: requireSuperAdmin() }, async (request, reply) => {
 return promoteUserController.handle(request, reply);
 });

 // List pending auctions for approval
 app.get("/api/admin/auctions/pending", { preHandler: requireAdmin() }, async (request, reply) => {
 return listPendingAuctionsController.handle(request, reply);
 });

 // Approve an auction
 app.patch("/api/admin/auctions/:auctionId/approve", { preHandler: requireAdmin() }, async (request, reply) => {
 return approveAuctionController.handle(request, reply);
 });

 // Reject an auction
 app.patch("/api/admin/auctions/:auctionId/reject", { preHandler: requireAdmin() }, async (request, reply) => {
 rejectAuctionSchema.parse(request.body);
 return rejectAuctionController.handle(request, reply);
 });

 app.post("/api/internal/cron/close-expired-auctions", async (request, reply) => {
 const cronSecret = request.headers["x-cron-secret"];

 if (!env.CRON_SECRET || cronSecret !== env.CRON_SECRET) {
 return reply.status(401).send({ error: "Não autorizado" });
 }

 const result = await closeExpiredAuctionsController.handle();

 await Promise.all(
 result.closedAuctionIds.map((auctionId) =>
 auditService.log(
 "AUCTION_AUTO_CLOSED",
 "auction",
 auctionId,
 {
 processedAt: result.processedAt,
 trigger: "cron",
 },
 {
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"],
 }
 )
 )
 );

 return { data: result };
 });

 if (hasFrontendBuild) {
 app.setNotFoundHandler(async (request, reply) => {
 const pathname = request.url.split("?")[0] || "/";

 if (request.method !== "GET") {
 return reply.status(404).send({ error: "Rota não encontrada" });
 }

 if (isStaticAssetRequest(pathname)) {
 const assetPath = resolveStaticFilePath(pathname);

 if (assetPath && existsSync(assetPath)) {
 return sendStaticFile(reply, assetPath);
 }

 return reply.status(404).send({ error: "Arquivo não encontrado" });
 }

 if (!isApiRequest(pathname)) {
 return sendStaticFile(reply.type("text/html; charset=utf-8"), join(FRONTEND_DIST_PATH, "index.html"));
 }

 return reply.status(404).send({ error: "Rota não encontrada" });
 });
 }

 return app;
}
