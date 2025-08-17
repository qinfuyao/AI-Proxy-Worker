# 配置指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Configuration.en.md) | [🇨🇳 中文](./Configuration.md)

</div>

AI Proxy Worker 提供了多种配置选项，让你可以根据需求定制代理的行为。配置分为两类：环境变量配置和代码配置。

## 🔑 环境变量配置

这些配置通过 Cloudflare Workers 的 Secret 功能设置，在代码中无法看到具体值，确保安全性。

### 必需的环境变量

| 变量名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `DEEPSEEK_API_KEY` | Secret | DeepSeek API 密钥 | `sk-...` |

**设置方法：**
```bash
wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API 密钥
```

### 可选的环境变量

| 变量名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `PROXY_KEY` | Secret | 代理访问密钥，用于保护你的代理 | 无（不启用认证） |

**设置方法：**
```bash
wrangler secret put PROXY_KEY
# 输入自定义的访问密钥，如：my-secret-key-2025
```

**使用建议：**
- 生产环境强烈建议设置 `PROXY_KEY`
- 使用强密码生成器生成访问密钥
- 定期轮换密钥以提高安全性

## ⚙️ 代码配置

这些配置在 `worker.js` 文件的 `CONFIG` 对象中定义，可以根据需要修改。

### 核心配置项

#### DEEPSEEK_API_URL
- **类型**：String
- **默认值**：`'https://api.deepseek.com/chat/completions'`
- **说明**：DeepSeek API 的端点地址
- **修改场景**：通常不需要修改，除非 DeepSeek 更改了 API 端点

```javascript
DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions'
```

#### MAX_BODY_SIZE
- **类型**：Number
- **默认值**：`1024 * 1024` (1MB)
- **说明**：请求体的最大大小限制（字节）
- **修改场景**：
  - 增大：如果需要处理更长的对话历史
  - 减小：如果想要更严格的限制以防止滥用

```javascript
MAX_BODY_SIZE: 1024 * 1024  // 1MB
MAX_BODY_SIZE: 2 * 1024 * 1024  // 2MB（更宽松）
MAX_BODY_SIZE: 512 * 1024  // 512KB（更严格）
```

#### REQUEST_TIMEOUT
- **类型**：Number
- **默认值**：`30000` (30秒)
- **说明**：向 DeepSeek API 请求的超时时间（毫秒）
- **修改场景**：
  - 增大：如果经常遇到超时错误
  - 减小：如果想要更快的失败响应

```javascript
REQUEST_TIMEOUT: 30000   // 30秒（默认）
REQUEST_TIMEOUT: 60000   // 60秒（更宽松）
REQUEST_TIMEOUT: 15000   // 15秒（更严格）
```

#### VALIDATE_REQUEST_BODY
- **类型**：Boolean
- **默认值**：`false`
- **说明**：是否启用严格的请求体格式验证
- **修改场景**：
  - `true`：启用严格验证，会检查 messages 格式
  - `false`：宽松模式，让 DeepSeek API 自己处理验证

```javascript
VALIDATE_REQUEST_BODY: false  // 宽松模式（推荐）
VALIDATE_REQUEST_BODY: true   // 严格模式
```

#### DEFAULT_MODEL
- **类型**：String
- **默认值**：`'deepseek-chat'`
- **说明**：当请求中没有指定模型时使用的默认模型
- **修改场景**：根据你的主要使用场景选择

```javascript
DEFAULT_MODEL: 'deepseek-chat'      // 通用对话（默认）
DEFAULT_MODEL: 'deepseek-reasoner'  // 推理任务为主
```

#### SUPPORTED_MODELS
- **类型**：Array
- **默认值**：`['deepseek-chat', 'deepseek-reasoner']`
- **说明**：支持的模型列表，用于验证和文档
- **修改场景**：当 DeepSeek 发布新模型时更新

```javascript
SUPPORTED_MODELS: [
  'deepseek-chat',      // 通用对话模型
  'deepseek-reasoner'   // 推理模型
]
```

### CORS 配置

#### CORS_HEADERS
- **说明**：跨域请求的响应头配置
- **默认配置**：允许所有域名访问

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

**生产环境建议：**
```javascript
// 限制特定域名
'Access-Control-Allow-Origin': 'https://yourdomain.com'

// 或者支持多个域名
'Access-Control-Allow-Origin': request.headers.get('origin') // 需要额外的验证逻辑
```

