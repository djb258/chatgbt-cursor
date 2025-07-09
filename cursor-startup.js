#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CursorStartup {
  constructor() {
    this.cursorConfigDir = path.join(process.env.APPDATA || process.env.HOME, '.cursor');
    this.startupFile = path.join(this.cursorConfigDir, 'startup-script.js');
  }

  // Create startup script for Cursor
  createStartupScript() {
    // Ensure directory exists
    if (!fs.existsSync(this.cursorConfigDir)) {
      fs.mkdirSync(this.cursorConfigDir, { recursive: true });
    }

    const startupScript = `#!/usr/bin/env node

// ChatGPT Commander Cursor Startup Script
// This runs automatically when Cursor starts

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function initializeChatGPTCommander() {
  const cwd = process.cwd();
  const projectName = path.basename(cwd);
  
  console.log('🚀 ChatGPT Commander: Initializing...');
  
  try {
    // Check if this is a project with our integration
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      
      // Check if this project has our integration scripts
      if (pkg.scripts && (pkg.scripts['cursor:setup'] || pkg.scripts['switch'])) {
        console.log(\`📁 Project detected: \${projectName}\`);
        
        // Auto-run setup if not already configured
        if (!fs.existsSync(path.join(cwd, '.cursor-workspace'))) {
          console.log('⚙️  Running initial setup...');
          execSync('npm run cursor:setup', { stdio: 'inherit' });
        } else {
          console.log('✅ Project already configured');
          execSync('npm run switch', { stdio: 'inherit' });
        }
        
        console.log('🎯 ChatGPT Commander ready!');
        console.log('💡 Use: chatgbt chat -m "Help me with this project"');
      }
    }
  } catch (error) {
    console.log('⚠️  ChatGPT Commander setup skipped:', error.message);
  }
}

// Run initialization
initializeChatGPTCommander();
`;

    fs.writeFileSync(this.startupFile, startupScript);
    console.log(`📄 Created startup script: ${this.startupFile}`);
    
    return this.startupFile;
  }

  // Set up Cursor to run our script on startup
  setupCursorIntegration() {
    // Ensure directory exists
    if (!fs.existsSync(this.cursorConfigDir)) {
      fs.mkdirSync(this.cursorConfigDir, { recursive: true });
    }

    const cursorSettings = path.join(this.cursorConfigDir, 'settings.json');
    let settings = {};
    
    if (fs.existsSync(cursorSettings)) {
      settings = JSON.parse(fs.readFileSync(cursorSettings, 'utf8'));
    }

    // Add startup script configuration
    settings['terminal.integrated.shellArgs.windows'] = ['-Command', `node "${this.startupFile}"`];
    settings['terminal.integrated.shellArgs.linux'] = ['-c', `node "${this.startupFile}"`];
    settings['terminal.integrated.shellArgs.osx'] = ['-c', `node "${this.startupFile}"`];
    
    // Add keyboard shortcuts
    settings['keybindings'] = settings['keybindings'] || [];
    settings['keybindings'].push(
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
    );

    fs.writeFileSync(cursorSettings, JSON.stringify(settings, null, 2));
    console.log(`⚙️  Updated Cursor settings: ${cursorSettings}`);
  }

  // Create a global startup script
  createGlobalStartup() {
    const globalScript = `#!/usr/bin/env node

// Global ChatGPT Commander Startup
// Add this to your system startup

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkAndSetupProject() {
  const cwd = process.cwd();
  
  // Only run in project directories
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      
      if (pkg.scripts && pkg.scripts['cursor:setup']) {
        console.log('🎯 ChatGPT Commander: Auto-setup detected');
        execSync('npm run cursor:setup', { stdio: 'inherit' });
      }
    } catch (error) {
      // Silent fail for non-ChatGPT Commander projects
    }
  }
}

// Run check
checkAndSetupProject();
`;

    const globalPath = path.join(process.env.APPDATA || process.env.HOME, 'chatgbt-startup.js');
    fs.writeFileSync(globalPath, globalScript);
    console.log(`🌍 Created global startup script: ${globalPath}`);
    
    return globalPath;
  }

  // Show setup instructions
  showSetupInstructions() {
    console.log('\n🎯 Cursor Startup Setup Instructions:');
    console.log('─'.repeat(50));
    
    console.log('\n📋 Option 1: Automatic Setup (Recommended)');
    console.log('1. Run this script: npm run cursor:startup');
    console.log('2. Restart Cursor');
    console.log('3. Open any project with ChatGPT Commander integration');
    
    console.log('\n📋 Option 2: Manual Setup');
    console.log('1. Open Cursor settings (Ctrl+,)');
    console.log('2. Add to settings.json:');
    console.log('   "terminal.integrated.shellArgs.windows": ["-Command", "node C:\\\\path\\\\to\\\\cursor-startup.js"]');
    
    console.log('\n📋 Option 3: System Startup');
    console.log('1. Add to Windows Task Scheduler or macOS/Linux startup');
    console.log('2. Run: node path/to/chatgbt-startup.js');
    
    console.log('\n💡 Pro Tips:');
    console.log('- The startup script only runs in projects with ChatGPT Commander');
    console.log('- It automatically detects and sets up new projects');
    console.log('- Keyboard shortcuts are automatically configured');
    console.log('- Project context is automatically maintained');
  }
}

// Main execution
const startup = new CursorStartup();
const command = process.argv[2];

switch (command) {
  case 'setup':
  case 's':
    startup.createStartupScript();
    startup.setupCursorIntegration();
    startup.createGlobalStartup();
    startup.showSetupInstructions();
    break;
    
  case 'script':
    startup.createStartupScript();
    break;
    
  case 'settings':
    startup.setupCursorIntegration();
    break;
    
  case 'global':
    startup.createGlobalStartup();
    break;
    
  case 'instructions':
    startup.showSetupInstructions();
    break;
    
  default:
    console.log('🎯 Cursor Startup Integration for ChatGPT Commander');
    console.log('');
    console.log('Usage:');
    console.log('  npm run cursor:startup        # Full setup (recommended)');
    console.log('  node cursor-startup.js setup  # Full setup');
    console.log('  node cursor-startup.js script # Create startup script only');
    console.log('  node cursor-startup.js settings # Configure Cursor settings');
    console.log('  node cursor-startup.js global # Create global startup script');
    console.log('  node cursor-startup.js instructions # Show setup instructions');
    console.log('');
    console.log('💡 This will automatically set up ChatGPT Commander when Cursor starts');
} 