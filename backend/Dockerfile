FROM golang:1.21

WORKDIR /app

# Copy source code first
COPY . .

# Print working directory and list files
RUN pwd && ls -la

# Print go version and environment
RUN go version && go env

# Download dependencies and create go.sum with verbose logging
RUN go mod download -x
RUN go mod tidy -v

# Print final go.mod and go.sum
RUN echo "=== go.mod contents ===" && cat go.mod
RUN echo "=== go.sum contents ===" && cat go.sum

# Build and run directly
EXPOSE 25044

# Add verbose flag to go run
CMD ["go", "run", "-v", "cmd/main.go"] 