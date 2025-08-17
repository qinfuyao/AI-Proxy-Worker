# 代码风格指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Code-Style.en.md) | [🇨🇳 中文](./Code-Style.md)

</div>

本指南概述了 AI Proxy Worker 项目的编码标准和最佳实践。遵循这些准则确保整个项目的代码一致性、可维护性和可读性。

## 📋 通用原则

### 代码质量标准
- **可读性优先**：编写能讲述故事的代码
- **一致性**：在整个代码库中遵循既定模式
- **简洁性**：优先选择简单的解决方案而非复杂的
- **模块化设计**：拆分复杂函数为单一职责的小函数
- **低认知复杂度**：保持函数的认知复杂度在15以下
- **性能**：考虑代码的性能影响
- **安全性**：在实现中始终优先考虑安全性

### 文件组织
```
ai-proxy-worker/
├── worker.js              # 主要 worker 脚本
├── wrangler.toml          # 配置文件
├── docs/                  # 文档
├── examples/              # 使用示例
└── tests/                 # 测试文件（未来）
```

## 🔧 JavaScript/TypeScript 标准

### 代码格式化
- **缩进**：使用 2 个空格（不使用制表符）
- **行长度**：每行最多 100 个字符
- **分号**：可选，但要保持一致
- **引号**：字符串使用单引号
- **尾随逗号**：在多行对象/数组中使用尾随逗号

```javascript
// ✅ 好的示例
const config = {
  apiUrl: 'https://api.deepseek.com',
  timeout: 30000,
  retries: 3,
}

const models = [
  'deepseek-chat',
  'deepseek-reasoner',
]

// ❌ 避免这样写
const config = {
    "apiUrl": "https://api.deepseek.com",
    "timeout": 30000,
    "retries": 3
};
```

### 命名约定

#### 变量和函数
变量和函数使用 camelCase：

```javascript
// ✅ 好的示例
const apiResponse = await fetchData()
const userMessage = request.body.message
const isValidRequest = validateInput(data)

function processUserRequest(request) {
  // 实现
}

async function sendUpstreamRequest(payload) {
  // 实现
}

// ❌ 避免这样写
const api_response = await fetchData()
const user_message = request.body.message
const IsValidRequest = validateInput(data)

function ProcessUserRequest(request) {
  // 实现
}
```

#### 常量
常量使用 UPPER_SNAKE_CASE：

```javascript
// ✅ 好的示例
const API_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_TIMEOUT = 30000
const MAX_RETRIES = 3
const SUPPORTED_MODELS = ['deepseek-chat', 'deepseek-reasoner']

// ❌ 避免这样写
const apiBaseUrl = 'https://api.deepseek.com'
const defaultTimeout = 30000
```

#### 类和对象
类和构造函数使用 PascalCase：

```javascript
// ✅ 好的示例
class RequestHandler {
  constructor(config) {
    this.config = config
  }
}

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

// ❌ 避免这样写
class requestHandler {
  // 实现
}
```

### 函数结构

#### 函数声明
短函数优先使用箭头函数，复杂逻辑使用常规函数：

```javascript
// ✅ 好的示例 - 短工具函数
const isValidModel = (model) => SUPPORTED_MODELS.includes(model)
const createErrorResponse = (message, status = 400) => 
  new Response(JSON.stringify({ error: message }), { status })

// ✅ 好的示例 - 复杂函数
async function handleChatRequest(request, env) {
  try {
    // 验证请求
    const validation = await validateRequest(request)
    if (!validation.valid) {
      return createErrorResponse(validation.error, 400)
    }

    // 处理请求
    const response = await processChat(request, env)
    return response

  } catch (error) {
    console.error('聊天请求失败:', error)
    return createErrorResponse('内部服务器错误', 500)
  }
}
```

#### 参数处理
对象参数使用解构：

```javascript
// ✅ 好的示例
async function processChat({ messages, model, temperature }, env) {
  // 实现
}

// 带验证的替代方案
async function processChat(params, env) {
  const { messages, model, temperature = 0.7 } = params
  
  // 验证必需参数
  if (!messages || !model) {
    throw new Error('缺少必需参数')
  }
  
  // 实现
}

// ❌ 避免这样写
async function processChat(params, env) {
  const messages = params.messages
  const model = params.model
  const temperature = params.temperature
  // 实现
}
```

## 📝 文档标准

### JSDoc 注释
函数文档使用 JSDoc：

