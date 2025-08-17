# API Reference

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./API-Reference.en.md) | [🇨🇳 中文](./API-Reference.md)

</div>

AI Proxy Worker provides a simple yet powerful RESTful API that is fully compatible with OpenAI's Chat Completions API format, allowing you to easily integrate it into existing projects.

> **Current Support**: DeepSeek API (v1.0)  
> **Future Plans**: Multi-AI service provider support including OpenAI, Claude, Gemini (v2.0)

## 🌐 Basic Information

### Base URL
```
https://your-worker.workers.dev
```

### Authentication
```http
Authorization: Bearer YOUR_PROXY_KEY
```

### Content-Type
```http
Content-Type: application/json
```

## 📚 API Endpoints

### 1. Health Check

Check service status and connectivity.

**Request:**
```http
GET /
```

**Response:**
```json
{
  "status": "ok",
  "service": "AI Proxy Worker",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Example:**
```bash
curl https://your-worker.workers.dev/
```

### 2. Chat Completions

Interact with AI models, supports both streaming and non-streaming responses.

**Request:**
```http
POST /chat
```

**Headers:**
```http
Authorization: Bearer YOUR_PROXY_KEY
Content-Type: application/json
Accept: application/json  # Non-streaming
Accept: text/event-stream # Streaming
```

**Request Body:**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant."
    },
    {
      "role": "user", 
      "content": "Hello!"
    }
  ],
  "stream": false,
  "max_tokens": 2048
}
```

## 🤖 Supported Models

### deepseek-chat
- **Use Case**: General conversation and text generation
- **Architecture**: Based on DeepSeek-V3 architecture
- **Features**: Suitable for daily conversations, content creation, text understanding
- **Context Length**: 64K tokens
- **Recommended Scenarios**: General text generation, conversational applications

### deepseek-reasoner  
- **Use Case**: Complex reasoning and logical thinking
- **Architecture**: Based on DeepSeek-R1 architecture
- **Features**: Math problems, logical reasoning, code analysis, complex reasoning
- **Context Length**: 64K tokens
- **Recommended Scenarios**: Tasks requiring deep thinking

> **Note**: Model specifications and capabilities may change with DeepSeek updates. Check [DeepSeek Official Documentation](https://platform.deepseek.com/) for latest information.

## 📝 Request Parameters

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model name to use |
| `messages` | array | Array of conversation messages |

### Optional Parameters

| Parameter | Type | Default | Description | Support Status |
|-----------|------|---------|-------------|----------------|
| `stream` | boolean | false | Enable streaming response | ✅ Fully supported |
| `max_tokens` | number | - | Maximum tokens to generate | ✅ Fully supported |
| `temperature` | number | 1.0 | Control randomness (0-2) | ⚠️ May not work |
| `top_p` | number | 1.0 | Nucleus sampling parameter (0-1) | ⚠️ May not work |
| `frequency_penalty` | number | 0 | Frequency penalty (-2 to 2) | ⚠️ May not work |
| `presence_penalty` | number | 0 | Presence penalty (-2 to 2) | ⚠️ May not work |
| `stop` | array/string | null | Stop sequences | ✅ Supported |
| `seed` | number | null | Random seed for consistent output | ✅ Supported |

> **Note**: Parameters marked "⚠️ May not work" may not have the expected effect due to DeepSeek API limitations. We recommend primarily using `stream`, `max_tokens`, `stop`, and `seed` parameters.

### Messages Format

Each message object contains:

```json
{
  "role": "user|assistant|system",
  "content": "Message content"
}
```

**Role Descriptions:**
- `system`: System prompt, defines AI behavior
- `user`: User input
- `assistant`: AI response

## 📤 Response Format

### Non-streaming Response

**Success Response:**
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
        "content": "Hello! I'm DeepSeek, happy to help you."
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

### Streaming Response

When `stream: true` is enabled, response is in Server-Sent Events (SSE) format:

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1677652288,"model":"deepseek-chat","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

## ⚠️ **Important: Parameter Compatibility**

According to DeepSeek official documentation, the following parameters may not work as expected:

- `temperature` - May be ignored, DeepSeek API may use fixed temperature values
- `top_p` - May not work
- `frequency_penalty` - May not work  
- `presence_penalty` - May not work

**Recommended Approach:**
- Primarily use `model`, `messages`, `max_tokens`, `stream`, and `stop` parameters
- To control generation behavior, use `system` messages to guide the model
- You can try these parameters during testing, but don't rely on their effects

**Example - Recommended Request Format:**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system", 
      "content": "Please answer concisely, don't be overly detailed."
    },
    {
      "role": "user",
      "content": "What is artificial intelligence?"
    }
  ],
  "max_tokens": 500,
  "stream": false
}
```

## 🔧 Complete Examples

### cURL Examples

**Non-streaming Request:**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "system",
        "content": "You are a professional programming assistant."
      },
      {
        "role": "user",
        "content": "Please write a Python quicksort function for me."
      }
    ],
    "max_tokens": 1000
  }'
```

