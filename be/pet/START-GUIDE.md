# 🐾 宠物养成游戏 - 快速启动指南

## 📦 系统架构

```
[浏览器] → http://jesson.tech:10201 → [ngrokd服务器:10201] 
              ↓
         [ngrok tunnel:10200]
              ↓
         [ngrok客户端] → localhost:3000 → [游戏服务器]
```

## 🚀 启动步骤

### 1️⃣ 启动游戏服务器（已完成 ✅）
```bash
cd d:\jd\t\t0\cc1\pet
npm start
# 服务运行在 localhost:3000
```

### 2️⃣ 确认 ngrokd 服务器运行中
在您的服务器上运行：
```bash
./ngrokd -tlsKey=server.key -tlsCrt=server.crt -domain=jesson.tech -tunnelAddr=:10200 -httpAddr=:10201 -httpsAddr=:10202 -log-level=ERROR
```

### 3️⃣ 启动 ngrok 客户端

#### Windows:
```batch
start-ngrok.bat
```

#### Linux/Mac:
```bash
chmod +x start-ngrok.sh
./start-ngrok.sh
```

#### 手动启动（如果脚本找不到 ngrok）:
```bash
# 假设 ngrok 在当前目录
ngrok.exe -config=ngrok.yml start pet

# 或使用完整路径
D:\path\to\ngrok.exe -config=ngrok.yml start pet

# Linux/Mac
./ngrok -config=ngrok.yml start pet
```

#### 不使用配置文件的启动方式:
```bash
ngrok -server_addr=jesson.tech:10200 -trust_host_root_certs=false http -hostname=jesson.tech 3000
```

## 🌐 访问游戏

启动成功后，在浏览器中访问：
**http://jesson.tech:10201**

## 📥 下载 ngrok 客户端

如果您还没有 ngrok 客户端程序：

1. **从 ngrok 官网下载**：https://ngrok.com/download
2. **或从您的 ngrokd 服务器编译**（如果您有源码）
3. 将 ngrok 可执行文件放到项目目录或添加到 PATH

## ✅ 验证清单

- [ ] 游戏服务器运行在 localhost:3000
- [ ] ngrokd 服务器运行在 jesson.tech
- [ ] ngrok 客户端已启动并连接成功
- [ ] 可以访问 http://jesson.tech:10201

## 🔍 故障排查

### 问题 1: ngrok 客户端连接失败
```
Error: dial tcp: lookup jesson.tech: no such host
```
**解决**: 检查 DNS 或在 hosts 文件中添加：
```
your.server.ip jesson.tech
```

### 问题 2: 连接被拒绝
```
Error: dial tcp jesson.tech:10200: connect: connection refused
```
**解决**: 确认 ngrokd 服务器正在运行，检查防火墙端口 10200

### 问题 3: 证书错误
```
Error: x509: certificate signed by unknown authority
```
**解决**: 已在配置中设置 `trust_host_root_certs: false`

### 问题 4: 游戏页面打不开
- 检查 localhost:3000 是否能访问
- 检查 ngrok 客户端是否显示 "Tunnel established"
- 查看 ngrok 客户端输出的日志

## 📊 查看 ngrok 状态

ngrok 客户端启动后会显示：
```
Tunnel Status                 online
Version                       2.x/3.x
Forwarding                    http://jesson.tech:10201 -> localhost:3000
Web Interface                 http://127.0.0.1:4040
Connections                   ttl     opn     rt1
```

## 🎮 游戏功能

1. **认领宠物** - 创建小朋友账户
2. **我的宠物** - 管理和喂养
3. **积分商城** - 兑换宠物粮
4. **管理员密码**: 123456

---

**有问题？** 查看 ngrok 客户端输出的错误信息，或检查 ngrokd 服务器日志。
