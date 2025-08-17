// 配置常量
const CONFIG = {
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  MAX_BODY_SIZE: 1024 * 1024, // 1MB
  REQUEST_TIMEOUT: 30000, // 30秒
  VALIDATE_REQUEST_BODY: false, // 是否验证请求体格式（设为 true 启用严格验证）
  DEFAULT_MODEL: 'deepseek-chat', // 默认模型
  SUPPORTED_MODELS: [
    'deepseek-chat',      // 通用对话模型 (DeepSeek-V3)
    'deepseek-reasoner'   // 推理模型 (DeepSeek-R1)
  ]
};

// CORS 响应头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 安全响应头
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// 辅助函数：验证认证
function validateAuth(request, env) {
  const expectedAuth = env.PROXY_KEY ? `Bearer ${env.PROXY_KEY}` : null;
  const gotAuth = request.headers.get('authorization') || '';
  return !expectedAuth || gotAuth === expectedAuth;
}

// 辅助函数：创建错误响应
function createErrorResponse(error, status = 500, details = null) {
  const errorBody = {
    error,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
  
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    }
  });
}

// 辅助函数：创建成功响应
function createResponse(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      ...headers,
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    }
  });
}

// 辅助函数：验证Content-Type
function validateContentType(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Invalid content type. Expected application/json');
  }
}

// 辅助函数：验证请求体大小
function validateContentLength(request) {
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > CONFIG.MAX_BODY_SIZE) {
    throw new Error(`Request body too large. Maximum size: ${CONFIG.MAX_BODY_SIZE} bytes`);
  }
}

// 辅助函数：验证单个消息格式
function validateSingleMessage(message) {
  if (!message.role || !message.content) {
    throw new Error('Invalid request format. Each message must have role and content');
  }
  if (!['system', 'user', 'assistant', 'tool'].includes(message.role)) {
    throw new Error('Invalid request format. Invalid message role');
  }
}

// 辅助函数：验证消息数组
function validateMessages(messages) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid request format. Missing or invalid messages array');
  }
  
  if (messages.length === 0) {
    throw new Error('Invalid request format. Messages array cannot be empty');
  }
  
  for (const message of messages) {
    validateSingleMessage(message);
  }
}

// 辅助函数：验证模型（警告但不阻止）
function validateModel(model) {
  if (model && !CONFIG.SUPPORTED_MODELS.includes(model)) {
    console.warn(`Unsupported model: ${model}, supported models: ${CONFIG.SUPPORTED_MODELS.join(', ')}`);
    // 注意：这里只是警告，不阻止请求，让 DeepSeek API 自己处理
  }
}

// 辅助函数：验证请求体内容
async function validateRequestBody(request) {
  try {
    const body = await request.clone().json();
    validateMessages(body.messages);
    validateModel(body.model);
  } catch (e) {
    if (e.message.includes('Invalid request format')) {
      throw e;
    }
    throw new Error('Invalid JSON format');
  }
}

// 辅助函数：验证请求
async function validateRequest(request) {
  validateContentType(request);
  validateContentLength(request);
  
  if (CONFIG.VALIDATE_REQUEST_BODY) {
    await validateRequestBody(request);
  }
}

// 辅助函数：发送上游请求
async function sendUpstreamRequest(request, env) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, CONFIG.REQUEST_TIMEOUT);

  try {
    const accept = request.headers.get('accept') || 'application/json';
    const contentType = request.headers.get('content-type') || 'application/json';

    // 处理请求体，确保有默认模型
    let requestBody;
    try {
      const bodyText = await request.text();
      const body = JSON.parse(bodyText);
      
      // 如果没有指定模型，使用默认模型
      if (!body.model) {
        body.model = CONFIG.DEFAULT_MODEL;
        console.log(`No model specified, using default: ${CONFIG.DEFAULT_MODEL}`);
      }
      
      requestBody = JSON.stringify(body);
    } catch (err) {
      // 如果解析失败，使用原始请求体（让上游API处理错误）
      console.warn('Failed to parse request body for model injection:', err.message);
      requestBody = await request.text();
    }

    const upstream = await fetch(CONFIG.DEEPSEEK_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': contentType,
        'Accept': accept,
        'User-Agent': 'AI-Proxy-Worker/1.0',
      },
      body: requestBody,
    });

    clearTimeout(timeoutId);

    // 记录请求日志
    console.log('DeepSeek API request:', {
      status: upstream.status,
      statusText: upstream.statusText,
      timestamp: new Date().toISOString(),
    });

    return upstream;
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw err;
  }
}

