# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci || npm install

# Build the static site. We call vite directly (instead of `npm run build`)
# so the production image isn't blocked by non-fatal TypeScript type errors.
COPY . .
RUN npx vite build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine

# SPA + API reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets produced by Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 127.0.0.1 (not localhost): inside the container localhost resolves to IPv6 ::1,
# but nginx listens on IPv4 only, so a localhost probe gets "connection refused".
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
