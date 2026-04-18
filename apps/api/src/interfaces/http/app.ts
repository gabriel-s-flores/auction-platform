/* eslint-disable sonarjs/deprecation */
import compress from "@fastify/compress";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import type { FastifyReply } from "fastify";
import Fastify from "fastify";
import { z, ZodError } from "zod";

import { AppError } from "#application/errors/app-error";
import { ALLOWED_MIME_TYPES } from "#application/services/storage-service";
import { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";
import { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";
import { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import { DeleteAuctionImageUseCase } from "#application/use-cases/delete-auction-image.use-case";
import { GetAuctionByIdUseCase } from "#application/use-cases/get-auction-by-id.use-case";
import { ListOpenAuctionsUseCase } from "#application/use-cases/list-open-auctions.use-case";
import { LoginUserUseCase } from "#application/use-cases/login-user.use-case";
import { PlaceBidUseCase } from "#application/use-cases/place-bid.use-case";
import { RegisterUserUseCase } from "#application/use-cases/register-user.use-case";
import { ReorderAuctionImagesUseCase } from "#application/use-cases/reorder-auction-images.use-case";
import { UploadAuctionImagesUseCase } from "#application/use-cases/upload-auction-images.use-case";
import { env } from "#infrastructure/config/env";
import { PrismaAuctionRepository } from "#infrastructure/repositories/prisma-auction.repository";
import { PrismaImageRepository } from "#infrastructure/repositories/prisma-image.repository";
import { PrismaUserRepository } from "#infrastructure/repositories/prisma-user.repository";
import { BunPasswordHasher } from "#infrastructure/security/bun-password-hasher";
import { FastifyTokenService } from "#infrastructure/security/fastify-token-service";
import { CloudinaryStorage } from "#infrastructure/storage/cloudinary-storage";
import { CloseAuctionController } from "#interfaces/http/controllers/auctions/close-auction.controller";
import { CreateAuctionController } from "#interfaces/http/controllers/auctions/create-auction.controller";
import { GetAuctionByIdController } from "#interfaces/http/controllers/auctions/get-auction-by-id.controller";
import { ListOpenAuctionsController } from "#interfaces/http/controllers/auctions/list-open-auctions.controller";
import { LoginController } from "#interfaces/http/controllers/auth/login.controller";
import { RegisterController } from "#interfaces/http/controllers/auth/register.controller";
import { PlaceBidController } from "#interfaces/http/controllers/bids/place-bid.controller";
import { DeleteAuctionImageController } from "#interfaces/http/controllers/images/delete-auction-image.controller";
import { GetAuctionImagesController } from "#interfaces/http/controllers/images/get-auction-images.controller";
import { ReorderAuctionImagesController } from "#interfaces/http/controllers/images/reorder-auction-images.controller";
import { UploadAuctionImagesController } from "#interfaces/http/controllers/images/upload-auction-images.controller";
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

// Cookie names
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

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

  app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
  const storageService = new CloudinaryStorage();
  const passwordHasher = new BunPasswordHasher();
  const tokenService = new FastifyTokenService(app, env.JWT_EXPIRES_IN, env.JWT_REFRESH_EXPIRES_IN);

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
  const closeAuctionController = new CloseAuctionController(
    new CloseAuctionUseCase(auctionRepository)
  );
  const placeBidController = new PlaceBidController(new PlaceBidUseCase(auctionRepository));

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

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.post("/auth/register", {
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

  app.post("/auth/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "15 minutes",
        keyGenerator: (request) => (request.body as { email?: string })?.email || request.ip,
      },
    },
  }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const { accessToken, refreshToken, user } = await loginController.handle(body);
    setAuthCookies(reply, accessToken, refreshToken);
    return { data: { user } };
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token não encontrado" });
    }

    try {
      const decoded = await app.jwt.verify(refreshToken) as { sub: string; email: string; role: string };
      const accessToken = await tokenService.signAccessToken({
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role as "USER" | "ADMIN",
      });
      const newRefreshToken = await tokenService.signRefreshToken({
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role as "USER" | "ADMIN",
      });
      setAuthCookies(reply, accessToken, newRefreshToken);
      return { data: { user: { id: decoded.sub, email: decoded.email, role: decoded.role } } };
    } catch {
      clearAuthCookies(reply);
      return reply.status(401).send({ error: "Refresh token inválido" });
    }
  });

  app.post("/auth/logout", async (request, reply) => {
    clearAuthCookies(reply);
    return { data: { message: "Logout realizado com sucesso" } };
  });

  app.get("/auth/me", async (request, reply) => {
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

  app.get("/auctions", async () => {
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

  app.get("/auctions/:auctionId", async (request) => {
    const params = auctionIdSchema.parse(request.params);
    const auction = await getAuctionByIdController.handle(params.auctionId);
    const images = await getImagesController.handle(params.auctionId);
    return { data: { ...auction, images } };
  });

  app.post("/auctions", async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "Não autenticado" });
    }
    const body = createAuctionSchema.parse(request.body);

    const auction = await createAuctionController.handle({
      ...body,
      sellerId: request.user.sub,
    });

    return reply.status(201).send({ data: auction });
  });

  app.patch("/auctions/:auctionId/close", async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "Não autenticado" });
    }
    const params = auctionIdSchema.parse(request.params);

    await closeAuctionController.handle({
      auctionId: params.auctionId,
      userId: request.user.sub,
      isAdmin: request.user.role === "ADMIN",
    });

    return reply.status(204).send();
  });

  app.post("/auctions/:auctionId/bids", async (request, reply) => {
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

    return reply.status(201).send({ data: result });
  });

  // Image routes
  app.get("/auctions/:auctionId/images", async (request) => {
    const params = auctionIdSchema.parse(request.params);
    return { data: await getImagesController.handle(params.auctionId) };
  });

  app.post("/auctions/:auctionId/images", async (request, reply) => {
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

    return reply.status(201).send({ data: result });
  });

  app.delete("/auctions/:auctionId/images/:imageId", async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: "Não autenticado" });
    }
    const params = imageIdSchema.parse(request.params);

    await deleteImageController.handle({
      auctionId: params.auctionId,
      imageId: params.imageId,
      userId: request.user.sub,
    });

    return reply.status(204).send();
  });

  app.patch("/auctions/:auctionId/images/reorder", async (request, reply) => {
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

  return app;
}