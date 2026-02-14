import { PrismaClient } from "@prisma/client";
import { env } from "#infrastructure/config/env";

export const prisma = new PrismaClient();
