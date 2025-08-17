# AI Proxy Worker Wiki

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Home.en.md) | [🇨🇳 中文](./Home.md)

</div>

Welcome to the complete documentation for AI Proxy Worker! Here you'll find detailed information from installation to advanced usage.

## 📚 Documentation Navigation

### 🚀 Quick Start
- **[Installation Guide](./Installation.en)** - Detailed system installation steps
- **[Deployment Tutorial](./Deployment.en)** - Multiple deployment methods comparison
- **[Quick Setup](./Quick-Setup.en)** - 5-minute quick configuration guide

### 📖 Usage Guide
- **[API Documentation](./API-Reference.en)** - Complete API reference
- **[Configuration Guide](./Configuration.en)** - Environment variables and code configuration details
- **[Usage Examples](./Examples.en)** - Examples in various programming languages

### 🔧 Operations Guide
- **[Troubleshooting](./Troubleshooting.en)** - Common issues and solutions
- **[Monitoring Guide](./Monitoring.en)** - Logging and performance monitoring
- **[Security Configuration](./Security.en)** - Production environment security best practices

### 🏗️ Development Guide
- **[Contributing Guide](./Contributing.en)** - How to participate in project development
- **[Code Style](./Code-Style.en)** - Code style and best practices
- **[Testing Guide](./Testing.en)** - Testing writing and execution

### 🔮 Advanced Features
- **[Multi-AI Support](./Multi-AI-Support.en)** - Extending support for other AI services
- **[Custom Middleware](./Custom-Middleware.en)** - Adding custom functionality
- **[Performance Optimization](./Performance.en)** - Performance tuning guide

## 🎯 Project Overview

AI Proxy Worker is a universal AI API proxy service based on Cloudflare Workers, designed to solve the following problems:

### 🔐 Security Issues
- **Problem**: Client applications calling AI APIs directly need to expose API keys
- **Solution**: Proxy service stores keys securely on the server side, clients only need proxy access keys

### ⚡ Performance Issues
- **Problem**: Direct calls may be affected by network restrictions
- **Solution**: Based on Cloudflare's global edge network for nearby access

### 🔄 Compatibility Issues
- **Problem**: Different AI service providers have inconsistent API formats
- **Solution**: Provides unified proxy interface, future support for multiple AI service providers

## 🏗️ Architecture Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │────│  AI Proxy      │────│   AI Service    │
│   (iOS/Web)     │    │   Worker        │    │  (DeepSeek)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                        │                       │
       │ PROXY_KEY             │ DEEPSEEK_API_KEY      │
       │ (Public Safe)         │ (Server Secret)       │
       └────────────────────────┴───────────────────────┘
```

### Core Components

1. **Authentication Layer**: Handles client access control
2. **Routing Layer**: Distributes requests to different AI services
3. **Proxy Layer**: Communicates with upstream AI APIs
4. **Security Layer**: Request validation, rate limiting, logging

## 📊 Supported AI Services

### Currently Supported (v1.0)
- ✅ **DeepSeek API** - Complete support including conversation and reasoning models
  - `deepseek-chat` - General conversation model
  - `deepseek-reasoner` - Complex reasoning model

### Planned Support (Future Versions)
- 🔄 **OpenAI API** - GPT series models (planned for v2.0)
- 🔄 **Claude API** - Anthropic Claude models (planned for v2.0)
- 🔄 **Gemini API** - Google Gemini models (planned for v2.0)
- 🔄 **Unified Routing** - One interface to call all AI service providers (planned for v2.0)

> **Note**: The current version focuses on providing stable and reliable DeepSeek API proxy service. Multi-AI support is under development, stay tuned!

## 🎯 Use Cases

### Mobile Applications
- iOS/Android apps securely call AI APIs
- Avoid storing sensitive keys in clients
- Provide unified AI service interface

### Web Applications
- Frontend direct calls without backend relay
- Support streaming responses for real-time conversation experience
- Global CDN accelerated access

### Microservice Architecture
- Serve as AI service gateway
- Unified AI API access layer
- Support multi-tenancy and access control

## 🔄 Version History

### v1.0.0 (Current Version)
- ✅ Support DeepSeek API
- ✅ Complete error handling
- ✅ Streaming response support
- ✅ Security protection mechanisms

### Future Versions
- 🔮 Multi-AI service provider support
- 🔮 User-level access control
- 🔮 Request rate limiting and quotas
- 🔮 Detailed usage statistics

## 🤝 Community

### Ways to Participate
- 🐛 [Report Bugs](../../issues/new?template=bug_report.md)
- 💡 [Feature Suggestions](../../issues/new?template=feature_request.md)
- 📝 [Improve Documentation](../../issues/new?template=documentation.md)
- 🔧 [Submit Code](./Contributing.en)

### Community Resources
- [GitHub Discussions](../../discussions) - Discussion and communication
- [Example Projects](./Examples.en) - Real-world use cases
- [Best Practices](./Best-Practices.en) - Experience sharing

---

**Ready to Start?** 👉 [Installation Guide](./Installation.en)
