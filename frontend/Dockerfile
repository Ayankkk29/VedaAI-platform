# --- Stage 1: Build Next.js application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built package and static folders
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]
