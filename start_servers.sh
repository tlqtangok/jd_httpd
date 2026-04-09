#!/bin/bash

echo "Starting unified backend server with auto-reload..."

# Ensure correct permissions on startup (in case of volume mounts)
chmod 777 /usr/local/apache2/htdocs 2>/dev/null || true
touch /usr/local/apache2/htdocs/inputstr.txt 2>/dev/null || true
touch /usr/local/apache2/htdocs/inputstr_post.txt 2>/dev/null || true
chmod 666 /usr/local/apache2/htdocs/inputstr.txt 2>/dev/null || true
chmod 666 /usr/local/apache2/htdocs/inputstr_post.txt 2>/dev/null || true
chmod 777 /usr/local/apache2/var 2>/dev/null || true
chmod 777 /usr/local/apache2/uploads 2>/dev/null || true
mkdir -p /usr/local/apache2/dat 2>/dev/null || true
chmod 777 /usr/local/apache2/dat 2>/dev/null || true

# Check SSL certificates exist (volume mount or built-in)
if [ ! -f /usr/local/apache2/ssl/server.crt ] || [ ! -f /usr/local/apache2/ssl/server.key ]; then
    echo "ERROR: SSL certificates not found!"
    echo "Please ensure ssl/server.crt and ssl/server.key exist"
    exit 1
fi

# Start unified backend server with nodemon (use polling for Windows volumes)
nodemon --watch /usr/local/apache2/be --legacy-watch /usr/local/apache2/be/server.js &
BACKEND_PID=$!
echo "Unified backend server started with PID: $BACKEND_PID (auto-reload enabled)"

# Start C++ CLI server
echo "Starting C++ CLI server..."
cd /usr/local/apache2/be/cpp_cli_srv
chmod +x ./build/cpp_srv ./build/cpp_cli
./build/cpp_srv --port 3001 --log ../cpp_srv.log --threads 2 --token jd &
CPP_SRV_PID=$!
echo $CPP_SRV_PID > ../cpp_srv.pid
echo "C++ CLI server started with PID: $CPP_SRV_PID (port 3001)"
echo "  - Log file: /usr/local/apache2/be/cpp_srv.log"
echo "  - PID file: /usr/local/apache2/be/cpp_srv.pid"

sleep 1s
nohup bash /usr/local/apache2/be/cpp_cli_srv/restart_cpp_srv.sh &
echo "C++ CLI server auto-reload enabled (watching for changes in /usr/local/apache2/be/cpp_cli_srv/build)"

cd /usr/local/apache2

# Start Apache httpd in foreground
echo "Starting Apache httpd..."
exec httpd-foreground
