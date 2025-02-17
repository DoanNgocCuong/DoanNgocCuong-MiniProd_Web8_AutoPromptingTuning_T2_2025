FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl

# Copy package files first
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Install serve to run production build
RUN npm install -g serve

EXPOSE 25043

# Run the production build
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:25043"] 