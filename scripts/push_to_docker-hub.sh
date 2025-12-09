#!/bin/bash

# Exit on any error
set -e

source ../.env.local


# Read package.json to get the version
VERSION=$(node -p "require('../package.json').version")

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