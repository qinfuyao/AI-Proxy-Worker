# Code Style Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Code-Style.en.md) | [🇨🇳 中文](./Code-Style.md)

</div>

This guide outlines the coding standards and best practices for the AI Proxy Worker project. Following these guidelines ensures code consistency, maintainability, and readability across the project.

## 📋 General Principles

### Code Quality Standards
- **Readability First**: Write code that tells a story
- **Consistency**: Follow established patterns throughout the codebase
- **Simplicity**: Prefer simple solutions over complex ones
- **Modular Design**: Break down complex functions into single-responsibility small functions
- **Low Cognitive Complexity**: Keep function cognitive complexity below 15
- **Performance**: Consider performance implications of your code
- **Security**: Always prioritize security in your implementations

### File Organization
```
ai-proxy-worker/
├── worker.js              # Main worker script
├── wrangler.toml          # Configuration file
├── docs/                  # Documentation
├── examples/              # Usage examples
└── tests/                 # Test files (future)
```

## 🔧 JavaScript/TypeScript Standards

### Code Formatting
- **Indentation**: Use 2 spaces (no tabs)
- **Line Length**: Maximum 100 characters per line
- **Semicolons**: Optional, but be consistent
- **Quotes**: Use single quotes for strings
- **Trailing Commas**: Use trailing commas in multiline objects/arrays

```javascript
// ✅ Good
const config = {
  apiUrl: 'https://api.deepseek.com',
  timeout: 30000,
  retries: 3,
}

const models = [
  'deepseek-chat',
  'deepseek-reasoner',
]

// ❌ Avoid
const config = {
    "apiUrl": "https://api.deepseek.com",
    "timeout": 30000,
    "retries": 3
};
```

### Naming Conventions

#### Variables and Functions
Use camelCase for variables and functions:

```javascript
// ✅ Good
const apiResponse = await fetchData()
const userMessage = request.body.message
const isValidRequest = validateInput(data)

function processUserRequest(request) {
  // Implementation
}

async function sendUpstreamRequest(payload) {
  // Implementation
}

// ❌ Avoid
const api_response = await fetchData()
const user_message = request.body.message
const IsValidRequest = validateInput(data)

function ProcessUserRequest(request) {
  // Implementation
}
```

#### Constants
Use UPPER_SNAKE_CASE for constants:

```javascript
// ✅ Good
const API_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_TIMEOUT = 30000
const MAX_RETRIES = 3
const SUPPORTED_MODELS = ['deepseek-chat', 'deepseek-reasoner']

// ❌ Avoid
const apiBaseUrl = 'https://api.deepseek.com'
const defaultTimeout = 30000
```

#### Classes and Objects
Use PascalCase for classes and constructor functions:

```javascript
// ✅ Good
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

// ❌ Avoid
class requestHandler {
  // Implementation
}
```

### Function Structure

#### Function Declaration
Prefer arrow functions for short functions, regular functions for complex logic:

```javascript
// ✅ Good - Short utility functions
const isValidModel = (model) => SUPPORTED_MODELS.includes(model)
const createErrorResponse = (message, status = 400) => 
  new Response(JSON.stringify({ error: message }), { status })

// ✅ Good - Complex functions
async function handleChatRequest(request, env) {
  try {
    // Validate request
    const validation = await validateRequest(request)
    if (!validation.valid) {
      return createErrorResponse(validation.error, 400)
    }

    // Process request
    const response = await processChat(request, env)
    return response

  } catch (error) {
    console.error('Chat request failed:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
```

#### Parameter Handling
Use destructuring for object parameters:

```javascript
// ✅ Good
async function processChat({ messages, model, temperature }, env) {
  // Implementation
}

// Alternative with validation
async function processChat(params, env) {
  const { messages, model, temperature = 0.7 } = params
  
  // Validate required parameters
  if (!messages || !model) {
    throw new Error('Missing required parameters')
  }
  
  // Implementation
}

// ❌ Avoid
async function processChat(params, env) {
  const messages = params.messages
  const model = params.model
  const temperature = params.temperature
  // Implementation
}
```

