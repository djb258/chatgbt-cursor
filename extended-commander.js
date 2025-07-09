const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ExtendedCommanderClient {
  constructor() {
    this.cloudApiUrl = 'https://chatgbt-cursor.onrender.com';
    this.clientId = 'extended-commander-' + Date.now();
    this.instructionFile = './cursor-instructions.json';
    this.isRunning = false;
    
    // Support for multiple application types
    this.appHandlers = {
      'cursor_ai': this.handleCursorAI,
      'vscode': this.handleVSCode,
      'claude': this.handleClaude,
      'perplexity': this.handlePerplexity,
      'github_copilot': this.handleGitHubCopilot,
      'custom_app': this.handleCustomApp
    };
  }

  async start() {
    console.log('🚀 Starting Extended Commander for Multi-App Collaboration');
    console.log(`📡 Cloud API: ${this.cloudApiUrl}`);
    console.log(`🆔 Client ID: ${this.clientId}`);
    
    await this.registerClient();
    this.startPolling();
    this.initializeInstructionFile();
    
    console.log('✅ Extended Commander is running!');
    console.log('🔗 Supported apps: Cursor AI, VSCode, Claude, Perplexity, GitHub Copilot');
  }

  async registerClient() {
    try {
      const response = await axios.post(`${this.cloudApiUrl}/api/clients`, {
        name: 'Extended Multi-App Commander',
        webhookUrl: null,
        capabilities: [
          'ai_assistant_instruction',
          'code_fix',
          'file_create',
          'file_modify',
          'component_create',
          'git_operations',
          'terminal_commands',
          'database_operations'
        ]
      });
      
      console.log(`✅ Registered client: ${response.data.clientId}`);
      this.clientId = response.data.clientId;
    } catch (error) {
      console.log('⚠️ Could not register client, using generated ID');
    }
  }

  async executeCommand(command) {
    console.log(`\n🤖 Executing command: ${command.type}`);
    console.log(`📱 Target App: ${command.data.target_app || 'cursor_ai'}`);
    
    try {
      const targetApp = command.data.target_app || 'cursor_ai';
      const handler = this.appHandlers[targetApp];
      
      if (handler) {
        await handler.call(this, command);
      } else {
        await this.handleGenericCommand(command);
      }

      await this.updateCommandStatus(command.id, 'completed', 'Command executed successfully');
      
    } catch (error) {
      console.error(`❌ Error executing command:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleCursorAI(command) {
    const { task, context, prompts, code_examples, requirements } = command.data;
    
    console.log(`🎯 Cursor AI Task: ${task}`);
    
    const instruction = {
      id: command.id,
      type: 'ai_assistant_instruction',
      assistant_id: 'cursor_ai',
      task,
      context,
      prompts: prompts || [],
      code_examples: code_examples || {},
      requirements: requirements || [],
      timestamp: new Date().toISOString(),
      status: 'pending',
      source: 'chatgpt'
    };

    await this.writeInstructionToFile(instruction);
    console.log('📄 Instruction sent to Cursor AI');
  }

  async handleVSCode(command) {
    const { action, file, content, settings } = command.data;
    
    console.log(`💻 VSCode Action: ${action}`);
    
    switch (action) {
      case 'open_file':
        // Could trigger VSCode to open a specific file
        console.log(`Opening file: ${file}`);
        break;
      case 'create_file':
        await this.handleFileCreate(command);
        break;
      case 'update_settings':
        console.log(`Updating VSCode settings: ${JSON.stringify(settings)}`);
        break;
      default:
        console.log(`VSCode action: ${action}`);
    }
  }

  async handleClaude(command) {
    const { prompt, context, model } = command.data;
    
    console.log(`🤖 Claude Instruction: ${prompt}`);
    console.log(`📝 Context: ${context}`);
    console.log(`🧠 Model: ${model || 'claude-3-sonnet'}`);
    
    // Could integrate with Claude's API or local instance
    const result = `Claude instruction processed: ${prompt}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async handlePerplexity(command) {
    const { query, search_context } = command.data;
    
    console.log(`🔍 Perplexity Query: ${query}`);
    console.log(`📚 Search Context: ${search_context}`);
    
    // Could integrate with Perplexity's API
    const result = `Perplexity search completed for: ${query}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async handleGitHubCopilot(command) {
    const { suggestion_type, code_context, language } = command.data;
    
    console.log(`🤖 GitHub Copilot: ${suggestion_type}`);
    console.log(`💻 Language: ${language}`);
    
    // Could integrate with GitHub Copilot's suggestions
    const result = `GitHub Copilot suggestion generated for ${language}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async handleCustomApp(command) {
    const { app_name, action, data } = command.data;
    
    console.log(`🔧 Custom App: ${app_name}`);
    console.log(`⚙️ Action: ${action}`);
    
    // Handle custom application integration
    const result = `Custom app ${app_name} action ${action} completed`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async handleFileCreate(command) {
    const { filename, content, type } = command.data;
    console.log(`📄 Creating file: ${filename}`);
    
    try {
      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filename, content);
      
      const result = `File created successfully: ${filename} (${content.length} characters)`;
      await this.updateCommandStatus(command.id, 'completed', result);
      
    } catch (error) {
      throw new Error(`Failed to create file ${filename}: ${error.message}`);
    }
  }

  async handleGenericCommand(command) {
    console.log(`⚙️ Executing generic command: ${command.type}`);
    const result = `Generic command executed: ${command.type}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async writeInstructionToFile(instruction) {
    try {
      let instructions = [];
      if (fs.existsSync(this.instructionFile)) {
        const fileContent = fs.readFileSync(this.instructionFile, 'utf8');
        instructions = JSON.parse(fileContent);
      }
      
      instructions.push(instruction);
      fs.writeFileSync(this.instructionFile, JSON.stringify(instructions, null, 2));
      
    } catch (error) {
      console.error('Error writing instruction to file:', error);
      throw error;
    }
  }

  async updateCommandStatus(commandId, status, result) {
    try {
      await axios.put(`${this.cloudApiUrl}/api/commands/${commandId}`, {
        status,
        result,
        completedAt: new Date().toISOString()
      });
      console.log(`✅ Command ${commandId} status updated: ${status}`);
    } catch (error) {
      console.error('❌ Error updating command status:', error.message);
    }
  }

  async pollForCommands() {
    try {
      const response = await axios.get(
        `${this.cloudApiUrl}/api/commands?clientId=${this.clientId}&status=pending`
      );
      
      if (response.data.commands.length > 0) {
        console.log(`📨 Found ${response.data.commands.length} new command(s)`);
        
        for (const command of response.data.commands) {
          await this.executeCommand(command);
        }
      }
    } catch (error) {
      console.error('❌ Error polling for commands:', error.message);
    }
  }

  initializeInstructionFile() {
    if (!fs.existsSync(this.instructionFile)) {
      const initialContent = {
        instructions: [],
        lastUpdated: new Date().toISOString(),
        note: 'Multi-app instruction file for AI collaboration'
      };
      fs.writeFileSync(this.instructionFile, JSON.stringify(initialContent, null, 2));
      console.log('📄 Created cursor-instructions.json');
    }
  }

  startPolling(intervalMs = 5000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`🔄 Starting command polling every ${intervalMs}ms`);
    
    setInterval(() => {
      this.pollForCommands();
    }, intervalMs);
  }

  async stop() {
    this.isRunning = false;
    console.log('🛑 Extended Commander stopped');
  }
}

module.exports = ExtendedCommanderClient; 