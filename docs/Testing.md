# 测试指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Testing.en.md) | [🇨🇳 中文](./Testing.md)

</div>

AI Proxy Worker 的全面测试指南。本文档涵盖测试策略、工具和最佳实践，以确保代码质量和可靠性。

## 📋 测试概述

### 测试理念
- **早测试，常测试**：在开发功能时编写测试
- **质量胜过数量**：专注于有意义的测试而非覆盖率数字
- **真实场景**：测试实际用例和边界条件
- **可维护的测试**：编写易于理解和维护的测试

### 测试金字塔
```
    /\
   /  \    单元测试 (70%)
  /____\   - 快速、隔离、专注
 /      \  
/________\  集成测试 (20%)
           - API 端点、数据流
           
           端到端测试 (10%)
           - 完整用户场景
```

## 🧪 测试设置

### 前置要求
- Node.js 18+ 和 npm
- Cloudflare Workers 的 Wrangler CLI
- 测试框架（推荐 Jest）

### 安装
```bash
# 安装测试依赖
npm install --save-dev jest @types/jest
npm install --save-dev @cloudflare/workers-types

# 用于 API 测试
npm install --save-dev supertest
npm install --save-dev node-fetch

# 用于模拟
npm install --save-dev jest-environment-miniflare
```

### 配置
创建 `jest.config.js`：

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

## 🔧 单元测试

### 测试 Worker 函数
独立测试单个函数：

```javascript
// tests/validation.test.js
import { validateChatRequest } from '../worker.js'

describe('validateChatRequest', () => {
  it('应该验证正确的聊天请求', () => {
    const validRequest = {
      messages: [
        { role: 'user', content: '你好，AI！' }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(validRequest)
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('应该拒绝没有消息的请求', () => {
    const invalidRequest = {
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages 必须是数组')
  })

  it('应该拒绝无效的消息格式', () => {
    const invalidRequest = {
      messages: [
        { role: 'invalid', content: '你好' }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages[0].role 必须是 user、assistant 或 system')
  })

  it('应该拒绝过长的消息', () => {
    const longContent = 'a'.repeat(100001)
    const invalidRequest = {
      messages: [
        { role: 'user', content: longContent }
      ],
      model: 'deepseek-chat'
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('messages[0].content 超过最大长度')
  })

  it('应该验证可选参数', () => {
    const requestWithParams = {
      messages: [{ role: 'user', content: '你好' }],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 1000
    }

    const result = validateChatRequest(requestWithParams)
    
    expect(result.valid).toBe(true)
  })

  it('应该拒绝无效的温度值', () => {
    const invalidRequest = {
      messages: [{ role: 'user', content: '你好' }],
      model: 'deepseek-chat',
      temperature: 3.0 // 无效：> 2.0
    }

    const result = validateChatRequest(invalidRequest)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('temperature 必须是 0 到 2 之间的数字')
  })
})
```

### 测试错误处理
彻底测试错误场景：

```javascript
// tests/error-handling.test.js
import { createErrorResponse, ApiError } from '../worker.js'

describe('错误处理', () => {
  describe('createErrorResponse', () => {
    it('应该创建标准错误响应', () => {
      const error = new Error('测试错误')
      const response = createErrorResponse(error, 400)
      
      expect(response.status).toBe(400)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('应该在调试模式下包含错误详情', () => {
      const error = new Error('测试错误')
      const env = { DEBUG_MODE: 'true' }
      const details = { operation: 'test' }
      
      const response = createErrorResponse(error, 400, details, env)
      const body = JSON.parse(response.body)
      
      expect(body.details).toEqual(details)
    })

    it('在生产环境中不应包含详情', () => {
      const error = new Error('测试错误')
      const env = { DEBUG_MODE: 'false' }
      const details = { operation: 'test' }
      
      const response = createErrorResponse(error, 400, details, env)
      const body = JSON.parse(response.body)
      
      expect(body.details).toBeUndefined()
    })
  })

  describe('ApiError', () => {
    it('应该创建带状态码的 API 错误', () => {
      const apiError = new ApiError('上游 API 失败', 502)
      
      expect(apiError.message).toBe('上游 API 失败')
      expect(apiError.statusCode).toBe(502)
      expect(apiError.name).toBe('ApiError')
    })
  })
})
```

### 测试工具函数
测试辅助函数：

```javascript
// tests/utils.test.js
import { sanitizeForLogging, getClientIP } from '../worker.js'

describe('工具函数', () => {
  describe('sanitizeForLogging', () => {
    it('应该移除敏感字段', () => {
      const data = {
        messages: [{ role: 'user', content: '你好' }],
        api_key: 'sk-secret',
        authorization: 'Bearer token'
      }

      const sanitized = sanitizeForLogging(data)
      
      expect(sanitized.api_key).toBeUndefined()
      expect(sanitized.authorization).toBeUndefined()
      expect(sanitized.messages).toBeDefined()
    })

    it('应该截断长内容', () => {
      const longContent = 'a'.repeat(200)
      const data = {
        messages: [{ role: 'user', content: longContent }]
      }

      const sanitized = sanitizeForLogging(data)
      
      expect(sanitized.messages[0].content).toHaveLength(103) // 100 + "..."
      expect(sanitized.messages[0].content).toContain('...[已截断]')
    })
  })

  describe('getClientIP', () => {
    it('应该从 CF-Connecting-IP 头提取 IP', () => {
      const request = new Request('https://example.com', {
        headers: { 'CF-Connecting-IP': '192.168.1.1' }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('应该回退到 X-Forwarded-For', () => {
      const request = new Request('https://example.com', {
        headers: { 'X-Forwarded-For': '192.168.1.2' }
      })

      const ip = getClientIP(request)
      expect(ip).toBe('192.168.1.2')
    })

    it('缺少头时应该返回 unknown', () => {
      const request = new Request('https://example.com')

      const ip = getClientIP(request)
      expect(ip).toBe('unknown')
    })
  })
})
```

