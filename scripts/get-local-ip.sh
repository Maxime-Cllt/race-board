#!/bin/bash

# Script to detect local IP address
# Works on macOS and Linux

echo "🔍 Detecting your local IP address..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    echo "💻 Platform: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    echo "💻 Platform: Linux"
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "Please manually find your IP address and update .env.local"
    exit 1
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not detect local IP address"
    echo "Please manually find your IP address and update .env.local"
    exit 1
fi

echo "✅ Local IP Address: $LOCAL_IP"
echo ""
echo "📝 Update your .env.local file with:"
echo "   NEXT_PUBLIC_API_URL=http://$LOCAL_IP:3000"
echo ""
echo "Or use this command to update it automatically:"
echo "   sed -i '' 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$LOCAL_IP:3000|' .env.local"
