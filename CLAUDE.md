# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `wrangler login` - Authenticate with Cloudflare
- `wrangler publish` - Deploy the worker to Cloudflare Workers
- `wrangler publish --env development` - Deploy to development environment
- `wrangler publish --env production` - Deploy to production environment
- `wrangler tail` - View real-time logs from the deployed worker
- `wrangler secret put DEEPSEEK_API_KEY` - Set the DeepSeek API key
- `wrangler secret put PROXY_KEY` - Set the proxy authentication key
- `wrangler secret list` - List all configured secrets
- `wrangler deployments list` - View deployment history

### Testing
- Health check: `curl https://your-worker.workers.dev/`
- API test: `curl -X POST https://your-worker.workers.dev/chat -H "Authorization: Bearer YOUR_PROXY_KEY" -H "Content-Type: application/json" -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'`

## Architecture Overview

This is a **Cloudflare Workers-based AI proxy service** that securely proxies requests to AI APIs (currently DeepSeek) without exposing API keys to client applications.

### Core Components

**Main Entry Point**: `worker.js` - Single file containing all proxy logic
- Modular request validation system with separated concerns
- Upstream API communication with timeout handling  
- Error handling and logging
- CORS and security headers
- Streaming response support

**Configuration**: `wrangler.toml` - Cloudflare Workers configuration
- Worker name and entry point
- Compatibility date
- Environment-specific settings

**Environment Variables** (stored as Cloudflare secrets):
- `DEEPSEEK_API_KEY` (required) - DeepSeek API authentication
- `PROXY_KEY` (optional but recommended) - Client authentication

### Request Flow
1. Client sends POST request to `/chat` endpoint
2. Worker validates authentication via `PROXY_KEY`
3. Worker validates request using modular validation functions:
   - Content-Type validation (`validateContentType`)
   - Content-Length validation (`validateContentLength`)  
   - Request body validation (`validateRequestBody`)
   - Message format validation (`validateMessages`)
   - Individual message validation (`validateSingleMessage`)
   - Model validation (`validateModel`)
4. Worker forwards request to DeepSeek API with proper headers
5. Worker streams response back to client with appropriate headers

### Supported Models
- `deepseek-chat` - General conversation model (DeepSeek-V3)
- `deepseek-reasoner` - Complex reasoning model (DeepSeek-R1)

### Configuration Constants (in worker.js)
- `MAX_BODY_SIZE`: 1MB request limit
- `REQUEST_TIMEOUT`: 30 second timeout
- `VALIDATE_REQUEST_BODY`: Request validation toggle
- `SUPPORTED_MODELS`: Array of valid model names

### Security Features
- API key isolation (stored server-side only)
- Optional proxy authentication
- Request size limits
- Timeout protection
- CORS headers for web integration
- Security headers (XSS protection, content type validation)

### Error Handling
Standardized error responses with:
- Descriptive error codes
- Timestamps
- Proper HTTP status codes
- Detailed logging for debugging

### Code Quality Features
- **Low Cognitive Complexity**: Validation logic split into focused, single-responsibility functions
- **Modular Design**: Each validation concern separated for better maintainability
- **Error Isolation**: Specific error handling for different validation types
- **Extensible Architecture**: Easy to add new validation rules or modify existing ones

### Future Architecture
The codebase is designed to support multiple AI providers. The current implementation focuses on DeepSeek but includes extensible patterns for adding OpenAI, Claude, and other providers in future versions.