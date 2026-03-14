#!/bin/bash

# JewelCart Deployment Script
# Usage: ./deploy.sh [local|aws]

set -e

MODE=${1:-local}
IMAGE_NAME="jewelcart"
ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/jewelcart"

echo "========================================="
echo "  JewelCart Deployment - $MODE"
echo "========================================="

# Build the image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:latest .

if [ "$MODE" = "aws" ]; then
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo "Error: AWS_ACCOUNT_ID not set"
        exit 1
    fi
    
    echo "Logging into ECR..."
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
    
    echo "Tagging image for ECR..."
    docker tag $IMAGE_NAME:latest $ECR_REPOSITORY:latest
    docker tag $IMAGE_NAME:latest $ECR_REPOSITORY:$(git rev-parse --short HEAD)
    
    echo "Pushing to ECR..."
    docker push $ECR_REPOSITORY:latest
    docker push $ECR_REPOSITORY:$(git rev-parse --short HEAD)
    
    echo "Updating ECS service..."
    aws ecs update-service --cluster jewelcart-cluster --service jewelcart --force-new-deployment
    
    echo "Deployment triggered! Check ECS console for status."
else
    echo "Starting local deployment with docker-compose..."
    docker-compose --env-file .env.production up -d --build
    
    echo "========================================="
    echo "  Deployment Complete!"
    echo "========================================="
    echo "App: http://localhost"
    echo "API: http://localhost:3000"
    echo "Postgres: localhost:5432"
fi

echo "Done!"
