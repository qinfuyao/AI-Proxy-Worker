# Configuration Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Configuration.en.md) | [🇨🇳 中文](./Configuration.md)

</div>

AI Proxy Worker provides various configuration options to customize the proxy behavior according to your needs. Configuration is divided into two categories: environment variables and code configuration.

## 🔑 Environment Variables

These configurations are set through Cloudflare Workers' Secret feature, ensuring they remain invisible in the code for security.

### Required Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DEEPSEEK_API_KEY` | Secret | DeepSeek API key | `sk-...` |

**Setup Method:**
```bash
wrangler secret put DEEPSEEK_API_KEY
# Enter your DeepSeek API key
```

### Optional Environment Variables

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `PROXY_KEY` | Secret | Proxy access key for protecting your proxy | None (no authentication) |

**Setup Method:**
```bash
wrangler secret put PROXY_KEY
# Enter a custom access key, e.g., my-secret-key-2025
```

**Recommendations:**
- Strongly recommended to set `PROXY_KEY` in production
- Use a strong password generator for access keys
- Rotate keys periodically for enhanced security

## ⚙️ Code Configuration

These configurations are defined in the `CONFIG` object in `worker.js` and can be modified as needed.

### Core Configuration Options

#### DEEPSEEK_API_URL
- **Type**: String
- **Default**: `'https://api.deepseek.com/chat/completions'`
- **Description**: DeepSeek API endpoint URL
- **When to modify**: Usually no need to change unless DeepSeek changes their API endpoint

```javascript
DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions'
```

#### MAX_BODY_SIZE
- **Type**: Number
- **Default**: `1024 * 1024` (1MB)
- **Description**: Maximum request body size limit (bytes)
- **When to modify**:
  - Increase: For longer conversation history
  - Decrease: For stricter limits to prevent abuse

```javascript
MAX_BODY_SIZE: 1024 * 1024  // 1MB
MAX_BODY_SIZE: 2 * 1024 * 1024  // 2MB (more lenient)
MAX_BODY_SIZE: 512 * 1024  // 512KB (stricter)
```

#### REQUEST_TIMEOUT
- **Type**: Number
- **Default**: `30000` (30 seconds)
- **Description**: Timeout for requests to DeepSeek API (milliseconds)
- **When to modify**:
  - Increase: If frequently encountering timeout errors
  - Decrease: For faster failure responses

```javascript
REQUEST_TIMEOUT: 30000   // 30 seconds (default)
REQUEST_TIMEOUT: 60000   // 60 seconds (more lenient)
REQUEST_TIMEOUT: 15000   // 15 seconds (stricter)
```

#### VALIDATE_REQUEST_BODY
- **Type**: Boolean
- **Default**: `false`
- **Description**: Whether to enable strict request body format validation
- **When to modify**:
  - `true`: Enable strict validation, checks messages format
  - `false`: Lenient mode, let DeepSeek API handle validation

```javascript
VALIDATE_REQUEST_BODY: false  // Lenient mode (recommended)
VALIDATE_REQUEST_BODY: true   // Strict mode
```

#### DEFAULT_MODEL
- **Type**: String
- **Default**: `'deepseek-chat'`
- **Description**: Default model to use when not specified in request
- **When to modify**: Based on your primary use case

```javascript
DEFAULT_MODEL: 'deepseek-chat'      // General conversation (default)
DEFAULT_MODEL: 'deepseek-reasoner'  // Reasoning tasks primary
```

#### SUPPORTED_MODELS
- **Type**: Array
- **Default**: `['deepseek-chat', 'deepseek-reasoner']`
- **Description**: List of supported models for validation and documentation
- **When to modify**: When DeepSeek releases new models

```javascript
SUPPORTED_MODELS: [
  'deepseek-chat',      // General conversation model
  'deepseek-reasoner'   // Reasoning model
]
```

### CORS Configuration

#### CORS_HEADERS
- **Description**: Cross-origin request response headers configuration
- **Default**: Allows all domains

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

**Production Recommendations:**
```javascript
// Restrict to specific domains
'Access-Control-Allow-Origin': 'https://yourdomain.com'

// Or support multiple domains
'Access-Control-Allow-Origin': request.headers.get('origin') // Needs additional validation logic
```