// 辅助函数：处理简单路由
function handleSimpleRoutes(request, url) {
  // 处理 OPTIONS 请求（CORS 预检）
  if (request.method === 'OPTIONS') {
    return createResponse(null, 200, CORS_HEADERS);
  }

  // 健康检查
  if (request.method === 'GET' && url.pathname === '/') {
    return createResponse(JSON.stringify({
      status: 'ok',
      service: 'AI Proxy Worker',
      timestamp: new Date().toISOString()
    }), 200, { 'Content-Type': 'application/json' });
  }

  return null;
}

// 辅助函数：处理错误响应
function handleError(err, request, url, startTime) {
  const duration = Date.now() - startTime;
  
  console.error('Request failed:', {
    error: err.message,
    duration: `${duration}ms`,
    method: request.method,
    pathname: url.pathname,
    timestamp: new Date().toISOString(),
  });

  // 根据错误类型返回不同的状态码
  if (err.message.includes('Invalid content type')) {
    return createErrorResponse('invalid_content_type', 400, err.message);
  }
  if (err.message.includes('Request body too large')) {
    return createErrorResponse('payload_too_large', 413, err.message);
  }
  if (err.message.includes('Invalid request format') || err.message.includes('Invalid JSON')) {
    return createErrorResponse('invalid_request', 400, err.message);
  }
  if (err.message.includes('Request timeout')) {
    return createErrorResponse('timeout', 504, 'Request to DeepSeek API timed out');
  }

  // 通用错误
  return createErrorResponse('internal_error', 500, 'An unexpected error occurred');
}

export default {
  /**
   * Cloudflare Workers entry point
   * AI Proxy Worker - Universal AI API proxy with enhanced error handling and security
   * 
   * Current Version (v1.0): DeepSeek API support
   * - deepseek-chat: General conversation model
   * - deepseek-reasoner: Complex reasoning model
   * 
   * Future Versions: Multi-AI support planned (OpenAI, Claude, Gemini)
   */
  async fetch(request, env) {
    const url = new URL(request.url);
    const startTime = Date.now();

    try {
      // 处理简单路由
      const simpleResponse = handleSimpleRoutes(request, url);
      if (simpleResponse) return simpleResponse;

      // 只允许 POST /chat
      if (request.method !== 'POST' || url.pathname !== '/chat') {
        return createErrorResponse('not_found', 404, 'Endpoint not found');
      }

      // 验证认证
      if (!validateAuth(request, env)) {
        return createErrorResponse('unauthorized', 401, 'Invalid or missing authorization');
      }

      // 检查必需的环境变量
      if (!env.DEEPSEEK_API_KEY) {
        console.error('Missing DEEPSEEK_API_KEY environment variable');
        return createErrorResponse('configuration_error', 500, 'Service configuration error');
      }

      // 验证请求
      await validateRequest(request);

      // 发送上游请求
      const upstream = await sendUpstreamRequest(request, env);

      // 处理上游错误
      if (!upstream.ok) {
        const errorText = await upstream.text();
        console.error('DeepSeek API error:', {
          status: upstream.status,
          statusText: upstream.statusText,
          body: errorText,
          timestamp: new Date().toISOString(),
        });

        return createErrorResponse('api_error', upstream.status, {
          upstream_status: upstream.status,
          upstream_message: upstream.statusText
        });
      }

      // 返回成功响应
      const responseHeaders = {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store, no-transform',
      };

      const duration = Date.now() - startTime;
      console.log(`Request completed successfully in ${duration}ms`);

      return createResponse(upstream.body, upstream.status, responseHeaders);

    } catch (err) {
      return handleError(err, request, url, startTime);
    }
  },
};
