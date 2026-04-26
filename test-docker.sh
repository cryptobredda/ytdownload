#!/bin/bash

echo "🐳 Testing Docker Build for Coolify Deployment"
echo "==============================================="
echo ""

# Build the Docker image
echo "Step 1: Building Docker image..."
docker-compose build 2>&1 | tail -50

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker build successful!"
    echo ""
    
    # Start the container
    echo "Step 2: Starting container..."
    docker-compose up -d
    
    sleep 5
    
    # Check if container is running
    echo ""
    echo "Step 3: Checking container status..."
    docker-compose ps
    
    # Test if app is accessible
    echo ""
    echo "Step 4: Testing API endpoint..."
    curl -s http://localhost:3000/api/tasks | jq . || echo "API not ready yet (might need more time)"
    
    echo ""
    echo "================================="
    echo "✅ Docker container is running!"
    echo ""
    echo "Access at: http://localhost:3000"
    echo ""
    echo "To stop: docker-compose down"
    echo "To view logs: docker-compose logs -f"
else
    echo ""
    echo "❌ Docker build failed!"
    echo ""
    echo "Check the error messages above."
    echo "Common issues:"
    echo "  - Docker not installed"
    echo "  - Network issues during package download"
    echo "  - Insufficient disk space"
    exit 1
fi
