import "@fastify/jwt";
import type { AuthenticatedUser } from "@/interfaces/http/types/authenticated-user";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}
