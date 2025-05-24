FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json files
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install dependencies with husky disabled
ENV HUSKY=0
WORKDIR /app/backend
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend ./

# Build the application
RUN pnpm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/src/db/migrations ./src/db/migrations

# Install production dependencies only
RUN npm install --omit=dev

# Set proper permissions
RUN chown -R appuser:nodejs /app

# Use non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Run the app with migrations
CMD ["npm", "run", "start:prod"]
