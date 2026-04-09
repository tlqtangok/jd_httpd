# HTTPD-NodeJS Docker Image - v3.2.0

A production-ready Docker image combining **Apache HTTPD** with **Node.js** backend, featuring auto-reload, authentication, and WebDAV support.

**Perfect for:** Web applications, API backends, file storage, and development environments

## ⚡ For Newcomers - Start Here!

**Prerequisites:**
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Windows: Use the `.bat` scripts provided
- Linux/Mac: Use `start_servers.sh` or adapt the batch scripts

**Three steps to get started:**

```bash
# 1. Build the Docker image (takes ~2-5 minutes)
build_image.bat

# 2. Start the container
start_httpd_test.bat

# 3. Open your browser
http://localhost:10248/
```

That's it! You now have a running web server with Node.js backend.

## 🎯 What's New in v3.2.0

- ✅ **Auto-Proxy Pattern** - `ProxyPassMatch` catches all `/get/*` and `/post/*` routes automatically!
- ✅ **No More httpd.conf Edits** - Add new backend routes without rebuilding Docker image
- ✅ **True Hot-Reload** - Add endpoints to `server.js`, nodemon reloads, routes work instantly

## 🎯 What's in v3.1.0

- ✅ **Clearer Route Names** - `/post/uri` and `/post/json` (was `/post/process` and `/post/process-post`)
- ✅ **Unified CGI Script** - Single `cgi.js` handles both form & JSON (auto-detection)
- ✅ **GET Method Support** - Both CGI and ProxyPass support GET with URL parameters
- ✅ **6 Test Methods** - Complete test suite with all HTTP methods (POST form, POST JSON, GET)
- ✅ **Simplified Maintenance** - 1 CGI script instead of 2, clearer naming conventions

## 🎯 What's in v3.0.0

- ✅ **Unified Backend Server** - Single Express server on port 3000 (no more multiple ports!)
- ✅ **User Authentication System** - Token-based login/register with 60-second expiry
- ✅ **Consistent Routing** - All endpoints use `/post/*` and `/get/*` patterns
- ✅ **User Data Storage** - Stored in mounted `uploads/` folder for easy access
- ✅ **Directory Listing** - Root URL shows file browser by default
- ✅ **All Test Pages Working** - CGI, ProxyPass, and Auth endpoints fully tested

## 📁 Folder Structure

```
create_httpd_img/
├── html/          → Frontend HTML files (BIND MOUNT - live edit)
│   ├── login.html              → User login page
│   ├── register.html           → User registration page
│   ├── hello.html              → Protected welcome page
│   ├── httpd_be_test.html      → Backend test suite (all 4 forms)
│   └── inputtest_proxypass_reverse.html → ProxyPass tests
├── be/            → Backend Node.js (BIND MOUNT - auto-reload with nodemon)
│   ├── server.js              → Unified Express server (port 3000)
│   └── package.json           → Dependencies (express)
├── cgi-bin/       → CGI scripts (COPIED TO IMAGE - rebuild needed)
├── ssl/           → SSL certificates (COPIED TO IMAGE)
├── uploads/       → WebDAV storage + user data (BIND MOUNT)
│   └── user_info.json         → User credentials (auto-created)
├── *.bat          → Management scripts (Windows)
├── start_servers.sh → Container startup script
├── httpd.conf     → Apache configuration
└── Dockerfile     → Build config
```

## 🚀 Quick Start Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/tlqtangok/jd_httpd.git
cd jd_httpd
```

### Step 2: Build the Docker Image
```batch
# Windows
build_image.bat

# Linux/Mac
docker build --no-cache -t jd-httpd:latest .
```

This takes 2-5 minutes on first build. It installs Apache, Node.js, and all dependencies.

### Step 3: Start the Container
```batch
# Windows
start_httpd_test.bat

# Linux/Mac
docker run -d --name httpd-test -p 10248:80 \
  -v "$(pwd)/html:/usr/local/apache2/htdocs" \
  -v "$(pwd)/be:/usr/local/apache2/be" \
  -v "$(pwd)/uploads:/usr/local/apache2/uploads" \
  jd-httpd:latest
```

### Step 4: Access Your Services

Open your browser and visit:

| Service | URL | Description |
|---------|-----|-------------|
| 🏠 **Home** | http://localhost:10248/ | Directory listing |
| 🔐 **Login** | http://localhost:10248/login.html | User authentication |
| 📝 **Register** | http://localhost:10248/register.html | Create new account |
| ✅ **Test Suite** | http://localhost:10248/httpd_be_test.html | Backend test forms |
| 📁 **WebDAV** | http://localhost:10248/uploads/ | File storage (user: `jd`, pass: `pw`) |

### Step 5: Stop the Container
```batch
# Windows
stop_httpd_test.bat

