#!/bin/bash

# Stop and remove existing container if it exists
sudo docker stop prompt_frontend || true
sudo docker rm prompt_frontend || true

# Build the new image
sudo docker build -t prompt_frontend .

# Run the new container
docker run -d \
  --name prompt_frontend \
  -p 25044:25044 \
  --restart unless-stopped \
  prompt_frontend

# Print the status
echo "Frontend deployment completed"
echo "Application is running on http://103.253.20.13:25044" 