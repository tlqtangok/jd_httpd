# 🔧 宠物游戏集成到 create_httpd_img/be 指南

## 📋 已完成的修改

✅ **端口修改**: 3000 → **3001**
✅ **路由修改**: `/api/*` → `/get/pet/*` 或 `/post/pet/*`

## 🗂️ API 路由列表

### GET 请求
- `GET /get/pet/children` - 获取所有小朋友列表
- `GET /get/pet/child/:account` - 获取指定小朋友详情
- `GET /get/pet/check-hunger/:account` - 检查宠物饥饿状态

### POST 请求
- `POST /post/pet/register` - 注册新小朋友（支持文件上传）
- `POST /post/pet/child/:account/add-points` - 添加积分（需要密码）
- `POST /post/pet/child/:account/hatch` - 孵化/出生宠物
- `POST /post/pet/child/:account/buy-food` - 购买宠物粮
- `POST /post/pet/child/:account/feed` - 喂食宠物
- `POST /post/pet/child/:account/perform` - 宠物表演

## 🔨 手动集成步骤

### 方法 1: 合并到单个 server.js 文件

1. **复制宠物游戏的路由到 create_httpd_img/be/server.js**

```javascript
// 在 create_httpd_img/be/server.js 中添加以下代码

// ========== 宠物游戏模块开始 ==========
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const PET_DATA_FILE = 'pet-data.json';
const ADMIN_PASSWORD = '123456';

function loadPetData() {
  if (fs.existsSync(PET_DATA_FILE)) {
    return JSON.parse(fs.readFileSync(PET_DATA_FILE, 'utf8'));
  }
  return { children: [] };
}

function savePetData(data) {
  fs.writeFileSync(PET_DATA_FILE, JSON.stringify(data, null, 2));
}

// 复制所有宠物游戏的路由（从当前 pet/server.js 的第 42-206 行）
app.post('/post/pet/register', upload.single('avatar'), (req, res) => {
  // ... 完整代码
});

app.get('/get/pet/children', (req, res) => {
  // ... 完整代码
});

// ... 其他所有路由

// ========== 宠物游戏模块结束 ==========
```

2. **复制 public 文件夹**
```bash
# 复制整个 public 文件夹到 create_httpd_img/be/
cp -r d:\jd\t\t0\cc1\pet\public d:\jd\t\t0\cc1\create_httpd_img\be\public
```

3. **更新 package.json**
```bash
cd d:\jd\t\t0\cc1\create_httpd_img\be
npm install multer
```

---

### 方法 2: 作为独立服务运行（推荐）

保持两个独立的服务器，使用反向代理：

#### A. 在 Apache httpd.conf 中添加代理配置

```apache
# 宠物游戏代理
ProxyPassMatch ^/get/pet/(.*)$ http://localhost:3001/get/pet/$1
ProxyPassMatch ^/post/pet/(.*)$ http://localhost:3001/post/pet/$1

# 静态文件代理（可选）
ProxyPass /pet-game/ http://localhost:3001/
ProxyPassReverse /pet-game/ http://localhost:3001/
```

#### B. 启动两个服务

```bash
# Terminal 1: 原有的 backend
cd d:\jd\t\t0\cc1\create_httpd_img\be
npm start  # 运行在 3000 端口

# Terminal 2: 宠物游戏
cd d:\jd\t\t0\cc1\pet
npm start  # 运行在 3001 端口
```

---

### 方法 3: 完全合并代码（最彻底）

#### 步骤 1: 复制文件
```bash
# 1. 复制宠物游戏的路由代码
# 从 pet/server.js 复制所有路由到 create_httpd_img/be/server.js

# 2. 复制前端文件
cp d:\jd\t\t0\cc1\pet\public\index.html d:\jd\t\t0\cc1\create_httpd_img\be\public\pet.html
cp d:\jd\t\t0\cc1\pet\public\style.css d:\jd\t\t0\cc1\create_httpd_img\be\public\pet-style.css
cp d:\jd\t\t0\cc1\pet\public\app.js d:\jd\t\t0\cc1\create_httpd_img\be\public\pet-app.js

# 3. 创建 uploads 目录
mkdir d:\jd\t\t0\cc1\create_httpd_img\be\public\uploads
```

