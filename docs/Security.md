# 安全配置

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Security.en.md) | [🇨🇳 中文](./Security.md)

</div>

在生产环境中部署 AI Proxy Worker 的综合安全指南。遵循这些最佳实践，确保你的部署安全并防范常见威胁。

## 🔐 认证与授权

### API 密钥安全
保护你的 AI 服务 API 密钥：

```javascript
// ✅ 正确: 存储在 Cloudflare 密钥中
wrangler secret put DEEPSEEK_API_KEY

// ❌ 错误: 永远不要在源代码中硬编码
const API_KEY = "sk-1234567890abcdef"; // 永远不要这样做
```

### 代理密钥配置
设置安全的代理访问：

```javascript
// 强代理密钥生成
const PROXY_KEY = crypto.randomUUID() + crypto.randomUUID();

// 设置为 Cloudflare 密钥
wrangler secret put PROXY_KEY
```

### 多层认证
实施分层安全：

```javascript
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: '缺少或无效的授权头' };
  }
  
  const token = authHeader.substring(7);
  
  // 验证代理密钥
  if (token !== env.PROXY_KEY) {
    return { valid: false, error: '无效的代理密钥' };
  }
  
  return { valid: true };
}
```

## 🛡️ 输入验证与清理

### 请求验证
验证所有传入请求：

```javascript
function validateChatRequest(data) {
  const errors = [];
  
  // 必需字段
  if (!data.messages || !Array.isArray(data.messages)) {
    errors.push('messages 必须是数组');
  }
  
  if (!data.model || typeof data.model !== 'string') {
    errors.push('model 必须是字符串');
  }
  
  // 消息验证
  data.messages?.forEach((msg, index) => {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      errors.push(`messages[${index}].role 必须是 user、assistant 或 system`);
    }
    
    if (!msg.content || typeof msg.content !== 'string') {
      errors.push(`messages[${index}].content 必须是非空字符串`);
    }
    
    // 内容长度限制
    if (msg.content.length > 100000) {
      errors.push(`messages[${index}].content 超过最大长度`);
    }
  });
  
  // 参数验证
  if (data.temperature !== undefined) {
    if (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 2) {
      errors.push('temperature 必须是 0 到 2 之间的数字');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 内容过滤
实施内容安全检查：

```javascript
function containsUnsafeContent(text) {
  const unsafePatterns = [
    /\b(password|secret|key|token|密码|密钥|令牌)\s*[:=]\s*\w+/i,
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡模式
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // 邮箱模式（如需要）
  ];
  
  return unsafePatterns.some(pattern => pattern.test(text));
}

// 在请求处理器中使用
if (containsUnsafeContent(message.content)) {
  return new Response(JSON.stringify({
    error: 'content_rejected',
    message: '请求包含潜在不安全内容'
  }), { status: 400 });
}
```

## 🚫 速率限制与 DDoS 防护

### 请求速率限制
实施速率限制以防止滥用：

```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // 清理旧条目
    for (const [id, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, validTimestamps);
      }
    }
    
    // 检查当前客户端
    const clientRequests = this.requests.get(clientId) || [];
    const recentRequests = clientRequests.filter(ts => ts > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // 添加当前请求
    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    
    return true;
  }
  
  getRemainingRequests(clientId) {
    const clientRequests = this.requests.get(clientId) || [];
    const windowStart = Date.now() - this.windowMs;
    const recentRequests = clientRequests.filter(ts => ts > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// 使用方法
const rateLimiter = new RateLimiter(100, 60000); // 每分钟 100 个请求

async function handleRequest(request, env) {
  const clientId = getClientId(request);
  
  if (!rateLimiter.isAllowed(clientId)) {
    return new Response(JSON.stringify({
      error: 'rate_limit_exceeded',
      message: '请求过多。请稍后再试。',
      retryAfter: 60
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    });
  }
  
  // 处理请求...
}
```

### 基于 IP 的防护
实施基于 IP 的安全措施：

```javascript
function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For') || 
         'unknown';
}

const BLOCKED_IPS = new Set([
  '192.168.1.100',
  '10.0.0.50'
]);

function isBlockedIP(ip) {
  return BLOCKED_IPS.has(ip);
}

// 在请求处理器中使用
const clientIP = getClientIP(request);
if (isBlockedIP(clientIP)) {
  return new Response('访问被拒绝', { status: 403 });
}
```

## 🔒 数据保护

### 敏感数据处理
永远不要记录敏感信息：

```javascript
function sanitizeForLogging(data) {
  const sanitized = { ...data };
  
  // 移除敏感字段
  delete sanitized.api_key;
  delete sanitized.authorization;
  delete sanitized.password;
  
  // 截断长内容
  if (sanitized.messages) {
    sanitized.messages = sanitized.messages.map(msg => ({
      ...msg,
      content: msg.content.length > 100 ? 
        msg.content.substring(0, 100) + '...[已截断]' : 
        msg.content
    }));
  }
  
  return sanitized;
}

// 使用方法
console.log('收到请求:', sanitizeForLogging(requestData));
```

### 响应清理
发送前清理响应：

```javascript
function sanitizeResponse(response) {
  // 移除内部字段
  const sanitized = { ...response };
  delete sanitized.internal_id;
  delete sanitized.debug_info;
  delete sanitized.upstream_headers;
  
  return sanitized;
}
```

## 🌐 CORS 配置

### 安全 CORS 设置
正确配置 CORS：

```javascript
function setCORSHeaders(response, origin) {
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://app.yourdomain.com',
    'https://localhost:3000' // 仅开发环境
  ];
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// 处理预检请求
if (request.method === 'OPTIONS') {
  const origin = request.headers.get('Origin');
  const response = new Response(null, { status: 204 });
  return setCORSHeaders(response, origin);
}
```

## 📝 安全头

### 必要的安全头
为所有响应添加安全头：

```javascript
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'none'");
  
  // 移除服务器信息
  response.headers.delete('Server');
  
  return response;
}
```

## 🔍 安全监控

### 安全事件日志
记录安全相关事件：

```javascript
function logSecurityEvent(event, details) {
  console.warn('安全事件:', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // 发送到安全监控服务
  if (env.SECURITY_WEBHOOK) {
    fetch(env.SECURITY_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'ai-proxy-worker',
        event,
        timestamp: new Date().toISOString(),
        ...details
      })
    }).catch(err => console.error('发送安全告警失败:', err));
  }
}

