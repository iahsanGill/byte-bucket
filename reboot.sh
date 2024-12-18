#!/bin/bash

# Stop and remove containers, networks, images, and volumes
docker compose down -v

# Build, (re)create, start, and attach to containers for a service in detached mode
docker compose up --build -d