```javascript
/**
 * 向上游 API 发送聊天请求
 * @param {Object} request - 聊天请求对象
 * @param {Array} request.messages - 聊天消息数组
 * @param {string} request.model - 要使用的模型
 * @param {number} [request.temperature=0.7] - 采样温度
 * @param {Object} env - 环境变量
 * @param {string} env.DEEPSEEK_API_KEY - DeepSeek API 密钥
 * @returns {Promise<Response>} API 响应
 * @throws {Error} 当 API 密钥缺失或请求失败时
 */
async function sendChatRequest(request, env) {
  // 实现
}
```

### 行内注释
使用注释解释复杂逻辑：

```javascript
// ✅ 好的示例 - 解释"为什么"
async function handleRequest(request, env) {
  // 提取客户端 IP 用于速率限制
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown'
  
  // 在处理昂贵操作之前检查速率限制
  if (!await checkRateLimit(clientIP)) {
    return new Response('超出速率限制', { status: 429 })
  }
  
  // 处理实际请求
  return await processRequest(request, env)
}

// ❌ 避免这样写 - 陈述显而易见的事实
async function handleRequest(request, env) {
  // 获取客户端 IP
  const clientIP = request.headers.get('CF-Connecting-IP')
  
  // 返回速率限制响应
  if (!await checkRateLimit(clientIP)) {
    return new Response('超出速率限制', { status: 429 })
  }
}
```

## 🔧 模块化验证架构

### 验证函数设计原则

本项目采用模块化验证架构，将复杂的验证逻辑拆分为多个单一职责的函数：

```javascript
// ✅ 好的示例 - 模块化验证
async function validateRequest(request) {
  validateContentType(request);           // 验证Content-Type
  validateContentLength(request);         // 验证请求大小
  
  if (CONFIG.VALIDATE_REQUEST_BODY) {
    await validateRequestBody(request);   // 验证请求体
  }
}

function validateContentType(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Invalid content type. Expected application/json');
  }
}

async function validateRequestBody(request) {
  try {
    const body = await request.clone().json();
    validateMessages(body.messages);      // 验证消息数组
    validateModel(body.model);            // 验证模型
  } catch (e) {
    // 错误处理逻辑
  }
}
```

### 函数复杂度控制

- **认知复杂度限制**: 每个函数保持认知复杂度 ≤ 15
- **单一职责原则**: 每个验证函数只负责一种验证
- **可组合性**: 验证函数可以独立测试和复用

```javascript
// ✅ 好的示例 - 单一职责
function validateSingleMessage(message) {
  if (!message.role || !message.content) {
    throw new Error('Invalid request format. Each message must have role and content');
  }
  if (!['system', 'user', 'assistant', 'tool'].includes(message.role)) {
    throw new Error('Invalid request format. Invalid message role');
  }
}

// ❌ 避免这样写 - 复杂的巨大函数
function validateEverything(request) {
  // 100+ 行验证代码，认知复杂度 > 20
}
```

## 🛡️ 错误处理

### 错误响应格式
使用一致的错误响应格式：

```javascript
// ✅ 好的示例 - 一致的错误格式
function createErrorResponse(error, statusCode = 500, details = null) {
  const errorResponse = {
    error: error.code || 'unknown_error',
    message: error.message || '发生意外错误',
    timestamp: new Date().toISOString(),
  }
  
  // 在开发/调试模式下添加详细信息
  if (details && env.DEBUG_MODE === 'true') {
    errorResponse.details = details
  }
  
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}

// 使用方法
try {
  const result = await riskyOperation()
  return new Response(JSON.stringify(result))
} catch (error) {
  console.error('操作失败:', error)
  return createErrorResponse(error, 500, { operation: 'riskyOperation' })
}
```

### 错误类型
为不同场景定义自定义错误类型：

```javascript
// ✅ 好的示例 - 自定义错误类
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message)
    this.name = 'ValidationError'
    this.code = 'validation_error'
    this.field = field
  }
}

class ApiError extends Error {
  constructor(message, statusCode = 500, originalError = null) {
    super(message)
    this.name = 'ApiError'
    this.code = 'api_error'
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

// 使用方法
function validateChatRequest(data) {
  if (!data.messages || !Array.isArray(data.messages)) {
    throw new ValidationError('消息必须是数组', 'messages')
  }
  
  if (!data.model || typeof data.model !== 'string') {
    throw new ValidationError('模型必须是字符串', 'model')
  }
}
```

## 🔒 安全最佳实践

### 输入验证
始终验证和清理输入：

