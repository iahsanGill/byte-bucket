# Use official Node.js image as a base
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code
COPY . .

# Expose the app on port 8080
EXPOSE 8080

# Run the app
CMD ["pnpm", "start:dev"]
