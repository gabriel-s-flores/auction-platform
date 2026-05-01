FROM oven/bun:latest AS base
WORKDIR /app

# Copy root package files
COPY package.json bun.lock bunfig.toml ./

# Copy packages and apps directories
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies
RUN bun install --frozen-lockfile && \
    # Ensure browser-image-compression is hoisted to root node_modules
    # (Bun hoisting edge case: package exists in .bun cache but symlink isn't created)
    ln -sf .bun/browser-image-compression@2.0.2/node_modules/browser-image-compression /app/node_modules/browser-image-compression

# Copy the rest of the source code for the Web app
COPY apps/web ./apps/web

# Expose Web port
EXPOSE 5173

# Start the application in development mode with host exposure
# Vite needs --host to be accessible from outside the container
CMD ["bun", "run", "dev", "--", "--host"]
