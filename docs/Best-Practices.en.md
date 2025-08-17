# Best Practices

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Best-Practices.en.md) | [🇨🇳 中文](./Best-Practices.md)

</div>

This guide provides best practice recommendations for using AI Proxy Worker, helping you maximize the advantages of this proxy service while ensuring security and performance.

## 🔐 Security Best Practices

### 1. API Key Management

**✅ Recommended Practices:**
```bash
# Use strong keys as proxy access keys
wrangler secret put PROXY_KEY
# Input: sk-proxy-your-very-secure-random-key-2025

# Rotate keys regularly
wrangler secret put DEEPSEEK_API_KEY  # Update DeepSeek key
wrangler secret put PROXY_KEY         # Update proxy key
```

**❌ Avoid These Practices:**
```javascript
// Don't hardcode keys in client code
const API_KEY = 'your-secret-key'; // Wrong!

// Don't use simple keys
PROXY_KEY: '123456' // Too simple!
```

### 2. Access Control

**Production CORS Configuration:**
```javascript
// Restrict specific domains in worker.js
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Restrict to specific domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',          // Only allow necessary methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 3. Key Rotation Strategy

```bash
# Recommend monthly rotation
echo "$(date): Updating API keys" >> key-rotation.log
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put PROXY_KEY
```

## ⚡ Performance Optimization

### 1. Request Optimization

**Reasonable Configuration Parameters:**
```javascript
// worker.js CONFIG optimization
const CONFIG = {
  MAX_BODY_SIZE: 512 * 1024,    // 512KB, suitable for most conversations
  REQUEST_TIMEOUT: 30000,        // 30 seconds, balance performance and reliability
  VALIDATE_REQUEST_BODY: false,  // Disable validation for better performance
};
```

**Client Request Optimization:**
```javascript
// Use appropriate models
const request = {
  model: 'deepseek-chat',        // Use chat model for daily conversations
  messages: messages,
  max_tokens: 1000,              // Limit response length
  temperature: 0.7,              // Balance creativity and consistency
};

// Use reasoner model for complex reasoning tasks
const complexRequest = {
  model: 'deepseek-reasoner',    // For math and logical reasoning tasks
  messages: messages,
  max_tokens: 2000,              // Reasoning tasks may need more tokens
};
```

### 2. Streaming Response Usage

**Recommended for Real-time Conversations:**
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_PROXY_KEY',
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',  // Enable streaming response
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: messages,
    stream: true,                   // Enable streaming
  })
});
```

### 3. Caching Strategy

```javascript
// Client-side simple caching
const messageCache = new Map();

function getCachedResponse(messageHash) {
  return messageCache.get(messageHash);
}

function setCachedResponse(messageHash, response) {
  // Limit cache size
  if (messageCache.size > 100) {
    const firstKey = messageCache.keys().next().value;
    messageCache.delete(firstKey);
  }
  messageCache.set(messageHash, response);
}
```

## 🛡️ Error Handling

### 1. Client Error Handling

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
    console.error('AI API call failed:', error);
    
    // Handle based on error type
    if (error.message.includes('timeout')) {
      return { error: 'Request timeout, please try again later' };
    } else if (error.message.includes('unauthorized')) {
      return { error: 'Authentication failed, please check access key' };
    } else {
      return { error: 'Service temporarily unavailable, please try again later' };
    }
  }
}
```

### 2. Retry Mechanism

```javascript
async function callAIWithRetry(messages, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callAI(messages);
      if (!result.error) {
        return result;
      }
      
      // Don't retry on authentication errors
      if (result.error.includes('Authentication failed')) {
        throw new Error(result.error);
      }
      
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff delay
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

## 📊 Monitoring and Logging

### 1. Client Monitoring

```javascript
// Request statistics
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
    
    // Update average response time
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

### 2. Worker Log Monitoring

```bash
# View Worker logs in real-time
wrangler tail

# Check deployment status
wrangler deployments list

# View usage statistics
wrangler metrics
```

## 🔧 Development Environment Configuration

### 1. Environment Separation

```toml
# wrangler.toml
name = "ai-proxy-worker"
main = "worker.js"
compatibility_date = "2025-08-17"

# Development environment
[env.development]
name = "ai-proxy-worker-dev"
vars = { ENVIRONMENT = "development" }

# Production environment
[env.production]
name = "ai-proxy-worker-prod"
vars = { ENVIRONMENT = "production" }
```

**Deploy to Different Environments:**
```bash
# Development environment
wrangler publish --env development

# Production environment
wrangler publish --env production
```

### 2. Local Development

```bash
# Local development server
wrangler dev

# Specify port
wrangler dev --port 8080

# Local testing
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

## 📱 Mobile Application Integration

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
                throw IOException("Request failed: ${response.code}")
            }
            
            val responseBody = response.body?.string() ?: throw IOException("Empty response")
            Gson().fromJson(responseBody, ChatResponse::class.java)
        }
    }
}
```

## 🚀 Production Deployment Recommendations

### 1. Pre-deployment Checklist

- [ ] Strong keys set (PROXY_KEY and DEEPSEEK_API_KEY)
- [ ] CORS domains restricted (production environment)
- [ ] Appropriate timeout and size limits configured
- [ ] All API endpoints tested
- [ ] Monitoring and logging set up
- [ ] Error handling and retry mechanisms prepared

### 2. Performance Benchmarking

```bash
# Use Apache Bench for stress testing
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_PROXY_KEY" \
   -H "Content-Type: application/json" \
   -p test-payload.json \
   https://your-worker.workers.dev/chat

# test-payload.json content:
echo '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}' > test-payload.json
```

### 3. Capacity Planning

According to Cloudflare Workers limits:
- **Free Tier**: 100,000 requests per day
- **Paid Tier**: Unlimited, pay-per-use
- **Memory**: Maximum 128MB
- **CPU Time**: Maximum 30 seconds

## 💡 Usage Tips

### 1. Model Selection Guide

```javascript
// Choose appropriate model
function selectModel(taskType) {
  switch (taskType) {
    case 'chat':
    case 'creative':
    case 'translation':
      return 'deepseek-chat';      // Daily conversation, creative writing, translation
      
    case 'math':
    case 'logic':
    case 'analysis':
      return 'deepseek-reasoner';  // Math, logical reasoning, analysis
      
    default:
      return 'deepseek-chat';      // Default to chat model
  }
}
```

### 2. Message Optimization

```javascript
// Optimize conversation context
function optimizeMessages(messages, maxTokens = 4000) {
  // Keep system messages and recent conversations
  const systemMessages = messages.filter(m => m.role === 'system');
  const recentMessages = messages.filter(m => m.role !== 'system').slice(-10);
  
  return [...systemMessages, ...recentMessages];
}
```

### 3. Error Recovery Strategy

```javascript
// Intelligent error recovery
async function resilientAICall(messages) {
  try {
    return await callAI(messages);
  } catch (error) {
    if (error.message.includes('too_long')) {
      // If message too long, try to shorten
      const shorterMessages = optimizeMessages(messages, 2000);
      return await callAI(shorterMessages);
    }
    throw error;
  }
}
```

---

**Next Steps?** 👉 [View Usage Examples](./Examples.en.md) | [Monitoring Guide](./Monitoring.en.md)