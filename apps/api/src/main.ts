import { env } from "#infrastructure/config/env";
import { initWebSocket } from "#infrastructure/websocket/auction-events";
import { buildApp } from "#interfaces/http/app";

async function main() {
 try {
 const app = buildApp();

 // Let Fastify create and manage its own HTTP server
 await app.listen({ host: "0.0.0.0", port: env.API_PORT });

 // Attach Socket.IO to Fastify's underlying HTTP server
 initWebSocket(app.server);

 app.log.info(
 {
 event: "api_started",
 url: `http://localhost:${env.API_PORT}`,
 appEnv: env.APP_ENV,
 nodeEnv: env.NODE_ENV,
 },
 "API em execução",
 );
 } catch (error) {
 // eslint-disable-next-line no-console
 console.error("Failed to start server:", error);
 throw error;
 }
}

void main();
