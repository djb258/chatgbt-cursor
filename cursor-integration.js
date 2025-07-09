#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CursorIntegration {
  constructor() {
    this.cursorConfigDir = path.join(process.env.APPDATA || process.env.HOME, '.cursor');
    this.workspaceFile = path.join(process.cwd(), '.cursor-workspace');
  }

  // Detect when Cursor opens a new project
  onProjectOpen() {
    const projectName = path.basename(process.cwd());
    const projectPath = process.cwd();
    
    console.log(`🎯 Cursor opened project: ${projectName}`);
    console.log(`📁 Path: ${projectPath}`);
    
    // Auto-switch CLI to this project
    this.switchToProject(projectName);
    
    // Set up project context
    this.setupProjectContext();
    
    // Show available commands
    this.showProjectCommands();
  }

  switchToProject(projectName) {
    try {
      // Update CLI configuration
      execSync(`chatgbt config set project.name "${projectName}"`, { stdio: 'ignore' });
      execSync(`chatgbt config set project.path "${process.cwd()}"`, { stdio: 'ignore' });
      execSync(`chatgbt config set project.cursor "true"`, { stdio: 'ignore' });
      
      console.log(`✅ Switched CLI to project: ${projectName}`);
    } catch (error) {
      console.log('⚠️  CLI not available, continuing...');
    }
  }

  setupProjectContext() {
    const context = this.getProjectContext();
    
    try {
      execSync(`chatgbt config set context "${context}"`, { stdio: 'ignore' });
      console.log(`📝 Set project context: ${context}`);
    } catch (error) {
      // CLI not available, continue
    }
  }

  getProjectContext() {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);
    let context = `Working in Cursor on project: ${projectName}`;
    
    // Detect project type and add relevant info
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      context += ` | Node.js project: ${pkg.name || 'unnamed'}`;
      if (pkg.description) context += ` | ${pkg.description}`;
    } else if (fs.existsSync(path.join(cwd, 'requirements.txt'))) {
      context += ' | Python project';
    } else if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
      context += ' | Rust project';
    }
    
    // Add key files
    const keyFiles = this.getKeyFiles();
    if (keyFiles.length > 0) {
      context += ` | Key files: ${keyFiles.join(', ')}`;
    }
    
    return context;
  }

  getKeyFiles() {
    const cwd = process.cwd();
    const keyFiles = [];
    
    const importantFiles = [
      'README.md', 'package.json', 'requirements.txt', 'Cargo.toml',
      'pom.xml', 'build.gradle', 'Makefile', 'Dockerfile',
      'docker-compose.yml', '.env', 'config.json'
    ];
    
    importantFiles.forEach(file => {
      if (fs.existsSync(path.join(cwd, file))) {
        keyFiles.push(file);
      }
    });
    
    return keyFiles.slice(0, 5); // Limit to 5 files
  }

  showProjectCommands() {
    console.log('\n🚀 Available Commands:');
    console.log('─'.repeat(40));
    console.log('💬 chatgbt chat                    # Start interactive chat');
    console.log('💬 chatgbt chat -m "Your message"   # Send single message');
    console.log('🔧 chatgbt llm -s claude           # Switch to Claude');
    console.log('🔧 chatgbt llm -s chatgpt          # Switch to ChatGPT');
    console.log('📋 chatgbt config -l               # View project config');
    console.log('📚 chatgbt history -l              # View chat history');
    console.log('');
    console.log('💡 Quick Start:');
    console.log('   chatgbt chat -m "Help me understand this project"');
    console.log('   chatgbt chat -m "What should I work on next?"');
    console.log('   chatgbt chat -m "Review my code for best practices"');
  }

  // Create a workspace file for Cursor
  createWorkspaceFile() {
    const workspace = {
      name: path.basename(process.cwd()),
      path: process.cwd(),
      cursor: true,
      timestamp: new Date().toISOString(),
      commands: {
        chat: 'chatgbt chat',
        claude: 'chatgbt llm -s claude && chatgbt chat',
        config: 'chatgbt config -l',
        history: 'chatgbt history -l'
      }
    };
    
    fs.writeFileSync(this.workspaceFile, JSON.stringify(workspace, null, 2));
    console.log(`📄 Created workspace file: ${this.workspaceFile}`);
  }

  // Set up Cursor keyboard shortcuts
  setupCursorShortcuts() {
    const shortcuts = {
      "chatgbt.chat": {
        "command": "chatgbt chat",
        "key": "ctrl+shift+c",
        "description": "Start ChatGPT Commander chat"
      },
      "chatgbt.claude": {
        "command": "chatgbt llm -s claude && chatgbt chat",
        "key": "ctrl+shift+l",
        "description": "Start Claude chat"
      },
      "chatgbt.config": {
        "command": "chatgbt config -l",
        "key": "ctrl+shift+o",
        "description": "Show CLI configuration"
      }
    };
    
    console.log('\n⌨️  Suggested Cursor Keyboard Shortcuts:');
    console.log('─'.repeat(50));
    Object.entries(shortcuts).forEach(([name, shortcut]) => {
      console.log(`${shortcut.key.padEnd(15)} → ${shortcut.description}`);
    });
    
    console.log('\n💡 Add these to your Cursor settings.json');
  }
}

// Main execution
const integration = new CursorIntegration();

const command = process.argv[2];

switch (command) {
  case 'open':
  case 'o':
    integration.onProjectOpen();
    break;
    
  case 'workspace':
  case 'w':
    integration.createWorkspaceFile();
    break;
    
  case 'shortcuts':
  case 's':
    integration.setupCursorShortcuts();
    break;
    
  case 'setup':
    integration.onProjectOpen();
    integration.createWorkspaceFile();
    integration.setupCursorShortcuts();
    break;
    
  default:
    console.log('🎯 Cursor Integration for ChatGPT Commander');
    console.log('');
    console.log('Usage:');
    console.log('  node cursor-integration.js open      # Project opened in Cursor');
    console.log('  node cursor-integration.js workspace # Create workspace file');
    console.log('  node cursor-integration.js shortcuts # Show keyboard shortcuts');
    console.log('  node cursor-integration.js setup     # Full setup');
    console.log('');
    console.log('💡 Add to Cursor startup or use as pre-command hook');
} 