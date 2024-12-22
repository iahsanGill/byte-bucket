#!/bin/bash

# Stop and remove containers, networks, images, and volumes
docker compose down -v

# Build, (re)create, start, and attach to containers for a service in detached mode
docker compose up --build -d

# Check and remove untagged images
UNTAGGED_IMAGE=$(docker images -f "dangling=true" -q)
if [ -n "$UNTAGGED_IMAGE" ]; then
    echo "Removing previous untagged image: $UNTAGGED_IMAGE"
    docker rmi $UNTAGGED_IMAGE
fi
