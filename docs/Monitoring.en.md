# Monitoring Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Monitoring.en.md) | [🇨🇳 中文](./Monitoring.md)

</div>

Learn how to monitor your AI Proxy Worker deployment, track performance, and troubleshoot issues using Cloudflare's built-in monitoring tools.

## 📊 Cloudflare Dashboard Monitoring

### Worker Analytics
Access real-time metrics in your Cloudflare dashboard:

1. **Navigate to Workers & Pages**
2. **Select your AI Proxy Worker**
3. **View Analytics tab**

### Key Metrics to Monitor

#### Request Metrics
- **Requests per second** - Traffic volume
- **Success rate** - Percentage of successful requests
- **Error rate** - Failed requests requiring attention
- **Response time** - Average latency

#### Resource Usage
- **CPU usage** - Worker execution time
- **Memory usage** - Memory consumption per request
- **Duration** - Request processing time

#### Error Analysis
- **4xx errors** - Client-side issues (authentication, validation)
- **5xx errors** - Server-side problems (upstream API issues)
- **Timeout errors** - Requests exceeding time limits

## 🔍 Log Analysis

### Accessing Logs
```bash
# View real-time logs
wrangler tail

# Filter by specific log level
wrangler tail --format json | jq 'select(.level == "error")'

# Save logs to file
wrangler tail --format json > worker-logs.json
```

### Log Levels and Meanings

#### INFO Level
```javascript
console.log('Request received:', {
  method: request.method,
  url: request.url,
  timestamp: new Date().toISOString()
});
```

#### WARN Level
```javascript
console.warn('Rate limit approaching:', {
  clientId: 'user123',
  requestCount: 95,
  limit: 100
});
```

#### ERROR Level
```javascript
console.error('API request failed:', {
  error: error.message,
  statusCode: response.status,
  timestamp: new Date().toISOString()
});
```

## 📈 Performance Monitoring

### Response Time Tracking
Monitor these key performance indicators:

```javascript
// Custom timing logs
const start = Date.now();
const response = await fetch(upstreamAPI);
const duration = Date.now() - start;

console.log('Upstream API timing:', {
  duration: duration,
  endpoint: 'deepseek-api',
  status: response.status
});
```

### Recommended Response Time Targets
- **Chat requests**: < 2 seconds
- **Streaming responses**: First token < 1 second
- **Health checks**: < 500ms

### Performance Optimization Monitoring
Track these metrics to identify optimization opportunities:

1. **Cold start frequency** - Worker initialization time
2. **Memory usage patterns** - Identify memory leaks
3. **CPU utilization** - Optimize heavy computations
4. **Network latency** - Upstream API response times

## 🚨 Alert Configuration

### Cloudflare Alerts
Set up alerts for critical issues:

#### Error Rate Alert
```yaml
Alert Type: Worker Error Rate
Threshold: > 5% error rate
Time Period: 5 minutes
Notification: Email, Webhook
```

#### Response Time Alert
```yaml
Alert Type: Worker Response Time
Threshold: > 3 seconds average
Time Period: 5 minutes
Notification: Email, Slack
```

#### Request Volume Alert
```yaml
Alert Type: Request Volume
Threshold: > 1000 requests/minute
Time Period: 1 minute
Notification: Email
```

### Custom Alert Implementation
```javascript
// In your worker code
const ALERT_THRESHOLDS = {
  ERROR_RATE: 0.05,  // 5%
  RESPONSE_TIME: 3000,  // 3 seconds
  REQUEST_RATE: 1000   // 1000/minute
};

async function checkAlerts(metrics) {
  if (metrics.errorRate > ALERT_THRESHOLDS.ERROR_RATE) {
    await sendAlert('High error rate detected', metrics);
  }
}
```

## 📋 Health Checks

### Endpoint Monitoring
Create a health check endpoint:

```javascript
// Add to your worker
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

### External Monitoring Services
Integrate with external monitoring tools:

#### Uptime Robot
```bash
# Monitor endpoint
https://your-worker.workers.dev/health

