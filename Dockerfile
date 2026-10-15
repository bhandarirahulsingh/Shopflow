# ==========================================
# STAGE 1: The Builder (Compile TypeScript)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (Leverages Docker Layer Caching!)
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies like typescript)
RUN npm install

# Copy backend source code
COPY src ./src

# Compile TypeScript into plain JavaScript (/app/dist)
RUN npm run build

# Remove development dependencies to keep only production packages
RUN npm prune --production


# ==========================================
# STAGE 2: The Runner (Ultra-Tiny Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Create a non-root system user for security
USER node

# Copy only the compiled code and production node_modules from the builder stage
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]