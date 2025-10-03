#!/bin/bash

# Build the Docker image
echo "Building Image..."
docker-compose build

# Run the Docker container
echo "Starting the application..."
docker-compose up -d

# Wait for the application to start
echo "Waiting for startup..."
sleep 10

# Check if the application is running
echo "Running an example curl to check app is working"
curl -s http://localhost:3000/api/healthz
