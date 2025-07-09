# Cursor + ChatGPT Commander Workflow Guide

This guide shows you how to seamlessly use ChatGPT Commander CLI with Cursor across different projects.

## 🎯 Quick Start

### 1. Auto-Switch When Opening Projects
```bash
# When you open a new project in Cursor, run:
npm run cursor:setup

# This will:
# ✅ Auto-detect project type
# ✅ Switch CLI to this project
# ✅ Set up project context
# ✅ Show available commands
```

### 2. Manual Project Switching
```bash
# Switch to current project
npm run switch

# List all projects
npm run switch:list

# Switch to specific project
npm run switch:project my-other-project
```

## 🚀 Workflow Examples

### Scenario 1: Starting a New Project
```bash
# 1. Open new project in Cursor
# 2. Run setup
npm run cursor:setup

# 3. Start chatting about the project
chatgbt chat -m "Help me understand this project structure"

# 4. Switch to Claude for code review
chatgbt llm -s claude
chatgbt chat -m "Review my code for best practices"
```

### Scenario 2: Switching Between Projects
```bash
# Project A: React app
cd /path/to/react-app
npm run switch
chatgbt chat -m "Help me add a new component"

# Project B: Python API
cd /path/to/python-api
npm run switch
chatgbt chat -m "Help me optimize this database query"

# Project C: Rust CLI tool
cd /path/to/rust-cli
npm run switch
chatgbt chat -m "Help me implement error handling"
```

### Scenario 3: Multi-LLM Development
```bash
# Use ChatGPT for coding
chatgbt llm -s chatgpt
chatgbt chat -m "Write a React hook for data fetching"

# Switch to Claude for review
chatgbt llm -s claude
chatgbt chat -m "Review this code for security issues"

# Use Gemini for research
chatgbt llm -s gemini
chatgbt chat -m "Research best practices for API design"
```

## 🔧 Cursor Integration Setup

### Option 1: Automatic Setup (Recommended)
```bash
# Run this once per project
npm run cursor:setup
```

### Option 2: Manual Setup
```bash
# 1. Set up project context
npm run cursor:open

# 2. Create workspace file
npm run cursor:workspace

# 3. Get keyboard shortcuts
npm run cursor:shortcuts
```

## ⌨️ Keyboard Shortcuts

Add these to your Cursor `settings.json`:

```json
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

## 📋 Project-Specific Commands

### Node.js Projects
```bash
# Package.json analysis
chatgbt chat -m "Analyze my package.json dependencies"

# Script optimization
chatgbt chat -m "Help me optimize my npm scripts"

# Testing setup
chatgbt chat -m "Help me set up Jest testing"
```

### Python Projects
```bash
# Requirements analysis
chatgbt chat -m "Review my requirements.txt"

# Virtual environment setup
chatgbt chat -m "Help me set up a virtual environment"

# Code formatting
chatgbt chat -m "Help me set up black and flake8"
```

### React Projects
```bash
# Component structure
chatgbt chat -m "Help me organize my React components"

# State management
chatgbt chat -m "Help me choose between Redux and Context API"

# Performance optimization
chatgbt chat -m "Help me optimize my React app performance"
```

## 🔄 Project Context Management

### View Current Context
```bash
chatgbt config -l
```

### Update Context
```bash
# Set specific context
chatgbt config set context "Working on authentication system"

# Clear context
chatgbt config clear context
```

### Project History
```bash
# View project-specific history
chatgbt history -l

# Export project history
chatgbt history -e project-history.json
```

## 🎯 Best Practices

### 1. Project Organization
```bash
# Always run setup when opening new projects
npm run cursor:setup

# Use descriptive context
chatgbt config set context "Working on user authentication with JWT"
```

### 2. LLM Selection
```bash
# ChatGPT: General coding, implementation
chatgbt llm -s chatgpt

# Claude: Code review, documentation, security
chatgbt llm -s claude

# Gemini: Research, analysis, data processing
chatgbt llm -s gemini
```

### 3. Context Switching
```bash
# Before switching projects
chatgbt history -e current-project-history.json

# After switching projects
npm run switch
chatgbt history -i new-project-history.json
```

## 🔍 Troubleshooting

### CLI Not Found
```bash
# Reinstall CLI
npm run cli:setup

# Check installation
chatgbt --version
```

### Project Context Issues
```bash
# Clear and reset context
chatgbt config clear
npm run switch

# Manual context setup
chatgbt config set context "Working on project: $(basename $(pwd))"
```

### Cursor Integration Issues
```bash
# Re-run setup
npm run cursor:setup

# Check workspace file
cat .cursor-workspace
```

## 🚀 Advanced Workflows

### Multi-Project Development
```bash
# Project A: Frontend
cd frontend && npm run switch
chatgbt chat -m "Help me with React components"

# Project B: Backend
cd ../backend && npm run switch
chatgbt chat -m "Help me with API endpoints"

# Project C: Database
cd ../database && npm run switch
chatgbt chat -m "Help me with schema design"
```

### Team Collaboration
```bash
# Share project context
chatgbt config -l > project-context.txt

# Import team member's context
cat team-context.txt | chatgbt config import

# Export conversation for team review
chatgbt history -e team-review.json
```

### Continuous Integration
```bash
# Pre-commit hook
npm run switch
chatgbt llm -s claude
chatgbt chat -m "Review my changes for best practices"

# Post-commit analysis
chatgbt chat -m "Analyze my commit for potential issues"
```

## 🎉 Success!

You now have a seamless workflow for using ChatGPT Commander with Cursor across multiple projects:

- ✅ **Auto-project switching** when opening new projects
- ✅ **Context-aware AI assistance** for each project
- ✅ **Multi-LLM support** for different tasks
- ✅ **Keyboard shortcuts** for quick access
- ✅ **Project history** management
- ✅ **Team collaboration** features

Happy coding with AI! 🤖✨ 