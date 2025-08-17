# Installation Guide

<div align="center">

**🌍 Language / 语言**

[🇺🇸 English](./Installation.en.md) | [🇨🇳 中文](./Installation.md)

</div>

This guide provides detailed instructions on how to install the AI Proxy Worker development and deployment environment on different operating systems.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: 2.x or higher
- **Cloudflare Account**: Free account is sufficient

### Recommended Configuration
- **Node.js**: 20.x LTS
- **Operating System**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **Memory**: 4GB+ (for development)

## 🖥️ Windows Installation

### Method 1: Using Official Node.js Installer (Recommended)

#### 1. Download and Install Node.js
1. Visit [Node.js official website](https://nodejs.org/)
2. Download **LTS version** (recommended 20.x)
3. Run the `.msi` installer
4. Keep all default options during installation
5. Ensure **"Add to PATH"** option is checked

#### 2. Verify Installation
Open **Command Prompt** (CMD) or **PowerShell**:
```cmd
# Check Node.js version
node --version
# Should display something like: v20.10.0

# Check npm version
npm --version
# Should display something like: 10.2.3
```

#### 3. Install Git
1. Visit [Git official website](https://git-scm.com/)
2. Download Windows version
3. Run installer with default settings
4. Verify installation:
   ```cmd
   git --version
   # Should display something like: git version 2.43.0
   ```

### Method 2: Using Package Managers

#### Using Chocolatey
1. Open PowerShell as Administrator
2. Install Chocolatey:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. Install dependencies:
   ```powershell
   choco install nodejs git -y
   ```

#### Using Scoop
```powershell
# Install Scoop
iwr -useb get.scoop.sh | iex

# Install dependencies
scoop install nodejs git
```

### Method 3: Using WSL2 (Recommended for Developers)

1. Enable WSL2:
   ```powershell
   # Run as Administrator
   wsl --install
   ```
2. Install Ubuntu:
   ```bash
   wsl --install -d Ubuntu
   ```
3. Follow Linux installation steps in WSL2

## 🍎 macOS Installation

### Method 1: Using Homebrew (Strongly Recommended)

#### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Dependencies
```bash
# Install Node.js (includes npm)
brew install node

# Install Git
brew install git

# Verify installation
node --version && npm --version && git --version
```

### Method 2: Using Official Installers

#### 1. Install Node.js
1. Visit [Node.js official website](https://nodejs.org/)
2. Download macOS version of LTS release
3. Run the `.pkg` installer
4. Follow installation wizard

#### 2. Install Git
```bash
# Git is usually pre-installed, check version
git --version

# If not installed, download official installer
# or use Xcode Command Line Tools
xcode-select --install
```

### Method 3: Using MacPorts
```bash
# After installing MacPorts
sudo port install nodejs20 +universal
sudo port install git
```

## 🐧 Linux Installation

### Ubuntu/Debian

#### Using apt (Recommended)
```bash
# Update package list
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Verify installation
node --version && npm --version && git --version
```

#### Using snap
```bash
sudo snap install node --classic
sudo apt install git -y
```

### CentOS/RHEL/Fedora

#### Using dnf/yum
```bash
# Fedora
sudo dnf install nodejs npm git -y

# CentOS/RHEL (requires EPEL)
sudo yum install epel-release -y
sudo yum install nodejs npm git -y
```

#### Using NodeSource
```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs git -y
```

### Arch Linux
```bash
sudo pacman -S nodejs npm git
```

## 🔧 Install Wrangler CLI

After installing Node.js, globally install Cloudflare Wrangler:

```bash
# Globally install Wrangler
npm install -g wrangler

# Verify installation
wrangler --version
# Should display something like: ⛅️ wrangler 3.15.0
```

### Common Issues Resolution

#### Permission Issues (Linux/macOS)
```bash
# If encountering permission errors, configure npm global directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall Wrangler
npm install -g wrangler
```

#### Windows Execution Policy Issues
```powershell
# If encountering execution policy errors
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📦 Get Project Code

### Method 1: Git Clone (Recommended)
```bash
# Clone project
git clone https://github.com/qinfuyao/AI-Proxy-Worker.git

# Enter project directory
cd ai-proxy-worker

# View project structure
ls -la
```

### Method 2: Download ZIP
1. Visit project GitHub page
2. Click green **"Code"** button
3. Select **"Download ZIP"**
4. Extract to local directory
5. Open terminal and navigate to project directory

## ✅ Verify Installation

Run the following commands to verify all dependencies are correctly installed:

```bash
# Check Node.js
node --version
# ✅ Should display v18.0.0 or higher

# Check npm
npm --version
# ✅ Should display 9.0.0 or higher

# Check Git
git --version
# ✅ Should display git version 2.x.x

# Check Wrangler
wrangler --version
# ✅ Should display wrangler 3.x.x

# Check project files
ls worker.js wrangler.toml
# ✅ Should show these two files exist
```

## 🚀 Next Steps

After installation, you can:

1. **[Configure deployment environment](./Deployment.en)** - Set up Cloudflare account and keys
2. **[Quick deployment](./Quick-Setup.en)** - Deploy to production in 5 minutes
3. **[Local development](./Development.en)** - Set up local development environment

## 🔧 Troubleshooting

### Common Installation Issues

#### Node.js Version Too Old
```bash
# Uninstall old version
sudo apt remove nodejs npm  # Ubuntu
brew uninstall node        # macOS

# Reinstall latest version following steps above
```

#### npm Permission Issues
```bash
# Linux/macOS solution
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Wrangler Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install -g wrangler
```

#### Network Issues (China Users)
```bash
# Use Taobao mirror
npm config set registry https://registry.npmmirror.com/

# Reinstall
npm install -g wrangler
```

### Get Help

If you encounter installation issues:

1. Check [Troubleshooting Guide](./Troubleshooting.en)
2. Search [📋 Issues](../../issues)
3. Ask questions in [💡 Discussions](../../discussions)
4. Check [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

---

**Installation Complete?** 👉 [Start Deployment](./Deployment.en.md)
