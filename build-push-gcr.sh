#!/bin/bash

# Variables
PROJECT_ID=$(gcloud config get-value project)
REGION="us"
REPO_NAME="gcr.io" # Artifact Registry repository name
SERVICE_DIRECTORIES=(
    "logging-service"
    "storage-service"
    "usage-monitoring-service"
    "user-service"
    "view-generator-service"
)

# Ensure GCP project is set
if [ -z "$PROJECT_ID" ]; then
    echo "GCP project is not set. Run 'gcloud config set project PROJECT_ID' to set it."
    exit 1
fi

# Ensure authentication
gcloud auth configure-docker gcr.io || exit 1

# Check and create repository if needed
echo "Checking if Artifact Registry repository $REPO_NAME exists..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &>/dev/null; then
    echo "Repository $REPO_NAME does not exist. Creating it..."
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for services" || exit 1
    echo "Repository $REPO_NAME created successfully."
else
    echo "Repository $REPO_NAME already exists."
fi

# Loop through each service directory
for SERVICE in "${SERVICE_DIRECTORIES[@]}"; do
    if [ -d "$SERVICE" ]; then
        echo "Processing $SERVICE..."

        # Build Docker image
        IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE"
        docker build -t "$IMAGE_NAME" "$SERVICE"

        if [ $? -ne 0 ]; then
            echo "Failed to build Docker image for $SERVICE. Exiting."
            exit 1
        fi

        # List all existing images in the repository and delete previous ones
        echo "Removing old images from the repository..."
        # List images sorted by creation time, filter for the service, and delete all but the latest
        OLD_IMAGES=$(gcloud container images list-tags "$IMAGE_NAME" --limit=100 --sort-by=TIMESTAMP --filter="tags:*" --format="get(digest)" | tail -n +2)

        if [ -n "$OLD_IMAGES" ]; then
            for OLD_IMAGE in $OLD_IMAGES; do
                echo "Deleting image $OLD_IMAGE..."
                gcloud container images delete "$IMAGE_NAME@$OLD_IMAGE" --quiet || exit 1
            done
        else
            echo "No old images to delete for $SERVICE."
        fi

        # Push Docker image to GCR
        docker push "$IMAGE_NAME"

        if [ $? -ne 0 ]; then
            echo "Failed to push Docker image for $SERVICE. Exiting."
            exit 1
        fi

        echo "$SERVICE has been successfully built, old images removed, and pushed to $IMAGE_NAME"
    else
        echo "Directory $SERVICE does not exist. Skipping."
    fi
done

echo "All services processed."
