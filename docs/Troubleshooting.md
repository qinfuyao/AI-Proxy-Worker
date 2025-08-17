# 故障排除指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Troubleshooting.en.md) | [🇨🇳 中文](./Troubleshooting.md)

</div>

本指南涵盖了使用 AI Proxy Worker 时可能遇到的常见问题及其解决方案。如果你遇到的问题不在此列表中，请在 [📋 Issues](https://github.com/qinfuyao/AI-Proxy-Worker/issues) 中提交新的问题报告。

## 🚨 常见错误及解决方案

### 1. 认证相关错误

#### ❌ 401 Unauthorized
**错误信息：**
```json
{
  "error": "unauthorized",
  "details": "Invalid or missing authorization",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**可能原因：**
- `PROXY_KEY` 未设置或设置错误
- 请求头中缺少 `Authorization` 字段
- `Authorization` 格式不正确

**解决方案：**

1. **检查环境变量设置：**
   ```bash
   # 查看已设置的密钥（不显示值）
   wrangler secret list
   
   # 重新设置 PROXY_KEY
   wrangler secret put PROXY_KEY
   ```

2. **检查请求格式：**
   ```bash
   # 正确格式
   curl -H "Authorization: Bearer YOUR_PROXY_KEY" \
        https://your-worker.workers.dev/chat
   
   # 错误格式（缺少 Bearer）
   curl -H "Authorization: YOUR_PROXY_KEY" \
        https://your-worker.workers.dev/chat
   ```

3. **验证密钥是否正确：**
   ```javascript
   // 确保密钥前后没有空格
   const proxyKey = "YOUR_PROXY_KEY".trim();
   ```

#### ❌ Configuration Error
**错误信息：**
```json
{
  "error": "configuration_error",
  "details": "Service configuration error",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**可能原因：**
- `DEEPSEEK_API_KEY` 未设置
- DeepSeek API 密钥无效或已过期

**解决方案：**

1. **重新设置 DeepSeek API 密钥：**
   ```bash
   wrangler secret put DEEPSEEK_API_KEY
   ```

2. **验证 DeepSeek 密钥有效性：**
   ```bash
   curl -X POST https://api.deepseek.com/chat/completions \
     -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
   ```

3. **检查 DeepSeek 账户状态：**
   - 登录 [DeepSeek 平台](https://platform.deepseek.com/)
   - 检查账户余额
   - 确认 API 密钥状态

### 2. 请求格式错误

#### ❌ 400 Bad Request - Invalid JSON
**错误信息：**
```json
{
  "error": "invalid_request",
  "details": "Invalid JSON format",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**解决方案：**

1. **验证 JSON 格式：**
   ```bash
   # 使用在线 JSON 验证器或
   echo '{"model":"deepseek-chat","messages":[]}' | python -m json.tool
   ```

2. **检查特殊字符：**
   ```javascript
   // 正确转义特殊字符
   const message = "He said: \"Hello, world!\"";
   const payload = JSON.stringify({
     model: "deepseek-chat",
     messages: [{ role: "user", content: message }]
   });
   ```

#### ❌ 400 Bad Request - Missing Required Fields
**错误信息：**
```json
{
  "error": "invalid_request", 
  "details": "Invalid request format. Missing or invalid messages array",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**解决方案：**

确保请求包含必需字段：
```json
{
  "model": "deepseek-chat",        // 必需
  "messages": [                    // 必需，且必须是数组
    {
      "role": "user",              // 必需：user/assistant/system
      "content": "Hello"           // 必需：消息内容
    }
  ]
}
```

#### ❌ 413 Payload Too Large
**错误信息：**
```json
{
  "error": "payload_too_large",
  "details": "Request body too large. Maximum size: 1048576 bytes",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**解决方案：**

1. **减少请求内容：**
   - 缩短对话历史
   - 减少单条消息长度
   - 移除不必要的参数

2. **分批处理长文本：**
   ```javascript
   function splitLongText(text, maxLength = 8000) {
     const chunks = [];
     for (let i = 0; i < text.length; i += maxLength) {
       chunks.push(text.slice(i, i + maxLength));
     }
     return chunks;
   }
   ```

3. **调整配置（如果有权限）：**
   ```javascript
   // 在 worker.js 中调整
   const CONFIG = {
     MAX_BODY_SIZE: 2 * 1024 * 1024, // 增加到 2MB
   };
   ```

### 3. 网络和超时错误

#### ❌ 504 Gateway Timeout
**错误信息：**
```json
{
  "error": "timeout",
  "details": "Request to DeepSeek API timed out",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**解决方案：**

1. **重试请求：**
   ```javascript
   async function retryRequest(requestFn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await requestFn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

2. **减少请求复杂度：**
   - 降低 `max_tokens` 参数
   - 简化提示内容
   - 使用更简单的模型

3. **检查网络连接：**
   ```bash
   # 测试到 DeepSeek API 的连接
   curl -I https://api.deepseek.com/
   
   # 测试到 Worker 的连接
   curl -I https://your-worker.workers.dev/
   ```

#### ❌ 502 Bad Gateway
**错误信息：**
```json
{
  "error": "upstream_error",
  "details": "Failed to connect to DeepSeek API",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**解决方案：**

1. **检查 DeepSeek API 状态：**
   - 访问 [DeepSeek 状态页面](https://status.deepseek.com/)（如果有）
   - 在社交媒体查看服务状态更新

2. **验证 API 密钥：**
   ```bash
   curl -X POST https://api.deepseek.com/chat/completions \
     -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
   ```

3. **等待并重试：**
   - 等待几分钟后重试
   - 如果持续出现，可能是 DeepSeek API 临时故障

### 4. 部署相关问题

#### ❌ Wrangler 登录失败
**错误信息：**
```
Error: Failed to login. Please try again.
```

**解决方案：**

1. **清除登录状态并重新登录：**
   ```bash
   wrangler logout
   wrangler login
   ```

2. **手动登录（如果浏览器无法打开）：**
   ```bash
   wrangler login --browser=false
   # 复制显示的 URL 到浏览器中打开
   ```

3. **检查网络代理：**
   ```bash
   # 如果使用代理
   export https_proxy=http://proxy.example.com:8080
   wrangler login
   ```

#### ❌ 部署失败
**错误信息：**
```
Error: Failed to publish your Worker
```

**解决方案：**

1. **检查 wrangler.toml 配置：**
   ```toml
   name = "ai-proxy-worker"  # 确保名称有效
   main = "worker.js"        # 确保文件存在
   compatibility_date = "2025-01-01"  # 使用有效日期
   ```

2. **验证代码语法：**
   ```bash
   # 检查 JavaScript 语法
   node -c worker.js
   ```

3. **检查账户限制：**
   - 免费账户有 Worker 数量限制
   - 检查 Cloudflare Dashboard 中的配额使用情况

#### ❌ Worker 无法访问
**现象：**
- 部署成功但访问 Worker URL 时出现错误
- 返回 Cloudflare 默认错误页面

**解决方案：**

1. **检查 Worker 状态：**
   ```bash
   wrangler deployments list
   ```

2. **查看实时日志：**
   ```bash
   wrangler tail
   # 然后在另一个终端测试请求
   ```

3. **验证路由配置：**
   ```bash
   # 检查健康检查端点
   curl https://your-worker.workers.dev/
   ```

### 5. 流式响应问题

#### ❌ 流式响应中断
**现象：**
- 流式响应突然停止
- 收到不完整的响应

**解决方案：**

1. **检查客户端超时设置：**
   ```javascript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
   
   fetch(url, {
     signal: controller.signal,
     // ...其他选项
   });
   ```

2. **实现重连机制：**
   ```javascript
   async function streamWithRetry(url, options, maxRetries = 3) {
     for (let attempt = 0; attempt < maxRetries; attempt++) {
       try {
         const response = await fetch(url, options);
         // 处理流式响应
         return response;
       } catch (error) {
         if (attempt === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000));
       }
     }
   }
   ```

3. **验证 SSE 格式：**
   ```javascript
   // 确保正确解析 SSE 数据
   const lines = chunk.split('\n');
   for (const line of lines) {
     if (line.startsWith('data: ')) {
       const data = line.slice(6);
       if (data === '[DONE]') break;
       // 处理数据
     }
   }
   ```

## 🔍 调试工具和技巧

### 1. 查看 Worker 日志

**实时日志：**
```bash
# 查看实时日志
wrangler tail

# 过滤特定级别的日志
wrangler tail --format=pretty
```

**Cloudflare Dashboard 日志：**
1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 点击 "Logs" 标签页

### 2. 本地调试

**本地开发服务器：**
```bash
# 启动本地开发环境
wrangler dev

# 指定端口
wrangler dev --port 8787
```

**添加调试日志：**
```javascript
// 在 worker.js 中添加调试信息
console.log('Request received:', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers)
});
```

### 3. 健康检查脚本

创建一个简单的健康检查脚本：

```bash
#!/bin/bash
# health-check.sh

WORKER_URL="https://your-worker.workers.dev"
PROXY_KEY="YOUR_PROXY_KEY"

echo "🔍 健康检查开始..."

# 1. 基础健康检查
echo "1. 检查服务状态..."
curl -s "$WORKER_URL/" | jq .

# 2. 认证测试
echo "2. 测试认证..."
curl -s -X POST "$WORKER_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[]}' | jq .

# 3. API 调用测试
echo "3. 测试 API 调用..."
curl -s -X POST "$WORKER_URL/chat" \
  -H "Authorization: Bearer $PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "test"}]
  }' | jq .

echo "✅ 健康检查完成"
```

### 4. 性能监控

**响应时间测试：**
```bash
# 创建性能测试脚本
curl -w "@curl-format.txt" -s -o /dev/null \
  -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

**curl-format.txt 文件内容：**
```
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```

## 📊 监控和告警

### 1. Cloudflare Analytics

在 Cloudflare Dashboard 中查看：
- 请求数量和响应时间
- 错误率统计
- 流量分布

### 2. 自定义监控

```javascript
// 在 worker.js 中添加监控指标
const startTime = Date.now();

// 处理请求...

const duration = Date.now() - startTime;
console.log(`Request completed in ${duration}ms`, {
  method: request.method,
  status: response.status,
  duration,
  timestamp: new Date().toISOString()
});
```

### 3. 外部监控服务

可以使用以下服务监控 Worker：
- Uptime Robot
- Pingdom
- StatusCake
- UptimeRobot

监控配置示例：
```
URL: https://your-worker.workers.dev/
Method: GET
Expected Response: {"status":"ok"}
Check Interval: 5 minutes
```

## 🆘 获取帮助

如果上述解决方案都无法解决你的问题：

### 1. 搜索现有问题
- 查看 [📋 Issues](https://github.com/qinfuyao/AI-Proxy-Worker/issues)
- 搜索 [💡 Discussions](https://github.com/qinfuyao/AI-Proxy-Worker/discussions)
- 查看 [Cloudflare Community](https://community.cloudflare.com/)

### 2. 提交新问题

在 GitHub Issues 中提交问题时，请包含：

**基本信息：**
- 操作系统和版本
- Node.js 和 Wrangler 版本
- 错误的完整信息

**重现步骤：**
- 详细的操作步骤
- 使用的命令或代码
- 期望的结果 vs 实际结果

**日志信息：**
```bash
# 获取详细日志
wrangler tail --format=pretty > logs.txt
```

**示例请求：**
```bash
# 提供失败的 curl 命令示例
curl -v -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer ***" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[...]}'
```

### 3. 社区资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs)
- [💡 Discussions](https://github.com/qinfuyao/AI-Proxy-Worker/discussions) - 社区讨论
- [Discord/Telegram 群组]（如果有）

---

**问题解决了？** 👉 [查看更多示例](./Examples.md) | [📋 Issues](https://github.com/qinfuyao/AI-Proxy-Worker/issues)