## 🌐 集成测试

### 测试 HTTP 端点
测试完整的请求/响应周期：

```javascript
// tests/integration/chat.test.js
import { unstable_dev } from 'wrangler'

describe('聊天端点集成', () => {
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

  it('应该处理有效的聊天请求', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-proxy-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: '你好，AI！' }
        ]
      })
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.choices).toBeDefined()
    expect(data.choices[0].message).toBeDefined()
  })

  it('应该拒绝没有授权的请求', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: '你好' }]
      })
    })

    expect(response.status).toBe(401)
  })

  it('应该处理格式错误的 JSON', async () => {
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

  it('应该处理流式请求', async () => {
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-proxy-key',
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: '你好' }],
        stream: true
      })
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/event-stream')
  })
})
```

### 测试速率限制
测试速率限制功能：

```javascript
// tests/integration/rate-limiting.test.js
describe('速率限制', () => {
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

  it('应该允许限制内的请求', async () => {
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
          messages: [{ role: 'user', content: '你好' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
  })

  it('应该阻止超过限制的请求', async () => {
    // 发送到达限制的请求
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
          messages: [{ role: 'user', content: '你好' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    
    // 前 5 个应该成功
    responses.slice(0, 5).forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // 第 6 个应该被速率限制
    expect(responses[5].status).toBe(429)
  })
})
```

## 🎭 模拟外部 API

### 模拟 DeepSeek API 响应
为外部 API 调用创建模拟：

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
      content: '你好！今天我能为你做些什么？'
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
  'data: {"choices":[{"delta":{"content":"你好"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":"！今天"}}]}\n\n',
  'data: {"choices":[{"delta":{"content":"我能为你做些什么？"}}]}\n\n',
  'data: [DONE]\n\n'
]

// 用于测试的模拟 fetch
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
  
  return Promise.reject(new Error('未模拟的 URL'))
}
```

### 在测试中使用模拟
```javascript
// tests/integration/api-mocking.test.js
import { mockFetch, mockDeepSeekResponse } from '../mocks/deepseek-api.js'

describe('使用模拟的 API 集成', () => {
  beforeEach(() => {
    global.fetch = jest.fn(mockFetch)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('应该处理成功的 API 响应', async () => {
    const worker = await unstable_dev('worker.js')
    
    const response = await worker.fetch('https://worker.dev/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: '你好' }]
      })
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.choices[0].message.content).toBe(mockDeepSeekResponse.choices[0].message.content)
    
    await worker.stop()
  })
})
```

## 🔍 性能测试

### 负载测试
在负载下测试性能：

```javascript
// tests/performance/load.test.js
describe('性能测试', () => {
  it('应该处理并发请求', async () => {
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
          messages: [{ role: 'user', content: '性能测试' }]
        })
      })
    )

    const responses = await Promise.all(requests)
    const endTime = Date.now()
    
    // 所有请求都应该成功
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    // 应该在合理时间内完成
    const duration = endTime - startTime
    expect(duration).toBeLessThan(10000) // 10 秒
    
    console.log(`${concurrentRequests} 个并发请求在 ${duration}ms 内完成`)
    
    await worker.stop()
  })
})
```

## 📊 测试覆盖率

### 覆盖率配置
确保良好的测试覆盖率：

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

### 运行覆盖率
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看 HTML 覆盖率报告
open coverage/lcov-report/index.html
```

## 🚀 持续集成

### GitHub Actions 工作流
创建 `.github/workflows/test.yml`：

```yaml
name: 测试

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
    
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: 安装依赖
      run: npm ci
    
    - name: 运行代码检查
      run: npm run lint
    
    - name: 运行测试
      run: npm run test:coverage
      env:
        DEEPSEEK_API_KEY: ${{ secrets.TEST_DEEPSEEK_API_KEY }}
        PROXY_KEY: ${{ secrets.TEST_PROXY_KEY }}
    
    - name: 上传覆盖率到 Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
    - name: 部署到测试环境
      if: github.ref == 'refs/heads/develop'
      run: npx wrangler publish --env test
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📝 测试最佳实践

### 测试结构
- **AAA 模式**：安排、行动、断言
- **描述性名称**：测试名称应解释它们测试的内容
- **单一职责**：一个测试应该测试一件事
- **独立测试**：测试之间不应该相互依赖

### 测试数据
- **使用工厂**：使用工厂函数创建测试数据
- **真实数据**：使用类似生产数据的数据
- **边界情况**：测试边界条件和边界情况

### 断言
- **具体断言**：使用具体的匹配器获得更好的错误消息
- **多个断言**：在同一个测试中分组相关断言
- **错误测试**：测试成功和失败场景

### 维护
- **保持测试更新**：代码更改时更新测试
- **删除死测试**：删除已删除功能的测试
- **重构测试**：保持测试代码干净和可维护

---

**好的测试是代码质量的投资** 🧪

全面的测试确保你的 AI Proxy Worker 可靠、可维护，并为生产使用做好准备。
