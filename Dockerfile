# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies before copying the rest of the code
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code (if necessary)
RUN npm run build

# Remove development dependencies after build
RUN npm prune --omit=dev

# Stage 2: Run
FROM node:18-alpine as runtime

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Set NODE_ENV for optimized performance
ENV NODE_ENV=production

# Expose the port
EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"]