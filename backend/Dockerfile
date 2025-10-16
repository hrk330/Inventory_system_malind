# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install required system dependencies for Prisma
RUN apk add --no-cache openssl1.1-compat

# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application and generate Prisma client
RUN npm run railway:build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "railway:start"]