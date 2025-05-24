FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json files
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Copy source code
COPY backend ./backend

# Install dependencies with husky disabled
ENV HUSKY=0
WORKDIR /app/backend
RUN pnpm install

# Build the application
RUN pnpm run build

# Production setup
ENV NODE_ENV production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser

# Expose the port the app will run on
EXPOSE 4000

# Run the app
CMD ["node", "dist/src/index.js"]
