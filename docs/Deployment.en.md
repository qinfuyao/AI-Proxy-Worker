# Deployment Tutorial

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Deployment.en.md) | [🇨🇳 中文](./Deployment.md)

</div>

This guide provides detailed instructions on deploying AI Proxy Worker to the Cloudflare Workers platform. We offer two deployment methods - choose based on your preference.

## 🎯 Deployment Methods Comparison

| Feature | Local CLI Deployment | Web Deployment |
|---------|---------------------|----------------|
| **Difficulty** | Medium | Easy |
| **Speed** | Fast | Medium |
| **Automation** | High | Low |
| **Version Control** | Git Support | Manual Management |
| **Batch Operations** | Script Support | Single Operation |
| **Recommended For** | Developers, CI/CD | Beginners, Quick Testing |

## 📋 Pre-deployment Preparation

### 1. Register Cloudflare Account
1. Visit [Cloudflare](https://www.cloudflare.com/)
2. Click **"Sign Up"** to register a free account
3. Verify email address
4. Login to Cloudflare Dashboard

### 2. Get DeepSeek API Key
1. Visit [DeepSeek Open Platform](https://platform.deepseek.com/)
2. Register and login to account
3. Go to **"API Keys"** page
4. Click **"Create new secret key"**
5. Copy and save the key (**Note: Only shown once**)

### 3. Prepare Project Files
Ensure you've completed the [Installation Guide](./Installation.en) steps and project files are ready.

## 🚀 Method 1: Local CLI Deployment (Recommended)

This is the recommended deployment method, especially suitable for developers and automated deployment scenarios.

### Step 1: Login to Cloudflare

```bash
# Login to Cloudflare account
wrangler login
```

This will:
1. Open browser window
2. Redirect to Cloudflare authorization page
3. Click **"Allow"** to authorize Wrangler
4. Automatically return to terminal showing login success

**Troubleshooting:**
```bash
# If browser doesn't open automatically
wrangler login --browser=false
# Manually copy the displayed URL to browser

# Check login status
wrangler whoami
```

### Step 2: Configure Project Information

Edit `wrangler.toml` file (optional):
```toml
name = "ai-proxy-worker"  # Your Worker name, can be modified
main = "worker.js"
compatibility_date = "2025-08-17"

# Optional: Custom domain configuration
# [[routes]]
# pattern = "ai.yourdomain.com/*"
# zone_name = "yourdomain.com"
```

### Step 3: Set Environment Variables

Set required secrets:

```bash
# Set DeepSeek API key (required)
wrangler secret put DEEPSEEK_API_KEY
# Input prompt: Please enter value for DEEPSEEK_API_KEY:
# Paste your DeepSeek API key

# Set proxy access key (strongly recommended)
wrangler secret put PROXY_KEY
# Input prompt: Please enter value for PROXY_KEY:
# Enter a custom strong password, e.g.: sk-proxy-your-secret-key-2025
```

**Key Setting Recommendations:**
- `DEEPSEEK_API_KEY`: Real API key from DeepSeek platform
- `PROXY_KEY`: Custom access key, recommend using strong password generator

### Step 4: Deploy to Cloudflare Workers

```bash
# Deploy project
wrangler publish
```

Success output example:
```
 ⛅️ wrangler 3.15.0
-------------------
✨ Successfully published your Worker to
   https://ai-proxy-worker.your-subdomain.workers.dev
✨ Success! Your worker is now live at
   https://ai-proxy-worker.your-subdomain.workers.dev
```

### Step 5: Test Deployment

```bash
# Health check
curl https://ai-proxy-worker.your-subdomain.workers.dev/

# API test
curl -X POST https://ai-proxy-worker.your-subdomain.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 🌐 Method 2: Cloudflare Web Deployment

Suitable for beginners or quick testing scenarios.

### Step 1: Prepare Code Files

1. Open `worker.js` file in project directory
2. Select all and copy all code content (Ctrl+A, Ctrl+C)

### Step 2: Create Worker

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** in left menu
3. Click **"Create application"** button
4. Select **"Create Worker"** option
5. Enter Worker name, e.g.: `ai-proxy-worker`
6. Click **"Deploy"** button

### Step 3: Edit Code

1. Click **"Edit code"** button on Worker page
2. Delete default code in editor
3. Paste copied `worker.js` content
4. Click **"Save and deploy"** button

### Step 4: Set Environment Variables

1. Return to Worker homepage
2. Click **"Settings"** tab
3. Find **"Environment variables"** section
4. Click **"Add variable"** button

Add the following variables:

**Variable 1: DEEPSEEK_API_KEY**
- Variable name: `DEEPSEEK_API_KEY`
- Value: Your DeepSeek API key
- Type: **Secret** (Important: Select encrypted type)

**Variable 2: PROXY_KEY**
- Variable name: `PROXY_KEY`
- Value: Custom access key
- Type: **Secret**

5. Click **"Save and deploy"** button

### Step 5: Get Deployment URL

After deployment, you'll see the Worker's access URL:
```
https://ai-proxy-worker.your-subdomain.workers.dev
```

### Step 6: Test Deployment

Use browser or curl to test:

```bash
# Health check
curl https://your-worker-url.workers.dev/

# API call test
curl -X POST https://your-worker-url.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 📊 Post-deployment Verification

### 1. Function Testing

**Health Check:**
```bash
curl https://your-worker.workers.dev/
# Expected response: {"status":"ok","service":"AI Proxy Worker","timestamp":"..."}
```

**API Call Test:**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Hello, please introduce yourself"}
    ]
  }'
```

**Streaming Response Test:**
```bash
curl -X POST https://your-worker.workers.dev/chat \
  -H "Authorization: Bearer YOUR_PROXY_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Write a short poem"}],
    "stream": true
  }'
```

## 🔄 Updates and Maintenance

### Update Code

**CLI Method:**
```bash
# After modifying code, redeploy
wrangler publish

# View deployment history
wrangler deployments list
```

**Web Method:**
1. Find your Worker in Cloudflare Dashboard
2. Click **"Edit code"**
3. Modify code
4. Click **"Save and deploy"**

### Manage Environment Variables

```bash
# View set secrets (doesn't show values)
wrangler secret list

# Update secrets
wrangler secret put DEEPSEEK_API_KEY

# Delete secrets
wrangler secret delete OLD_KEY_NAME
```

### Monitoring and Logs

```bash
# View real-time logs
wrangler tail

# View deployment status
wrangler deployments list

# View usage statistics
wrangler metrics
```

## 🚨 Common Deployment Issues

### Authentication Failed
```bash
# Re-login
wrangler logout
wrangler login
```

### Deployment Timeout
```bash
# Check network connection
curl -I https://api.cloudflare.com/

# Use proxy (if needed)
wrangler publish --proxy http://proxy.example.com:8080
```

### Environment Variables Not Taking Effect
```bash
# Confirm secrets are set
wrangler secret list

# Reset secrets
wrangler secret put DEEPSEEK_API_KEY
```

### Worker Inaccessible
1. Check Worker status is "Active"
2. Confirm URL spelling is correct
3. Check Cloudflare service status page

## 🎯 Next Steps

After successful deployment, you can:

1. **[Configure API Usage](./API-Reference.en)** - Learn complete API documentation
2. **[Integrate into Applications](./Examples.en)** - View integration examples in various programming languages
3. **[Monitor and Maintain](./Monitoring.en)** - Set up monitoring and log analysis
4. **[Performance Optimization](./Performance.en)** - Optimize Worker performance

---

**Deployment Successful?** 👉 [Start Using API](./API-Reference.en.md)
