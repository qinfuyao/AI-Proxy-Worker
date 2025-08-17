# 最佳实践

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Best-Practices.en.md) | [🇨🇳 中文](./Best-Practices.md)

</div>

这份指南提供了使用 AI Proxy Worker 的最佳实践建议，帮助你充分利用这个代理服务的优势，同时确保安全性和性能。

## 🔐 安全最佳实践

### 1. API 密钥管理

**✅ 推荐做法：**
```bash
# 使用强密钥作为代理访问密钥
wrangler secret put PROXY_KEY
# 输入：sk-proxy-your-very-secure-random-key-2025

# 定期轮换密钥
wrangler secret put DEEPSEEK_API_KEY  # 更新 DeepSeek 密钥
wrangler secret put PROXY_KEY         # 更新代理密钥
```

**❌ 避免做法：**
```javascript
// 不要在客户端代码中硬编码密钥
const API_KEY = 'your-secret-key'; // 错误！

// 不要使用简单密钥
PROXY_KEY: '123456' // 太简单！
```

### 2. 访问控制

**生产环境 CORS 配置：**
```javascript
// worker.js 中限制特定域名
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // 限制特定域名
  'Access-Control-Allow-Methods': 'POST, OPTIONS',          // 只允许必要方法
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 3. 密钥轮换策略

```bash
# 建议每月轮换一次
echo "$(date): 更新 API 密钥" >> key-rotation.log
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put PROXY_KEY
```

## ⚡ 性能优化

### 1. 请求优化

**合理的配置参数：**
```javascript
// worker.js CONFIG 优化
const CONFIG = {
  MAX_BODY_SIZE: 512 * 1024,    // 512KB，适合大多数对话
  REQUEST_TIMEOUT: 30000,        // 30秒，平衡性能和可靠性
  VALIDATE_REQUEST_BODY: false,  // 关闭验证以提高性能
};
```

**客户端请求优化：**
```javascript
// 使用适当的模型
const request = {
  model: 'deepseek-chat',        // 日常对话使用 chat 模型
  messages: messages,
  max_tokens: 1000,              // 限制响应长度
  temperature: 0.7,              // 平衡创造性和一致性
};

// 复杂推理任务使用 reasoner 模型
const complexRequest = {
  model: 'deepseek-reasoner',    // 数学、逻辑推理任务
  messages: messages,
  max_tokens: 2000,              // 推理任务可能需要更多 token
};
```

### 2. 流式响应使用

**推荐用于实时对话：**
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_PROXY_KEY',
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',  // 启用流式响应
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: messages,
    stream: true,                   // 启用流式传输
  })
});
```

### 3. 缓存策略

```javascript
// 客户端实现简单缓存
const messageCache = new Map();

function getCachedResponse(messageHash) {
  return messageCache.get(messageHash);
}

function setCachedResponse(messageHash, response) {
  // 限制缓存大小
  if (messageCache.size > 100) {
    const firstKey = messageCache.keys().next().value;
    messageCache.delete(firstKey);
  }
  messageCache.set(messageHash, response);
}
```

## 🛡️ 错误处理

### 1. 客户端错误处理

```javascript
async function callAI(messages) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PROXY_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error} - ${errorData.details || errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI API调用失败:', error);
    
    // 根据错误类型处理
    if (error.message.includes('timeout')) {
      return { error: '请求超时，请稍后重试' };
    } else if (error.message.includes('unauthorized')) {
      return { error: '认证失败，请检查访问密钥' };
    } else {
      return { error: '服务暂时不可用，请稍后重试' };
    }
  }
}
```

### 2. 重试机制

```javascript
async function callAIWithRetry(messages, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callAI(messages);
      if (!result.error) {
        return result;
      }
      
      // 如果是认证错误，不重试
      if (result.error.includes('认证失败')) {
        throw new Error(result.error);
      }
      
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // 指数退避延迟
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

## 📊 监控和日志

### 1. 客户端监控

```javascript
// 请求统计
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
};

async function monitoredAICall(messages) {
  const startTime = Date.now();
  stats.totalRequests++;
  
  try {
    const result = await callAI(messages);
    stats.successfulRequests++;
    
    // 更新平均响应时间
    const responseTime = Date.now() - startTime;
    stats.averageResponseTime = 
      (stats.averageResponseTime * (stats.successfulRequests - 1) + responseTime) 
      / stats.successfulRequests;
    
    return result;
  } catch (error) {
    stats.failedRequests++;
    throw error;
  }
}
```

### 2. Worker 日志监控

```bash
# 实时查看 Worker 日志
wrangler tail

