import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { z,ZodError } from "zod";

import { AppError } from "#application/errors/app-error";
import { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";
import { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";
import { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import { GetAuctionByIdUseCase } from "#application/use-cases/get-auction-by-id.use-case";
import { ListOpenAuctionsUseCase } from "#application/use-cases/list-open-auctions.use-case";
import { LoginUserUseCase } from "#application/use-cases/login-user.use-case";
import { PlaceBidUseCase } from "#application/use-cases/place-bid.use-case";
import { RegisterUserUseCase } from "#application/use-cases/register-user.use-case";
import { env } from "#infrastructure/config/env";
import { PrismaAuctionRepository } from "#infrastructure/repositories/prisma-auction.repository";
import { PrismaUserRepository } from "#infrastructure/repositories/prisma-user.repository";
import { BunPasswordHasher } from "#infrastructure/security/bun-password-hasher";
import { FastifyTokenService } from "#infrastructure/security/fastify-token-service";
import { CloseAuctionController } from "#interfaces/http/controllers/auctions/close-auction.controller";
import { CreateAuctionController } from "#interfaces/http/controllers/auctions/create-auction.controller";
import { GetAuctionByIdController } from "#interfaces/http/controllers/auctions/get-auction-by-id.controller";
import { ListOpenAuctionsController } from "#interfaces/http/controllers/auctions/list-open-auctions.controller";
import { LoginController } from "#interfaces/http/controllers/auth/login.controller";
import { RegisterController } from "#interfaces/http/controllers/auth/register.controller";
import { PlaceBidController } from "#interfaces/http/controllers/bids/place-bid.controller";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const createAuctionSchema = z.object({
  title: z.string().min(3),
  description: z.string().nullable().optional().default(null),
  startingPrice: z.number().int().positive(),
  endsAt: z.string().datetime()
});

const auctionIdSchema = z.object({
  auctionId: z.string().uuid()
});

const placeBidSchema = z.object({
  amount: z.number().int().positive()
});

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      base: {
        service: "auction-api",
        appEnv: env.APP_ENV,
        nodeEnv: env.NODE_ENV
      }
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({ error: "Dados inválidos", details: error.flatten() });
    }

    return reply.status(500).send({ error: "Erro interno" });
  });

  app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  app.register(jwt, {
    secret: env.JWT_SECRET
  });

  const userRepository = new PrismaUserRepository();
  const auctionRepository = new PrismaAuctionRepository();
  const passwordHasher = new BunPasswordHasher();
  const tokenService = new FastifyTokenService(async (payload) =>
    app.jwt.sign(payload, { expiresIn: env.JWT_EXPIRES_IN })
  );

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

  app.get("/health", async () => ({
    status: "ok",
    appEnv: env.APP_ENV,
    nodeEnv: env.NODE_ENV,
    uptimeInSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  }));

  app.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const user = await registerController.handle(body);
    return reply.status(201).send({ data: user });
  });

  app.post("/auth/login", async (request) => {
    const body = loginSchema.parse(request.body);
    const result = await loginController.handle(body);
    return { data: result };
  });

  app.get("/auctions", async () => ({ data: await listAuctionsController.handle() }));

  app.get("/auctions/:auctionId", async (request) => {
    const params = auctionIdSchema.parse(request.params);
    return { data: await getAuctionByIdController.handle(params.auctionId) };
  });

  app.post("/auctions", async (request, reply) => {
    await request.jwtVerify();
    const body = createAuctionSchema.parse(request.body);

    const auction = await createAuctionController.handle({
      ...body,
      sellerId: request.user.sub
    });

    return reply.status(201).send({ data: auction });
  });

  app.patch("/auctions/:auctionId/close", async (request, reply) => {
    await request.jwtVerify();
    const params = auctionIdSchema.parse(request.params);

    await closeAuctionController.handle({
      auctionId: params.auctionId,
      userId: request.user.sub,
      isAdmin: request.user.role === "ADMIN"
    });

    return reply.status(204).send();
  });

  app.post("/auctions/:auctionId/bids", async (request, reply) => {
    await request.jwtVerify();

    const params = auctionIdSchema.parse(request.params);
    const body = placeBidSchema.parse(request.body);

    const result = await placeBidController.handle({
      auctionId: params.auctionId,
      bidderId: request.user.sub,
      amount: body.amount
    });

    return reply.status(201).send({ data: result });
  });

  return app;
}
