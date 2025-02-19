#!/bin/bash

# Default values
PORT=25043
IMAGE_NAME="auto-prompting-backend"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
        PORT="$2"
        shift 2
        ;;
        --name)
        IMAGE_NAME="$2"
        shift 2
        ;;
        --help)
        echo "Usage: $0 [--port PORT] [--name IMAGE_NAME]"
        exit 0
        ;;
        *)
        print_error "Unknown parameter: $1"
        exit 1
        ;;
    esac
done

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        print_status "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# Check Docker service
print_status "Checking Docker service..."
if ! systemctl is-active --quiet docker; then
    print_status "Starting Docker service..."
    systemctl start docker
    check_status "Docker service started" "Failed to start Docker service"
fi

# Stop and remove existing container if it exists
print_status "Checking for existing container..."
if [ "$(docker ps -q -f name=$IMAGE_NAME)" ]; then
    print_status "Stopping existing container..."
    docker stop $IMAGE_NAME
    check_status "Container stopped successfully" "Failed to stop container"
    
    print_status "Removing existing container..."
    docker rm $IMAGE_NAME
    check_status "Container removed successfully" "Failed to remove container"
fi

# Build the Docker image with optimizations
print_status "Building Docker image..."
sudo docker build \
    --compress \
    --force-rm \
    -t $IMAGE_NAME .
check_status "Docker image built successfully" "Failed to build Docker image"

# Run the container
print_status "Starting container..."
docker run -d \
    -p $PORT:$PORT \
    -e PORT=$PORT \
    --name $IMAGE_NAME \
    $IMAGE_NAME
check_status "Container started successfully" "Failed to start container"

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 5

# Check if the container is running
if [ "$(docker ps -q -f name=$IMAGE_NAME)" ]; then
    print_status "Container is running"
    
    # Check health endpoint
    print_status "Checking health endpoint..."
    HEALTH_CHECK=$(curl -s http://localhost:$PORT/health)
    if [[ $HEALTH_CHECK == *"healthy"* ]]; then
        print_status "Health check passed"
        print_status "Application is ready at http://localhost:$PORT"
        
        # Show container logs
        print_status "Recent container logs:"
        docker logs --tail 10 $IMAGE_NAME
    else
        print_error "Health check failed"
        print_status "Container logs:"
        docker logs $IMAGE_NAME
        exit 1
    fi
else
    print_error "Container failed to start"
    print_status "Container logs:"
    docker logs $IMAGE_NAME
    exit 1
fi 