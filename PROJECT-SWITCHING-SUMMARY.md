# ChatGPT Commander + Cursor Project Switching Summary

## 🎯 The Problem Solved

When you switch between different projects in Cursor, you want ChatGPT/Claude to automatically understand the new project context and provide relevant assistance.

## ✅ The Solution

We've created a complete project switching system that:

1. **Auto-detects** when you open a new project
2. **Switches CLI context** to the new project
3. **Sets up project-specific** AI assistance
4. **Provides keyboard shortcuts** for quick access

## 🚀 How to Use

### Quick Start (One Command)
```bash
# When you open a new project in Cursor, run:
npm run cursor:setup
```

### Manual Project Switching
```bash
# Switch to current project
npm run switch

# List all projects
npm run switch:list

# Switch to specific project
npm run switch:project my-project
```

## 📋 Available Commands

### Project Management
```bash
npm run switch              # Auto-switch to current project
npm run switch:list         # List all configured projects
npm run switch:project      # Switch to specific project
```

### Cursor Integration
```bash
npm run cursor:setup        # Full Cursor setup (recommended)
npm run cursor:open         # Project opened in Cursor
npm run cursor:shortcuts    # Show keyboard shortcuts
```

### CLI Commands
```bash
chatgbt chat               # Start interactive chat
chatgbt chat -m "Message"  # Send single message
chatgbt llm -s claude      # Switch to Claude
chatgbt llm -s chatgpt     # Switch to ChatGPT
chatgbt config -l          # View project config
chatgbt history -l         # View chat history
```

## 🔄 Workflow Examples

### Example 1: React Project
```bash
cd /path/to/react-app
npm run cursor:setup
chatgbt chat -m "Help me add a new component"
```

### Example 2: Python API
```bash
cd /path/to/python-api
npm run cursor:setup
chatgbt llm -s claude
chatgbt chat -m "Review my API endpoints"
```

### Example 3: Node.js Backend
```bash
cd /path/to/node-backend
npm run cursor:setup
chatgbt chat -m "Help me optimize database queries"
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

## 🎯 LLM Selection Strategy

### ChatGPT (Default)
- **Best for**: General coding, implementation, debugging
- **Use when**: Writing new code, fixing bugs, implementing features

### Claude
- **Best for**: Code review, documentation, security analysis
- **Use when**: Reviewing code, writing docs, security concerns

### Gemini
- **Best for**: Research, data analysis, architectural decisions
- **Use when**: Researching best practices, analyzing data, design decisions

## 📁 Project Context Management

### Automatic Context
The system automatically detects:
- Project type (Node.js, Python, Rust, etc.)
- Key files (package.json, requirements.txt, etc.)
- Project structure
- Recent files

### Manual Context
```bash
# Set specific context
chatgbt config set context "Working on authentication system"

# View current context
chatgbt config -l

# Clear context
chatgbt config clear context
```

## 🔧 Files Created

### `.cursor-workspace`
Contains project-specific configuration and commands.

### `~/.chatgbt/projects.json`
Stores all project configurations and history.

### Project-specific context
Automatically set in CLI configuration.

## 🚀 Advanced Features

### Multi-Project Development
```bash
# Frontend
cd frontend && npm run switch
chatgbt chat -m "Help with React components"

# Backend
cd ../backend && npm run switch
chatgbt chat -m "Help with API endpoints"
```

### Team Collaboration
```bash
# Export project context
chatgbt config -l > project-context.txt

# Share with team
git add project-context.txt
git commit -m "Add project context for team"
```

### Continuous Integration
```bash
# Pre-commit review
npm run switch
chatgbt llm -s claude
chatgbt chat -m "Review my changes"
```

## 🎉 Benefits

1. **Seamless Context Switching**: AI automatically understands your current project
2. **Multi-LLM Support**: Use the best AI for each task
3. **Project History**: Keep track of conversations per project
4. **Keyboard Shortcuts**: Quick access to AI assistance
5. **Team Collaboration**: Share project contexts with team members
6. **Cross-Platform**: Works on Windows, macOS, and Linux

## 🔍 Troubleshooting

### CLI Not Found
```bash
npm run cli:setup
```

### Project Context Issues
```bash
npm run switch
```

### Cursor Integration Issues
```bash
npm run cursor:setup
```

## 📚 Documentation

- **Main Integration**: `CLI-INTEGRATION.md`
- **Cursor Workflow**: `CURSOR-WORKFLOW.md`
- **Project Switching**: `PROJECT-SWITCHING-SUMMARY.md`

## 🎯 Next Steps

1. **Test the workflow** with your current project
2. **Add keyboard shortcuts** to Cursor
3. **Try different LLMs** for different tasks
4. **Share with your team** for collaboration

Your ChatGPT Commander + Cursor workflow is now complete! 🚀 