# Check every 5 minutes
# Alert on 3 consecutive failures
```

#### Pingdom
```bash
# HTTP check configuration
URL: https://your-worker.workers.dev/health
Interval: 1 minute
Timeout: 30 seconds
```

## 🔧 Debugging Tools

### Debug Mode
Enable detailed logging for troubleshooting:

```javascript
const DEBUG = env.DEBUG_MODE === 'true';

if (DEBUG) {
  console.log('Debug: Request details:', {
    headers: Object.fromEntries(request.headers),
    body: await request.clone().text(),
    timestamp: new Date().toISOString()
  });
}
```

### Request Tracing
Track requests through the system:

```javascript
function generateTraceId() {
  return Math.random().toString(36).substring(2, 15);
}

const traceId = generateTraceId();
console.log('Request started:', { traceId, url: request.url });

// Pass traceId through all function calls
const result = await processRequest(request, { traceId });

console.log('Request completed:', { traceId, duration });
```

## 📊 Custom Metrics

### Business Metrics
Track application-specific metrics:

```javascript
// Track model usage
const modelUsage = {
  'deepseek-chat': 0,
  'deepseek-reasoner': 0
};

// Track user activity
const userMetrics = {
  activeUsers: new Set(),
  totalRequests: 0,
  streamingRequests: 0
};

// Log metrics periodically
setInterval(() => {
  console.log('Business metrics:', {
    modelUsage,
    userMetrics: {
      activeUsers: userMetrics.activeUsers.size,
      totalRequests: userMetrics.totalRequests,
      streamingRequests: userMetrics.streamingRequests
    }
  });
}, 60000); // Every minute
```

### Cost Tracking
Monitor usage costs:

```javascript
// Track request costs
const costTracking = {
  totalRequests: 0,
  cpuTime: 0,
  bandwidthUsed: 0
};

// Calculate estimated costs
function calculateCosts(metrics) {
  const workerCost = metrics.totalRequests * 0.0000005; // $0.50 per million
  const cpuCost = metrics.cpuTime * 0.000002; // $2 per million CPU seconds
  
  return {
    workerCost,
    cpuCost,
    totalCost: workerCost + cpuCost
  };
}
```

## 🔍 Log Analysis Best Practices

### Structured Logging
Use consistent log formats:

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

// Usage
logEvent('info', 'request_received', { method, url });
logEvent('error', 'api_error', { error: err.message, statusCode });
```

### Log Retention
Understand Cloudflare's log retention:
- **Real-time logs**: Available during development
- **Analytics data**: Retained for 30 days
- **Custom logging**: Use external services for long-term storage

### External Log Aggregation
Send logs to external services:

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

## 📱 Monitoring Dashboard

### Creating Custom Dashboards
Use tools like Grafana or Datadog:

```javascript
// Send metrics to external service
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

### Key Dashboard Widgets
1. **Request Volume** - Line chart showing requests over time
2. **Error Rate** - Percentage gauge with threshold alerts
3. **Response Time** - Histogram showing latency distribution
4. **Model Usage** - Pie chart showing model usage breakdown
5. **Geographic Distribution** - Map showing request origins

## 🚨 Incident Response

### Incident Detection
Automated monitoring should detect:
- High error rates (>5%)
- Slow response times (>3s average)
- Service unavailability
- Unusual traffic patterns

### Response Procedures
1. **Immediate**: Check Cloudflare status page
2. **Investigate**: Review recent deployments and logs
3. **Mitigate**: Roll back if necessary
4. **Communicate**: Update status page and notify users
5. **Resolve**: Fix root cause
6. **Post-mortem**: Document lessons learned

### Emergency Contacts
Maintain an escalation list:
- Primary: On-call engineer
- Secondary: Team lead
- Escalation: Infrastructure team

---

**Effective monitoring ensures reliable service** 📊

Regular monitoring helps you maintain high availability and quickly resolve issues.
