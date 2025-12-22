#!/bin/bash

# Exit on any error
set -e

# Configuration
PROJECT_DIR="/opt/12306"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SERVICE_NAME="12306-backend"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

echo "=========================================="
echo "Starting Deployment for 12306 Project"
echo "=========================================="

# 1. Database Deployment
echo "[1/4] Starting Database..."
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    cd "$PROJECT_DIR"
    docker compose up -d
    echo "Database started."
else
    echo "Error: docker-compose.yml not found in $PROJECT_DIR"
    exit 1
fi

# 2. Backend Build
echo "[2/4] Building Backend..."
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    # Ensure dependencies are tidy
    go mod tidy
    # Build the binary
    go build -o 12306-backend main.go
    echo "Backend built successfully."
else
    echo "Error: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# 3. Systemd Service Registration/Update
echo "[3/4] Configuring Systemd Service..."
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Create or overwrite the service file
cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=12306 Backend Service
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
ExecStart=$BACKEND_DIR/12306-backend
Restart=always
# Environment variables
Environment="DATABASE_URL=postgres://postgres:postgres@localhost:5432/railway12306?sslmode=disable"
Environment="GIN_MODE=release"

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to pick up changes
systemctl daemon-reload
# Enable service to start on boot
systemctl enable "$SERVICE_NAME"
# Restart the service to apply new binary
systemctl restart "$SERVICE_NAME"
echo "Backend service restarted."

# 4. Frontend Build
echo "[4/4] Building Frontend..."
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    # Install dependencies (in case of updates)
    npm install
    # Build the project
    npx vite build
    echo "Frontend built successfully."
else
    echo "Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

echo "=========================================="
echo "Deployment Finished Successfully!"
echo "=========================================="
