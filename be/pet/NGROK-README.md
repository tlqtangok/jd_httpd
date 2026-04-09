# ngrok 客户端配置说明

## 🎯 目标
将 localhost:3000 映射到 http://jesson.tech:10201

## 配置文件：ngrok.yml

服务器信息：
- **ngrokd 服务器地址**: jesson.tech:10200 (tunnel 端口)
- **外网访问地址**: http://jesson.tech:10201
- **本地游戏服务**: localhost:3000

## 启动方式

### 方式 1: 使用批处理脚本
```batch
start-ngrok.bat
```

### 方式 2: 手动启动
```batch
ngrok -config=ngrok.yml start pet
```

### 方式 3: 使用完整路径
如果 ngrok 客户端在其他位置，例如：
```batch
D:\path\to\ngrok.exe -config=ngrok.yml start pet
```

## 命令行参数说明

如果不使用配置文件，也可以直接命令行启动：

```batch
ngrok -server_addr=jesson.tech:10200 -trust_host_root_certs=false -proto=http -hostname=jesson.tech -port=10201 3000
```

或者使用 HTTP 协议：
```batch
ngrok -server_addr=jesson.tech:10200 http -hostname=jesson.tech 3000
```

## 访问地址

启动成功后，您的宠物养成游戏将可以通过以下地址访问：

- **HTTP**: http://jesson.tech:10201
- **HTTPS**: https://jesson.tech:10202 (如果服务器配置了 SSL)

## 验证服务

1. 确保您的 ngrokd 服务器正在运行：
   ```
   ./ngrokd -tlsKey=server.key -tlsCrt=server.crt -domain=jesson.tech -tunnelAddr=:10200 -httpAddr=:10201 -httpsAddr=:10202 -log-level=ERROR
   ```

2. 确保本地宠物游戏服务器在运行 (localhost:3000)

3. 启动 ngrok 客户端

4. 在浏览器中访问 http://jesson.tech:10201

## 故障排查

如果连接失败：
1. 检查防火墙是否允许 10200, 10201, 10202 端口
2. 确认 ngrokd 服务器正在运行
3. 检查 DNS 是否正确解析到 ngrok 服务器 IP
4. 查看 ngrok 客户端输出的错误信息

## 保持后台运行

Windows 后台运行：
```batch
start /B ngrok -config=ngrok.yml start pet
```

或使用 PowerShell：
```powershell
Start-Process -FilePath "ngrok.exe" -ArgumentList "-config=ngrok.yml start pet" -WindowStyle Hidden
```
