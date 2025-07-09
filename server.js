/**
 * Cloud-based ChatGPT Commander API
 * 
 * This server provides a cloud API that ChatGPT can use to send commands
 * to your local development environment. Commands are stored and can be
 * retrieved by your local commander client.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (in production, use a database like MongoDB or PostgreSQL)
let commands = [];
let clients = [];

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    commands: commands.length,
    clients: clients.length
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'ChatGPT Commander Cloud API',
    version: '1.0.0',
    description: 'Cloud-based API for ChatGPT to send commands to local development environments',
    endpoints: {
      '/health': 'Health check endpoint',
      '/api/commands': 'POST - Send commands, GET - Retrieve pending commands',
      '/api/commands/completed': 'GET - Retrieve completed commands',
      '/api/commands/:commandId': 'GET - Get specific command result',
      '/api/commands/:commandId': 'PUT - Update command status (local client)',
      '/api/clients': 'POST - Register client, GET - List clients',
      '/api/status': 'GET - System status and statistics'
    },
    commandTypes: {
      'ai_assistant_instruction': 'Send structured instructions to AI assistants',
      'code_fix': 'Fix code issues in files',
      'file_create': 'Create new files with content',
      'file_modify': 'Modify existing files',
      'file_delete': 'Delete files',
      'component_create': 'Create React components',
      'api_endpoint': 'Create API endpoints',
      'file_read': 'Read file contents and return them',
      'directory_list': 'List directory contents and structure',
      'terminal_command': 'Execute terminal commands',
      'git_operation': 'Perform Git operations (clone, pull, push, checkout)',
      'npm_operation': 'Perform NPM operations (install, uninstall, update)',
      'search_files': 'Search for text in files',
      'code_analysis': 'Analyze code for issues and patterns',
      'project_info': 'Get project information (package.json, git status)'
    },
    usage: {
      sendCommand: 'POST /api/commands with { type, data, priority }',
      getCommands: 'GET /api/commands?clientId=YOUR_CLIENT_ID',
      registerClient: 'POST /api/clients with { name, webhookUrl }'
    }
  });
});

// Command management endpoints
app.post('/api/commands', (req, res) => {
  try {
    const { type, data, priority = 'medium', source = 'chatgpt' } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type and data are required'
      });
    }

    const command = {
      id: uuidv4(),
      type,
      data,
      priority,
      source,
      timestamp: new Date().toISOString(),
      status: 'pending',
      attempts: 0,
      maxAttempts: 3
    };

    commands.push(command);

    // Notify registered clients about new command
    notifyClients(command);

    console.log(`📨 New command received: ${type} (${priority} priority)`);

    res.status(201).json({
      success: true,
      message: 'Command received and queued',
      commandId: command.id,
      timestamp: command.timestamp
    });

  } catch (error) {
    console.error('Error processing command:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/api/commands', (req, res) => {
  try {
    const { clientId, status = 'pending', limit = 10 } = req.query;
    
    let filteredCommands = commands.filter(cmd => cmd.status === status);
    
    if (clientId) {
      // Mark commands as being processed by this client
      filteredCommands = filteredCommands.map(cmd => ({
        ...cmd,
        status: 'processing',
        clientId,
        processingStarted: new Date().toISOString()
      }));
    }

    // Sort by priority and timestamp
    filteredCommands.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Limit results
    filteredCommands = filteredCommands.slice(0, parseInt(limit));

    res.json({
      commands: filteredCommands,
      total: filteredCommands.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving commands:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get completed commands (for ChatGPT to see what was done)
app.get('/api/commands/completed', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const completedCommands = commands
      .filter(cmd => cmd.status === 'completed' || cmd.status === 'failed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, parseInt(limit));

    res.json({
      commands: completedCommands,
      total: completedCommands.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving completed commands:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get specific command result (for ChatGPT to check results)
app.get('/api/commands/:commandId', (req, res) => {
  try {
    const { commandId } = req.params;
    
    const command = commands.find(cmd => cmd.id === commandId);
    if (!command) {
      return res.status(404).json({
        error: 'Command not found'
      });
    }

    res.json({
      command: {
        id: command.id,
        type: command.type,
        data: command.data,
        priority: command.priority,
        status: command.status,
        result: command.result,
        error: command.error,
        timestamp: command.timestamp,
        completedAt: command.completedAt,
        attempts: command.attempts
      }
    });

  } catch (error) {
    console.error('Error retrieving command:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Command status update
app.put('/api/commands/:commandId', (req, res) => {
  try {
    const { commandId } = req.params;
    const { status, result, error } = req.body;

    const command = commands.find(cmd => cmd.id === commandId);
    if (!command) {
      return res.status(404).json({
        error: 'Command not found'
      });
    }

    command.status = status;
    command.result = result;
    command.error = error;
    command.completedAt = new Date().toISOString();

    console.log(`✅ Command ${commandId} updated: ${status}`);

    res.json({
      success: true,
      message: 'Command status updated',
      command
    });

  } catch (error) {
    console.error('Error updating command:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Client management endpoints
app.post('/api/clients', (req, res) => {
  try {
    const { name, webhookUrl, capabilities = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Client name is required'
      });
    }

    const client = {
      id: uuidv4(),
      name,
      webhookUrl,
      capabilities,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'active'
    };

    clients.push(client);

    console.log(`🔗 New client registered: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      clientId: client.id,
      client
    });

  } catch (error) {
    console.error('Error registering client:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.get('/api/clients', (req, res) => {
  try {
    res.json({
      clients: clients.map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        lastSeen: client.lastSeen,
        capabilities: client.capabilities
      })),
      total: clients.length
    });
  } catch (error) {
    console.error('Error retrieving clients:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// System status endpoint
app.get('/api/status', (req, res) => {
  try {
    const pendingCommands = commands.filter(cmd => cmd.status === 'pending').length;
    const processingCommands = commands.filter(cmd => cmd.status === 'processing').length;
    const completedCommands = commands.filter(cmd => cmd.status === 'completed').length;
    const failedCommands = commands.filter(cmd => cmd.status === 'failed').length;

    res.json({
      system: {
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      commands: {
        total: commands.length,
        pending: pendingCommands,
        processing: processingCommands,
        completed: completedCommands,
        failed: failedCommands
      },
      clients: {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Cleanup old commands (run every hour)
cron.schedule('0 * * * *', () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const initialCount = commands.length;
  
  commands = commands.filter(cmd => {
    const commandDate = new Date(cmd.timestamp);
    return commandDate > oneWeekAgo || cmd.status === 'pending';
  });

  const removedCount = initialCount - commands.length;
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old commands`);
  }
});

// Update client last seen (run every 5 minutes)
cron.schedule('*/5 * * * *', () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  clients.forEach(client => {
    const lastSeen = new Date(client.lastSeen);
    if (lastSeen < fiveMinutesAgo) {
      client.status = 'inactive';
    }
  });
});

// Notify clients about new commands
function notifyClients(command) {
  clients.forEach(client => {
    if (client.webhookUrl && client.status === 'active') {
      // In a real implementation, you'd send a webhook notification
      console.log(`📡 Would notify client ${client.name} about new command ${command.id}`);
    }
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ChatGPT Commander Cloud API running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app; 