const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveIntegration {
  constructor() {
    this.drive = null;
    this.folderId = null;
    this.setupGoogleDrive();
  }

  setupGoogleDrive() {
    try {
      // Load credentials from environment or file
      const credentials = this.loadCredentials();
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth });
      
      // Set default folder ID (ChatGPT Commander output folder)
      this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
      
      console.log('✅ Google Drive integration ready');
    } catch (error) {
      console.log('⚠️ Google Drive integration not configured:', error.message);
    }
  }

  loadCredentials() {
    // Try environment variable first
    if (process.env.GOOGLE_DRIVE_CREDENTIALS) {
      return JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS);
    }
    
    // Try credentials file
    const credentialsPath = path.join(process.cwd(), 'google-drive-credentials.json');
    if (fs.existsSync(credentialsPath)) {
      return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    }
    
    throw new Error('Google Drive credentials not found');
  }

  // List files in the ChatGPT Commander folder
  async listFiles() {
    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });
      
      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Upload file to Google Drive
  async uploadFile(filePath, fileName = null) {
    try {
      const fileMetadata = {
        name: fileName || path.basename(filePath),
        parents: [this.folderId]
      };

      const media = {
        mimeType: this.getMimeType(filePath),
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      console.log(`✅ Uploaded: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Download file from Google Drive
  async downloadFile(fileId, outputPath) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      fs.writeFileSync(outputPath, response.data);
      console.log(`✅ Downloaded: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Read file content from Google Drive
  async readFile(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return response.data;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  // Search files by name or content
  async searchFiles(query) {
    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents and (name contains '${query}' or fullText contains '${query}') and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });
      
      return response.data.files;
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  // Create a new folder
  async createFolder(folderName) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
      });

      console.log(`✅ Created folder: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileInfo(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink, description'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.md': 'text/markdown',
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.py': 'text/x-python',
      '.html': 'text/html',
      '.css': 'text/css',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Sync local output folder to Google Drive
  async syncOutputFolder(localFolder = './output') {
    try {
      if (!fs.existsSync(localFolder)) {
        console.log(`📁 Creating output folder: ${localFolder}`);
        fs.mkdirSync(localFolder, { recursive: true });
      }

      const files = fs.readdirSync(localFolder);
      
      for (const file of files) {
        const filePath = path.join(localFolder, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          console.log(`📤 Syncing: ${file}`);
          await this.uploadFile(filePath, file);
        }
      }
      
      console.log('✅ Output folder synced to Google Drive');
    } catch (error) {
      console.error('Error syncing output folder:', error);
    }
  }
}

module.exports = GoogleDriveIntegration; 