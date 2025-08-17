# 监控指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Monitoring.en.md) | [🇨🇳 中文](./Monitoring.md)

</div>

学习如何监控你的 AI Proxy Worker 部署，跟踪性能，并使用 Cloudflare 内置监控工具排查问题。

## 📊 Cloudflare 控制台监控

### Worker 分析
在 Cloudflare 控制台中访问实时指标：

1. **导航到 Workers & Pages**
2. **选择你的 AI Proxy Worker**
3. **查看分析标签**

### 需要监控的关键指标

#### 请求指标
- **每秒请求数** - 流量大小
- **成功率** - 成功请求的百分比
- **错误率** - 需要关注的失败请求
- **响应时间** - 平均延迟

#### 资源使用
- **CPU 使用率** - Worker 执行时间
- **内存使用** - 每个请求的内存消耗
- **持续时间** - 请求处理时间

#### 错误分析
- **4xx 错误** - 客户端问题（认证、验证）
- **5xx 错误** - 服务器端问题（上游 API 问题）
- **超时错误** - 超过时间限制的请求

## 🔍 日志分析

### 访问日志
```bash
# 查看实时日志
wrangler tail

# 按特定日志级别过滤
wrangler tail --format json | jq 'select(.level == "error")'

# 保存日志到文件
wrangler tail --format json > worker-logs.json
```

### 日志级别和含义

#### INFO 级别
```javascript
console.log('收到请求:', {
  method: request.method,
  url: request.url,
  timestamp: new Date().toISOString()
});
```

#### WARN 级别
```javascript
console.warn('接近速率限制:', {
  clientId: 'user123',
  requestCount: 95,
  limit: 100
});
```

#### ERROR 级别
```javascript
console.error('API 请求失败:', {
  error: error.message,
  statusCode: response.status,
  timestamp: new Date().toISOString()
});
```

## 📈 性能监控

### 响应时间跟踪
监控这些关键性能指标：

```javascript
// 自定义计时日志
const start = Date.now();
const response = await fetch(upstreamAPI);
const duration = Date.now() - start;

console.log('上游 API 计时:', {
  duration: duration,
  endpoint: 'deepseek-api',
  status: response.status
});
```

### 推荐的响应时间目标
- **聊天请求**: < 2 秒
- **流式响应**: 首个令牌 < 1 秒
- **健康检查**: < 500ms

### 性能优化监控
跟踪这些指标以识别优化机会：

1. **冷启动频率** - Worker 初始化时间
2. **内存使用模式** - 识别内存泄漏
3. **CPU 利用率** - 优化重计算
4. **网络延迟** - 上游 API 响应时间

## 🚨 告警配置

### Cloudflare 告警
为关键问题设置告警：

#### 错误率告警
```yaml
告警类型: Worker 错误率
阈值: > 5% 错误率
时间段: 5 分钟
通知方式: 邮件, Webhook
```

#### 响应时间告警
```yaml
告警类型: Worker 响应时间
阈值: > 3 秒平均值
时间段: 5 分钟
通知方式: 邮件, Slack
```

#### 请求量告警
```yaml
告警类型: 请求量
阈值: > 1000 请求/分钟
时间段: 1 分钟
通知方式: 邮件
```

### 自定义告警实现
```javascript
// 在你的 worker 代码中
const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.05,  // 5%
  RESPONSE_TIME: 3000,  // 3 秒
  REQUEST_RATE: 1000   // 1000/分钟
};

async function checkAlerts(metrics) {
  if (metrics.errorRate > ALERT_THRESHOLDS.ERROR_RATE) {
    await sendAlert('检测到高错误率', metrics);
  }
}
```

## 📋 健康检查

### 端点监控
创建健康检查端点：

```javascript
// 添加到你的 worker
if (url.pathname === '/health') {
  const healthStatus = await checkSystemHealth();
  return new Response(JSON.stringify(healthStatus), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function checkSystemHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    upstreamAPIs: {
      deepseek: await checkDeepSeekAPI()
    }
  };
}
```

### 外部监控服务
与外部监控工具集成：

#### Uptime Robot
```bash
# 监控端点
https://your-worker.workers.dev/health

# 每 5 分钟检查一次
# 连续 3 次失败时告警
```

#### Pingdom
```bash
# HTTP 检查配置
URL: https://your-worker.workers.dev/health
间隔: 1 分钟
超时: 30 秒
```

