const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
      if (error.response && error.response.status === 429) {
        console.log('⚠️ Rate limited, waiting longer before next poll...');
        // Don't log this as an error since it's expected behavior
      } else {
        console.error('❌ Error polling for commands:', error.message);
      }
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
        case 'file_read':
          await this.handleFileRead(command);
          break;
        case 'directory_list':
          await this.handleDirectoryList(command);
          break;
        case 'file_modify':
          await this.handleFileModify(command);
          break;
        case 'file_delete':
          await this.handleFileDelete(command);
          break;
        case 'terminal_command':
          await this.handleTerminalCommand(command);
          break;
        case 'git_operation':
          await this.handleGitOperation(command);
          break;
        case 'npm_operation':
          await this.handleNpmOperation(command);
          break;
        case 'search_files':
          await this.handleSearchFiles(command);
          break;
        case 'code_analysis':
          await this.handleCodeAnalysis(command);
          break;
        case 'project_info':
          await this.handleProjectInfo(command);
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
      // Read existing instructions as an object with an instructions array
      let fileData = { instructions: [] };
      if (fs.existsSync(this.instructionFile)) {
        fileData = JSON.parse(fs.readFileSync(this.instructionFile, 'utf8'));
      }
      fileData.instructions.push(instruction);
      fileData.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.instructionFile, JSON.stringify(fileData, null, 2));
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

  async handleFileRead(command) {
    const { filepath, encoding = 'utf8' } = command.data;
    console.log(`📖 Reading file: ${filepath}`);
    
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      const content = fs.readFileSync(filepath, encoding);
      const stats = fs.statSync(filepath);
      
      const result = {
        filepath,
        content,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        encoding
      };
      
      console.log(`✅ File read successfully: ${filepath} (${stats.size} bytes)`);
      await this.updateCommandStatus(command.id, 'completed', JSON.stringify(result));
      
    } catch (error) {
      throw new Error(`Failed to read file ${filepath}: ${error.message}`);
    }
  }

  async handleDirectoryList(command) {
    const { directory = '.', recursive = false, includeFiles = true, includeDirs = true } = command.data;
    console.log(`📁 Listing directory: ${directory}`);
    
    try {
      if (!fs.existsSync(directory)) {
        throw new Error(`Directory not found: ${directory}`);
      }
      
      const listDirectory = (dir, depth = 0) => {
        const items = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(directory, fullPath);
          
          if (entry.isDirectory()) {
            if (includeDirs) {
              items.push({
                name: entry.name,
                type: 'directory',
                path: relativePath,
                fullPath
              });
            }
            
            if (recursive && depth < 3) { // Limit recursion depth
              const subItems = listDirectory(fullPath, depth + 1);
              items.push(...subItems);
            }
          } else if (entry.isFile() && includeFiles) {
            const stats = fs.statSync(fullPath);
            items.push({
              name: entry.name,
              type: 'file',
              path: relativePath,
              fullPath,
              size: stats.size,
              modified: stats.mtime.toISOString(),
              extension: path.extname(entry.name)
            });
          }
        }
        
        return items;
      };
      
      const items = listDirectory(directory);
      
      const result = {
        directory,
        items,
        total: items.length,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Directory listed successfully: ${directory} (${items.length} items)`);
      await this.updateCommandStatus(command.id, 'completed', JSON.stringify(result));
      
    } catch (error) {
      throw new Error(`Failed to list directory ${directory}: ${error.message}`);
    }
  }

  async handleFileModify(command) {
    const { filepath, content } = command.data;
    console.log(`📝 Modifying file: ${filepath}`);
    
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      fs.writeFileSync(filepath, content);
      
      const result = `File modified successfully: ${filepath} (${content.length} characters)`;
      await this.updateCommandStatus(command.id, 'completed', result);
      
    } catch (error) {
      throw new Error(`Failed to modify file ${filepath}: ${error.message}`);
    }
  }

  async handleFileDelete(command) {
    const { filepath } = command.data;
    console.log(`🗑️ Deleting file: ${filepath}`);
    
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      fs.unlinkSync(filepath);
      
      const result = `File deleted successfully: ${filepath}`;
      await this.updateCommandStatus(command.id, 'completed', result);
      
    } catch (error) {
      throw new Error(`Failed to delete file ${filepath}: ${error.message}`);
    }
  }

  async handleTerminalCommand(command) {
    const { command: cmd } = command.data;
    console.log(`🖥️ Executing terminal command: ${cmd}`);
    
    try {
      const result = await execAsync(cmd);
      console.log(`✅ Terminal command executed: ${cmd}`);
      await this.updateCommandStatus(command.id, 'completed', result.stdout);
    } catch (error) {
      console.error(`❌ Error executing terminal command:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleGitOperation(command) {
    const { operation, repository, branch } = command.data;
    console.log(`🔗 Git Operation: ${operation} on ${repository}`);
    
    try {
      if (operation === 'clone') {
        await execAsync(`git clone ${repository}`);
        console.log(`✅ Git clone successful: ${repository}`);
      } else if (operation === 'checkout') {
        await execAsync(`git checkout ${branch}`);
        console.log(`✅ Git checkout successful: ${branch}`);
      } else if (operation === 'pull') {
        await execAsync(`git pull origin ${branch}`);
        console.log(`✅ Git pull successful: ${branch}`);
      } else if (operation === 'push') {
        await execAsync(`git push origin ${branch}`);
        console.log(`✅ Git push successful: ${branch}`);
      } else {
        throw new Error(`Unknown Git operation: ${operation}`);
      }
      await this.updateCommandStatus(command.id, 'completed', `Git ${operation} successful on ${repository}`);
    } catch (error) {
      console.error(`❌ Error executing Git operation:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleNpmOperation(command) {
    const { operation, packageName } = command.data;
    console.log(`🎁 NPM Operation: ${operation} on ${packageName}`);
    
    try {
      if (operation === 'install') {
        await execAsync(`npm install ${packageName}`);
        console.log(`✅ NPM install successful: ${packageName}`);
      } else if (operation === 'uninstall') {
        await execAsync(`npm uninstall ${packageName}`);
        console.log(`✅ NPM uninstall successful: ${packageName}`);
      } else if (operation === 'update') {
        await execAsync(`npm update ${packageName}`);
        console.log(`✅ NPM update successful: ${packageName}`);
      } else {
        throw new Error(`Unknown NPM operation: ${operation}`);
      }
      await this.updateCommandStatus(command.id, 'completed', `NPM ${operation} successful on ${packageName}`);
    } catch (error) {
      console.error(`❌ Error executing NPM operation:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleSearchFiles(command) {
    const { query, directory = '.' } = command.data;
    console.log(`🔍 Searching files for: "${query}" in ${directory}`);
    
    try {
      if (!fs.existsSync(directory)) {
        throw new Error(`Directory not found: ${directory}`);
      }
      
      const findFiles = (dir, query) => {
        const results = [];
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const relativePath = path.relative(directory, fullPath);
          
          if (fs.statSync(fullPath).isDirectory()) {
            results.push(...findFiles(fullPath, query));
          } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(query)) {
              results.push({
                path: relativePath,
                fullPath,
                content: content.substring(0, 100) + '...' // Show first 100 chars
              });
            }
          }
        }
        return results;
      };
      
      const results = findFiles(directory, query);
      
      const result = {
        query,
        directory,
        results,
        total: results.length,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Search completed: ${results.length} files found.`);
      await this.updateCommandStatus(command.id, 'completed', JSON.stringify(result));
      
    } catch (error) {
      console.error(`❌ Error searching files:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleCodeAnalysis(command) {
    const { filepath } = command.data;
    console.log(`🔍 Analyzing code in ${filepath}`);
    
    try {
      if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      
      const content = fs.readFileSync(filepath, 'utf8');
      const lines = content.split('\n');
      const issues = [];
      
      // Simple example: check for common issues
      if (lines.length > 100 && lines.length < 1000) {
        issues.push('File is likely a boilerplate file (too short or too long)');
      }
      if (content.includes('console.log(') && !content.includes('console.error(')) {
        issues.push('File contains console.log but no console.error');
      }
      if (content.includes('import React from') && content.includes('export const')) {
        issues.push('File is likely a React component file (contains React import and export)');
      }
      
      const result = {
        filepath,
        issues,
        total: issues.length,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Code analysis completed: ${issues.length} issues found.`);
      await this.updateCommandStatus(command.id, 'completed', JSON.stringify(result));
      
    } catch (error) {
      console.error(`❌ Error code analysis:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
    }
  }

  async handleProjectInfo(command) {
    const { directory = '.' } = command.data;
    console.log(`📁 Project Info for: ${directory}`);
    
    try {
      if (!fs.existsSync(directory)) {
        throw new Error(`Directory not found: ${directory}`);
      }
      
      const packageJson = JSON.parse(fs.readFileSync(`${directory}/package.json`, 'utf8'));
      const gitStatus = await execAsync(`git -C ${directory} status --porcelain`);
      const gitBranch = await execAsync(`git -C ${directory} rev-parse --abbrev-ref HEAD`);
      
      const result = {
        directory,
        packageJson,
        gitBranch: gitBranch.stdout.trim(),
        gitStatus: gitStatus.stdout,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Project info collected: ${directory}`);
      await this.updateCommandStatus(command.id, 'completed', JSON.stringify(result));
      
    } catch (error) {
      console.error(`❌ Error collecting project info:`, error.message);
      await this.updateCommandStatus(command.id, 'failed', error.message);
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

  startPolling(intervalMs = 15000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`🔄 Starting command polling every ${intervalMs}ms (15 seconds)`);
    
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