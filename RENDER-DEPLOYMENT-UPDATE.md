# Render Deployment Update - Google Drive Integration

## Overview
The ChatGPT Commander Cloud API now includes Google Drive integration. This guide explains how to update your Render deployment.

## What's New
- Google Drive API integration for file storage and retrieval
- New API endpoints for Drive operations
- Enhanced context building with Google Drive sync

## Required Environment Variables

Add these environment variables to your Render deployment:

### Google Drive API Configuration
```
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n","client_email":"your_service_account_email@your_project.iam.gserviceaccount.com","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## How to Update Render Deployment

### Option 1: Via Render Dashboard
1. Go to your Render dashboard
2. Select your ChatGPT Commander service
3. Go to "Environment" tab
4. Add the new environment variables above
5. Redeploy the service

### Option 2: Via Render CLI
```bash
# Update environment variables
render env set GOOGLE_DRIVE_CREDENTIALS '{"type":"service_account",...}'
render env set GOOGLE_DRIVE_FOLDER_ID 'your_folder_id_here'

# Redeploy
render deploy
```

## New API Endpoints

After deployment, these endpoints will be available:

- `GET /api/drive/files` - List files in Google Drive
- `POST /api/drive/upload` - Upload file to Google Drive
- `GET /api/drive/download/:fileId` - Download file from Google Drive
- `GET /api/drive/search?q=query` - Search files in Google Drive
- `POST /api/drive/sync` - Sync local output folder to Google Drive

## Testing the Deployment

After updating, test the integration:

```bash
# Test file listing
curl https://your-render-app.onrender.com/api/drive/files

# Test context upload
curl -X POST https://your-render-app.onrender.com/api/drive/sync \
  -H 'Content-Type: application/json' \
  -d '{"localFolder": "./ai-context"}'
```

## CLI Configuration for Render

Configure the CLI to work with your Render deployment:

### Automatic Setup
```bash
# Configure CLI for Render (uses default app name: chatgbt-cursor)
npm run cli:render:setup

# Or specify your app name
node configure-cli-render.js your-app-name
```

### Manual Setup
```bash
# Install CLI globally
npm install -g chatgbt-commander-cli

# Set API URL to your Render deployment
chatgbt config set apiUrl https://your-app-name.onrender.com

# Register as client
chatgbt register

# Test connection
chatgbt chat -m "Hello from Render!"
```

### Available CLI Commands
```bash
npm run cli:render:test     # Test Render connection
npm run cli:render:context  # Upload context to Render
chatgbt chat               # Start interactive chat
chatgbt llm -l             # List available LLMs
chatgbt config -l          # View configuration
```

## Security Notes
- The `google.env` file is excluded from git tracking
- Use Render's environment variables for production credentials
- Never commit actual service account keys to the repository

## Troubleshooting
- If you get "Google Drive integration not configured" errors, check that environment variables are set correctly
- If you get "The specified parent is not a folder" errors, verify the folder ID is correct
- Ensure the service account has the necessary Google Drive API permissions 