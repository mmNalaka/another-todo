FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Set environment variables
ENV HUSKY=0
ENV NODE_ENV=development

# Copy package.json and lock files
COPY backend/package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/drizzle.config.ts ./

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
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/db/migrations ./src/db/migrations

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
