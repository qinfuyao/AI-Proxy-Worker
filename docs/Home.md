# AI Proxy Worker Wiki

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Home.en.md) | [🇨🇳 中文](./Home.md)

</div>

欢迎来到 AI Proxy Worker 的完整文档！这里包含了从安装到高级使用的所有详细信息。

## 📚 文档导航

### 🚀 快速开始
- **[安装指南](./Installation)** - 详细的系统安装步骤
- **[部署教程](./Deployment)** - 多种部署方式对比
- **[快速配置](./Quick-Setup)** - 5分钟快速配置指南

### 📖 使用指南
- **[API 文档](./API-Reference)** - 完整的 API 参考
- **[配置指南](./Configuration)** - 环境变量和代码配置详解
- **[使用示例](./Examples)** - 各种编程语言示例

### 🔧 运维指南
- **[故障排除](./Troubleshooting)** - 常见问题解决方案
- **[监控指南](./Monitoring)** - 日志和性能监控
- **[安全配置](./Security)** - 生产环境安全最佳实践

### 🏗️ 开发指南
- **[贡献指南](./Contributing)** - 如何参与项目开发
- **[代码规范](./Code-Style)** - 代码风格和最佳实践
- **[测试指南](./Testing)** - 测试编写和执行

### 🔮 高级功能
- **[多 AI 支持](./Multi-AI-Support)** - 扩展支持其他 AI 服务
- **[自定义中间件](./Custom-Middleware)** - 添加自定义功能
- **[性能优化](./Performance)** - 性能调优指南

## 🎯 项目概览

AI Proxy Worker 是一个基于 Cloudflare Workers 的通用 AI API 代理服务，旨在解决以下问题：

### 🔐 安全性问题
- **问题**：客户端应用直接调用 AI API 需要暴露 API 密钥
- **解决**：代理服务将密钥安全存储在服务端，客户端只需要代理访问密钥

### ⚡ 性能问题
- **问题**：直接调用可能受网络限制影响速度
- **解决**：基于 Cloudflare 全球边缘网络，就近访问

### 🔄 兼容性问题
- **问题**：不同 AI 服务商 API 格式不统一
- **解决**：提供统一的代理接口，未来支持多个 AI 服务商

## 🏗️ 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   客户端应用    │────│  AI Proxy      │────│   AI 服务商     │
│   (iOS/Web)     │    │   Worker        │    │  (DeepSeek)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                        │                       │
       │ PROXY_KEY             │ DEEPSEEK_API_KEY      │
       │ (公开安全)            │ (服务端机密)          │
       └────────────────────────┴───────────────────────┘
```

### 核心组件

1. **认证层**：处理客户端访问控制
2. **路由层**：分发请求到不同的 AI 服务
3. **代理层**：与上游 AI API 通信
4. **安全层**：请求验证、限流、日志记录

## 📊 支持的 AI 服务

### 当前支持 (v1.0)
- ✅ **DeepSeek API** - 完整支持，包含对话和推理模型
  - `deepseek-chat` - 通用对话模型
  - `deepseek-reasoner` - 复杂推理模型

### 计划支持 (未来版本)
- 🔄 **OpenAI API** - GPT 系列模型 (v2.0 计划)
- 🔄 **Claude API** - Anthropic Claude 模型 (v2.0 计划)
- 🔄 **Gemini API** - Google Gemini 模型 (v2.0 计划)
- 🔄 **统一路由** - 一套接口调用所有 AI 服务商 (v2.0 计划)

> **注意**: 当前版本专注于提供稳定可靠的 DeepSeek API 代理服务。多 AI 支持正在开发中，敬请期待！

## 🎯 使用场景

### 移动应用
- iOS/Android 应用安全调用 AI API
- 避免在客户端存储敏感密钥
- 提供统一的 AI 服务接口

### Web 应用
- 前端直接调用，无需后端中转
- 支持流式响应，实时对话体验
- 全球 CDN 加速访问

### 微服务架构
- 作为 AI 服务网关
- 统一的 AI API 访问层
- 支持多租户和访问控制

## 🔄 版本历史

### v1.0.0 (当前版本)
- ✅ 支持 DeepSeek API
- ✅ 完整的错误处理
- ✅ 流式响应支持
- ✅ 安全防护机制

### 未来版本
- 🔮 多 AI 服务商支持
- 🔮 用户级访问控制
- 🔮 请求限流和配额
- 🔮 详细的使用统计

## 🤝 社区

### 参与方式
- 🐛 [报告 Bug](../../issues/new?template=bug_report.md)
- 💡 [功能建议](../../issues/new?template=feature_request.md)
- 📝 [改进文档](../../issues/new?template=documentation.md)
- 🔧 [提交代码](./Contributing)

### 社区资源
- [GitHub Discussions](../../discussions) - 讨论和交流
- [示例项目](./Examples) - 实际使用案例
- [最佳实践](./Best-Practices) - 经验分享

---

**开始使用？** 👉 [安装指南](./Installation)
