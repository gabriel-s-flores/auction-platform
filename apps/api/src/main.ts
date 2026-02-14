import { env } from "@/infrastructure/config/env";
import { buildApp } from "@/interfaces/http/app";

const app = buildApp();

await app.listen({
  host: "0.0.0.0",
  port: env.API_PORT
});

app.log.info(
  {
    event: "api_started",
    url: `http://localhost:${env.API_PORT}`,
    appEnv: env.APP_ENV,
    nodeEnv: env.NODE_ENV
  },
  "API em execução"
);
