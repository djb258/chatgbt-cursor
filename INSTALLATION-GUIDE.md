# ChatGPT Commander Installation Guide

Complete guide for installing ChatGPT Commander on any machine with Cursor integration.

## 🚀 Quick Installation (One Command)

### For New Machines
```bash
# Clone the main project
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor

# Install everything (CLI + Cursor integration)
npm run install:global
```

### For Existing Projects
```bash
# Just install the CLI and Cursor integration
npm run install:quick
```

## 📋 Prerequisites

- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **Cursor**: Latest version
- **Git**: For cloning repositories

### Check Prerequisites
```bash
node --version    # Should be >= 16.0.0
npm --version     # Should be >= 8.0.0
git --version     # Any recent version
```

## 🔧 Installation Options

### Option 1: Full Installation (Recommended)
```bash
# Clone and install everything
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global
```

### Option 2: CLI Only
```bash
# Install just the CLI globally
npm install -g chatgbt-commander-cli
```

### Option 3: Project-Specific Installation
```bash
# Add to existing project
npm install --save-dev chatgbt-commander-cli
npm run cursor:setup
```

## 🎯 What Gets Installed

### 1. ChatGPT Commander CLI
- **Global command**: `chatgbt`
- **Location**: Global npm packages
- **Features**: Multi-LLM support, project switching, history management

### 2. Cursor Integration
- **Startup script**: Auto-runs when Cursor opens
- **Keyboard shortcuts**: Ctrl+Shift+C, Ctrl+Shift+L, Ctrl+Shift+O
- **Project detection**: Auto-switches context per project
- **Workspace files**: `.cursor-workspace` per project

### 3. Project Switching System
- **Auto-detection**: Project type and structure
- **Context management**: Per-project AI context
- **History tracking**: Separate history per project

## 🔄 Installation Process

### Step 1: Install CLI
```bash
npm install -g chatgbt-commander-cli
```

### Step 2: Set up Cursor Integration
```bash
npm run cursor:startup
```

### Step 3: Test Installation
```bash
# Check CLI installation
chatgbt --version

# Test project setup
npm run cursor:setup

# Test chat functionality
chatgbt chat -m "Hello, test message"
```

## 🖥️ Platform-Specific Instructions

### Windows
```bash
# PowerShell (Run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global

# Or using Command Prompt
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global
```

### macOS
```bash
# Terminal
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global

# Or using Homebrew (if you prefer)
brew install node
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm git
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global

# CentOS/RHEL
sudo yum install nodejs npm git
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor
npm run install:global
```

## 🔧 Configuration

### Initial Setup
```bash
# Register with the cloud API
chatgbt register

# Configure your preferences
chatgbt config set model gpt-4
chatgbt config set temperature 0.7
```

### Cursor Settings
The installation automatically configures:
- **Keyboard shortcuts**: Ctrl+Shift+C, Ctrl+Shift+L, Ctrl+Shift+O
- **Startup script**: Auto-runs when Cursor opens
- **Project detection**: Auto-switches context

### Manual Cursor Configuration (if needed)
```json
// Add to Cursor settings.json
{
  "keybindings": [
    {
      "key": "ctrl+shift+c",
      "command": "workbench.action.terminal.sendSequence",
      "args": { "text": "chatgbt chat\n" }
    },
    {
      "key": "ctrl+shift+l",
      "command": "workbench.action.terminal.sendSequence",
      "args": { "text": "chatgbt llm -s claude && chatgbt chat\n" }
    },
    {
      "key": "ctrl+shift+o",
      "command": "workbench.action.terminal.sendSequence",
      "args": { "text": "chatgbt config -l\n" }
    }
  ]
}
```

## 🧪 Testing Installation

### Test 1: CLI Installation
```bash
chatgbt --version
# Should show: 1.0.0
```

### Test 2: Project Setup
```bash
npm run cursor:setup
# Should show project detection and setup
```

### Test 3: Chat Functionality
```bash
chatgbt chat -m "Test message"
# Should connect to AI and respond
```

### Test 4: Project Switching
```bash
npm run switch
# Should detect current project and set context
```

### Test 5: Multi-LLM
```bash
chatgbt llm -l
# Should list available LLMs
chatgbt llm -s claude
# Should switch to Claude
```

## 🔍 Troubleshooting

### CLI Not Found
```bash
# Reinstall CLI
npm install -g chatgbt-commander-cli

# Check PATH
echo $PATH
which chatgbt
```

### Cursor Integration Issues
```bash
# Re-run setup
npm run cursor:startup

# Check Cursor settings
cat ~/.cursor/settings.json
```

### Permission Issues (Windows)
```bash
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install -g chatgbt-commander-cli
```

### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

### Network Issues
```bash
# Check API connectivity
curl https://chatgbt-cursor.onrender.com/health

# Configure proxy if needed
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

## 🚀 Post-Installation

### First Use
```bash
# 1. Open Cursor
# 2. Open any project
# 3. Run setup
npm run cursor:setup

# 4. Start chatting
chatgbt chat -m "Help me with this project"
```

### Daily Workflow
```bash
# When opening a new project
npm run cursor:setup

# Quick chat
chatgbt chat

# Switch to Claude for review
chatgbt llm -s claude
chatgbt chat -m "Review my code"
```

### Keyboard Shortcuts
- `Ctrl+Shift+C`: Start ChatGPT chat
- `Ctrl+Shift+L`: Start Claude chat
- `Ctrl+Shift+O`: Show project config

## 📦 Deployment Scripts

### Automated Installation Script
```bash
#!/bin/bash
# install-chatgbt.sh

echo "🚀 Installing ChatGPT Commander..."

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Install CLI
echo "📦 Installing CLI..."
npm install -g chatgbt-commander-cli

# Clone main project
echo "📁 Cloning main project..."
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor

# Set up Cursor integration
echo "⚙️ Setting up Cursor integration..."
npm run cursor:startup

echo "✅ Installation complete!"
echo "💡 Restart Cursor and open a project to get started."
```

### Windows PowerShell Script
```powershell
# install-chatgbt.ps1

Write-Host "🚀 Installing ChatGPT Commander..." -ForegroundColor Green

# Check prerequisites
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Install CLI
Write-Host "📦 Installing CLI..." -ForegroundColor Yellow
npm install -g chatgbt-commander-cli

# Clone main project
Write-Host "📁 Cloning main project..." -ForegroundColor Yellow
git clone https://github.com/djb258/chatgbt-cursor.git
cd chatgbt-cursor

# Set up Cursor integration
Write-Host "⚙️ Setting up Cursor integration..." -ForegroundColor Yellow
npm run cursor:startup

Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "💡 Restart Cursor and open a project to get started." -ForegroundColor Cyan
```

## 🎉 Success!

After installation, you'll have:

- ✅ **Global CLI**: `chatgbt` command available everywhere
- ✅ **Cursor Integration**: Auto-setup when opening projects
- ✅ **Multi-LLM Support**: ChatGPT, Claude, Gemini
- ✅ **Project Switching**: Automatic context management
- ✅ **Keyboard Shortcuts**: Quick access to AI assistance
- ✅ **Cross-Platform**: Works on Windows, macOS, Linux

Your ChatGPT Commander system is now ready for use on any machine! 🚀 