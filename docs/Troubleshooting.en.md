# Troubleshooting Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Troubleshooting.en.md) | [🇨🇳 中文](./Troubleshooting.md)

</div>

This guide covers common issues you might encounter when using AI Proxy Worker and their solutions. If your issue isn't listed here, please submit a new issue report in [GitHub Issues](../../issues).

## 🚨 Common Errors and Solutions

### 1. Authentication Related Errors

#### ❌ 401 Unauthorized
**Error Message:**
```json
{
  "error": "unauthorized",
  "details": "Invalid or missing authorization",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Possible Causes:**
- `PROXY_KEY` not set or incorrectly set
- Missing `Authorization` field in request headers
- Incorrect `Authorization` format

**Solutions:**

1. **Check environment variable settings:**
   ```bash
   # View set secrets (doesn't show values)
   wrangler secret list
   
   # Reset PROXY_KEY
   wrangler secret put PROXY_KEY
   ```

2. **Check request format:**
   ```bash
   # Correct format
   curl -H "Authorization: Bearer YOUR_PROXY_KEY" \
        https://your-worker.workers.dev/chat
   
   # Wrong format (missing Bearer)
   curl -H "Authorization: YOUR_PROXY_KEY" \
        https://your-worker.workers.dev/chat
   ```

3. **Verify key is correct:**
   ```javascript
   // Ensure no spaces before/after key
   const proxyKey = "YOUR_PROXY_KEY".trim();
   ```

#### ❌ Configuration Error
**Error Message:**
```json
{
  "error": "configuration_error",
  "details": "Service configuration error",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Possible Causes:**
- `DEEPSEEK_API_KEY` not set
- DeepSeek API key invalid or expired

**Solutions:**

1. **Reset DeepSeek API key:**
   ```bash
   wrangler secret put DEEPSEEK_API_KEY
   ```

2. **Verify DeepSeek key validity:**
   ```bash
   curl -X POST https://api.deepseek.com/chat/completions \
     -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
   ```

3. **Check DeepSeek account status:**
   - Login to [DeepSeek Platform](https://platform.deepseek.com/)
   - Check account balance
   - Confirm API key status

### 2. Request Format Errors

#### ❌ 400 Bad Request - Invalid JSON
**Error Message:**
```json
{
  "error": "invalid_request",
  "details": "Invalid JSON format",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Solutions:**

1. **Validate JSON format:**
   ```bash
   # Use online JSON validator or
   echo '{"model":"deepseek-chat","messages":[]}' | python -m json.tool
   ```

2. **Check special characters:**
   ```javascript
   // Properly escape special characters
   const message = "He said: \"Hello, world!\"";
   const payload = JSON.stringify({
     model: "deepseek-chat",
     messages: [{ role: "user", content: message }]
   });
   ```

#### ❌ 400 Bad Request - Missing Required Fields
**Error Message:**
```json
{
  "error": "invalid_request",
  "details": "Invalid request format. Missing or invalid messages array",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Solution:**

Ensure request contains required fields:
```json
{
  "model": "deepseek-chat",        // Required
  "messages": [                    // Required, must be array
    {
      "role": "user",              // Required: user/assistant/system
      "content": "Hello"           // Required: message content
    }
  ]
}
```

#### ❌ 413 Payload Too Large
**Error Message:**
```json
{
  "error": "payload_too_large",
  "details": "Request body too large. Maximum size: 1048576 bytes",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Solutions:**

1. **Reduce request content:**
   - Shorten conversation history
   - Reduce single message length
   - Remove unnecessary parameters

2. **Process long text in batches:**
   ```javascript
   function splitLongText(text, maxLength = 8000) {
     const chunks = [];
     for (let i = 0; i < text.length; i += maxLength) {
       chunks.push(text.slice(i, i + maxLength));
     }
     return chunks;
   }
   ```

3. **Adjust configuration (if you have permissions):**
   ```javascript
   // In worker.js
   const CONFIG = {
     MAX_BODY_SIZE: 2 * 1024 * 1024, // Increase to 2MB
   };
   ```

### 3. Network and Timeout Errors

#### ❌ 504 Gateway Timeout
**Error Message:**
```json
{
  "error": "timeout",
  "details": "Request to DeepSeek API timed out",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Solutions:**

1. **Retry request:**
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

2. **Reduce request complexity:**
   - Lower `max_tokens` parameter
   - Simplify prompt content
   - Use simpler models

3. **Check network connection:**
   ```bash
   # Test connection to DeepSeek API
   curl -I https://api.deepseek.com/
   
   # Test connection to Worker
   curl -I https://your-worker.workers.dev/
   ```

#### ❌ 502 Bad Gateway
**Error Message:**
```json
{
  "error": "upstream_error",
  "details": "Failed to connect to DeepSeek API",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Solutions:**

1. **Check DeepSeek API status:**
   - Visit [DeepSeek Status Page](https://status.deepseek.com/) (if available)
   - Check social media for service status updates

2. **Verify API key:**
   ```bash
   curl -X POST https://api.deepseek.com/chat/completions \
     -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
   ```

3. **Wait and retry:**
   - Wait a few minutes before retrying
   - If persistent, might be temporary DeepSeek API outage

### 4. Deployment Related Issues

#### ❌ Wrangler Login Failed
**Error Message:**
```
Error: Failed to login. Please try again.
```

**Solutions:**

1. **Clear login state and re-login:**
   ```bash
   wrangler logout
   wrangler login
   ```

2. **Manual login (if browser won't open):**
   ```bash
   wrangler login --browser=false
   # Copy displayed URL to browser
   ```

3. **Check network proxy:**
   ```bash
   # If using proxy
   export https_proxy=http://proxy.example.com:8080
   wrangler login
   ```

#### ❌ Deployment Failed
**Error Message:**
```
Error: Failed to publish your Worker
```

**Solutions:**

1. **Check wrangler.toml configuration:**
   ```toml
   name = "ai-proxy-worker"  # Ensure valid name
   main = "worker.js"        # Ensure file exists
   compatibility_date = "2025-08-17"  # Use valid date
   ```

2. **Verify code syntax:**
   ```bash
   # Check JavaScript syntax
   node -c worker.js
   ```

3. **Check account limits:**
   - Free accounts have Worker quantity limits
   - Check quota usage in Cloudflare Dashboard

## 🔍 Debugging Tools and Tips

### 1. View Worker Logs

**Real-time logs:**
```bash
# View real-time logs
wrangler tail

# Filter specific log levels
wrangler tail --format=pretty
```

**Cloudflare Dashboard logs:**
1. Login to Cloudflare Dashboard
2. Go to Workers & Pages
3. Select your Worker
4. Click "Logs" tab

### 2. Local Debugging

**Local development server:**
```bash
# Start local development environment
wrangler dev

# Specify port
wrangler dev --port 8787
```

**Add debug logs:**
```javascript
// Add debug info in worker.js
console.log('Request received:', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers)
});
```

### 3. Health Check Script

Create a simple health check script:

```bash
#!/bin/bash
# health-check.sh

WORKER_URL="https://your-worker.workers.dev"
PROXY_KEY="YOUR_PROXY_KEY"

echo "🔍 Starting health check..."

# 1. Basic health check
echo "1. Checking service status..."
curl -s "$WORKER_URL/" | jq .

# 2. Authentication test
echo "2. Testing authentication..."
curl -s -X POST "$WORKER_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[]}' | jq .

# 3. API call test
echo "3. Testing API call..."
curl -s -X POST "$WORKER_URL/chat" \
  -H "Authorization: Bearer $PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "test"}]
  }' | jq .

echo "✅ Health check complete"
```

## 📊 Monitoring and Alerting

### 1. Cloudflare Analytics

View in Cloudflare Dashboard:
- Request count and response time
- Error rate statistics
- Traffic distribution

### 2. Custom Monitoring

```javascript
// Add monitoring metrics in worker.js
const startTime = Date.now();

// Process request...

const duration = Date.now() - startTime;
console.log(`Request completed in ${duration}ms`, {
  method: request.method,
  status: response.status,
  duration,
  timestamp: new Date().toISOString()
});
```

### 3. External Monitoring Services

You can use the following services to monitor Worker:
- Uptime Robot
- Pingdom
- StatusCake

Monitoring configuration example:
```
URL: https://your-worker.workers.dev/
Method: GET
Expected Response: {"status":"ok"}
Check Interval: 5 minutes
```

## 🆘 Getting Help

If the above solutions don't resolve your issue:

### 1. Search Existing Issues
- Check [GitHub Issues](../../issues)
- Search [GitHub Discussions](../../discussions)
- Check [Cloudflare Community](https://community.cloudflare.com/)

### 2. Submit New Issue

When submitting issues on GitHub, please include:

**Basic Information:**
- Operating system and version
- Node.js and Wrangler versions
- Complete error message

**Reproduction Steps:**
- Detailed operation steps
- Commands or code used
- Expected vs actual results

**Log Information:**
```bash
# Get detailed logs
wrangler tail --format=pretty > logs.txt
```

**Example Request:**
```bash
# Provide failing curl command example
curl -v -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer ***" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[...]}'
```

### 3. Community Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [DeepSeek API Documentation](https://platform.deepseek.com/api-docs)
- [GitHub Discussions](../../discussions) - Community discussion
- Discord/Telegram groups (if available)

---

**Issue Resolved?** 👉 [View More Examples](./Examples.en.md) | [GitHub Issues](../../issues)
