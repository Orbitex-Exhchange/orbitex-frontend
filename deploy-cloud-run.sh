#!/bin/bash

# Google Cloud Run Deployment Script for Frontend using cloud-run-config.yaml

set -e  # Exit on any error

# Configuration
PROJECT_ID="nice-azimuth-310713"
REGION="us-central1"
SERVICE_NAME="orbitex-frontend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
VERSION=$(date +%Y%m%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Google Cloud Run Deployment for Frontend${NC}"
echo -e "${BLUE}================================================================${NC}"

# Validate required files
echo -e "${YELLOW}📋 Validating project files...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found!${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found!${NC}"
    exit 1
fi

if [ ! -f "cloud-run-config.yaml" ]; then
    echo -e "${RED}❌ Cloud Run configuration file not found!${NC}"
    exit 1
fi

if [ ! -f "next.config.js" ]; then
    echo -e "${RED}❌ next.config.js not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project validation passed${NC}"

# Set up Google Cloud project
echo -e "${YELLOW}🔧 Setting up Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# Build and push Docker image
echo -e "${YELLOW}🔨 Building and pushing Docker image...${NC}"
gcloud builds submit --tag $IMAGE_NAME:$VERSION --machine-type='E2_HIGHCPU_8' --project $PROJECT_ID

# Tag as latest
echo -e "${YELLOW}🏷️  Tagging as latest...${NC}"
gcloud container images add-tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest --quiet

# Update the Cloud Run configuration with the new image
echo -e "${YELLOW}📝 Updating Cloud Run configuration...${NC}"
sed -i.bak "s|image: .*|image: $IMAGE_NAME:$VERSION|" cloud-run-config.yaml

# Deploy using the configuration file
echo -e "${YELLOW}🚀 Deploying to Google Cloud Run...${NC}"
echo -e "${BLUE}📊 Deployment Configuration:${NC}"
echo "  Service Name: $SERVICE_NAME"
echo "  Image: $IMAGE_NAME:$VERSION"
echo "  Region: $REGION"
echo "  Project: $PROJECT_ID"
echo ""

gcloud run services replace cloud-run-config.yaml --region $REGION

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
sleep 20

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
echo -e "${BLUE}Testing health endpoint: $SERVICE_URL${NC}"

# Wait a bit more for the application to fully start
sleep 10

# Test with retries
for i in {1..5}; do
    echo -e "${YELLOW}Attempt $i/5: Testing frontend...${NC}"
    if curl -f -s "$SERVICE_URL" > /dev/null; then
        echo -e "${GREEN}✅ Frontend is accessible!${NC}"
        break
    else
        echo -e "${YELLOW}⚠️  Frontend not ready, retrying in 10 seconds...${NC}"
        sleep 10
    fi
done

# Restore the backup file
if [ -f "cloud-run-config.yaml.bak" ]; then
    mv cloud-run-config.yaml.bak cloud-run-config.yaml
fi

# Final status
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Service URL: $SERVICE_URL${NC}"

# Troubleshooting information
echo -e "${YELLOW}🔧 Troubleshooting Commands:${NC}"
echo -e "  View logs: gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --project=$PROJECT_ID --limit=50"
echo -e "  Service info: gcloud run services describe $SERVICE_NAME --region $REGION"
echo -e "  Update service: gcloud run services update $SERVICE_NAME --region $REGION --image $IMAGE_NAME:$VERSION"

echo -e "${GREEN}✅ Deployment script completed!${NC}"
