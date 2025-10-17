# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install OS deps (e.g., for bcrypt) and CA certs for TLS (Mongo Atlas)
RUN apk add --no-cache python3 make g++ ca-certificates && update-ca-certificates

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (production by default; switch via ARG when needed)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm ci; fi

# Copy source
COPY src ./src

# Expose app port
EXPOSE 3000

# Default env fallbacks (can be overridden by compose)
ENV PORT=3000 \
    REDIS_HOST=redis \
    REDIS_PORT=6379

# Start the server
CMD ["npm", "start"]


