#!/bin/bash
# Linux/Mac ngrok 客户端启动脚本

echo "Starting ngrok client..."
echo "Connecting to jesson.tech:10200"
echo "Local service: localhost:3000"
echo "Public URL: http://jesson.tech:10201"
echo ""

# 尝试找到 ngrok
if command -v ngrok &> /dev/null; then
    echo "Using ngrok from PATH"
    ngrok -config=ngrok.yml start pet
elif [ -f "./ngrok" ]; then
    echo "Using ./ngrok"
    ./ngrok -config=ngrok.yml start pet
elif [ -f "../ngrok" ]; then
    echo "Using ../ngrok"
    ../ngrok -config=ngrok.yml start pet
else
    echo "ERROR: ngrok not found!"
    echo "Please download ngrok client from your ngrok server"
    exit 1
fi
