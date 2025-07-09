const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');

class LocalCommanderClient {
  constructor(cloudApiUrl, clientId) {
    this.cloudApiUrl = cloudApiUrl;
    this.clientId = clientId;
    this.cursorApiUrl = 'http://localhost:3001'; // Cursor AI API endpoint
  }

  async pollForCommands() {
    try {
      const response = await axios.get(
        `${this.cloudApiUrl}/api/commands?clientId=${this.clientId}&status=pending`
      );
      
      for (const command of response.data.commands) {
        await this.executeCommand(command);
      }
    } catch (error) {
      console.error('Error polling for commands:', error);
    }
  }

  async executeCommand(command) {
    console.log(`🤖 Executing: ${command.type}`);
    
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
        default:
          await this.handleGenericCommand(command);
      }

      // Report success
      await this.updateCommandStatus(command.id, 'completed', 'Command executed successfully');
      
    } catch (error) {
      console.error(`❌ Error executing command:`, error);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleAIAssistantInstruction(command) {
    const { assistant_id, task, context, prompts, code_examples, requirements } = command.data;
    
    console.log(`🎯 AI Assistant Task: ${task}`);
    console.log(`📝 Context: ${context}`);
    
    // Send structured instruction to Cursor AI
    const instruction = {
      type: 'ai_assistant_instruction',
      assistant_id,
      task,
      context,
      prompts,
      code_examples,
      requirements,
      timestamp: new Date().toISOString()
    };

    // Method 1: Send to Cursor AI via API (if available)
    try {
      await axios.post(`${this.cursorApiUrl}/ai/instruction`, instruction);
      console.log('✅ Instruction sent to Cursor AI');
    } catch (error) {
      console.log('⚠️ Cursor AI API not available, using alternative method');
      await this.sendToCursorViaFile(instruction);
    }
  }

  async sendToCursorViaFile(instruction) {
    // Method 2: Write instruction to a file that Cursor AI can read
    const instructionFile = './cursor-instructions.json';
    
    // Read existing instructions or create new array
    let instructions = [];
    try {
      if (fs.existsSync(instructionFile)) {
        instructions = JSON.parse(fs.readFileSync(instructionFile, 'utf8'));
      }
    } catch (error) {
      console.log('Creating new instructions file');
    }
    
    // Add new instruction
    instructions.push(instruction);
    
    // Write back to file
    fs.writeFileSync(instructionFile, JSON.stringify(instructions, null, 2));
    console.log('📄 Instruction written to cursor-instructions.json');
    
    // Trigger Cursor AI to read the file (you can implement this)
    await this.triggerCursorAI();
  }

  async triggerCursorAI() {
    // This could be a webhook, file watcher, or direct API call
    // For now, we'll just log that Cursor AI should check for new instructions
    console.log('🔔 Cursor AI should check for new instructions');
    
    // You could implement:
    // 1. Webhook to Cursor AI
    // 2. File watcher in Cursor AI
    // 3. Direct API call to Cursor AI
    // 4. Message queue system
  }

  async handleCodeFix(command) {
    const { file, error, fix } = command.data;
    console.log(`🔧 Fixing code in ${file}: ${error}`);
    
    // Implement code fixing logic
    // This could involve file editing, linting, etc.
  }

  async handleFileCreate(command) {
    const { filename, content, type } = command.data;
    console.log(`📄 Creating file: ${filename}`);
    
    // Implement file creation logic
    fs.writeFileSync(filename, content);
  }

  async handleGenericCommand(command) {
    console.log(`⚙️ Executing generic command: ${command.type}`);
    // Implement generic command execution
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
      console.error('Error updating command status:', error);
    }
  }

  // Start polling for commands
  startPolling(intervalMs = 5000) {
    console.log(`🚀 Starting command polling every ${intervalMs}ms`);
    setInterval(() => {
      this.pollForCommands();
    }, intervalMs);
  }
}

// Usage example
const commander = new LocalCommanderClient(
  'https://your-app-name.onrender.com',
  'your-client-id'
);

commander.startPolling();

module.exports = LocalCommanderClient; 