## 🔧 调试工具

### 调试模式
启用详细日志进行故障排除：

```javascript
const DEBUG = env.DEBUG_MODE === 'true';

if (DEBUG) {
  console.log('调试: 请求详情:', {
    headers: Object.fromEntries(request.headers),
    body: await request.clone().text(),
    timestamp: new Date().toISOString()
  });
}
```

### 请求追踪
跟踪请求在系统中的流转：

```javascript
function generateTraceId() {
  return Math.random().toString(36).substring(2, 15);
}

const traceId = generateTraceId();
console.log('请求开始:', { traceId, url: request.url });

// 在所有函数调用中传递 traceId
const result = await processRequest(request, { traceId });

console.log('请求完成:', { traceId, duration });
```

## 📊 自定义指标

### 业务指标
跟踪应用程序特定指标：

```javascript
// 跟踪模型使用情况
const modelUsage = {
  'deepseek-chat': 0,
  'deepseek-reasoner': 0
};

// 跟踪用户活动
const userMetrics = {
  activeUsers: new Set(),
  totalRequests: 0,
  streamingRequests: 0
};

// 定期记录指标
setInterval(() => {
  console.log('业务指标:', {
    modelUsage,
    userMetrics: {
      activeUsers: userMetrics.activeUsers.size,
      totalRequests: userMetrics.totalRequests,
      streamingRequests: userMetrics.streamingRequests
    }
  });
}, 60000); // 每分钟
```

### 成本跟踪
监控使用成本：

```javascript
// 跟踪请求成本
const costTracking = {
  totalRequests: 0,
  cpuTime: 0,
  bandwidthUsed: 0
};

// 计算预估成本
function calculateCosts(metrics) {
  const workerCost = metrics.totalRequests * 0.0000005; // 每百万 $0.50
  const cpuCost = metrics.cpuTime * 0.000002; // 每百万 CPU 秒 $2
  
  return {
    workerCost,
    cpuCost,
    totalCost: workerCost + cpuCost
  };
}
```

## 🔍 日志分析最佳实践

### 结构化日志
使用一致的日志格式：

```javascript
function logEvent(level, event, data) {
  const logEntry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    workerId: env.WORKER_ID || 'unknown',
    ...data
  };
  
  console[level](JSON.stringify(logEntry));
}

// 使用方法
logEvent('info', 'request_received', { method, url });
logEvent('error', 'api_error', { error: err.message, statusCode });
```

### 日志保留
了解 Cloudflare 的日志保留策略：
- **实时日志**: 开发期间可用
- **分析数据**: 保留 30 天
- **自定义日志**: 使用外部服务进行长期存储

### 外部日志聚合
发送日志到外部服务：

```javascript
async function sendToLogService(logData) {
  if (env.LOG_SERVICE_URL) {
    await fetch(env.LOG_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
  }
}
```

## 📱 监控仪表板

### 创建自定义仪表板
使用 Grafana 或 Datadog 等工具：

```javascript
// 发送指标到外部服务
async function sendMetrics(metrics) {
  if (env.METRICS_ENDPOINT) {
    await fetch(env.METRICS_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.METRICS_API_KEY}`
      },
      body: JSON.stringify({
        service: 'ai-proxy-worker',
        timestamp: Date.now(),
        metrics
      })
    });
  }
}
```

### 关键仪表板组件
1. **请求量** - 显示随时间变化的请求的折线图
2. **错误率** - 带有阈值告警的百分比仪表
3. **响应时间** - 显示延迟分布的直方图
4. **模型使用** - 显示模型使用情况的饼图
5. **地理分布** - 显示请求来源的地图

## 🚨 事故响应

### 事故检测
自动化监控应检测：
- 高错误率 (>5%)
- 慢响应时间 (>3s 平均)
- 服务不可用
- 异常流量模式

### 响应程序
1. **立即**: 检查 Cloudflare 状态页面
2. **调查**: 查看最近的部署和日志
3. **缓解**: 必要时回滚
4. **沟通**: 更新状态页面并通知用户
5. **解决**: 修复根本原因
6. **事后分析**: 记录经验教训

### 紧急联系人
维护升级列表：
- 主要: 值班工程师
- 次要: 团队负责人
- 升级: 基础设施团队

---

**有效的监控确保可靠的服务** 📊

定期监控帮助你维护高可用性并快速解决问题。
