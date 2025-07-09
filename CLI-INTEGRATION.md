# ChatGPT Commander CLI Integration Guide

This guide shows how to integrate the ChatGPT Commander CLI with your main cloud API project.

## 🎯 Integration Options

### Option 1: Keep Separate (Recommended)
- **CLI**: [chatgbt-commander-cli](https://github.com/djb258/chatgbt-commander-cli) (separate repo)
- **API**: `chatgpt-commander-cloud` (this repo)
- **Benefits**: Clean separation, independent versioning, easier maintenance

### Option 2: Use Together
- Install CLI globally and use with your local API
- Perfect for development and testing

## 🚀 Quick Integration

### 1. Automatic Setup
```bash
# Run the integration script
npm run integrate
```

### 2. Manual Setup
```bash
# Install CLI globally
npm run cli:setup

# Register as client
chatgbt register

# Test the connection
chatgbt chat -m "Hello from integration!"
```

## 🔧 Configuration

### CLI Configuration
The CLI will automatically connect to your cloud API at:
- **Production**: `https://chatgbt-cursor.onrender.com`
- **Local**: `http://localhost:3000` (when running locally)

### Environment Variables
```bash
# In your .env file
API_BASE_URL=https://chatgbt-cursor.onrender.com
CLIENT_ID=your-client-id
```

## 📋 Usage Examples

### Basic Integration
```bash
# Start your API
npm start

# In another terminal, use CLI
chatgbt chat
```

### Development Workflow
```bash
# 1. Start API in development mode
npm run dev

# 2. Use CLI for testing
chatgbt chat -m "Create a new file called test.js"

# 3. Check command queue
curl http://localhost:3000/api/commands

# 4. Execute commands locally
node local-commander.js
```

### Multi-LLM Testing
```bash
# Test different AI models
chatgbt llm -s chatgpt
chatgbt chat -m "Write a React component"

chatgbt llm -s claude
chatgbt chat -m "Review this code for best practices"

chatgbt llm -s gemini
chatgbt chat -m "Analyze this dataset"
```

## 🔗 API Endpoints Used by CLI

The CLI communicates with these endpoints:

- `POST /api/chat` - Send messages to AI
- `GET /api/llm/providers` - List available LLMs
- `POST /api/clients/register` - Register new client
- `GET /api/health` - Check API status

## 🛠️ Development

### Local Development
```bash
# Terminal 1: Start API
npm run dev

# Terminal 2: Use CLI
chatgbt chat

# Terminal 3: Monitor logs
tail -f logs/api.log
```

### Testing Integration
```bash
# Test CLI commands
npm run cli:test

# Test API endpoints
curl http://localhost:3000/api/health

# Test full workflow
chatgbt register && chatgbt chat -m "Test message"
```

## 📦 Publishing

### CLI Package
```bash
# CLI is already published at: https://github.com/djb258/chatgbt-commander-cli
# Install globally
npm install -g chatgbt-commander-cli

# Or install from GitHub
npm install -g https://github.com/djb258/chatgbt-commander-cli.git
```

### API Deployment
```bash
# Deploy to Render/Heroku
git push heroku main

# Update CLI to use new API URL
chatgbt config set api.url https://your-new-api.onrender.com
```

## 🔍 Troubleshooting

### Common Issues

1. **CLI not found**
   ```bash
   npm install -g chatgbt-commander-cli
   ```

2. **API connection failed**
   ```bash
   # Check if API is running
   curl http://localhost:3000/api/health
   
   # Start API if needed
   npm start
   ```

3. **Registration failed**
   ```bash
   # Clear CLI config
   chatgbt config clear
   
   # Re-register
   chatgbt register
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* chatgbt chat

# Check CLI logs
chatgbt config -l
```

## 🎉 Success!

You now have a complete ChatGPT Commander ecosystem:
- ✅ Cloud API for command processing
- ✅ CLI for universal access
- ✅ Multi-LLM support
- ✅ Local command execution
- ✅ Cross-platform compatibility

Happy coding with AI! 🤖✨ 