## 📝 Documentation Standards

### JSDoc Comments
Use JSDoc for function documentation:

```javascript
/**
 * Sends a chat request to the upstream API
 * @param {Object} request - The chat request object
 * @param {Array} request.messages - Array of chat messages
 * @param {string} request.model - The model to use
 * @param {number} [request.temperature=0.7] - Sampling temperature
 * @param {Object} env - Environment variables
 * @param {string} env.DEEPSEEK_API_KEY - DeepSeek API key
 * @returns {Promise<Response>} The API response
 * @throws {Error} When API key is missing or request fails
 */
async function sendChatRequest(request, env) {
  // Implementation
}
```

### Inline Comments
Use comments to explain complex logic:

```javascript
// ✅ Good - Explains the "why"
async function handleRequest(request, env) {
  // Extract client IP for rate limiting
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown'
  
  // Check rate limit before processing expensive operations
  if (!await checkRateLimit(clientIP)) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  // Process the actual request
  return await processRequest(request, env)
}

// ❌ Avoid - States the obvious
async function handleRequest(request, env) {
  // Get the client IP
  const clientIP = request.headers.get('CF-Connecting-IP')
  
  // Return rate limit response
  if (!await checkRateLimit(clientIP)) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
}
```

## 🔧 Modular Validation Architecture

### Validation Function Design Principles

This project adopts a modular validation architecture, breaking down complex validation logic into multiple single-responsibility functions:

```javascript
// ✅ Good Example - Modular Validation
async function validateRequest(request) {
  validateContentType(request);           // Validate Content-Type
  validateContentLength(request);         // Validate request size
  
  if (CONFIG.VALIDATE_REQUEST_BODY) {
    await validateRequestBody(request);   // Validate request body
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
    validateMessages(body.messages);      // Validate message array
    validateModel(body.model);            // Validate model
  } catch (e) {
    // Error handling logic
  }
}
```

### Function Complexity Control

- **Cognitive Complexity Limit**: Keep each function's cognitive complexity ≤ 15
- **Single Responsibility Principle**: Each validation function handles only one type of validation
- **Composability**: Validation functions can be independently tested and reused

```javascript
// ✅ Good Example - Single Responsibility
function validateSingleMessage(message) {
  if (!message.role || !message.content) {
    throw new Error('Invalid request format. Each message must have role and content');
  }
  if (!['system', 'user', 'assistant', 'tool'].includes(message.role)) {
    throw new Error('Invalid request format. Invalid message role');
  }
}

// ❌ Avoid This - Complex Monolithic Function
function validateEverything(request) {
  // 100+ lines of validation code, cognitive complexity > 20
}
```

## 🛡️ Error Handling

### Error Response Format
Use consistent error response format:

```javascript
// ✅ Good - Consistent error format
function createErrorResponse(error, statusCode = 500, details = null) {
  const errorResponse = {
    error: error.code || 'unknown_error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  }
  
  // Add details in development/debug mode
  if (details && env.DEBUG_MODE === 'true') {
    errorResponse.details = details
  }
  
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Usage
try {
  const result = await riskyOperation()
  return new Response(JSON.stringify(result))
} catch (error) {
  console.error('Operation failed:', error)
  return createErrorResponse(error, 500, { operation: 'riskyOperation' })
}
```

### Error Types
Define custom error types for different scenarios:

```javascript
// ✅ Good - Custom error classes
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

// Usage
function validateChatRequest(data) {
  if (!data.messages || !Array.isArray(data.messages)) {
    throw new ValidationError('Messages must be an array', 'messages')
  }
  
  if (!data.model || typeof data.model !== 'string') {
    throw new ValidationError('Model must be a string', 'model')
  }
}
```

## 🔒 Security Best Practices

### Input Validation
Always validate and sanitize inputs:

