# API 参考文档

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./API-Reference.en.md) | [🇨🇳 中文](./API-Reference.md)

</div>

AI Proxy Worker 提供了简洁而强大的 RESTful API，完全兼容 OpenAI 的 Chat Completions API 格式，让你可以轻松集成到现有项目中。

> **当前支持**: DeepSeek API (v1.0)  
> **未来计划**: OpenAI、Claude、Gemini 等多 AI 服务商支持 (v2.0)

## 🌐 基础信息

### 基础 URL
```
https://your-worker.workers.dev
```

### 认证方式
```http
Authorization: Bearer YOUR_PROXY_KEY
```

### Content-Type
```http
Content-Type: application/json
```

## 📚 API 端点

### 1. 健康检查

检查服务状态和连通性。

**请求：**
```http
GET /
```

**响应：**
```json
{
  "status": "ok",
  "service": "AI Proxy Worker",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**示例：**
```bash
curl https://your-worker.workers.dev/
```

### 2. 聊天补全

与 AI 模型进行对话，支持流式和非流式响应。

**请求：**
```http
POST /chat
```

**请求头：**
```http
Authorization: Bearer YOUR_PROXY_KEY
Content-Type: application/json
Accept: application/json  # 非流式
Accept: text/event-stream # 流式
```

**请求体：**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个有用的AI助手。"
    },
    {
      "role": "user", 
      "content": "你好！"
    }
  ],
  "stream": false,
  "max_tokens": 2048
}
```

## 🤖 支持的模型

### deepseek-chat
- **用途**：通用对话和文本生成
- **架构**：基于 DeepSeek-V3 架构
- **特点**：适合日常对话、内容创作、文本理解
- **上下文长度**：64K tokens
- **推荐场景**：通用文本生成、对话应用

### deepseek-reasoner  
- **用途**：复杂推理和逻辑思考
- **架构**：基于 DeepSeek-R1 架构
- **特点**：数学问题、逻辑推理、代码分析、复杂推理
- **上下文长度**：64K tokens
- **推荐场景**：需要深度思考的任务

> **注意**：模型的具体参数和能力可能会根据 DeepSeek 的更新而变化。建议查看 [DeepSeek 官方文档](https://platform.deepseek.com/) 获取最新信息。

## 📝 请求参数详解

### 必需参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | string | 要使用的模型名称 |
| `messages` | array | 对话消息数组 |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 | 支持状态 |
|------|------|--------|------|----------|
| `stream` | boolean | false | 是否启用流式响应 | ✅ 完全支持 |
| `max_tokens` | number | - | 最大生成 tokens 数量 | ✅ 完全支持 |
| `temperature` | number | 1.0 | 控制随机性 (0-2) | ⚠️ 可能不生效 |
| `top_p` | number | 1.0 | 核采样参数 (0-1) | ⚠️ 可能不生效 |
| `frequency_penalty` | number | 0 | 频率惩罚 (-2 to 2) | ⚠️ 可能不生效 |
| `presence_penalty` | number | 0 | 存在惩罚 (-2 to 2) | ⚠️ 可能不生效 |
| `stop` | array/string | null | 停止序列 | ✅ 支持 |
| `seed` | number | null | 随机种子，确保输出一致性 | ✅ 支持 |

> **注意**：标记为 "⚠️ 可能不生效" 的参数由于 DeepSeek API 的限制，设置后可能不会产生预期效果。建议主要使用 `stream`、`max_tokens`、`stop` 和 `seed` 参数。

### Messages 格式

每个消息对象包含：

```json
{
  "role": "user|assistant|system",
  "content": "消息内容"
}
```

**角色说明：**
- `system`: 系统提示，定义 AI 的行为
- `user`: 用户输入
- `assistant`: AI 回复

## 📤 响应格式

### 非流式响应

**成功响应：**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是 DeepSeek，很高兴为你提供帮助。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  }
}
```

### 流式响应

启用 `stream: true` 时，响应为 Server-Sent Events (SSE) 格式：

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"content":"你好"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"content":"！"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

## ⚠️ **重要说明：参数兼容性**

根据 DeepSeek 官方文档，以下参数可能不会按预期工作：

- `temperature` - 可能被忽略，DeepSeek API 可能使用固定的温度值
- `top_p` - 可能不生效
- `frequency_penalty` - 可能不生效  
- `presence_penalty` - 可能不生效

**推荐做法：**
- 主要使用 `model`、`messages`、`max_tokens`、`stream` 和 `stop` 参数
- 如果需要控制生成行为，建议通过 `system` 消息来指导模型
- 测试时可以尝试这些参数，但不要依赖它们的效果

**示例 - 推荐的请求格式：**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system", 
      "content": "请用简洁的语言回答，不要过于详细。"
    },
    {
      "role": "user",
      "content": "什么是人工智能？"
    }
  ],
  "max_tokens": 500,
  "stream": false
}
```

## 🔧 完整示例

### cURL 示例

**非流式请求：**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "system",
        "content": "你是一个专业的编程助手。"
      },
      {
        "role": "user",
        "content": "请帮我写一个 Python 快速排序函数。"
      }
    ],
    "max_tokens": 1000
  }'
```

**流式请求：**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "写一首关于编程的诗"}
    ],
          "stream": true
  }'
```

### JavaScript 示例

**基础调用：**
```javascript
async function callAI(message) {
  const response = await fetch('https://your-worker.workers.dev/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_PROXY_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 使用示例
callAI('你好，请介绍一下你自己')
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));
```

