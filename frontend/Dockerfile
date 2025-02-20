# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Create a .env file with the port configuration
RUN echo "PORT=25044" > .env

# Copy source files
COPY . .

# Type check and build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

EXPOSE 25044

# Start the application
CMD ["serve", "-s", "build", "-l", "25044"] 