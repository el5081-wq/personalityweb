#!/usr/bin/env bash
# deploy.sh
# ----------
# Builds the Docker image, pushes it to Docker Hub,
# then SSHes into the AWS EC2 server and restarts the container.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# Required env vars (or set them below):
#   DOCKER_USERNAME   — your Docker Hub username
#   SERVER_IP         — your EC2 public IP  (from: terraform output server_ip)
#   SSH_KEY_PATH      — path to your .pem key file
#   MONGO_URI         — MongoDB Atlas connection string
#   CLIENT_ORIGIN     — allowed CORS origin

set -euo pipefail  # exit on error, unset variable, or pipe failure

# ── Config (override with env vars) ──────────────────────────────────────────
DOCKER_USERNAME="${DOCKER_USERNAME:?Set DOCKER_USERNAME}"
SERVER_IP="${SERVER_IP:?Set SERVER_IP}"
SSH_KEY_PATH="${SSH_KEY_PATH:-~/.ssh/personalityweb.pem}"
IMAGE="${DOCKER_USERNAME}/personalityweb"
MONGO_URI="${MONGO_URI:?Set MONGO_URI}"
CLIENT_ORIGIN="${CLIENT_ORIGIN:-http://localhost:3000}"

echo "========================================"
echo "  personalityweb deploy  $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "========================================"

# ── Step 1: Build Docker image ───────────────────────────────────────────────
echo ""
echo "[1/4] Building Docker image..."
docker build -t "${IMAGE}:latest" -f backend/Dockerfile .
echo "  Built: ${IMAGE}:latest"

# ── Step 2: Push to Docker Hub ───────────────────────────────────────────────
echo ""
echo "[2/4] Pushing image to Docker Hub..."
docker push "${IMAGE}:latest"
echo "  Pushed: ${IMAGE}:latest"

# ── Step 3: SSH into server and pull new image ───────────────────────────────
echo ""
echo "[3/4] Deploying to server at ${SERVER_IP}..."
ssh -i "${SSH_KEY_PATH}" -o StrictHostKeyChecking=no "ubuntu@${SERVER_IP}" bash <<REMOTE
  set -e
  echo "  Pulling latest image..."
  docker pull ${IMAGE}:latest

  echo "  Stopping old container (if any)..."
  docker stop personalityweb 2>/dev/null || true
  docker rm   personalityweb 2>/dev/null || true

  echo "  Starting new container..."
  docker run -d \
    --name personalityweb \
    --restart always \
    -p 5000:5000 \
    -e PORT=5000 \
    -e MONGO_URI="${MONGO_URI}" \
    -e CLIENT_ORIGIN="${CLIENT_ORIGIN}" \
    ${IMAGE}:latest

  echo "  Container started."
REMOTE

# ── Step 4: Verify health ────────────────────────────────────────────────────
echo ""
echo "[4/4] Verifying app health..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_IP}:5000/api/health")

if [ "${HTTP_STATUS}" = "200" ]; then
  echo "  Health check PASSED (HTTP ${HTTP_STATUS})"
  echo ""
  echo "  App is live at: http://${SERVER_IP}:5000"
else
  echo "  Health check FAILED (HTTP ${HTTP_STATUS})"
  exit 1
fi

echo ""
echo "Deploy complete."
