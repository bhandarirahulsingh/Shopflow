# ==========================================
# STAGE 1: Build the React SPA
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve with Ultra-Fast Nginx
# ==========================================
FROM nginx:alpine

# Copy compiled React HTML/CSS/JS into Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
