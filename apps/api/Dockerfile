FROM oven/bun:latest AS base
WORKDIR /app

# Copy root package files
COPY package.json bun.lock bunfig.toml ./

# Copy packages and apps directories (so we can install dependencies)
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
# (If there are other apps, add them here or use a broader copy pattern if context allows, but specific is safer for caching)

# Install dependencies (frozen lockfile is faster and safer for CI/prod, but ensuring we have dev deps for dev env)
RUN HUSKY=0 bun install --frozen-lockfile

# Copy the rest of the source code for the API
COPY apps/api ./apps/api

# Generate Prisma Client
# DATABASE_URL is required by prisma.config.ts but prisma generate
# does not connect to the database — it only generates client code.
# The real DATABASE_URL is provided at runtime via docker-compose.
WORKDIR /app/apps/api
ENV DATABASE_URL="postgresql://localhost:5432/placeholder?schema=public"
RUN bun run prisma:generate

# Expose API port
EXPOSE 3333

# Start the application in development mode
# We use the root script but filter for api, validating that it binds to 0.0.0.0 is handled in code
CMD ["bun", "run", "dev"]
