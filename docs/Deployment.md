# 部署教程

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Deployment.en.md) | [🇨🇳 中文](./Deployment.md)

</div>

本指南详细介绍如何将 AI Proxy Worker 部署到 Cloudflare Workers 平台。我们提供两种部署方式，你可以根据自己的偏好选择。

## 🎯 部署方式对比

| 特性 | 本地 CLI 部署 | 网页部署 |
|------|---------------|----------|
| **难度** | 中等 | 简单 |
| **速度** | 快速 | 中等 |
| **自动化** | 高 | 低 |
| **版本控制** | 支持 Git | 手动管理 |
| **批量操作** | 支持脚本 | 单个操作 |
| **推荐场景** | 开发者、CI/CD | 新手、快速测试 |

## 📋 部署前准备

### 1. 注册 Cloudflare 账户
1. 访问 [Cloudflare](https://www.cloudflare.com/)
2. 点击 **"Sign Up"** 注册免费账户
3. 验证邮箱地址
4. 登录到 Cloudflare Dashboard

### 2. 获取 DeepSeek API 密钥
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册并登录账户
3. 前往 **"API Keys"** 页面
4. 点击 **"Create new secret key"**
5. 复制并保存密钥（**注意：只显示一次**）

### 3. 准备项目文件
确保你已经完成了 [安装指南](./Installation) 中的步骤，并且项目文件已就绪。

## 🚀 方法一：本地 CLI 部署（推荐）

这是推荐的部署方式，特别适合开发者和需要自动化部署的场景。

### 步骤 1：登录 Cloudflare

```bash
# 登录 Cloudflare 账户
wrangler login
```

这会：
1. 打开浏览器窗口
2. 跳转到 Cloudflare 授权页面
3. 点击 **"Allow"** 授权 Wrangler
4. 自动返回终端，显示登录成功

**故障排除：**
```bash
# 如果浏览器没有自动打开
wrangler login --browser=false
# 手动复制显示的 URL 到浏览器

# 检查登录状态
wrangler whoami
```

### 步骤 2：配置项目信息

编辑 `wrangler.toml` 文件（可选）：
```toml
name = "ai-proxy-worker"  # 你的 Worker 名称，可以修改
main = "worker.js"
compatibility_date = "2025-01-01"

# 可选：自定义域名配置
# [[routes]]
# pattern = "ai.yourdomain.com/*"
# zone_name = "yourdomain.com"
```

### 步骤 3：设置环境变量

设置必需的密钥：

```bash
# 设置 DeepSeek API 密钥（必需）
wrangler secret put DEEPSEEK_API_KEY
# 输入提示：请输入 DEEPSEEK_API_KEY 的值:
# 粘贴你的 DeepSeek API 密钥

# 设置代理访问密钥（强烈推荐）
wrangler secret put PROXY_KEY  
# 输入提示：请输入 PROXY_KEY 的值:
# 输入一个自定义的强密码，如：sk-proxy-your-secret-key-2025
```

**密钥设置建议：**
- `DEEPSEEK_API_KEY`: 从 DeepSeek 平台获取的真实 API 密钥
- `PROXY_KEY`: 自定义的访问密钥，建议使用强密码生成器

### 步骤 4：部署到 Cloudflare Workers

```bash
# 部署项目
wrangler publish
```

成功输出示例：
```
 ⛅️ wrangler 3.15.0
-------------------
✨ Successfully published your Worker to
   https://ai-proxy-worker.your-subdomain.workers.dev
✨ Success! Your worker is now live at
   https://ai-proxy-worker.your-subdomain.workers.dev
```

### 步骤 5：测试部署

```bash
# 健康检查
curl https://ai-proxy-worker.your-subdomain.workers.dev/

# API 测试
curl -X POST https://ai-proxy-worker.your-subdomain.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

## 🌐 方法二：Cloudflare 网页部署

适合新手用户或需要快速测试的场景。

### 步骤 1：准备代码文件

1. 打开项目目录中的 `worker.js` 文件
2. 全选并复制所有代码内容（Ctrl+A, Ctrl+C）

### 步骤 2：创建 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单中点击 **"Workers & Pages"**
3. 点击 **"Create application"** 按钮
4. 选择 **"Create Worker"** 选项
5. 输入 Worker 名称，如：`ai-proxy-worker`
6. 点击 **"Deploy"** 按钮

### 步骤 3：编辑代码

1. 在 Worker 页面点击 **"Edit code"** 按钮
2. 删除编辑器中的默认代码
3. 粘贴复制的 `worker.js` 内容
4. 点击 **"Save and deploy"** 按钮

### 步骤 4：设置环境变量

1. 返回 Worker 主页面
2. 点击 **"Settings"** 标签页
3. 找到 **"Environment variables"** 部分
4. 点击 **"Add variable"** 按钮

添加以下变量：

**变量 1：DEEPSEEK_API_KEY**
- Variable name: `DEEPSEEK_API_KEY`
- Value: 你的 DeepSeek API 密钥
- Type: **Secret** （重要：选择加密类型）

**变量 2：PROXY_KEY**
- Variable name: `PROXY_KEY`  
- Value: 自定义的访问密钥
- Type: **Secret**

5. 点击 **"Save and deploy"** 按钮

### 步骤 5：获取部署 URL

部署完成后，你会看到 Worker 的访问 URL：
```
https://ai-proxy-worker.your-subdomain.workers.dev
```

### 步骤 6：测试部署

使用浏览器或 curl 测试：

```bash
# 健康检查
curl https://your-worker-url.workers.dev/

# API 调用测试  
curl -X POST https://your-worker-url.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat", 
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## ⚙️ 高级部署配置

### 自定义域名

如果你有自己的域名，可以绑定到 Worker：

#### 方法 1：通过 Dashboard
1. 在 Worker 页面点击 **"Triggers"** 标签
2. 点击 **"Add Custom Domain"**
3. 输入你的域名，如：`api.yourdomain.com`
4. 按照提示完成 DNS 配置

#### 方法 2：通过 wrangler.toml
```toml
name = "ai-proxy-worker"
main = "worker.js" 
compatibility_date = "2025-01-01"

[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 环境配置

为不同环境设置不同的配置：

```toml
name = "ai-proxy-worker"
main = "worker.js"
compatibility_date = "2025-01-01"

# 生产环境
[env.production]
name = "ai-proxy-worker-prod"
vars = { ENVIRONMENT = "production" }

# 开发环境
[env.development]  
name = "ai-proxy-worker-dev"
vars = { ENVIRONMENT = "development" }
```

部署到特定环境：
```bash
# 部署到开发环境
wrangler publish --env development

# 部署到生产环境
wrangler publish --env production
```

## 📊 部署后验证

### 1. 功能测试

**健康检查：**
```bash
curl https://your-worker.workers.dev/
# 期望响应：{"status":"ok","service":"AI Proxy Worker","timestamp":"..."}
```

**API 调用测试：**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'
```

**流式响应测试：**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "写一首短诗"}],
    "stream": true
  }'
