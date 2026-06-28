#!/bin/bash
set -euxo pipefail

# Use este script na instancia EC2 de validacao depois de clonar o repositorio.
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

sudo dnf update -y
sudo dnf install -y nginx nodejs npm git
command -v aws >/dev/null 2>&1 || sudo dnf install -y awscli || sudo dnf install -y awscli-2 || true

cd "$APP_DIR/api"
npm install --omit=dev

sudo rm -rf /usr/share/nginx/html/*
sudo cp -r "$APP_DIR/public/"* /usr/share/nginx/html/
sudo rm -f /etc/nginx/conf.d/kickstream.conf
sudo cp "$APP_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf
sudo cp "$APP_DIR/systemd/kickstream-api.service" /etc/systemd/system/kickstream-api.service

sudo mkdir -p /opt
sudo rm -rf /opt/kickstream
sudo cp -r "$APP_DIR" /opt/kickstream
sudo chown -R ec2-user:ec2-user /opt/kickstream

sudo systemctl daemon-reload
sudo systemctl enable kickstream-api
sudo systemctl restart kickstream-api
sudo systemctl enable nginx
sudo systemctl restart nginx

for attempt in {1..12}; do
  curl -f http://127.0.0.1/api/health && exit 0
  sleep 5
done

sudo journalctl -u kickstream-api --no-pager -n 80
exit 1
