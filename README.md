# 🤖 ChatGPT Commander Cloud API

A cloud-based API service that enables **two-way communication** between ChatGPT and your local development environment. ChatGPT can send commands through this cloud API, and your local commander client can retrieve and execute them.

## 🚀 Features

- **Cloud API**: Deploy to Render, Heroku, or any cloud platform
- **Command Queue**: Store and manage commands with priority levels
- **Client Management**: Register multiple local development environments
- **Real-time Updates**: Webhook notifications for new commands
- **Security**: Rate limiting, CORS, and API key authentication
- **Monitoring**: Health checks and system status endpoints

## 📋 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ChatGPT       │    │   Cloud API     │    │   Your Local    │
│   (Anywhere)    │───▶│   (Render)      │───▶│   Development   │
│                 │    │                 │    │   Environment   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd cloud-commander
npm install
```

### 2. Environment Configuration

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Local Development

```bash
npm run dev
```

### 4. Deploy to Render

1. Push to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy!

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Send Command (ChatGPT → Cloud)
```
POST /api/commands
{
  "type": "code_fix",
  "data": {
    "file": "./components/App.jsx",
    "error": "Syntax error on line 25",
    "fix": "Add missing semicolon"
  },
  "priority": "high"
}
```

### Get Commands (Local → Cloud)
```
GET /api/commands?clientId=YOUR_CLIENT_ID&status=pending
```

### Register Client (Local → Cloud)
```
POST /api/clients
{
  "name": "My Development Machine",
  "webhookUrl": "https://my-local-server.com/webhook",
  "capabilities": ["code_fix", "file_modify", "component_create"]
}
```

## 🔧 Local Commander Client

Create a local client that polls the cloud API:

```javascript
const axios = require('axios');

class LocalCommanderClient {
  constructor(cloudApiUrl, clientId) {
    this.cloudApiUrl = cloudApiUrl;
    this.clientId = clientId;
  }

  async pollForCommands() {
    try {
      const response = await axios.get(
        `${this.cloudApiUrl}/api/commands?clientId=${this.clientId}`
      );
      
      for (const command of response.data.commands) {
        await this.executeCommand(command);
      }
    } catch (error) {
      console.error('Error polling for commands:', error);
    }
  }

  async executeCommand(command) {
    // Execute the command locally
    console.log(`Executing: ${command.type}`);
    
    // Update command status
    await axios.put(`${this.cloudApiUrl}/api/commands/${command.id}`, {
      status: 'completed',
      result: 'Command executed successfully'
    });
  }
}
```

## 🚀 Deployment to Render

### 1. Create Render Account
- Sign up at [render.com](https://render.com)

### 2. Connect GitHub Repository
- Connect your GitHub account
- Select the cloud-commander repository

### 3. Create Web Service
- **Name**: `chatgpt-commander-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for production)

### 4. Environment Variables
Set these in Render dashboard:
```
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://chat.openai.com
```

### 5. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Your API will be available at: `https://your-app-name.onrender.com`

## 🔐 Security Considerations

### Production Setup
1. **API Key Authentication**: Add API key validation
2. **Database**: Use MongoDB or PostgreSQL instead of in-memory storage
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust rate limits based on usage
5. **CORS**: Restrict allowed origins to specific domains

### Environment Variables
```bash
# Required
PORT=10000
NODE_ENV=production

# Security
ALLOWED_ORIGINS=https://chat.openai.com,https://your-domain.com
API_KEY=your-secret-api-key

# Database (for production)
DATABASE_URL=mongodb://your-mongo-url
```

## 📊 Monitoring

### Health Check
```bash
curl https://your-app-name.onrender.com/health
```

### System Status
```bash
curl https://your-app-name.onrender.com/api/status
```

### View Commands
```bash
curl https://your-app-name.onrender.com/api/commands
```

## 🔄 Usage Flow

### 1. ChatGPT Sends Command
```javascript
// ChatGPT can send commands via any HTTP client
fetch('https://your-app-name.onrender.com/api/commands', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'code_fix',
    data: { file: 'app.js', error: 'Syntax error' },
    priority: 'high'
  })
});
```

### 2. Local Client Polls for Commands
```javascript
// Your local commander polls every 30 seconds
setInterval(async () => {
  await localCommander.pollForCommands();
}, 30000);
```

### 3. Execute and Report Back
```javascript
// Local client executes command and reports status
await axios.put(`${cloudApiUrl}/api/commands/${commandId}`, {
  status: 'completed',
  result: 'Fixed syntax error on line 25'
});
```

## 🧪 Testing

### Local Testing
```bash
npm test
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test command creation
curl -X POST http://localhost:3000/api/commands \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{"message":"Hello"}}'
```

## 📈 Scaling

### For High Traffic
1. **Database**: Use MongoDB Atlas or PostgreSQL
2. **Caching**: Add Redis for command caching
3. **Load Balancing**: Use multiple instances
4. **Monitoring**: Add logging and metrics
5. **Auto-scaling**: Configure Render auto-scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create GitHub issues
- **Documentation**: Check this README
- **API Docs**: Visit `/` endpoint for interactive docs

---

**Ready to deploy?** Follow the deployment guide above and start receiving commands from ChatGPT! 🚀 