# 贡献指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Contributing.en.md) | [🇨🇳 中文](./Contributing.md)

</div>

感谢你对 AI Proxy Worker 项目的关注！本指南将帮助你了解如何参与项目开发。

## 🚀 快速开始

### 前置要求
- Node.js 18+ 和 npm
- Git
- Cloudflare 账户（用于测试）
- JavaScript 和 Cloudflare Workers 基础知识

### 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# 安装依赖
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 设置开发环境
cp wrangler.toml.example wrangler.toml
# 编辑 wrangler.toml 配置你的设置
```

## 🔧 开发流程

### 1. Fork 和 Clone
```bash
# 在 GitHub 上 Fork 仓库，然后克隆你的 fork
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# 添加上游远程仓库
git remote add upstream https://github.com/original-owner/ai-proxy-worker.git
```

### 2. 创建功能分支
```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或者修复 bug
git checkout -b fix/bug-description
```

### 3. 本地开发
```bash
# 启动本地开发服务器
wrangler dev

# 测试你的更改
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "测试"}]}'
```

### 4. 测试
```bash
# 运行测试（如果可用）
npm test

# 手动测试清单：
# - 基本聊天功能
# - 流式响应
# - 错误处理
# - 身份验证
```

### 5. 提交和推送
```bash
# 添加更改
git add .

# 使用描述性消息提交
git commit -m "feat: 添加新 AI 模型支持"

# 推送到你的 fork
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request
1. 在 GitHub 上访问你的 fork
2. 点击 "New Pull Request"
3. 填写 PR 模板
4. 等待审查

## 📝 代码规范

### JavaScript 风格
- 使用现代 ES6+ 特性
- 保持一致的缩进（2个空格）
- 使用有意义的变量名
- 为复杂逻辑添加注释

```javascript
// 好的示例
const handleChatRequest = async (request, env) => {
  const { messages, model } = await request.json();
  
  // 验证必需字段
  if (!messages || !Array.isArray(messages)) {
    throw new Error('消息必须是数组格式');
  }
  
  return await processChat(messages, model, env);
};

// 避免这样写
const h = async (r, e) => {
  const d = await r.json();
  return await p(d.m, d.mod, e);
};
```

### 错误处理
始终提供有意义的错误消息：

```javascript
// 好的示例
if (!env.DEEPSEEK_API_KEY) {
  return new Response(JSON.stringify({
    error: 'configuration_error',
    message: '需要设置 DEEPSEEK_API_KEY 环境变量',
    timestamp: new Date().toISOString()
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 安全最佳实践
- 永远不要记录敏感信息（API 密钥、用户数据）
- 验证所有输入参数
- 使用适当的 HTTP 状态码
- 在适当的地方实施速率限制

## 🐛 Bug 报告

### 报告前检查
1. 检查现有 issues
2. 使用最新版本测试
3. 能够一致地重现问题

### Bug 报告模板
```markdown
**Bug 描述**
清楚地描述 bug 是什么。

**重现步骤**
1. 使用配置 X 部署 worker
2. 发送载荷 Y 的请求
3. 观察到错误 Z

**预期行为**
应该发生什么。

**环境信息**
- Cloudflare Workers 版本
- 使用的浏览器/客户端
- 任何相关配置

**附加上下文**
日志、截图或其他有用信息。
```

## 💡 功能请求

### 功能请求模板
```markdown
**功能描述**
清楚地描述你希望看到的功能。

**使用场景**
解释为什么这个功能有用。

**建议实现**
如果你对如何实现有想法。

**考虑的替代方案**
你考虑过的其他解决方案。
```

## 📖 文档

### 写作指南
- 使用清晰、简洁的语言
- 提供实用示例
- 包含中英文版本
- 测试所有代码示例

### 文档结构
```
docs/
├── Installation.md/en.md     # 安装指南
├── Configuration.md/en.md    # 配置选项
├── API-Reference.md/en.md    # API 文档
├── Examples.md/en.md         # 使用示例
├── Troubleshooting.md/en.md  # 常见问题
└── Contributing.md/en.md     # 本文件
```

## 🔄 发布流程

### 版本编号
我们遵循 [语义化版本](https://semver.org/lang/zh-CN/)：
- `主版本.次版本.修订版本`
- 主版本：不兼容的 API 修改
- 次版本：向下兼容的功能性新增
- 修订版本：向下兼容的问题修正

### 发布清单
- [ ] 更新 `wrangler.toml` 中的版本
- [ ] 更新 CHANGELOG.md
- [ ] 测试所有功能
- [ ] 更新文档
- [ ] 创建发布说明
- [ ] 标记发布

## 🏆 致谢

### 贡献者
所有贡献者将在以下地方得到认可：
- README.md 贡献者部分
- 发布说明
- GitHub 贡献者页面

### 贡献类型
- 🐛 Bug 修复
- ✨ 新功能
- 📝 文档
- 🎨 UI/UX 改进
- 🔧 基础设施
- 🌍 翻译

## ❓ 获取帮助

### 社区支持
- [💡 Discussions](../../discussions) - 一般问题
- [📋 Issues](../../issues) - Bug 报告和功能请求
- [Discord/Slack] - 实时聊天（如果可用）

### 代码审查流程
1. 所有 PR 需要至少一次审查
2. 维护者将在 48 小时内审查
3. 及时处理反馈
4. 合并前压缩提交

## 📋 贡献清单

提交 PR 前，确保：
- [ ] 代码遵循项目风格指南
- [ ] 所有测试通过
- [ ] 如需要已更新文档
- [ ] 提交消息具有描述性
- [ ] PR 描述解释了更改
- [ ] 代码中没有敏感信息
- [ ] 功能在生产环境中正常工作

---

**感谢你为 AI Proxy Worker 做出贡献！** 🎉

你的贡献让这个项目对每个人都更好。