# Linux/Mac
docker stop httpd-test && docker rm httpd-test
```

## 🌐 All Working Pages

| Page | URL | Description |
|------|-----|-------------|
| **Directory Listing** | http://localhost:10248/ | File browser (default) |
| **Login System** | http://localhost:10248/login.html | User authentication |
| **Register** | http://localhost:10248/register.html | New user registration |
| **Welcome** | http://localhost:10248/hello.html | Protected page (requires token) |
| **Backend Test** | http://localhost:10248/httpd_be_test.html | 4-form test suite ✅ |
| **ProxyPass Test** | http://localhost:10248/inputtest_proxypass_reverse.html | 2-form test ✅ |
| **WebDAV** | http://localhost:10248/uploads/ | File upload/download |

## 🔌 API Endpoints

### Authentication (Port 3000 - Unified Backend)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/post/register` | Register new user | `{"username":"user","password":"pass"}` |
| POST | `/post/login` | Login user | `{"username":"user","password":"pass"}` |
| GET | `/get/verify` | Verify token | Header: `Authorization: Bearer <token>` |

### Test Endpoints (Port 3000 - Unified Backend)

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| POST | `/post/uri` | Form data submission | `application/x-www-form-urlencoded` |
| POST | `/post/json` | JSON POST submission | `application/json` |
| GET | `/get/param` | GET with URL parameters | Query string: `?inputstr=value` |

### CGI Endpoints (Unified Script)

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| POST | `/cgi-bin/cgi.js` | Unified CGI handler (form) | `application/x-www-form-urlencoded` |
| POST | `/cgi-bin/cgi.js` | Unified CGI handler (JSON) | `application/json` |
| GET | `/cgi-bin/cgi.js` | GET with URL parameters | Query string: `?inputstr=value` |

## 💡 Key Features Explained

### 1. 🔄 Auto-Proxy Pattern (v3.2.0) - For Backend Developers

**The Problem:** Traditionally, adding a new API endpoint required:
1. Edit `server.js` to add the route
2. Edit `httpd.conf` to add ProxyPass rule
3. Rebuild Docker image
4. Restart container

**The Solution:** Auto-proxy pattern!
```apache
ProxyPassMatch ^/(get|post)/(.*)$ http://localhost:3000/$1/$2
```

**Now you just:**
1. Edit `be/server.js` and add your route
2. Wait 1 second (nodemon auto-reloads)
3. Done! Route works immediately ✨

**Example:**
```javascript
// Add this to be/server.js
app.get('/get/newroute', (req, res) => {
    res.json({ message: 'Hello from new route!' });
});

// Save the file, wait 1 second, then visit:
// http://localhost:10248/get/newroute
// It works! No rebuild needed!
```

### 2. 🔐 User Authentication System

Built-in token-based authentication:
- Register new users
- Login with username/password
- Get JWT token (60-second expiry, configurable)
- Protected routes that verify token

**How to use:**
```bash
# 1. Register
curl -X POST http://localhost:10248/post/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# 2. Login (get token)
curl -X POST http://localhost:10248/post/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
# Returns: {"success":true,"token":"eyJhbGci..."}

# 3. Access protected route
curl -X GET http://localhost:10248/get/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

User data is stored in `uploads/user_info.json` - accessible from your host machine!

### 3. 📦 Volume Mounts - Live Editing

Three folders are mounted as volumes, meaning **changes are instant**:

| Local Folder | Container Path | What it's for | Restart needed? |
|--------------|----------------|---------------|-----------------|
| `html/` | `/usr/local/apache2/htdocs` | Frontend HTML/CSS/JS | ❌ No - just refresh browser |
| `be/` | `/usr/local/apache2/be` | Backend Node.js code | ❌ No - nodemon auto-reloads |
| `uploads/` | `/usr/local/apache2/uploads` | File storage, user data | ❌ No - persistent storage |

**Other files** (Dockerfile, httpd.conf, cgi-bin) are copied into the image, so changes require rebuild.

### 4. 🌐 Multiple Access Methods

This image supports **three ways** to handle requests:

1. **Static Files** - HTML, CSS, JS served directly by Apache
2. **CGI Scripts** - Node.js scripts executed per request (in `cgi-bin/`)
3. **ProxyPass** - Reverse proxy to Node.js Express server (port 3000)

Choose the method that fits your use case!

## 🔄 How to Make Changes

### 🎨 Editing Frontend (HTML/CSS/JS)

**Files affected:** Anything in `html/` folder

```bash
# 1. Edit the file
notepad html\login.html

# 2. Save it
# 3. Refresh browser - changes appear immediately!
```

**No rebuild, no restart needed.** The `html/` folder is volume-mounted.

---

### 🔧 Editing Backend (Node.js API)

**Files affected:** `be/server.js`, `be/package.json`

```bash
# 1. Edit the backend
notepad be\server.js