**Streaming Request:**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Write a poem about programming"}
    ],
    "stream": true
  }'
```

### JavaScript Examples

**Basic Call:**
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

// Usage example
callAI('Hello, please introduce yourself')
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));
```

**Streaming Call:**
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
            // Ignore parsing errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Usage example
streamAI('Write a story about AI', (chunk) => {
  process.stdout.write(chunk); // Real-time output
});
```

### Python Examples

**Basic Call:**
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

# Usage example
result = call_ai("Please explain what machine learning is")
print(result)
```

**Streaming Call:**
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

# Usage example
stream_ai("Write a poem about spring")
```

### iOS Swift Examples

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

// Usage example
let client = AIProxyClient()

Task {
    do {
        let response = try await client.chatCompletion(
            messages: [
                ["role": "user", "content": "Hello, please introduce yourself"]
            ]
        )
        print(response)
    } catch {
        print("Error: \(error)")
    }
}
```

## ❌ Error Handling

### Error Response Format

All errors return a unified JSON format:

```json
{
  "error": "error_type",
  "details": "Detailed error message",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Common Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | Request format error |
| 401 | `unauthorized` | Authentication failed |
| 404 | `not_found` | Endpoint not found |
| 413 | `payload_too_large` | Request body too large |
| 500 | `internal_error` | Internal server error |
| 502 | `upstream_error` | Upstream API error |
| 504 | `timeout` | Request timeout |

### Error Handling Example

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
    
    // Handle different error types
    if (error.message.includes('401')) {
      console.log('Please check if API key is correct');
    } else if (error.message.includes('504')) {
      console.log('Request timeout, please try again later');
    } else if (error.message.includes('413')) {
      console.log('Request content too long, please reduce input');
    }
    
    throw error;
  }
}
```

## 🔒 Security Best Practices

### 1. API Key Management
- Never hardcode `PROXY_KEY` in client code
- Use environment variables or secure configuration management
- Rotate keys regularly

### 2. Request Validation
- Validate user input to prevent injection attacks
- Limit request frequency to prevent abuse
- Log and monitor abnormal requests

### 3. Content Filtering
```javascript
function sanitizeInput(content) {
  // Remove potentially malicious content
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

const sanitizedMessage = sanitizeInput(userInput);
```

## 📊 Usage Limits

### Cloudflare Workers Limits
- **Request Timeout**: 30 seconds (configurable)
- **Request Body Size**: 1MB (configurable)
- **Concurrent Requests**: 1000/minute (free tier)
- **CPU Time**: 10ms (free tier)

### DeepSeek API Limits
- **Rate Limits**: Based on your DeepSeek account plan
- **Context Length**: 64K tokens
- **Concurrent Connections**: Based on account type

## 🚀 Performance Optimization Tips

### 1. Caching Strategy
```javascript
// Simple memory cache example
const cache = new Map();

function getCachedResponse(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5-minute cache
    return cached.data;
  }
  return null;
}
```

### 2. Request Optimization
- Set reasonable `max_tokens` to avoid unnecessarily long responses
- Use appropriate `temperature` values
- Use faster models for simple tasks

### 3. Streaming Response
- Use streaming response for long text generation to improve user experience
- Implement appropriate error retry mechanisms
- Consider implementing request cancellation

---

**Need More Help?** 👉 [View Usage Examples](./Examples.en.md) | [Troubleshooting](./Troubleshooting.en.md)
