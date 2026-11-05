#!/bin/bash

# Google Cloud Run Deployment Script for Frontend using cloud-run-config.yaml

set -euo pipefail

# Configuration
PROJECT_ID="nice-azimuth-310713"
REGION="us-central1"
SERVICE_NAME="orbitex-frontend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
VERSION=$(date +%Y%m%d-%H%M%S)
BACKEND_URL="${NEXT_PUBLIC_API_URL:-https://orbitex-backend-ih6wdmcn3q-uc.a.run.app}"
AUTH_SERVICE_URL="${NEXT_PUBLIC_AUTH_SERVICE_URL:-https://orbisigner-ih6wdmcn3q-uc.a.run.app/api/v2/identity}"
FRONTEND_URL="${NEXT_PUBLIC_FRONTEND_URL:-https://orbitex-frontend-ih6wdmcn3q-uc.a.run.app}"
WS_URL="${NEXT_PUBLIC_WS_URL:-wss://socketeer-976099405307.us-central1.run.app/public}"
ENABLE_2FA="${NEXT_PUBLIC_ENABLE_2FA:-false}"
ENABLE_KYC="${NEXT_PUBLIC_ENABLE_KYC:-false}"
ENABLE_WEBAUTHN="${NEXT_PUBLIC_ENABLE_WEBAUTHN:-false}"
TMP_CLOUDBUILD="$(mktemp -t orbitex-frontend-cloudbuild.XXXXXX.yaml)"
TMP_SERVICE="$(mktemp -t orbitex-frontend-service.XXXXXX.yaml)"

cleanup() {
    rm -f "$TMP_CLOUDBUILD" "$TMP_SERVICE"
}
trap cleanup EXIT

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

PREVIOUS_REVISION=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.latestReadyRevisionName)' 2>/dev/null || true)
if [ -n "$PREVIOUS_REVISION" ]; then
    echo -e "${BLUE}Previous ready revision: $PREVIOUS_REVISION${NC}"
fi

cat > "$TMP_CLOUDBUILD" <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -t
      - $IMAGE_NAME:$VERSION
      - --build-arg
      - NEXT_PUBLIC_API_URL=$BACKEND_URL
      - --build-arg
      - NEXT_PUBLIC_AUTH_SERVICE_URL=$AUTH_SERVICE_URL
      - --build-arg
      - NEXT_PUBLIC_FRONTEND_URL=$FRONTEND_URL
      - --build-arg
      - NEXT_PUBLIC_WS_URL=$WS_URL
      - --build-arg
      - NEXT_PUBLIC_ENABLE_2FA=$ENABLE_2FA
      - --build-arg
      - NEXT_PUBLIC_ENABLE_KYC=$ENABLE_KYC
      - --build-arg
      - NEXT_PUBLIC_ENABLE_WEBAUTHN=$ENABLE_WEBAUTHN
      - --build-arg
      - SKIP_ENV_VALIDATION=true
      - .
images:
  - $IMAGE_NAME:$VERSION
EOF

# Build and push Docker image
echo -e "${YELLOW}🔨 Building and pushing Docker image with backend-rust public env...${NC}"
gcloud builds submit --config "$TMP_CLOUDBUILD" --machine-type='E2_HIGHCPU_8' --timeout=1800 --project "$PROJECT_ID"

# Tag as latest
echo -e "${YELLOW}🏷️  Tagging as latest...${NC}"
gcloud container images add-tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest --quiet

python3 - "$IMAGE_NAME:$VERSION" "$BACKEND_URL" "$AUTH_SERVICE_URL" "$FRONTEND_URL" "$WS_URL" "$TMP_SERVICE" <<'PY'
import sys
from pathlib import Path

image, backend_url, auth_url, frontend_url, ws_url, out_path = sys.argv[1:]
text = Path("cloud-run-config.yaml").read_text()
replacements = {
    "image: ": f"image: {image}",
    'value: "https://orbitex-backend-ih6wdmcn3q-uc.a.run.app"': f'value: "{backend_url}"',
    'value: "https://orbisigner-ih6wdmcn3q-uc.a.run.app/api/v2/identity"': f'value: "{auth_url}"',
    'value: "https://orbitex-frontend-ih6wdmcn3q-uc.a.run.app"': f'value: "{frontend_url}"',
    'value: "wss://socketeer-976099405307.us-central1.run.app/public"': f'value: "{ws_url}"',
}

lines = []
for line in text.splitlines():
    stripped = line.lstrip()
    indent = line[: len(line) - len(stripped)]
    if stripped.startswith("- image: "):
        lines.append(f"{indent}- image: {image}")
        continue
    if stripped.startswith("image: "):
        lines.append(f"{indent}image: {image}")
        continue
    for old, new in replacements.items():
        if old in line:
            line = line.replace(old, new)
    lines.append(line)

Path(out_path).write_text("\n".join(lines) + "\n")
PY

# Deploy using the configuration file
echo -e "${YELLOW}🚀 Deploying to Google Cloud Run...${NC}"
echo -e "${BLUE}📊 Deployment Configuration:${NC}"
echo "  Service Name: $SERVICE_NAME"
echo "  Image: $IMAGE_NAME:$VERSION"
echo "  Region: $REGION"
echo "  Project: $PROJECT_ID"
echo "  API URL: $BACKEND_URL"
echo "  Auth URL: $AUTH_SERVICE_URL"
echo ""

gcloud run services replace "$TMP_SERVICE" --region "$REGION"

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
FRONTEND_OK=false
for i in {1..5}; do
    echo -e "${YELLOW}Attempt $i/5: Testing frontend...${NC}"
    if curl -f -s --max-time 30 "$SERVICE_URL" > /dev/null; then
        echo -e "${GREEN}✅ Frontend is accessible!${NC}"
        FRONTEND_OK=true
        break
    else
        echo -e "${YELLOW}⚠️  Frontend not ready, retrying in 10 seconds...${NC}"
        sleep 10
    fi
done

if [ "$FRONTEND_OK" != "true" ]; then
    if [ -n "$PREVIOUS_REVISION" ]; then
        echo -e "${RED}❌ Frontend health failed. Rollback command:${NC}"
        echo "gcloud run services update-traffic $SERVICE_NAME --region $REGION --to-revisions $PREVIOUS_REVISION=100"
    fi
    exit 1
fi

# Final status
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Service URL: $SERVICE_URL${NC}"
echo -e "${BLUE}Revision: $(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.latestReadyRevisionName)')${NC}"
if [ -n "$PREVIOUS_REVISION" ]; then
    echo -e "${BLUE}Rollback: gcloud run services update-traffic $SERVICE_NAME --region $REGION --to-revisions $PREVIOUS_REVISION=100${NC}"
fi

# Troubleshooting information
echo -e "${YELLOW}🔧 Troubleshooting Commands:${NC}"
echo -e "  View logs: gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --project=$PROJECT_ID --limit=50"
echo -e "  Service info: gcloud run services describe $SERVICE_NAME --region $REGION"
echo -e "  Update service: gcloud run services update $SERVICE_NAME --region $REGION --image $IMAGE_NAME:$VERSION"

echo -e "${GREEN}✅ Deployment script completed!${NC}"
