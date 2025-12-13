#!/bin/bash

# Exit on any error
set -e

# Load environment variables from .env.local
source ../.env.local


# Read package.json to get the version
VERSION='latest'

echo "Preparing to push Docker image..."
echo "Image Name: $IMAGE_NAME"
echo "Version: $VERSION"

echo "Log in to Docker Hub..."
docker login

echo "Building Docker image..."
docker build --no-cache -t $IMAGE_NAME:$VERSION ../

echo "Tagging Docker image..."
docker tag $IMAGE_NAME:$VERSION $DOCKER_LOGIN_USERNAME/$IMAGE_NAME:$VERSION

echo "Pushing Docker image to Docker Hub..."
docker push $DOCKER_LOGIN_USERNAME/$IMAGE_NAME:$VERSION