# 2. Save it
# 3. Wait ~1 second (watch Docker logs to see nodemon restart)
# 4. Your new route works immediately!
```

**Example - Add a new API endpoint:**
```javascript
// Add to be/server.js
app.get('/get/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
});
// Save, wait 1 second, visit http://localhost:10248/get/hello
```

**No rebuild needed** - nodemon watches for changes and auto-reloads.

---

### ⚙️ Editing Configuration

**Files affected:** `httpd.conf`, `Dockerfile`, `cgi-bin/*`, `start_servers.sh`

These files are **copied into the image** during build, so changes require rebuild:

```bash
# 1. Edit the file
notepad httpd.conf

# 2. Rebuild the image
build_image.bat

# 3. Restart the container
stop_httpd_test.bat
start_httpd_test.bat
```

**When to rebuild:**
- Changed Apache config (`httpd.conf`)
- Changed CGI scripts (`cgi-bin/`)
- Changed Dockerfile
- Changed startup script (`start_servers.sh`)
- Installed new Node.js packages (`be/package.json` - run `docker restart httpd-test` after npm install)

## 📋 Architecture

```
┌────────────────────────────────────────────────────┐
│         Apache HTTPD (www-data)                    │
│    Port 80 (HTTP) / 443 (HTTPS)                   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Static Files (Volume Mounted)                    │
│  └─ /                  → Directory listing        │
│  └─ /login.html        → Login page               │
│  └─ /register.html     → Registration page        │
│  └─ /hello.html        → Protected page           │
│                                                    │
│  CGI Scripts (Unified Handler)                    │
│  └─ /cgi-bin/cgi.js        → Form, JSON & GET    │
│                                                    │
│  ProxyPass → Unified Node.js Backend             │
│  └─ /post/register     → localhost:3000          │
│  └─ /post/login        → localhost:3000          │
│  └─ /get/verify        → localhost:3000          │
│  └─ /post/uri          → localhost:3000          │
│  └─ /post/json         → localhost:3000          │
│  └─ /get/param         → localhost:3000          │
│                                                    │
│  WebDAV (Basic Auth)                              │
│  └─ /uploads/ → jd:pw                            │
│     └─ user_info.json  → User credentials        │
│                                                    │
└────────────────────────────────────────────────────┘
                        │
                        ▼
          Unified Express Server (Port 3000)
          - Authentication (register/login/verify)
          - Test endpoints (uri/json/param)
          - Auto-reload with nodemon
```

## 🛠️ Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `build_image.bat` | Build image (no cache) | Run after Dockerfile/httpd.conf changes |
| `start_httpd_test.bat` | Start container with volume mounts | First time or after rebuild |
| `stop_httpd_test.bat` | Stop container | When done testing |
| `restart_httpd_test.bat` | Restart container | Apply config changes |
| `logs_httpd_test.bat` | View container logs | Debug issues |

## 🧪 Testing Your Setup

### Option 1: Use the Browser (Easiest)

Visit http://localhost:10248/httpd_be_test.html

This page has **6 test forms** that test all API endpoints:
- ✅ CGI POST (form data)
- ✅ CGI POST (JSON)
- ✅ CGI GET (URL parameters)
- ✅ ProxyPass POST (form data)
- ✅ ProxyPass POST (JSON)
- ✅ ProxyPass GET (URL parameters)

Click each "Submit" button and verify you get a response!

---

### Option 2: Use curl (For API Testing)

**Test ProxyPass endpoints:**
```bash
# Form data
curl -X POST http://localhost:10248/post/uri \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "inputstr=Hello"

# JSON POST
curl -X POST http://localhost:10248/post/json \
  -H "Content-Type: application/json" \
  -d '{"inputstr":"Hello JSON"}'

# GET with parameters
curl "http://localhost:10248/get/param?inputstr=Hello%20GET"
```

**Test CGI endpoint:**
```bash
# Auto-detects content type!
curl -X POST http://localhost:10248/cgi-bin/cgi.js \
  -H "Content-Type: application/json" \
  -d '{"inputstr":"CGI Test"}'
```

**Test authentication:**
```bash
# Register
curl -X POST http://localhost:10248/post/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'

# Login (get token)
curl -X POST http://localhost:10248/post/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'

# Verify token (replace TOKEN with actual token from login)
curl -X GET http://localhost:10248/get/verify \
  -H "Authorization: Bearer TOKEN"
```

## 🛠️ Management Scripts

Duplicate section removed - see above for management scripts reference.

## 📤 WebDAV Upload Examples

**Using curl:**
```bash
# Upload file
curl -u "jd:pw" "http://localhost:10248/uploads/myfile.txt" -T myfile.txt

# List files
curl -u "jd:pw" "http://localhost:10248/uploads/" -X PROPFIND

# Download file
curl -u "jd:pw" "http://localhost:10248/uploads/user_info.json"
```

**Using WinSCP (Recommended for Windows):**
1. Protocol: **WebDAV**
2. Host: `localhost`
3. Port: `10248`
4. Path: `/uploads`
5. User: `jd` / Password: `pw`

## 🐛 Troubleshooting

### ❌ "Port 10248 already in use"

**Solution:**
```bash
# Stop the running container
stop_httpd_test.bat

# Or find what's using the port
netstat -ano | findstr :10248
# Then kill the process or change the port in start_httpd_test.bat
```

---

### ❌ "Backend changes not reflecting"

**Check if nodemon is running:**
```bash
docker logs httpd-test | findstr nodemon

# You should see: [nodemon] watching path(s): *.*
```

**Force restart:**
```bash
restart_httpd_test.bat
```

---

### ❌ "404 Not Found on /post/login"

**Verify ProxyPass is configured:**
```bash
docker exec httpd-test grep ProxyPassMatch /usr/local/apache2/conf/httpd.conf

# Should output:
# ProxyPassMatch ^/(get|post)/(.*)$ http://localhost:3000/$1/$2
```

**Check backend is running:**
```bash
docker exec httpd-test curl http://localhost:3000/post/login
```

---

### ❌ "User data not saving"

**Check uploads folder:**
```bash
dir uploads\user_info.json

# If missing, check volume mount:
docker inspect httpd-test | findstr uploads
```

---

### ❌ "Build fails with npm error"

**Clear Docker cache and rebuild:**
```bash
docker system prune -a
build_image.bat
```

---

### 📋 View Container Logs

```bash
# Windows
logs_httpd_test.bat

# Or manually
docker logs httpd-test

# Follow logs in real-time
docker logs -f httpd-test
```

---

### 🔍 Debug Inside Container

```bash
# Access container shell
docker exec -it httpd-test bash

# Check running processes
ps aux

# Check Node.js backend
curl http://localhost:3000/get/param?inputstr=test

# View httpd config
cat /usr/local/apache2/conf/httpd.conf | grep Proxy
```

## 💡 Tips for Newcomers

- 🎯 **Start simple:** First run the test page to ensure everything works
- 📂 **Check uploads/:** User data is stored here, accessible from your host machine
- 🔄 **Use auto-reload:** Edit `be/server.js` and changes apply in ~1 second
- 🚀 **Add routes easily:** Just add to `server.js` - no config edits needed for `/get/*` or `/post/*`
- 🔑 **Token expires fast:** Default is 60 seconds, change in `be/server.js` if needed
- 📁 **WebDAV credentials:** Username `jd`, password `pw` (change in `httpd.conf`)
- 🔍 **View logs:** Use `logs_httpd_test.bat` to debug issues
- 📝 **Directory listing:** Enabled by default at http://localhost:10248/

---

## 🛠️ Management Scripts (Windows)

| Script | Purpose |
|--------|---------|
| `build_image.bat` | Build Docker image from scratch |
| `start_httpd_test.bat` | Start container with volume mounts |
| `stop_httpd_test.bat` | Stop and remove container |
| `restart_httpd_test.bat` | Restart container (keeps volumes) |
| `logs_httpd_test.bat` | View container logs |

**Linux/Mac users:** Check the scripts to see the docker commands and adapt them for your shell.

---

## 📚 Documentation Files

For more detailed information, check these docs:

- `AUTO_PROXY_v3.2.md` - Auto-proxy pattern documentation
- `GET_METHOD_ADDED_v3.1.md` - GET method implementation details
- `CGI_UNIFICATION.md` - CGI script unification
- `README_httpd-nodejs.md` - Quick reference guide
- `FINAL_STATUS.md` - Current system status

---

## 📝 Version History

- **v3.2.0** (2026-03-23) - Auto-proxy pattern, no more httpd.conf edits! 🎉
- **v3.1.0** (2026-03-19) - Clearer routes, unified CGI, GET support ✅
- **v3.0.0** (2026-03-19) - Unified backend, auth system, consistent routing ✅
- **v2.0.0** - Nodemon auto-reload, WebDAV basic auth
- **v1.3.0** - Organized folder structure with bind mounts
- **v1.0.0** - Initial CGI + ProxyPass version

---

## 🤝 Contributing

Found a bug or want to contribute? 

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly with `httpd_be_test.html`
5. Submit a pull request

---

## 📄 License

This project is open source. Feel free to use and modify for your needs.

---

**Last Updated:** 2026-04-09  
**Maintainer:** GitHub @tlqtangok  
**Repository:** https://github.com/tlqtangok/jd_httpd