```

### 2. 性能测试

```bash
# 响应时间测试
curl -w "@curl-format.txt" -s -o /dev/null https://your-worker.workers.dev/

# 创建 curl-format.txt 文件：
echo "     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n" > curl-format.txt
```

### 3. 错误处理测试

```bash
# 测试未授权访问
curl -X POST https://your-worker.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[]}'
# 期望：401 Unauthorized

# 测试无效路径
curl https://your-worker.workers.dev/invalid-path
# 期望：404 Not Found

# 测试无效请求体
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d 'invalid-json'
# 期望：400 Bad Request
```

## 🔄 更新和维护

### 更新代码

**CLI 方式：**
```bash
# 修改代码后重新部署
wrangler publish

# 查看部署历史
wrangler deployments list
```

**网页方式：**
1. 在 Cloudflare Dashboard 中找到你的 Worker
2. 点击 **"Edit code"**
3. 修改代码
4. 点击 **"Save and deploy"**

### 管理环境变量

```bash
# 查看已设置的密钥（不显示值）
wrangler secret list

# 更新密钥
wrangler secret put DEEPSEEK_API_KEY

# 删除密钥
wrangler secret delete OLD_KEY_NAME
```

### 监控和日志

```bash
# 实时查看日志
wrangler tail

# 查看部署状态
wrangler deployments list

# 查看使用统计
wrangler metrics
```

## 🚨 常见部署问题

### 认证失败
```bash
# 重新登录
wrangler logout
wrangler login
```

### 部署超时
```bash
# 检查网络连接
curl -I https://api.cloudflare.com/

# 使用代理（如果需要）
wrangler publish --proxy http://proxy.example.com:8080
```

### 环境变量未生效
```bash
# 确认密钥已设置
wrangler secret list

# 重新设置密钥
wrangler secret put DEEPSEEK_API_KEY
```

### Worker 无法访问
1. 检查 Worker 状态是否为 "Active"
2. 确认 URL 拼写正确
3. 查看 Cloudflare 服务状态页面

## 🎯 下一步

部署完成后，你可以：

1. **[配置 API 使用](./API-Reference)** - 了解完整的 API 文档
2. **[集成到应用](./Examples)** - 查看各种编程语言的集成示例  
3. **[监控和维护](./Monitoring)** - 设置监控和日志分析
4. **[性能优化](./Performance)** - 优化 Worker 性能

---

**部署成功？** 👉 [开始使用 API](./API-Reference)
