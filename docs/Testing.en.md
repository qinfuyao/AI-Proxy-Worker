# Testing Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Testing.en.md) | [🇨🇳 中文](./Testing.md)

</div>

Comprehensive testing guide for AI Proxy Worker. This document covers testing strategies, tools, and best practices for ensuring code quality and reliability.

## 📋 Testing Overview

### Testing Philosophy
- **Test Early, Test Often**: Write tests as you develop features
- **Quality Over Quantity**: Focus on meaningful tests rather than coverage numbers
- **Real-World Scenarios**: Test actual use cases and edge conditions
- **Maintainable Tests**: Write tests that are easy to understand and maintain

### Testing Pyramid
```
    /\
   /  \    Unit Tests (70%)
  /____\   - Fast, isolated, focused
 /      \  
/________\  Integration Tests (20%)
           - API endpoints, data flow
           
           E2E Tests (10%)
           - Full user scenarios
```

## 🧪 Testing Setup

### Prerequisites
- Node.js 18+ and npm
- Wrangler CLI for Cloudflare Workers
- Testing framework (Jest recommended)

### Installation
```bash
# Install testing dependencies
npm install --save-dev jest @types/jest
npm install --save-dev @cloudflare/workers-types

# For API testing
npm install --save-dev supertest
npm install --save-dev node-fetch

# For mocking
npm install --save-dev jest-environment-miniflare
```