**流式调用：**
```javascript
async function streamAI(message, onChunk) {
  const response = await fetch('https://your-worker.workers.dev/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_PROXY_KEY',
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: message }],
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// 使用示例
streamAI('写一个关于 AI 的故事', (chunk) => {
  process.stdout.write(chunk); // 实时输出
});
```

### Python 示例

**基础调用：**
```python
import requests
import json

def call_ai(message, model="deepseek-chat"):
    url = "https://your-worker.workers.dev/chat"
    headers = {
        "Authorization": "Bearer YOUR_PROXY_KEY",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": message}
        ],
        "max_tokens": 1000
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    data = response.json()
    return data["choices"][0]["message"]["content"]

# 使用示例
result = call_ai("请解释什么是机器学习")
print(result)
```

**流式调用：**
```python
import requests
import json

def stream_ai(message, model="deepseek-chat"):
    url = "https://your-worker.workers.dev/chat"
    headers = {
        "Authorization": "Bearer YOUR_PROXY_KEY",
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": message}],
        "stream": True
    }
    
    response = requests.post(url, headers=headers, json=payload, stream=True)
    response.raise_for_status()
    
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data = line[6:]
                if data == '[DONE]':
                    break
                
                try:
                    parsed = json.loads(data)
                    content = parsed["choices"][0]["delta"].get("content")
                    if content:
                        print(content, end='', flush=True)
                except json.JSONDecodeError:
                    continue

# 使用示例
stream_ai("写一首关于春天的诗")
```

### iOS Swift 示例

```swift
import Foundation

class AIProxyClient {
    private let baseURL = "https://your-worker.workers.dev"
    private let apiKey = "YOUR_PROXY_KEY"
    
    func chatCompletion(
        model: String = "deepseek-chat",
        messages: [[String: String]],
        maxTokens: Int = 1000
    ) async throws -> String {
        
        guard let url = URL(string: "\(baseURL)/chat") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody: [String: Any] = [
            "model": model,
            "messages": messages,
            "max_tokens": maxTokens
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.requestFailed
        }
        
        let result = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        let choices = result["choices"] as! [[String: Any]]
        let message = choices[0]["message"] as! [String: Any]
        
        return message["content"] as! String
    }
}

enum APIError: Error {
    case invalidURL
    case requestFailed
}

// 使用示例
let client = AIProxyClient()

Task {
    do {
        let response = try await client.chatCompletion(
            messages: [
                ["role": "user", "content": "你好，请介绍一下你自己"]
            ]
        )
        print(response)
    } catch {
        print("Error: \(error)")
    }
}
```

## ❌ 错误处理

### 错误响应格式

所有错误都返回统一的 JSON 格式：

```json
{
  "error": "error_type",
  "details": "详细错误信息",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 常见错误码

| HTTP 状态码 | 错误类型 | 说明 |
|-------------|----------|------|
| 400 | `invalid_request` | 请求格式错误 |
| 401 | `unauthorized` | 认证失败 |
| 404 | `not_found` | 端点不存在 |
| 413 | `payload_too_large` | 请求体过大 |
| 500 | `internal_error` | 服务器内部错误 |
| 502 | `upstream_error` | 上游 API 错误 |
| 504 | `timeout` | 请求超时 |

### 错误处理示例

```javascript
async function handleAPICall(message) {
  try {
    const response = await fetch('https://your-worker.workers.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PROXY_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error (${response.status}): ${errorData.error} - ${errorData.details}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error.message);
    
    // 根据错误类型进行处理
    if (error.message.includes('401')) {
      console.log('请检查 API 密钥是否正确');
    } else if (error.message.includes('504')) {
      console.log('请求超时，请稍后重试');
    } else if (error.message.includes('413')) {
      console.log('请求内容过长，请减少输入');
    }
    
    throw error;
  }
}
```

## 🔒 安全最佳实践

### 1. API 密钥管理
- 永远不要在客户端代码中硬编码 `PROXY_KEY`
- 使用环境变量或安全的配置管理
- 定期轮换密钥

### 2. 请求验证
- 验证用户输入，防止注入攻击
- 限制请求频率，防止滥用
- 记录和监控异常请求

### 3. 内容过滤
```javascript
function sanitizeInput(content) {
  // 移除潜在的恶意内容
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

const sanitizedMessage = sanitizeInput(userInput);
```

## 📊 使用限制

### Cloudflare Workers 限制
- **请求超时**：30秒（可配置）
- **请求体大小**：1MB（可配置）
- **并发请求**：1000个/分钟（免费版）
- **CPU 时间**：10ms（免费版）

### DeepSeek API 限制
- **速率限制**：根据你的 DeepSeek 账户套餐
- **上下文长度**：128K tokens
- **并发连接**：根据账户类型

## 🚀 性能优化建议

### 1. 缓存策略
```javascript
// 简单的内存缓存示例
const cache = new Map();

function getCachedResponse(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
    return cached.data;
  }
  return null;
}
```

### 2. 请求优化
- 合理设置 `max_tokens` 避免不必要的长响应
- 使用适当的 `temperature` 值
- 对于简单任务使用更快的模型

### 3. 流式响应
- 对于长文本生成，使用流式响应提升用户体验
- 实现适当的错误重试机制
- 考虑实现请求取消功能

---

**需要更多帮助？** 👉 [查看使用示例](./Examples) | [故障排除](./Troubleshooting)
