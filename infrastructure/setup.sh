#!/bin/bash
# EC2 User Data script: installs Nginx and deploys the Redwall game
set -euo pipefail

# Update system packages
yum update -y

# Install Nginx and Git
amazon-linux-extras install nginx1 -y 2>/dev/null || yum install nginx -y
yum install git -y

# Clone the game into Nginx's web root
WEBROOT="/usr/share/nginx/html/redwall"
rm -rf "$WEBROOT"
git clone https://github.com/kwamesompimpong-build/Redwall-Game.git "$WEBROOT" || {
  # Fallback: create the directory and copy from /tmp if clone fails
  mkdir -p "$WEBROOT"
  echo "Git clone failed — game files should be deployed manually." > "$WEBROOT/deploy-note.txt"
}

# Configure Nginx to serve the game
cat > /etc/nginx/conf.d/redwall.conf << 'NGINX'
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html/redwall;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Remove default server block so our config takes priority
sed -i '/server {/,/}/d' /etc/nginx/nginx.conf 2>/dev/null || true

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx
