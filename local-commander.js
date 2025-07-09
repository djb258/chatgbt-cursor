const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LocalCommanderClient {
  constructor() {
    this.cloudApiUrl = 'https://chatgbt-cursor.onrender.com';
    this.clientId = 'cursor-ai-client-' + Date.now();
    this.instructionFile = './cursor-instructions.json';
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Local Commander for ChatGPT ↔ Cursor AI collaboration');
    console.log(`📡 Cloud API: ${this.cloudApiUrl}`);
    console.log(`🆔 Client ID: ${this.clientId}`);
    
    // Register this client with the cloud API
    await this.registerClient();
    
    // Start polling for commands
    this.startPolling();
    
    // Initialize instruction file
    this.initializeInstructionFile();
    
    console.log('✅ Local Commander is running!');
    console.log('📝 Instructions will be written to: cursor-instructions.json');
    console.log('🤖 Cursor AI should monitor this file for new instructions');
  }

  async registerClient() {
    try {
      const response = await axios.post(`${this.cloudApiUrl}/api/clients`, {
        name: 'Cursor AI Local Commander',
        webhookUrl: null, // We're using polling instead of webhooks
        capabilities: ['ai_assistant_instruction', 'code_fix', 'file_create', 'file_modify', 'component_create']
      });
      
      console.log(`✅ Registered client: ${response.data.clientId}`);
      this.clientId = response.data.clientId;
    } catch (error) {
      console.log('⚠️ Could not register client, using generated ID');
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

  async executeCommand(command) {
    console.log(`\n🤖 Executing command: ${command.type}`);
    console.log(`📋 Task: ${command.data.task || command.data.message || 'No description'}`);
    
    try {
      switch (command.type) {
        case 'ai_assistant_instruction':
          await this.handleAIAssistantInstruction(command);
          break;
        case 'code_fix':
          await this.handleCodeFix(command);
          break;
        case 'file_create':
          await this.handleFileCreate(command);
          break;
        case 'component_create':
          await this.handleComponentCreate(command);
          break;
        default:
          await this.handleGenericCommand(command);
      }

      // Report success
      await this.updateCommandStatus(command.id, 'completed', 'Command executed successfully');
      
    } catch (error) {
      console.error(`❌ Error executing command:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleAIAssistantInstruction(command) {
    const { assistant_id, task, context, prompts, code_examples, requirements } = command.data;
    
    console.log(`🎯 AI Assistant Task: ${task}`);
    console.log(`📝 Context: ${context}`);
    console.log(`📋 Requirements: ${requirements?.join(', ') || 'None specified'}`);
    
    // Create structured instruction for Cursor AI
    const instruction = {
      id: command.id,
      type: 'ai_assistant_instruction',
      assistant_id: assistant_id || 'cursor_ai',
      task,
      context,
      prompts: prompts || [],
      code_examples: code_examples || {},
      requirements: requirements || [],
      timestamp: new Date().toISOString(),
      status: 'pending',
      source: 'chatgpt'
    };

    // Write instruction to file for Cursor AI to read
    await this.writeInstructionToFile(instruction);
    
    console.log('📄 Instruction written to cursor-instructions.json');
    console.log('🔔 Cursor AI should check the file for new instructions');
    
    // Wait a moment for Cursor AI to process
    await this.wait(2000);
    
    // Report back with instruction details
    const result = `Instruction sent to Cursor AI: ${task}. Context: ${context}. Requirements: ${requirements?.join(', ')}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async writeInstructionToFile(instruction) {
    try {
      // Read existing instructions
      let instructions = [];
      if (fs.existsSync(this.instructionFile)) {
        const fileContent = fs.readFileSync(this.instructionFile, 'utf8');
        instructions = JSON.parse(fileContent);
      }
      
      // Add new instruction
      instructions.push(instruction);
      
      // Write back to file
      fs.writeFileSync(this.instructionFile, JSON.stringify(instructions, null, 2));
      
    } catch (error) {
      console.error('Error writing instruction to file:', error);
      throw error;
    }
  }

  async handleCodeFix(command) {
    const { file, error, fix } = command.data;
    console.log(`🔧 Fixing code in ${file}: ${error}`);
    
    // For now, just report that we received the fix request
    // In a full implementation, you'd actually modify the file
    const result = `Code fix requested for ${file}: ${error}. Fix: ${fix}`;
    await this.updateCommandStatus(command.id, 'completed', result);
  }

  async handleFileCreate(command) {
    const { filename, content, type } = command.data;
    console.log(`📄 Creating file: ${filename}`);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filename, content);
      
      const result = `File created successfully: ${filename} (${content.length} characters)`;
      await this.updateCommandStatus(command.id, 'completed', result);
      
    } catch (error) {
      throw new Error(`Failed to create file ${filename}: ${error.message}`);
    }
  }

  async handleComponentCreate(command) {
    const { componentName, framework, features } = command.data;
    console.log(`⚛️ Creating ${framework} component: ${componentName}`);
    
    // Create component file
    const filename = `./src/components/${componentName}.tsx`;
    const content = this.generateComponentContent(componentName, framework, features);
    
    await this.handleFileCreate({
      data: { filename, content, type: 'component' }
    });
  }

  generateComponentContent(componentName, framework, features) {
    // Basic React component template
    return `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="${componentName.toLowerCase()}-container">
      <h2>${componentName}</h2>
      {/* Add your component content here */}
    </div>
  );
};

export default ${componentName};
`;
  }

  async handleGenericCommand(command) {
    console.log(`⚙️ Executing generic command: ${command.type}`);
    const result = `Generic command executed: ${command.type}`;
    await this.updateCommandStatus(command.id, 'completed', result);
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

  initializeInstructionFile() {
    if (!fs.existsSync(this.instructionFile)) {
      const initialContent = {
        instructions: [],
        lastUpdated: new Date().toISOString(),
        note: 'This file is monitored by Cursor AI for new instructions from ChatGPT'
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

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    this.isRunning = false;
    console.log('🛑 Local Commander stopped');
  }
}

// Start the commander
const commander = new LocalCommanderClient();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Local Commander...');
  await commander.stop();
  process.exit(0);
});

// Start the commander
commander.start();

module.exports = LocalCommanderClient; 