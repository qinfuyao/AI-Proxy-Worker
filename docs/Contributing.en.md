# Contributing Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Contributing.en.md) | [🇨🇳 中文](./Contributing.md)

</div>

Thank you for your interest in contributing to AI Proxy Worker! This guide will help you understand how to participate in the project development.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Cloudflare account (for testing)
- Basic knowledge of JavaScript and Cloudflare Workers

### Development Setup
```bash
# Clone the repository
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# Install dependencies
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set up development environment
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your settings
```

## 🔧 Development Workflow

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git
cd ai-proxy-worker

# Add upstream remote
git remote add upstream https://github.com/original-owner/ai-proxy-worker.git
```

### 2. Create Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Local Development
```bash
# Start local development server
wrangler dev

# Test your changes
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "test"}]}'
```

### 4. Testing
```bash
# Run tests (when available)
npm test

# Manual testing checklist:
# - Basic chat functionality
# - Streaming responses
# - Error handling
# - Authentication
```

### 5. Commit and Push
```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add support for new AI model"

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request
1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill out the PR template
4. Wait for review

## 📝 Code Standards

### JavaScript Style
- Use modern ES6+ features
- Follow consistent indentation (2 spaces)
- Use meaningful variable names
- Add comments for complex logic

```javascript
// Good
const handleChatRequest = async (request, env) => {
  const { messages, model } = await request.json();
  
  // Validate required fields
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }
  
  return await processChat(messages, model, env);
};

// Avoid
const h = async (r, e) => {
  const d = await r.json();
  return await p(d.m, d.mod, e);
};
```

### Error Handling
Always provide meaningful error messages:

```javascript
// Good
if (!env.DEEPSEEK_API_KEY) {
  return new Response(JSON.stringify({
    error: 'configuration_error',
    message: 'DEEPSEEK_API_KEY environment variable is required',
    timestamp: new Date().toISOString()
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Security Best Practices
- Never log sensitive information (API keys, user data)
- Validate all input parameters
- Use proper HTTP status codes
- Implement rate limiting where appropriate

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test with latest version
3. Reproduce the issue consistently

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Deploy worker with configuration X
2. Send request with payload Y
3. Observe error Z

**Expected Behavior**
What should have happened.

**Environment**
- Cloudflare Workers version
- Browser/client used
- Any relevant configuration

**Additional Context**
Logs, screenshots, or other helpful information.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Explain why this feature would be useful.

**Proposed Implementation**
If you have ideas about how to implement this.

**Alternatives Considered**
Other solutions you've considered.
```

## 📖 Documentation

### Writing Guidelines
- Use clear, concise language
- Provide practical examples
- Include both English and Chinese versions
- Test all code examples

### Documentation Structure
```
docs/
├── Installation.md/en.md     # Setup guides
├── Configuration.md/en.md    # Configuration options
├── API-Reference.md/en.md    # API documentation
├── Examples.md/en.md         # Usage examples
├── Troubleshooting.md/en.md  # Common issues
└── Contributing.md/en.md     # This file
```

## 🔄 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features, backward compatible
- Patch: Bug fixes

### Release Checklist
- [ ] Update version in `wrangler.toml`
- [ ] Update CHANGELOG.md
- [ ] Test all functionality
- [ ] Update documentation
- [ ] Create release notes
- [ ] Tag release

## 🏆 Recognition

### Contributors
All contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

### Types of Contributions
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- 🎨 UI/UX improvements
- 🔧 Infrastructure
- 🌍 Translations

## ❓ Getting Help

### Community Support
- [GitHub Discussions](../../discussions) - General questions
- [Issues](../../issues) - Bug reports and feature requests
- [Discord/Slack] - Real-time chat (if available)

### Code Review Process
1. All PRs require at least one review
2. Maintainers will review within 48 hours
3. Address feedback promptly
4. Squash commits before merging

## 📋 Contribution Checklist

Before submitting a PR, ensure:
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated if needed
- [ ] Commit messages are descriptive
- [ ] PR description explains the changes
- [ ] No sensitive information in code
- [ ] Feature works in production environment

---

**Thank you for contributing to AI Proxy Worker!** 🎉

Your contributions make this project better for everyone.