#### 步骤 2: 修改 create_httpd_img/be/server.js

```javascript
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');
const multer = require('multer'); // 新增

const app = express();
const PORT = 3000; // 保持 3000

// 原有配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // 添加静态文件服务

// 添加 multer 配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 原有的用户认证代码...
const USER_DATA_FILE = '/usr/local/apache2/uploads/user_info.json';
const tokens = new Map();
// ... 保持原有代码 ...

// ========== 宠物游戏路由开始 ==========
const PET_DATA_FILE = 'pet-data.json';
const ADMIN_PASSWORD = '123456';

function loadPetData() {
  if (fsSync.existsSync(PET_DATA_FILE)) {
    return JSON.parse(fsSync.readFileSync(PET_DATA_FILE, 'utf8'));
  }
  return { children: [] };
}

function savePetData(data) {
  fsSync.writeFileSync(PET_DATA_FILE, JSON.stringify(data, null, 2));
}

// 粘贴所有宠物游戏的路由代码...
app.post('/post/pet/register', upload.single('avatar'), (req, res) => {
  // ... 完整代码
});

// ... 其他所有宠物路由 ...

// ========== 宠物游戏路由结束 ==========

// 保持原有的其他路由
app.post('/post/uri', (req, res) => {
    // ... 原有代码
});

// 最后启动服务器
app.listen(PORT, () => {
    console.log(`Unified backend server running on http://localhost:${PORT}`);
});
```

#### 步骤 3: 安装依赖
```bash
cd d:\jd\t\t0\cc1\create_httpd_img\be
npm install multer
```

#### 步骤 4: 访问宠物游戏
```
http://jesson.tech:10201/pet.html
```

---

## 📁 文件清单（需要复制的文件）

```
从 pet/ 复制到 create_httpd_img/be/:

📄 server.js 中的路由代码（第42-206行）
📄 public/index.html → public/pet.html
📄 public/style.css → public/pet-style.css
📄 public/app.js → public/pet-app.js
📁 public/uploads/ (创建空目录)
```

---

## 🔗 Apache ProxyPass 配置（推荐方式2）

如果使用独立服务（方法2），在 httpd.conf 添加：

```apache
# 宠物游戏 API 代理（运行在 3001）
ProxyPassMatch ^/get/pet/(.*)$ http://localhost:3001/get/pet/$1
ProxyPassMatch ^/post/pet/(.*)$ http://localhost:3001/post/pet/$1

# 宠物游戏前端（可选，直接访问 3001）
ProxyPass /pet-game http://localhost:3001/
ProxyPassReverse /pet-game http://localhost:3001/
```

---

## ✅ 集成验证

### 测试 API:
```bash
# 测试获取宠物列表
curl http://localhost:3001/get/pet/children

# 或通过 jesson.tech
curl http://jesson.tech:10201/get/pet/children
```

### 测试前端:
```
浏览器访问: http://localhost:3001
或: http://jesson.tech:10201
```

---

## 🎯 推荐方案

**推荐使用方法 2（独立服务）**，因为：
- ✅ 代码分离，易于维护
- ✅ 可以独立重启
- ✅ 不影响原有系统
- ✅ 通过 ProxyPass 统一访问

---

## 📊 端口分配

```
3000 - create_httpd_img/be (原有服务)
3001 - pet 游戏服务器 (新服务)
10200 - ngrokd tunnel 端口
10201 - ngrokd HTTP 端口（对外访问）
```

---

## 🚀 快速启动命令

```bash
# 启动宠物游戏服务器
cd d:\jd\t\t0\cc1\pet
npm start

# 服务器会输出:
# 宠物养成游戏服务器运行在 http://localhost:3001

# 通过 jesson.tech 访问:
# http://jesson.tech:10201
```

---

需要我帮您执行哪种集成方式？
