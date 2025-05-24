FROM node:22-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json files
COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Copy source code
COPY frontend ./frontend

# Install dependencies with husky disabled
ENV HUSKY=0
WORKDIR /app/frontend
RUN pnpm install

# Build the application with environment variables
ARG VITE_API_URL=http://backend:4000
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm run build

# Production nginx setup
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /app/frontend/dist .

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the runtime config and entrypoint script
COPY frontend/public/config.js /usr/share/nginx/html/config.js
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Set the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
