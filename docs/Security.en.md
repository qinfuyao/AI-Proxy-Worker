# Security Configuration

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Security.en.md) | [🇨🇳 中文](./Security.md)

</div>

Comprehensive security guide for deploying AI Proxy Worker in production environments. Follow these best practices to ensure your deployment is secure and protected against common threats.

## 🔐 Authentication & Authorization

### API Key Security
Protect your AI service API keys:

```javascript
// ✅ Good: Store in Cloudflare secrets
wrangler secret put DEEPSEEK_API_KEY

// ❌ Bad: Never hardcode in source code
const API_KEY = "sk-1234567890abcdef"; // NEVER DO THIS
```

### Proxy Key Configuration
Set up secure proxy access:

```javascript
// Strong proxy key generation
const PROXY_KEY = crypto.randomUUID() + crypto.randomUUID();

// Set as Cloudflare secret
wrangler secret put PROXY_KEY
```

### Multi-tier Authentication
Implement layered security:

```javascript
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }
  
  const token = authHeader.substring(7);
  
  // Verify proxy key
  if (token !== env.PROXY_KEY) {
    return { valid: false, error: 'Invalid proxy key' };
  }
  
  return { valid: true };
}
```

## 🛡️ Input Validation & Sanitization

### Request Validation
Validate all incoming requests:

```javascript
function validateChatRequest(data) {
  const errors = [];
  
  // Required fields
  if (!data.messages || !Array.isArray(data.messages)) {
    errors.push('messages must be an array');
  }
  
  if (!data.model || typeof data.model !== 'string') {
    errors.push('model must be a string');
  }
  
  // Message validation
  data.messages?.forEach((msg, index) => {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      errors.push(`messages[${index}].role must be user, assistant, or system`);
    }
    
    if (!msg.content || typeof msg.content !== 'string') {
      errors.push(`messages[${index}].content must be a non-empty string`);
    }
    
    // Content length limits
    if (msg.content.length > 100000) {
      errors.push(`messages[${index}].content exceeds maximum length`);
    }
  });
  
  // Parameter validation
  if (data.temperature !== undefined) {
    if (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 2) {
      errors.push('temperature must be a number between 0 and 2');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Content Filtering
Implement content safety checks:

```javascript
function containsUnsafeContent(text) {
  const unsafePatterns = [
    /\b(password|secret|key|token)\s*[:=]\s*\w+/i,
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email patterns (if needed)
  ];
  
  return unsafePatterns.some(pattern => pattern.test(text));
}

// Usage in request handler
if (containsUnsafeContent(message.content)) {
  return new Response(JSON.stringify({
    error: 'content_rejected',
    message: 'Request contains potentially unsafe content'
  }), { status: 400 });
}
```

## 🚫 Rate Limiting & DDoS Protection

### Request Rate Limiting
Implement rate limiting to prevent abuse:

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
    
    // Clean old entries
    for (const [id, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, validTimestamps);
      }
    }
    
    // Check current client
    const clientRequests = this.requests.get(clientId) || [];
    const recentRequests = clientRequests.filter(ts => ts > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
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

// Usage
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

async function handleRequest(request, env) {
  const clientId = getClientId(request);
  
  if (!rateLimiter.isAllowed(clientId)) {
    return new Response(JSON.stringify({
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: 60
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    });
  }
  
  // Process request...
}
```

### IP-based Protection
Implement IP-based security measures:

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

// Usage in request handler
const clientIP = getClientIP(request);
if (isBlockedIP(clientIP)) {
  return new Response('Access denied', { status: 403 });
}
```

## 🔒 Data Protection

### Sensitive Data Handling
Never log sensitive information:

```javascript
function sanitizeForLogging(data) {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  delete sanitized.api_key;
  delete sanitized.authorization;
  delete sanitized.password;
  
  // Truncate long content
  if (sanitized.messages) {
    sanitized.messages = sanitized.messages.map(msg => ({
      ...msg,
      content: msg.content.length > 100 ? 
        msg.content.substring(0, 100) + '...[truncated]' : 
        msg.content
    }));
  }
  
  return sanitized;
}

