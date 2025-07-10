# Google Drive Integration Setup

This guide shows you how to set up Google Drive integration with your ChatGPT Commander system.

## 🎯 What This Enables

- **File Storage**: Store large AI outputs in Google Drive
- **File Sharing**: Share files between different machines
- **Backup**: Automatic backup of important files
- **Collaboration**: Share files with team members
- **Large File Handling**: Handle files too large for API responses

## 🚀 Quick Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API

### 2. Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details and create
4. Download the JSON credentials file

### 3. Set Up Environment Variables
Add to your `.env` file:
```bash
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### 4. Install Dependencies
```bash
npm install googleapis
```

## 📋 Detailed Setup Steps

### Step 1: Google Cloud Console Setup

1. **Create Project**
   ```bash
   # Go to https://console.cloud.google.com/
   # Create new project: "ChatGPT Commander"
   ```

2. **Enable APIs**
   - Google Drive API
   - Google Sheets API (optional, for spreadsheets)

3. **Create Service Account**
   - Name: `chatgpt-commander-drive`
   - Description: `Service account for ChatGPT Commander Google Drive integration`
   - Role: `Editor` (or custom role with Drive permissions)

4. **Download Credentials**
   - Download JSON file
   - Save as `google-drive-credentials.json` in your project root

### Step 2: Google Drive Setup

1. **Create Shared Folder**
   - Create folder: "ChatGPT Commander Output"
   - Share with service account email
   - Copy folder ID from URL

2. **Set Permissions**
   - Right-click folder > Share
   - Add service account email
   - Give "Editor" permissions

### Step 3: Environment Configuration

Add to your `.env` file:
```bash
# Google Drive Configuration
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

### Step 4: Deploy to Render

1. **Add Environment Variables**
   - Go to your Render dashboard
   - Select your ChatGPT Commander service
   - Add environment variables:
     - `GOOGLE_DRIVE_CREDENTIALS`
     - `GOOGLE_DRIVE_FOLDER_ID`

2. **Deploy**
   - Push changes to GitHub
   - Render will auto-deploy

## 🔧 API Endpoints

### List Files
```bash
GET /api/drive/files
```

### Upload File
```bash
POST /api/drive/upload
{
  "filePath": "/path/to/local/file.txt",
  "fileName": "optional-custom-name.txt"
}
```

### Download File
```bash
GET /api/drive/download/{fileId}?outputPath=/path/to/save/file.txt
```

### Search Files
```bash
GET /api/drive/search?query=project
```

### Sync Output Folder
```bash
POST /api/drive/sync
{
  "localFolder": "./output"
}
```

## 💡 Usage Examples

### From ChatGPT Commander CLI
```bash
# Upload a file
curl -X POST https://chatgbt-cursor.onrender.com/api/drive/upload \
  -H "Content-Type: application/json" \
  -d '{"filePath": "./output/analysis.txt"}'

# List files
curl https://chatgbt-cursor.onrender.com/api/drive/files

# Search for files
curl "https://chatgbt-cursor.onrender.com/api/drive/search?query=analysis"
```

### From Local Commander
```javascript
// Upload large output to Google Drive
const response = await fetch('https://chatgbt-cursor.onrender.com/api/drive/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: './output/large-analysis.json',
    fileName: 'project-analysis.json'
  })
});

// Get Google Drive link
const result = await response.json();
console.log('File uploaded:', result.file.webViewLink);
```

### Automatic Sync
```javascript
// Sync output folder after processing
await fetch('https://chatgbt-cursor.onrender.com/api/drive/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ localFolder: './output' })
});
```

## 🔄 Integration with ChatGPT Commander

### Command Types for Google Drive

Add these to your command types:

```javascript
// Upload file to Google Drive
{
  type: 'drive_upload',
  data: {
    filePath: './output/result.txt',
    fileName: 'analysis-result.txt'
  }
}

// Download file from Google Drive
{
  type: 'drive_download',
  data: {
    fileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    outputPath: './downloads/file.txt'
  }
}

// Search Google Drive
{
  type: 'drive_search',
  data: {
    query: 'project analysis'
  }
}
```

### Local Commander Integration

Add to your `local-commander.js`:

```javascript
// Handle Google Drive commands
async function handleDriveCommand(command) {
  switch (command.type) {
    case 'drive_upload':
      const uploadResponse = await fetch(`${API_BASE_URL}/api/drive/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command.data)
      });
      return await uploadResponse.json();
      
    case 'drive_download':
      const downloadResponse = await fetch(
        `${API_BASE_URL}/api/drive/download/${command.data.fileId}?outputPath=${command.data.outputPath}`
      );
      return await downloadResponse.json();
      
    case 'drive_search':
      const searchResponse = await fetch(
        `${API_BASE_URL}/api/drive/search?query=${encodeURIComponent(command.data.query)}`
      );
      return await searchResponse.json();
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Credentials Not Found**
   ```bash
   # Check environment variable
   echo $GOOGLE_DRIVE_CREDENTIALS
   
   # Or check file
   ls google-drive-credentials.json
   ```

2. **Permission Denied**
   - Make sure service account has access to folder
   - Check folder sharing settings
   - Verify folder ID is correct

3. **API Not Enabled**
   - Go to Google Cloud Console
   - Enable Google Drive API
   - Wait a few minutes for activation

4. **Rate Limits**
   - Google Drive has rate limits
   - Implement exponential backoff
   - Use batch operations for multiple files

### Testing Integration

```bash
# Test file listing
curl https://chatgbt-cursor.onrender.com/api/drive/files

# Test upload (if you have a test file)
curl -X POST https://chatgbt-cursor.onrender.com/api/drive/upload \
  -H "Content-Type: application/json" \
  -d '{"filePath": "./test.txt"}'
```

## 🎉 Benefits

- **Large File Support**: Handle files too big for API responses
- **Persistent Storage**: Files stay in Google Drive
- **Cross-Platform**: Access files from any device
- **Sharing**: Easy file sharing with team
- **Backup**: Automatic backup of important outputs
- **Integration**: Seamless with existing ChatGPT Commander workflow

Your ChatGPT Commander system now has full Google Drive integration! 🚀 