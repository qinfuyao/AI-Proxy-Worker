# AI Proxy Worker

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./README.en.md) | [🇨🇳 中文](./README.md)

</div>

**企业级 AI API 安全代理服务** - 让你的前端应用无需暴露 API 密钥即可安全调用 AI 服务，基于 Cloudflare 全球边缘网络提供毫秒级响应。

> 🚀 基于 Cloudflare Workers 的通用 AI API 代理服务，让你的应用安全调用各种 AI API

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qinfuyao/AI-Proxy-Worker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## ✨ 为什么选择 AI Proxy Worker？

- 🔐 **安全第一**：API 密钥只存储在服务端，客户端永远无法获取
- ⚡ **极速响应**：基于 Cloudflare 全球边缘网络，毫秒级响应
- 🤖 **多模型支持**：当前支持 DeepSeek API，架构设计支持未来扩展更多 AI 服务商
- 🌊 **流式传输**：完整支持 SSE 流式响应，实时对话体验
- 🛡️ **生产就绪**：完善的错误处理、安全防护和监控日志
- 💰 **零成本起步**：Cloudflare Workers 免费额度足够个人使用

## 🚀 5分钟快速开始

### 1. 一键部署
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 克隆项目
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# 登录并部署
wrangler login
wrangler secret put DEEPSEEK_API_KEY  # 输入你的 DeepSeek API 密钥
wrangler secret put PROXY_KEY         # 设置访问密钥（可选但推荐）
wrangler publish
```

### 2. 立即测试
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

## 🎯 支持的 AI 模型

| 模型 | 用途 | 特点 |
|------|------|------|
| `deepseek-chat` | 通用对话 | DeepSeek-V3，671B 参数，日常对话首选 |
| `deepseek-reasoner` | 复杂推理 | DeepSeek-R1，逻辑推理和数学问题专家 |

### 🔮 发展路线图

**当前版本 (v1.0)**：
- ✅ DeepSeek API 完整支持
- ✅ 双模型支持（对话 + 推理）
- ✅ 流式响应和完整错误处理

**计划中的功能**：
- 🔄 OpenAI API 支持
- 🔄 Claude API 支持  
- 🔄 Gemini API 支持
- 🔄 统一的多 AI 路由
- 🔄 用户级访问控制
- 🔄 请求限流和配额管理

## ⚙️ 配置

只需设置两个环境变量即可开始使用：
- `DEEPSEEK_API_KEY` - 你的 DeepSeek API 密钥
- `PROXY_KEY` - 自定义访问密钥（推荐）

> 📖 **完整配置指南**：[详细配置说明](./docs/Configuration.md)

## 📱 客户端集成示例

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

## 📖 完整文档

### 📚 详细指南
- **[安装指南](./docs/Installation.md)** - Windows/macOS 详细安装步骤
- **[部署教程](./docs/Deployment.md)** - 本地CLI vs 网页部署对比
- **[API 文档](./docs/API-Reference.md)** - 完整的 API 参考和示例
- **[配置说明](./docs/Configuration.md)** - 高级配置和优化选项

### 🔧 运维支持  
- **[故障排除](./docs/Troubleshooting.md)** - 常见问题和解决方案
- **[监控指南](./docs/Monitoring.md)** - 日志查看和性能监控
- **[安全最佳实践](./docs/Security.md)** - 生产环境安全配置

### 💡 使用案例
- **[使用示例](./docs/Examples.md)** - 各种编程语言的集成示例
- **[最佳实践](./docs/Best-Practices.md)** - 性能优化和使用建议

## 🌟 项目亮点

```javascript
// 🔐 安全：密钥服务端存储
env.DEEPSEEK_API_KEY // 只在 Cloudflare 中存储

// ⚡ 性能：全局边缘计算
Cloudflare Workers // 180+ 数据中心

// 🛡️ 可靠：完善错误处理
{
  "error": "timeout",
  "message": "Request timeout after 30s",
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// 🌊 流式：实时响应
Accept: text/event-stream
```

## 🤝 社区与支持

### 💬 获取帮助
- [📋 Issues](../../issues) - 报告 Bug 或提出功能建议
- [💡 Discussions](../../discussions) - 社区讨论和经验分享
- [📖 Wiki](../../wiki) - 完整文档和教程

### 🔧 参与贡献
- [🤝 贡献指南](./docs/Contributing.md) - 如何参与项目开发
- [📝 代码规范](./docs/Code-Style.md) - 代码风格和最佳实践
- [🧪 测试指南](./docs/Testing.md) - 如何编写和运行测试

### 📊 项目状态
- ✅ **稳定版本**：v1.0.0
- 🔄 **活跃维护**：定期更新和 Bug 修复
- 🌍 **生产使用**：已在多个项目中稳定运行

## 🏆 使用案例

> "AI Proxy Worker 让我们的 iOS 应用可以安全地集成 AI 功能，无需担心 API 密钥泄露。部署简单，性能出色！" 
> 
> — iOS 开发者

> "从 DeepSeek 切换到其他 AI 服务商只需要几行代码修改，这种灵活性太棒了。"
> 
> — 全栈工程师

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 开源许可证。

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给个 Star 支持一下！**

[⭐ Star](../../stargazers) • [🍴 Fork](../../fork) • [📢 分享](https://twitter.com/intent/tweet?text=AI%20Proxy%20Worker%20-%20%E5%9F%BA%E4%BA%8E%20Cloudflare%20Workers%20%E7%9A%84%E9%80%9A%E7%94%A8%20AI%20API%20%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1&url=https://github.com/qinfuyao/AI-Proxy-Worker)

</div>