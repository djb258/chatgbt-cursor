// Load environment variables from google.env
require('dotenv').config({ path: 'google.env' });

const GoogleDriveIntegration = require('./google-drive-integration');

async function createChatGPTCommanderFolder() {
  console.log('📁 Creating ChatGPT Commander folder in Google Drive...');
  
  try {
    const drive = new GoogleDriveIntegration();
    
    // Create a new folder in the root
    const folderMetadata = {
      name: 'ChatGPT Commander Output',
      mimeType: 'application/vnd.google-apps.folder'
    };

    const response = await drive.drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, webViewLink'
    });

    const folder = response.data;
    console.log(`✅ Created folder: ${folder.name}`);
    console.log(`📋 Folder ID: ${folder.id}`);
    console.log(`🔗 Folder Link: ${folder.webViewLink}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Copy the folder ID above');
    console.log('2. Update GOOGLE_DRIVE_FOLDER_ID in google.env');
    console.log('3. Share the folder with your personal Google account if needed');
    
    return folder.id;
    
  } catch (error) {
    console.error('❌ Error creating folder:', error.message);
  }
}

createChatGPTCommanderFolder(); 