// 使用方法
logSecurityEvent('authentication_failure', {
  ip: getClientIP(request),
  userAgent: request.headers.get('User-Agent'),
  path: new URL(request.url).pathname
});
```

### 异常检测
检测异常模式：

```javascript
class AnomalyDetector {
  constructor() {
    this.requestPatterns = new Map();
  }
  
  recordRequest(clientId, endpoint) {
    const key = `${clientId}:${endpoint}`;
    const now = Date.now();
    
    if (!this.requestPatterns.has(key)) {
      this.requestPatterns.set(key, []);
    }
    
    const requests = this.requestPatterns.get(key);
    requests.push(now);
    
    // 只保留最近的请求（最后一小时）
    const oneHourAgo = now - 3600000;
    const recentRequests = requests.filter(ts => ts > oneHourAgo);
    this.requestPatterns.set(key, recentRequests);
    
    // 检测异常
    if (recentRequests.length > 1000) { // 每小时超过 1000 个请求
      logSecurityEvent('high_frequency_requests', {
        clientId,
        endpoint,
        requestCount: recentRequests.length
      });
    }
  }
}
```

## 🛠️ 环境配置

### 生产环境变量
安全环境设置：

```bash
# 必需的密钥
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put PROXY_KEY

# 可选的安全设置
wrangler secret put SECURITY_WEBHOOK
wrangler secret put RATE_LIMIT_MAX_REQUESTS
wrangler secret put ALLOWED_ORIGINS
```

### 配置验证
启动时验证环境：

```javascript
function validateEnvironment(env) {
  const required = ['DEEPSEEK_API_KEY'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
  }
  
  // 验证 API 密钥格式
  if (!env.DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.warn('DEEPSEEK_API_KEY 可能无效 - 应以 sk- 开头');
  }
  
  return true;
}
```

## 🚨 事故响应

### 安全事故清单
检测到安全事故时：

1. **立即响应**
   - [ ] 识别事故范围
   - [ ] 如可能阻止恶意流量
   - [ ] 保存日志和证据

2. **评估**
   - [ ] 确定可能被访问的数据
   - [ ] 评估对用户和服务的影响
   - [ ] 检查持续威胁

3. **控制**
   - [ ] 轮换受损的 API 密钥
   - [ ] 更新安全规则
   - [ ] 如需要部署补丁

4. **恢复**
   - [ ] 恢复正常操作
   - [ ] 监控持续威胁
   - [ ] 验证安全措施

5. **事后处理**
   - [ ] 记录经验教训
   - [ ] 更新安全程序
   - [ ] 如需要通知利益相关者

### 紧急程序
```javascript
// 紧急关闭能力
async function emergencyShutdown(reason) {
  logSecurityEvent('emergency_shutdown', { reason });
  
  // 返回维护模式响应
  return new Response(JSON.stringify({
    error: 'service_unavailable',
    message: '服务因维护暂时不可用',
    timestamp: new Date().toISOString()
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '3600'
    }
  });
}
```

## 📋 安全清单

### 部署前安全审查
- [ ] 所有 API 密钥存储为密钥
- [ ] 实施输入验证
- [ ] 配置速率限制
- [ ] 正确配置 CORS
- [ ] 添加安全头
- [ ] 清理日志
- [ ] 错误消息不泄露信息
- [ ] 更新依赖项
- [ ] 启用安全监控

### 定期安全维护
- [ ] 每月审查访问日志
- [ ] 每季度更新依赖项
- [ ] 每年轮换 API 密钥
- [ ] 测试事故响应程序
- [ ] 审查和更新安全策略

---

**安全是一个持续的过程** 🔒

定期审查和更新确保你的 AI Proxy Worker 对不断演变的威胁保持安全。