// Usage
console.log('Request received:', sanitizeForLogging(requestData));
```

### Response Sanitization
Clean responses before sending:

```javascript
function sanitizeResponse(response) {
  // Remove internal fields
  const sanitized = { ...response };
  delete sanitized.internal_id;
  delete sanitized.debug_info;
  delete sanitized.upstream_headers;
  
  return sanitized;
}
```

## 🌐 CORS Configuration

### Secure CORS Setup
Configure CORS properly:

```javascript
function setCORSHeaders(response, origin) {
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://app.yourdomain.com',
    'https://localhost:3000' // Development only
  ];
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Handle preflight requests
if (request.method === 'OPTIONS') {
  const origin = request.headers.get('Origin');
  const response = new Response(null, { status: 204 });
  return setCORSHeaders(response, origin);
}
```

## 📝 Security Headers

### Essential Security Headers
Add security headers to all responses:

```javascript
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'none'");
  
  // Remove server information
  response.headers.delete('Server');
  
  return response;
}
```

## 🔍 Security Monitoring

### Security Event Logging
Log security-related events:

```javascript
function logSecurityEvent(event, details) {
  console.warn('Security event:', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
  
  // Send to security monitoring service
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
    }).catch(err => console.error('Failed to send security alert:', err));
  }
}

// Usage
logSecurityEvent('authentication_failure', {
  ip: getClientIP(request),
  userAgent: request.headers.get('User-Agent'),
  path: new URL(request.url).pathname
});
```

### Anomaly Detection
Detect unusual patterns:

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
    
    // Keep only recent requests (last hour)
    const oneHourAgo = now - 3600000;
    const recentRequests = requests.filter(ts => ts > oneHourAgo);
    this.requestPatterns.set(key, recentRequests);
    
    // Detect anomalies
    if (recentRequests.length > 1000) { // More than 1000 requests per hour
      logSecurityEvent('high_frequency_requests', {
        clientId,
        endpoint,
        requestCount: recentRequests.length
      });
    }
  }
}
```

## 🛠️ Environment Configuration

### Production Environment Variables
Secure environment setup:

```bash
# Required secrets
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put PROXY_KEY

# Optional security settings
wrangler secret put SECURITY_WEBHOOK
wrangler secret put RATE_LIMIT_MAX_REQUESTS
wrangler secret put ALLOWED_ORIGINS
```

### Configuration Validation
Validate environment on startup:

```javascript
function validateEnvironment(env) {
  const required = ['DEEPSEEK_API_KEY'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate API key format
  if (!env.DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.warn('DEEPSEEK_API_KEY may be invalid - should start with sk-');
  }
  
  return true;
}
```

## 🚨 Incident Response

### Security Incident Checklist
When a security incident is detected:

1. **Immediate Response**
   - [ ] Identify the scope of the incident
   - [ ] Block malicious traffic if possible
   - [ ] Preserve logs and evidence

2. **Assessment**
   - [ ] Determine what data may have been accessed
   - [ ] Assess the impact on users and services
   - [ ] Check for ongoing threats

3. **Containment**
   - [ ] Rotate compromised API keys
   - [ ] Update security rules
   - [ ] Deploy patches if needed

4. **Recovery**
   - [ ] Restore normal operations
   - [ ] Monitor for continued threats
   - [ ] Validate security measures

5. **Post-Incident**
   - [ ] Document lessons learned
   - [ ] Update security procedures
   - [ ] Notify stakeholders if required

### Emergency Procedures
```javascript
// Emergency shutdown capability
async function emergencyShutdown(reason) {
  logSecurityEvent('emergency_shutdown', { reason });
  
  // Return maintenance mode response
  return new Response(JSON.stringify({
    error: 'service_unavailable',
    message: 'Service temporarily unavailable for maintenance',
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

## 📋 Security Checklist

### Pre-deployment Security Review
- [ ] All API keys stored as secrets
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Logging sanitized
- [ ] Error messages don't leak information
- [ ] Dependencies updated
- [ ] Security monitoring enabled

### Regular Security Maintenance
- [ ] Review access logs monthly
- [ ] Update dependencies quarterly
- [ ] Rotate API keys annually
- [ ] Test incident response procedures
- [ ] Review and update security policies

---

**Security is an ongoing process** 🔒

Regular reviews and updates ensure your AI Proxy Worker remains secure against evolving threats.