# 查看部署状态
wrangler deployments list

# 查看使用统计
wrangler metrics
```

## 🔧 开发环境配置

### 1. 环境分离

```toml
# wrangler.toml
name = "ai-proxy-worker"
main = "worker.js"
compatibility_date = "2025-08-17"

# 开发环境
[env.development]
name = "ai-proxy-worker-dev"
vars = { ENVIRONMENT = "development" }

# 生产环境
[env.production]
name = "ai-proxy-worker-prod"
vars = { ENVIRONMENT = "production" }
```

**部署到不同环境：**
```bash
# 开发环境
wrangler publish --env development

# 生产环境
wrangler publish --env production
```

### 2. 本地开发

```bash
# 本地开发服务器
wrangler dev

# 指定端口
wrangler dev --port 8080

# 本地测试
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

## 📱 移动应用集成

### iOS (Swift)

```swift
class AIProxyService {
    private let baseURL = "https://your-worker.workers.dev"
    private let proxyKey = "YOUR_PROXY_KEY"
    
    func chat(messages: [[String: String]]) async throws -> ChatResponse {
        let url = URL(string: "\(baseURL)/chat")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(proxyKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "model": "deepseek-chat",
            "messages": messages
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AIError.requestFailed
        }
        
        return try JSONDecoder().decode(ChatResponse.self, from: data)
    }
}
```

### Android (Kotlin)

```kotlin
class AIProxyService {
    private val baseUrl = "https://your-worker.workers.dev"
    private val proxyKey = "YOUR_PROXY_KEY"
    private val client = OkHttpClient()
    
    suspend fun chat(messages: List<Message>): ChatResponse {
        val requestBody = JSONObject().apply {
            put("model", "deepseek-chat")
            put("messages", JSONArray(messages.map { it.toJson() }))
        }
        
        val request = Request.Builder()
            .url("$baseUrl/chat")
            .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
            .addHeader("Authorization", "Bearer $proxyKey")
            .build()
            
        return withContext(Dispatchers.IO) {
            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                throw IOException("请求失败: ${response.code}")
            }
            
            val responseBody = response.body?.string() ?: throw IOException("空响应")
            Gson().fromJson(responseBody, ChatResponse::class.java)
        }
    }
}
```

## 🚀 生产部署建议

### 1. 部署前检查清单

- [ ] 已设置强密钥（PROXY_KEY 和 DEEPSEEK_API_KEY）
- [ ] 已限制 CORS 域名（生产环境）
- [ ] 已配置适当的超时和大小限制
- [ ] 已测试所有API端点
- [ ] 已设置监控和日志
- [ ] 已准备错误处理和重试机制

### 2. 性能基准测试

```bash
# 使用 Apache Bench 进行压力测试
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_PROXY_KEY" \
   -H "Content-Type: application/json" \
   -p test-payload.json \
   https://your-worker.workers.dev/chat

# test-payload.json 内容：
echo '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}' > test-payload.json
```

### 3. 容量规划

根据 Cloudflare Workers 限制：
- **免费版**：每天 100,000 次请求
- **付费版**：无限制，按使用量计费
- **内存**：最大 128MB
- **CPU 时间**：最大 30 秒

## 💡 使用技巧

### 1. 模型选择指南

```javascript
// 选择合适的模型
function selectModel(taskType) {
  switch (taskType) {
    case 'chat':
    case 'creative':
    case 'translation':
      return 'deepseek-chat';      // 日常对话、创作、翻译
      
    case 'math':
    case 'logic':
    case 'analysis':
      return 'deepseek-reasoner';  // 数学、逻辑推理、分析
      
    default:
      return 'deepseek-chat';      // 默认使用 chat 模型
  }
}
```

### 2. 消息优化

```javascript
// 优化对话上下文
function optimizeMessages(messages, maxTokens = 4000) {
  // 保留系统消息和最近的对话
  const systemMessages = messages.filter(m => m.role === 'system');
  const recentMessages = messages.filter(m => m.role !== 'system').slice(-10);
  
  return [...systemMessages, ...recentMessages];
}
```

### 3. 错误恢复策略

```javascript
// 智能错误恢复
async function resilientAICall(messages) {
  try {
    return await callAI(messages);
  } catch (error) {
    if (error.message.includes('too_long')) {
      // 如果消息太长，尝试缩短
      const shorterMessages = optimizeMessages(messages, 2000);
      return await callAI(shorterMessages);
    }
    throw error;
  }
}
```

---

**下一步？** 👉 [查看使用示例](./Examples.md) | [监控指南](./Monitoring.md)