```javascript
// ✅ Good - Comprehensive validation
function validateChatRequest(data) {
  const errors = []
  
  // Required fields
  if (!data.messages || !Array.isArray(data.messages)) {
    errors.push('messages must be an array')
  }
  
  if (!data.model || typeof data.model !== 'string') {
    errors.push('model must be a string')
  }
  
  // Validate messages array
  if (data.messages) {
    data.messages.forEach((msg, index) => {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push(`messages[${index}].role must be user, assistant, or system`)
      }
      
      if (!msg.content || typeof msg.content !== 'string') {
        errors.push(`messages[${index}].content must be a non-empty string`)
      }
      
      // Content length limits
      if (msg.content && msg.content.length > 100000) {
        errors.push(`messages[${index}].content exceeds maximum length`)
      }
    })
  }
  
  // Optional parameter validation
  if (data.temperature !== undefined) {
    if (typeof data.temperature !== 'number' || 
        data.temperature < 0 || 
        data.temperature > 2) {
      errors.push('temperature must be a number between 0 and 2')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Sensitive Data Handling
Never log sensitive information:

```javascript
// ✅ Good - Sanitized logging
function logRequest(request, response) {
  const logData = {
    method: request.method,
    url: new URL(request.url).pathname, // Don't log query params
    status: response.status,
    timestamp: new Date().toISOString(),
    // Don't log authorization headers or body content
  }
  
  console.log('Request processed:', logData)
}

// ❌ Avoid - Logging sensitive data
function logRequest(request, response) {
  console.log('Request:', {
    headers: Object.fromEntries(request.headers), // Contains API keys!
    body: request.body, // Contains user data!
    url: request.url // May contain sensitive query params!
  })
}
```

## ⚡ Performance Guidelines

### Async/Await Best Practices
Use async/await properly:

```javascript
// ✅ Good - Parallel execution when possible
async function processMultipleRequests(requests, env) {
  // Execute requests in parallel
  const promises = requests.map(request => processRequest(request, env))
  const results = await Promise.allSettled(promises)
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  ).filter(Boolean)
}

// ✅ Good - Sequential when needed
async function processWithDependencies(request, env) {
  const validation = await validateRequest(request)
  if (!validation.valid) {
    throw new ValidationError(validation.errors.join(', '))
  }
  
  const processed = await processRequest(request, env)
  const logged = await logRequest(processed)
  
  return processed
}

// ❌ Avoid - Unnecessary sequential execution
async function processMultipleRequests(requests, env) {
  const results = []
  for (const request of requests) {
    const result = await processRequest(request, env) // Blocking!
    results.push(result)
  }
  return results
}
```

### Memory Management
Be mindful of memory usage:

```javascript
// ✅ Good - Clean up resources
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
    // Clean up resources
    if (reader) {
      reader.releaseLock()
    }
  }
}
```

## 🧪 Testing Guidelines

### Test Structure
When writing tests (future implementation):

```javascript
// ✅ Good - Clear test structure
describe('Chat Request Handler', () => {
  describe('validateChatRequest', () => {
    it('should accept valid chat request', () => {
      const validRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'deepseek-chat'
      }
      
      const result = validateChatRequest(validRequest)
      expect(result.valid).toBe(true)
    })
    
    it('should reject request without messages', () => {
      const invalidRequest = { model: 'deepseek-chat' }
      
      const result = validateChatRequest(invalidRequest)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('messages must be an array')
    })
  })
})
```

## 📋 Code Review Checklist

Before submitting code, ensure:

### Functionality
- [ ] Code works as expected
- [ ] Edge cases are handled
- [ ] Error conditions are properly managed
- [ ] Performance implications are considered

### Code Quality
- [ ] Follows project naming conventions
- [ ] Functions are reasonably sized (< 50 lines)
- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] No debugging code left behind

### Security
- [ ] Input validation is implemented
- [ ] No sensitive data in logs
- [ ] Proper error handling without information leakage
- [ ] Security headers are set appropriately

### Documentation
- [ ] JSDoc comments for public functions
- [ ] README updated if needed
- [ ] Examples provided for new features
- [ ] Breaking changes documented

---

**Consistent code style makes collaboration easier** ✨

Following these guidelines helps maintain a high-quality, maintainable codebase that's easy for all contributors to work with.
