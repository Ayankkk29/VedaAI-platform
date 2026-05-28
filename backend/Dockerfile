FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

# Start application
CMD ["node", "src/index.js"]