### Configuration
Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'miniflare',
  testEnvironmentOptions: {
    scriptPath: './worker.js',
    modules: true,
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'worker.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## 🔧 Unit Testing

### Testing Worker Functions
Test individual functions in isolation:

```javascript
// tests/validation.test.js
import { validateChatRequest } from '../worker.js'

describe('validateChatRequest', () => {
  it('should validate correct chat request', () => {
    const validRequest = {
      messages: [
        { role: 'user', content: 'Hello, AI!' }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(validRequest)
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject request without messages', () => {
    const invalidRequest = {
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages must be an array')
  })

  it('should reject invalid message format', () => {
    const invalidRequest = {
      messages: [
        { role: 'invalid', content: 'Hello' }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages[0].role must be user, assistant, or system')
  })

  it('should reject messages that are too long', () => {
    const longContent = 'a'.repeat(100001)
    const invalidRequest = {
      messages: [
        { role: 'user', content: longContent }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages[0].content exceeds maximum length')
  })

  it('should validate optional parameters', () => {
    const requestWithParams = {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 1000
    }

    const result = validateChatRequest(requestWithParams)
    
    expect(result.valid).toBe(true)
  })

  it('should reject invalid temperature', () => {
    const invalidRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'deepseek-chat',
      temperature: 3.0 // Invalid: > 2.0
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('temperature must be a number between 0 and 2')
  })
})
```

### Testing Error Handling
Test error scenarios thoroughly:

```javascript
// tests/error-handling.test.js
import { createErrorResponse, ApiError } from '../worker.js'

describe('Error Handling', () => {
  describe('createErrorResponse', () => {
    it('should create standard error response', () => {
      const error = new Error('Test error')
      const response = createErrorResponse(error, 400)
      
      expect(response.status).toBe(400)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should include error details in debug mode', () => {
      const error = new Error('Test error')
      const env = { DEBUG_MODE: 'true' }
      const details = { operation: 'test' }
      
      const response = createErrorResponse(error, 400, details, env)
      const body = JSON.parse(response.body)
      
      expect(body.details).toEqual(details)
    })

    it('should not include details in production', () => {
      const error = new Error('Test error')
      const env = { DEBUG_MODE: 'false' }
      const details = { operation: 'test' }
      
      const response = createErrorResponse(error, 400, details, env)
      const body = JSON.parse(response.body)
      
      expect(body.details).toBeUndefined()
    })
  })

  describe('ApiError', () => {
    it('should create API error with status code', () => {
      const apiError = new ApiError('Upstream API failed', 502)
      
      expect(apiError.message).toBe('Upstream API failed')
      expect(apiError.statusCode).toBe(502)
      expect(apiError.name).toBe('ApiError')
    })
  })
})
```

### Testing Utilities
Test helper functions:

```javascript
// tests/utils.test.js
import { sanitizeForLogging, getClientIP } from '../worker.js'

describe('Utility Functions', () => {
  describe('sanitizeForLogging', () => {
    it('should remove sensitive fields', () => {
      const data = {
        messages: [{ role: 'user', content: 'Hello' }],
        api_key: 'sk-secret',
        authorization: 'Bearer token'
      }

      const sanitized = sanitizeForLogging(data)
      
      expect(sanitized.api_key).toBeUndefined()
      expect(sanitized.authorization).toBeUndefined()
      expect(sanitized.messages).toBeDefined()
    })

    it('should truncate long content', () => {
      const longContent = 'a'.repeat(200)
      const data = {
        messages: [{ role: 'user', content: longContent }]
      }

      const sanitized = sanitizeForLogging(data)
      
      expect(sanitized.messages[0].content).toHaveLength(103) // 100 + "..."
      expect(sanitized.messages[0].content).toContain('...[truncated]')
    })
  })

  describe('getClientIP', () => {
    it('should extract IP from CF-Connecting-IP header', () => {
      const request = new Request('https://example.com', {
        headers: { 'CF-Connecting-IP': '192.168.1.1' }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to X-Forwarded-For', () => {
      const request = new Request('https://example.com', {
        headers: { 'X-Forwarded-For': '192.168.1.2' }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.2')
    })

    it('should return unknown for missing headers', () => {
      const request = new Request('https://example.com')

      const ip = getClientIP(request)
      expect(ip).toBe('unknown')
    })
  })
})
```

## 🌐 Integration Testing

### Testing HTTP Endpoints
Test complete request/response cycles:

```javascript
// tests/integration/chat.test.js
import { unstable_dev } from 'wrangler'

describe('Chat Endpoint Integration', () => {
  let worker

  beforeAll(async () => {
    worker = await unstable_dev('worker.js', {
      experimental: { disableExperimentalWarning: true },
      env: {
        DEEPSEEK_API_KEY: 'test-key',
        PROXY_KEY: 'test-proxy-key'
      }
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  it('should handle valid chat request', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-proxy-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hello, AI!' }
        ]
      })
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.choices).toBeDefined()
    expect(data.choices[0].message).toBeDefined()
  })

  it('should reject request without authorization', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    expect(response.status).toBe(401)
  })

  it('should handle malformed JSON', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-proxy-key',
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toBe('invalid_json')
  })

  it('should handle streaming requests', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-proxy-key',
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true
      })
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/event-stream')
  })
})
```

### Testing Rate Limiting
Test rate limiting functionality:

```javascript
// tests/integration/rate-limiting.test.js
describe('Rate Limiting', () => {
  let worker

  beforeAll(async () => {
    worker = await unstable_dev('worker.js', {
      env: {
        RATE_LIMIT_MAX_REQUESTS: '5',
        RATE_LIMIT_WINDOW_MS: '60000'
      }
    })
  })

  afterAll(async () => {
    await worker.stop()
  })

  it('should allow requests within limit', async () => {
    const requests = Array(3).fill().map(() => 
      worker.fetch('https://worker.dev/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-proxy-key',
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '192.168.1.100'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
  })

  it('should block requests exceeding limit', async () => {
    // Make requests up to the limit
    const requests = Array(6).fill().map(() => 
      worker.fetch('https://worker.dev/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-proxy-key',
          'Content-Type': 'application/json',
          'CF-Connecting-IP': '192.168.1.101'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    
    // First 5 should succeed
    responses.slice(0, 5).forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // 6th should be rate limited
    expect(responses[5].status).toBe(429)
  })
})
```

## 🎭 Mocking External APIs

### Mock DeepSeek API Responses
Create mocks for external API calls:

```javascript
// tests/mocks/deepseek-api.js
export const mockDeepSeekResponse = {
  id: 'chatcmpl-test123',
  object: 'chat.completion',
  created: Date.now(),
  model: 'deepseek-chat',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: 'Hello! How can I help you today?'
    },
    finish_reason: 'stop'
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 9,
    total_tokens: 19
  }
}

export const mockStreamingResponse = [
  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":"! How"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":" can I help you?"}}]}\n\n',
  'data: [DONE]\n\n'
]

// Mock fetch for testing
export function mockFetch(url, options) {
  if (url.includes('api.deepseek.com')) {
    if (options.headers.Accept?.includes('text/event-stream')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/event-stream']]),
        body: {
          getReader: () => ({
            read: mockStreamingResponse.shift() 
              ? () => Promise.resolve({ 
                  done: false, 
                  value: new TextEncoder().encode(mockStreamingResponse.shift())
                })
              : () => Promise.resolve({ done: true })
          })
        }
      })
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockDeepSeekResponse)
    })
  }
  
  return Promise.reject(new Error('Unmocked URL'))
}
```

### Using Mocks in Tests
```javascript
// tests/integration/api-mocking.test.js
import { mockFetch, mockDeepSeekResponse } from '../mocks/deepseek-api.js'

describe('API Integration with Mocks', () => {
  beforeEach(() => {
    global.fetch = jest.fn(mockFetch)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should handle successful API response', async () => {
    const worker = await unstable_dev('worker.js')
    
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.choices[0].message.content).toBe(mockDeepSeekResponse.choices[0].message.content)
    
    await worker.stop()
  })
})
```

## 🔍 Performance Testing

### Load Testing
Test performance under load:

```javascript
// tests/performance/load.test.js
describe('Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const worker = await unstable_dev('worker.js')
    const concurrentRequests = 50
    
    const startTime = Date.now()
    
    const requests = Array(concurrentRequests).fill().map(() =>
      worker.fetch('https://worker.dev/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Performance test' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    const endTime = Date.now()
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // Should complete within reasonable time
    const duration = endTime - startTime
    expect(duration).toBeLessThan(10000) // 10 seconds
    
    console.log(`${concurrentRequests} concurrent requests completed in ${duration}ms`)
    
    await worker.stop()
  })
})
```

## 📊 Test Coverage

### Coverage Configuration
Ensure good test coverage:

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'worker.js',
    'src/**/*.js',
    '!**/node_modules/**',
    '!coverage/**',
    '!tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

### Running Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## 🚀 Continuous Integration

### GitHub Actions Workflow
Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
      env:
        DEEPSEEK_API_KEY: ${{ secrets.TEST_DEEPSEEK_API_KEY }}
        PROXY_KEY: ${{ secrets.TEST_PROXY_KEY }}
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
    - name: Deploy to test environment
      if: github.ref == 'refs/heads/develop'
      run: npx wrangler publish --env test
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📝 Testing Best Practices

### Test Structure
- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Test names should explain what they test
- **Single Responsibility**: One test should test one thing
- **Independent Tests**: Tests should not depend on each other

### Test Data
- **Use Factories**: Create test data with factory functions
- **Realistic Data**: Use data that resembles production data
- **Edge Cases**: Test boundary conditions and edge cases

### Assertions
- **Specific Assertions**: Use specific matchers for better error messages
- **Multiple Assertions**: Group related assertions in the same test
- **Error Testing**: Test both success and failure scenarios

### Maintenance
- **Keep Tests Updated**: Update tests when code changes
- **Remove Dead Tests**: Delete tests for removed functionality
- **Refactor Tests**: Keep test code clean and maintainable

---

**Good tests are an investment in code quality** 🧪

Comprehensive testing ensures your AI Proxy Worker is reliable, maintainable, and ready for production use.