```javascript
// ✅ 好的示例 - 全面验证
function validateChatRequest(data) {
  const errors = []
  
  // 必需字段
  if (!data.messages || !Array.isArray(data.messages)) {
    errors.push('messages 必须是数组')
  }
  
  if (!data.model || typeof data.model !== 'string') {
    errors.push('model 必须是字符串')
  }
  
  // 验证消息数组
  if (data.messages) {
    data.messages.forEach((msg, index) => {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push(`messages[${index}].role 必须是 user、assistant 或 system`)
      }
      
      if (!msg.content || typeof msg.content !== 'string') {
        errors.push(`messages[${index}].content 必须是非空字符串`)
      }
      
      // 内容长度限制
      if (msg.content && msg.content.length > 100000) {
        errors.push(`messages[${index}].content 超过最大长度`)
      }
    })
  }
  
  // 可选参数验证
  if (data.temperature !== undefined) {
    if (typeof data.temperature !== 'number' || 
        data.temperature < 0 || 
        data.temperature > 2) {
      errors.push('temperature 必须是 0 到 2 之间的数字')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 敏感数据处理
永远不要记录敏感信息：

```javascript
// ✅ 好的示例 - 清理后的日志
function logRequest(request, response) {
  const logData = {
    method: request.method,
    url: new URL(request.url).pathname, // 不记录查询参数
    status: response.status,
    timestamp: new Date().toISOString(),
    // 不记录授权头或正文内容
  }
  
  console.log('请求已处理:', logData)
}

// ❌ 避免这样写 - 记录敏感数据
function logRequest(request, response) {
  console.log('请求:', {
    headers: Object.fromEntries(request.headers), // 包含 API 密钥！
    body: request.body, // 包含用户数据！
    url: request.url // 可能包含敏感查询参数！
  })
}
```

## ⚡ 性能指南

### Async/Await 最佳实践
正确使用 async/await：

```javascript
// ✅ 好的示例 - 尽可能并行执行
async function processMultipleRequests(requests, env) {
  // 并行执行请求
  const promises = requests.map(request => processRequest(request, env))
  const results = await Promise.allSettled(promises)
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  ).filter(Boolean)
}

// ✅ 好的示例 - 需要时顺序执行
async function processWithDependencies(request, env) {
  const validation = await validateRequest(request)
  if (!validation.valid) {
    throw new ValidationError(validation.errors.join(', '))
  }
  
  const processed = await processRequest(request, env)
  const logged = await logRequest(processed)
  
  return processed
}

// ❌ 避免这样写 - 不必要的顺序执行
async function processMultipleRequests(requests, env) {
  const results = []
  for (const request of requests) {
    const result = await processRequest(request, env) // 阻塞！
    results.push(result)
  }
  return results
}
```

### 内存管理
注意内存使用：

```javascript
// ✅ 好的示例 - 清理资源
async function processLargeRequest(request, env) {
  let reader = null
  try {
    reader = request.body.getReader()
    const chunks = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    return await processChunks(chunks)
    
  } finally {
    // 清理资源
    if (reader) {
      reader.releaseLock()
    }
  }
}
```

## 🧪 测试指南

### 测试结构
编写测试时（未来实现）：

```javascript
// ✅ 好的示例 - 清晰的测试结构
describe('聊天请求处理器', () => {
  describe('validateChatRequest', () => {
    it('应该接受有效的聊天请求', () => {
      const validRequest = {
        messages: [{ role: 'user', content: '你好' }],
        model: 'deepseek-chat'
      }
      
      const result = validateChatRequest(validRequest)
      expect(result.valid).toBe(true)
    })
    
    it('应该拒绝没有消息的请求', () => {
      const invalidRequest = { model: 'deepseek-chat' }
      
      const result = validateChatRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('messages 必须是数组')
    })
  })
})
```

## 📋 代码审查清单

提交代码前，确保：

### 功能性
- [ ] 代码按预期工作
- [ ] 处理边界情况
- [ ] 正确管理错误条件
- [ ] 考虑性能影响

### 代码质量
- [ ] 遵循项目命名约定
- [ ] 函数大小合理（< 50 行）
- [ ] 代码自文档化
- [ ] 复杂逻辑有注释
- [ ] 没有遗留调试代码

### 安全性
- [ ] 实现输入验证
- [ ] 日志中无敏感数据
- [ ] 适当的错误处理不泄露信息
- [ ] 适当设置安全头

### 文档
- [ ] 公共函数有 JSDoc 注释
- [ ] 需要时更新 README
- [ ] 为新功能提供示例
- [ ] 记录重大变更

---

**一致的代码风格让协作更容易** ✨

遵循这些指南有助于维护高质量、可维护的代码库，让所有贡献者都能轻松使用。