### Security Configuration

#### SECURITY_HEADERS
- **Description**: Security-related response headers
- **Default**: Basic security protection

```javascript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

## 🛠️ Advanced Configuration

### Custom Configuration Examples

For more complex configurations, you can modify like this:

```javascript
// Development environment configuration
const CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  MAX_BODY_SIZE: 2 * 1024 * 1024, // 2MB, more lenient
  REQUEST_TIMEOUT: 60000, // 60 seconds, longer timeout
  VALIDATE_REQUEST_BODY: true, // Enable strict validation
  DEFAULT_MODEL: 'deepseek-chat',
  SUPPORTED_MODELS: [
    'deepseek-chat',
    'deepseek-reasoner'
  ]
};

// Production environment configuration
const CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  MAX_BODY_SIZE: 512 * 1024, // 512KB, stricter
  REQUEST_TIMEOUT: 15000, // 15 seconds, faster failure
  VALIDATE_REQUEST_BODY: false, // Lenient validation, better compatibility
  DEFAULT_MODEL: 'deepseek-chat',
  SUPPORTED_MODELS: [
    'deepseek-chat',
    'deepseek-reasoner'
  ]
};
```

### Environment-Specific Configuration

You can also set environment-specific configurations in `wrangler.toml`:

```toml
name = "ai-proxy-worker"
main = "worker.js"
compatibility_date = "2025-08-17"

# Production environment
[env.production]
name = "ai-proxy-worker-prod"
vars = { ENVIRONMENT = "production" }

# Development environment
[env.development]
name = "ai-proxy-worker-dev"
vars = { ENVIRONMENT = "development" }
```

Then use in code:

```javascript
// Adjust configuration based on environment
const isProduction = env.ENVIRONMENT === 'production';

const CONFIG = {
  // ... other configurations
  MAX_BODY_SIZE: isProduction ? 512 * 1024 : 2 * 1024 * 1024,
  REQUEST_TIMEOUT: isProduction ? 15000 : 60000,
  VALIDATE_REQUEST_BODY: !isProduction, // Enable strict validation in development
};
```

## 📝 Configuration Best Practices

### 1. Security Configuration
```javascript
// ✅ Recommended: Restrict CORS in production
'Access-Control-Allow-Origin': 'https://yourdomain.com'

// ❌ Avoid: Using wildcards in production
'Access-Control-Allow-Origin': '*'
```

### 2. Performance Configuration
```javascript
// ✅ Recommended: Reasonable timeout
REQUEST_TIMEOUT: 30000  // 30 seconds

// ❌ Avoid: Excessive timeout
REQUEST_TIMEOUT: 300000  // 5 minutes (too long)
```

### 3. Compatibility Configuration
```javascript
// ✅ Recommended: Lenient validation mode
VALIDATE_REQUEST_BODY: false

// ⚠️ Note: Strict mode may cause some clients to fail
VALIDATE_REQUEST_BODY: true
```

## 🔧 Configuration Modification Steps

### 1. Modify Code Configuration
1. Edit `worker.js` file
2. Modify corresponding values in `CONFIG` object
3. Save file

### 2. Redeploy
```bash
wrangler publish
```

### 3. Verify Configuration
```bash
# Test health check
curl https://your-worker.workers.dev/

# Test API call
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
```

## ❓ Common Configuration Questions

### Q: How to increase request body size limit?
A: Modify `MAX_BODY_SIZE` configuration:
```javascript
MAX_BODY_SIZE: 2 * 1024 * 1024  // Increase to 2MB
```

### Q: How to set stricter timeout?
A: Modify `REQUEST_TIMEOUT` configuration:
```javascript
REQUEST_TIMEOUT: 15000  // Reduce to 15 seconds
```

### Q: How to disable request validation?
A: Set `VALIDATE_REQUEST_BODY` to false:
```javascript
VALIDATE_REQUEST_BODY: false
```

### Q: How to restrict CORS domains?
A: Modify `Access-Control-Allow-Origin` in `CORS_HEADERS`:
```javascript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

---

**Need Help?** 👉 [Troubleshooting Guide](./Troubleshooting.en.md) | [📋 Issues](../../issues)
