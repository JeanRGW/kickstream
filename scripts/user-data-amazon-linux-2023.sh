#!/bin/bash
set -euxo pipefail

# Troque esta URL pela URL HTTPS do seu repositorio publico no GitHub.
REPO_URL="https://github.com/JeanRGW/kickstream.git"
APP_DIR="/opt/kickstream"

dnf update -y
dnf install -y nginx nodejs npm git
command -v aws >/dev/null 2>&1 || dnf install -y awscli || dnf install -y awscli-2 || true

systemctl enable nginx
systemctl start nginx

rm -rf "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"

cd "$APP_DIR/api"
npm install --omit=dev

rm -rf /usr/share/nginx/html/*
cp -r "$APP_DIR/public/"* /usr/share/nginx/html/
rm -f /etc/nginx/conf.d/kickstream.conf
cp "$APP_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf
cp "$APP_DIR/systemd/kickstream-api.service" /etc/systemd/system/kickstream-api.service

chown -R ec2-user:ec2-user "$APP_DIR"

systemctl daemon-reload
systemctl enable kickstream-api
systemctl restart kickstream-api
systemctl restart nginx

for attempt in {1..12}; do
  curl -f http://127.0.0.1/api/health && exit 0
  sleep 5
done

journalctl -u kickstream-api --no-pager -n 80
exit 1
