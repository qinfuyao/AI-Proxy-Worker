# 安装指南

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Installation.en.md) | [🇨🇳 中文](./Installation.md)

</div>

本指南将详细介绍如何在不同操作系统上安装 AI Proxy Worker 的开发和部署环境。

## 📋 系统要求

### 最低要求
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本  
- **Git**: 2.x 或更高版本
- **Cloudflare 账户**: 免费账户即可

### 推荐配置
- **Node.js**: 20.x LTS
- **操作系统**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **内存**: 4GB+（开发时）

## 🖥️ Windows 系统安装

### 方法一：使用 Node.js 官方安装包（推荐）

#### 1. 下载并安装 Node.js
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 **LTS 版本**（推荐 20.x）
3. 运行 `.msi` 安装文件
4. 安装过程中保持所有默认选项
5. 确保勾选 **"Add to PATH"** 选项

#### 2. 验证安装
打开 **命令提示符** (CMD) 或 **PowerShell**：
```cmd
# 检查 Node.js 版本
node --version
# 应该显示类似：v20.10.0

# 检查 npm 版本  
npm --version
# 应该显示类似：10.2.3
```

#### 3. 安装 Git
1. 访问 [Git 官网](https://git-scm.com/)
2. 下载 Windows 版本
3. 运行安装程序，保持默认设置
4. 验证安装：
   ```cmd
   git --version
   # 应该显示类似：git version 2.43.0
   ```

### 方法二：使用包管理器

#### 使用 Chocolatey
1. 以管理员身份打开 PowerShell
2. 安装 Chocolatey：
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. 安装依赖：
   ```powershell
   choco install nodejs git -y
   ```

#### 使用 Scoop
```powershell
# 安装 Scoop
iwr -useb get.scoop.sh | iex

# 安装依赖
scoop install nodejs git
```

### 方法三：使用 WSL2（推荐开发者）

1. 启用 WSL2：
   ```powershell
   # 以管理员身份运行
   wsl --install
   ```
2. 安装 Ubuntu：
   ```bash
   wsl --install -d Ubuntu
   ```
3. 在 WSL2 中按照 Linux 安装步骤进行

## 🍎 macOS 系统安装

### 方法一：使用 Homebrew（强烈推荐）

#### 1. 安装 Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. 安装依赖
```bash
# 安装 Node.js（包含 npm）
brew install node

# 安装 Git
brew install git

# 验证安装
node --version && npm --version && git --version
```

### 方法二：使用官方安装包

#### 1. 安装 Node.js
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 macOS 版本的 LTS 版本
3. 运行 `.pkg` 安装文件
4. 按照安装向导完成安装

#### 2. 安装 Git
```bash
# Git 通常已预装，检查版本
git --version

# 如果没有安装，下载官方安装包
# 或使用 Xcode Command Line Tools
xcode-select --install
```

### 方法三：使用 MacPorts
```bash
# 安装 MacPorts 后
sudo port install nodejs20 +universal
sudo port install git
```

## 🐧 Linux 系统安装

### Ubuntu/Debian

#### 使用 apt（推荐）
```bash
# 更新包列表
sudo apt update

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Git
sudo apt install git -y

# 验证安装
node --version && npm --version && git --version
```

#### 使用 snap
```bash
sudo snap install node --classic
sudo apt install git -y
```

### CentOS/RHEL/Fedora

#### 使用 dnf/yum
```bash
# Fedora
sudo dnf install nodejs npm git -y

# CentOS/RHEL (需要 EPEL)
sudo yum install epel-release -y
sudo yum install nodejs npm git -y
```

#### 使用 NodeSource
```bash
# 安装 Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs git -y
```

### Arch Linux
```bash
sudo pacman -S nodejs npm git
```

## 🔧 安装 Wrangler CLI

安装完 Node.js 后，全局安装 Cloudflare Wrangler：

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 验证安装
wrangler --version
# 应该显示类似：⛅️ wrangler 3.15.0
```

### 常见问题解决

#### 权限问题（Linux/macOS）
```bash
# 如果遇到权限错误，配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到 PATH（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 重新安装 Wrangler
npm install -g wrangler
```

#### Windows 执行策略问题
```powershell
# 如果遇到执行策略错误
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📦 获取项目代码

### 方法一：Git 克隆（推荐）
```bash
# 克隆项目
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git

# 进入项目目录
cd ai-proxy-worker

# 查看项目结构
ls -la
```

### 方法二：下载 ZIP
1. 访问项目 GitHub 页面
2. 点击绿色的 **"Code"** 按钮
3. 选择 **"Download ZIP"**
4. 解压到本地目录
5. 打开终端，进入项目目录

## ✅ 验证安装

运行以下命令验证所有依赖都已正确安装：

```bash
# 检查 Node.js
node --version
# ✅ 应该显示 v18.0.0 或更高版本

# 检查 npm
npm --version  
# ✅ 应该显示 9.0.0 或更高版本

# 检查 Git
git --version
# ✅ 应该显示 git version 2.x.x

# 检查 Wrangler
wrangler --version
# ✅ 应该显示 wrangler 3.x.x

# 检查项目文件
ls worker.js wrangler.toml
# ✅ 应该显示这两个文件存在
```

## 🚀 下一步

安装完成后，你可以：

1. **[配置部署环境](./Deployment.md)** - 设置 Cloudflare 账户和密钥

## 🔧 故障排除

### 常见安装问题

#### Node.js 版本过低
```bash
# 卸载旧版本
sudo apt remove nodejs npm  # Ubuntu
brew uninstall node        # macOS

# 按照上述步骤重新安装最新版本
```

#### npm 权限问题
```bash
# Linux/macOS 解决方案
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Wrangler 安装失败
```bash
# 清理 npm 缓存
npm cache clean --force

# 重新安装
npm install -g wrangler
```

#### 网络问题（中国用户）
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/

# 重新安装
npm install -g wrangler
```

### 获取帮助

如果遇到安装问题：

1. 查看 [故障排除指南](./Troubleshooting.md)
2. 搜索 [📋 Issues](https://github.com/qinfuyao/AI-Proxy-Worker/issues)
3. 在 [💡 Discussions](https://github.com/qinfuyao/AI-Proxy-Worker/discussions) 中提问
4. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

---

**安装完成？** 👉 [开始部署](./Deployment.md)