### 安全配置

#### SECURITY_HEADERS
- **说明**：安全相关的响应头
- **默认配置**：基础安全防护

```javascript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

## 🛠️ 高级配置

### 自定义配置示例

如果你需要更复杂的配置，可以这样修改：

```javascript
// 开发环境配置
const CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  MAX_BODY_SIZE: 2 * 1024 * 1024, // 2MB，更宽松
  REQUEST_TIMEOUT: 60000, // 60秒，更长的超时
  VALIDATE_REQUEST_BODY: true, // 启用严格验证
  DEFAULT_MODEL: 'deepseek-chat',
  SUPPORTED_MODELS: [
    'deepseek-chat',
    'deepseek-reasoner'
  ]
};

// 生产环境配置
const CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  MAX_BODY_SIZE: 512 * 1024, // 512KB，更严格
  REQUEST_TIMEOUT: 15000, // 15秒，更快失败
  VALIDATE_REQUEST_BODY: false, // 宽松验证，更好的兼容性
  DEFAULT_MODEL: 'deepseek-chat',
  SUPPORTED_MODELS: [
    'deepseek-chat',
    'deepseek-reasoner'
  ]
};
```

### 环境特定配置

你也可以在 `wrangler.toml` 中设置环境特定的配置：

```toml
name = "ai-proxy-worker"
main = "worker.js"
compatibility_date = "2025-08-17"

# 生产环境
[env.production]
name = "ai-proxy-worker-prod"
vars = { ENVIRONMENT = "production" }

# 开发环境
[env.development]
name = "ai-proxy-worker-dev"
vars = { ENVIRONMENT = "development" }
```

然后在代码中使用：

```javascript
// 根据环境调整配置
const isProduction = env.ENVIRONMENT === 'production';

const CONFIG = {
  // ... 其他配置
  MAX_BODY_SIZE: isProduction ? 512 * 1024 : 2 * 1024 * 1024,
  REQUEST_TIMEOUT: isProduction ? 15000 : 60000,
  VALIDATE_REQUEST_BODY: !isProduction, // 开发环境启用严格验证
};
```

## 📝 配置最佳实践

### 1. 安全配置
```javascript
// ✅ 推荐：生产环境限制 CORS
'Access-Control-Allow-Origin': 'https://yourdomain.com'

// ❌ 避免：生产环境使用通配符
'Access-Control-Allow-Origin': '*'
```

### 2. 性能配置
```javascript
// ✅ 推荐：合理的超时时间
REQUEST_TIMEOUT: 30000  // 30秒

// ❌ 避免：过长的超时时间
REQUEST_TIMEOUT: 300000  // 5分钟（太长）
```

### 3. 兼容性配置
```javascript
// ✅ 推荐：宽松的验证模式
VALIDATE_REQUEST_BODY: false

// ⚠️ 注意：严格模式可能导致某些客户端失败
VALIDATE_REQUEST_BODY: true
```

## 🔧 配置修改步骤

### 1. 修改代码配置
1. 编辑 `worker.js` 文件
2. 修改 `CONFIG` 对象中的相应值
3. 保存文件

### 2. 重新部署
```bash
wrangler publish
```

### 3. 验证配置
```bash
# 测试健康检查
curl https://your-worker.workers.dev/

# 测试 API 调用
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

## ❓ 常见配置问题

### Q: 如何增加请求体大小限制？
A: 修改 `MAX_BODY_SIZE` 配置：
```javascript
MAX_BODY_SIZE: 2 * 1024 * 1024  // 增加到 2MB
```

### Q: 如何设置更严格的超时？
A: 修改 `REQUEST_TIMEOUT` 配置：
```javascript
REQUEST_TIMEOUT: 15000  // 减少到 15秒
```

### Q: 如何禁用请求验证？
A: 设置 `VALIDATE_REQUEST_BODY` 为 false：
```javascript
VALIDATE_REQUEST_BODY: false
```

### Q: 如何限制 CORS 域名？
A: 修改 `CORS_HEADERS` 中的 `Access-Control-Allow-Origin`：
```javascript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

---

**需要帮助？** 👉 [故障排除指南](./Troubleshooting) | [GitHub Issues](../../issues)
