#!/bin/bash

echo "Updating system packages..."

apt update 

echo "Installing missing dependencies for Puppeteer..."

apt install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon-x11-0 libnss3 libxcomposite1 libxrandr2 libgbm1

echo "Reinstalling node modules..."

npm install

echo "Fix completed. Restart your server!"
