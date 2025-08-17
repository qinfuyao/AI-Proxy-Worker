# AI Proxy Worker

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./README.en.md) | [🇨🇳 中文](./README.md)

</div>

**Enterprise-grade AI API Security Proxy** - Enable your frontend applications to securely access AI services without exposing API keys, powered by Cloudflare's global edge network for millisecond response times.

> 🚀 A universal AI API proxy service based on Cloudflare Workers that allows your applications to securely call various AI APIs

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qinfuyao/AI-Proxy-Worker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ Why Choose AI Proxy Worker?

- 🔐 **Security First**: API keys stored server-side only, never accessible to clients
- ⚡ **Lightning Fast**: Built on Cloudflare's global edge network with millisecond response times
- 🤖 **Multi-Model Support**: Currently supports DeepSeek API, architecture designed to support future expansion to more AI service providers
- 🌊 **Streaming Support**: Full SSE streaming response support for real-time conversation experience
- 🛡️ **Production Ready**: Comprehensive error handling, security protection, and monitoring logs
- 💰 **Zero Cost Start**: Cloudflare Workers free tier is sufficient for personal use

## 🚀 5-Minute Quick Start

### 1. One-Click Deploy
```bash
# Install Wrangler CLI
npm install -g wrangler

# Clone project
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# Login and deploy
wrangler login
wrangler secret put DEEPSEEK_API_KEY  # Enter your DeepSeek API key
wrangler secret put PROXY_KEY         # Set access key (optional but recommended)
wrangler publish
```

### 2. Test Immediately
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 🎯 Supported AI Models

| Model | Use Case | Features |
|-------|----------|----------|
| `deepseek-chat` | General conversation | DeepSeek-V3, 671B parameters, perfect for daily conversations |
| `deepseek-reasoner` | Complex reasoning | DeepSeek-R1, expert in logical reasoning and math problems |

### 🔮 Roadmap

**Current Version (v1.0)**:
- ✅ Complete DeepSeek API support
- ✅ Dual model support (conversation + reasoning)
- ✅ Streaming response and comprehensive error handling

**Planned Features**:
- 🔄 OpenAI API support
- 🔄 Claude API support  
- 🔄 Gemini API support
- 🔄 Unified multi-AI routing
- 🔄 User-level access control
- 🔄 Request rate limiting and quota management

## ⚙️ Configuration

Only two environment variables needed to get started:
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `PROXY_KEY` - Custom access key (recommended)

> 📖 **Complete Configuration Guide**: [Detailed Configuration](./docs/Configuration.en.md)

## 📱 Client Integration Examples

### iOS (Swift)
```swift
let response = try await URLSession.shared.data(for: URLRequest(
    url: URL(string: "https://your-worker.workers.dev/chat")!,
    headers: ["Authorization": "Bearer YOUR_PROXY_KEY"],
    body: ["model": "deepseek-chat", "messages": [...]]
))
```

### JavaScript
```javascript
const response = await fetch('https://your-worker.workers.dev/chat', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_PROXY_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello!' }]
    })
});
```

## 📖 Complete Documentation

### 📚 Detailed Guides
- **[Installation Guide](./docs/Installation.en.md)** - Windows/macOS detailed installation steps
- **[Deployment Tutorial](./docs/Deployment.en.md)** - Local CLI vs Web deployment comparison
- **[API Documentation](./docs/API-Reference.en.md)** - Complete API reference and examples
- **[Configuration Guide](./docs/Configuration.en.md)** - Advanced configuration and optimization options

### 🔧 Operations Support  
- **[Troubleshooting](./docs/Troubleshooting.en.md)** - Common issues and solutions
- **[Monitoring Guide](./docs/Monitoring.en.md)** - Log viewing and performance monitoring
- **[Security Best Practices](./docs/Security.en.md)** - Production environment security configuration

### 💡 Use Cases
- **[Usage Examples](./docs/Examples.en.md)** - Integration examples in various programming languages
- **[Best Practices](./docs/Best-Practices.en.md)** - Performance optimization and usage recommendations

## 🌟 Project Highlights

```javascript
// 🔐 Security: Server-side key storage
env.DEEPSEEK_API_KEY // Only stored in Cloudflare

// ⚡ Performance: Global edge computing
Cloudflare Workers // 180+ data centers

// 🛡️ Reliability: Comprehensive error handling
{
  "error": "timeout",
  "message": "Request timeout after 30s",
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// 🌊 Streaming: Real-time response
Accept: text/event-stream
```

## 🤝 Community & Support

### 💬 Get Help
- [📋 Issues](../../issues) - Report bugs or suggest features
- [💡 Discussions](../../discussions) - Community discussion and experience sharing

### 🔧 Contribute
- [🤝 Contributing Guide](./docs/Contributing.en.md) - How to participate in project development
- [📝 Code Standards](./docs/Code-Style.en.md) - Code style and best practices
- [🧪 Testing Guide](./docs/Testing.en.md) - How to write and run tests

### 📊 Project Status
- ✅ **Stable Version**: v1.0.0
- 🔄 **Active Maintenance**: Regular updates and bug fixes
- 🌍 **Production Use**: Stable operation in multiple projects

## 🏆 Use Cases

> "AI Proxy Worker allows our iOS app to securely integrate AI features without worrying about API key exposure. Simple deployment and excellent performance!" 
> 
> — iOS Developer

> "Switching from DeepSeek to other AI service providers only requires a few lines of code changes. This flexibility is amazing."
> 
> — Full-stack Engineer

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

**🌟 If this project helps you, please give it a Star!**

[⭐ Star](../../stargazers) • [🍴 Fork](../../fork) • [📢 Share](https://twitter.com/intent/tweet?text=AI%20Proxy%20Worker%20-%20Universal%20AI%20API%20proxy%20service%20based%20on%20Cloudflare%20Workers&url=https://github.com/qinfuyao/AI-Proxy-Worker)

</div>