// Load environment variables from google.env
require('dotenv').config({ path: 'google.env' });

const GoogleDriveIntegration = require('./google-drive-integration');

async function listAllFolders() {
  console.log('🔍 Listing all accessible Google Drive folders...');
  
  try {
    const drive = new GoogleDriveIntegration();
    
    // List all folders accessible to the service account
    const response = await drive.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, parents, webViewLink)',
      orderBy: 'name'
    });
    
    console.log(`\n📁 Found ${response.data.files.length} folders:`);
    response.data.files.forEach(folder => {
      console.log(`  - ${folder.name} (ID: ${folder.id})`);
      if (folder.webViewLink) {
        console.log(`    Link: ${folder.webViewLink}`);
      }
    });
    
    // Also list root-level files to see what's accessible
    console.log('\n📄 Root level files:');
    const rootFiles = await drive.drive.files.list({
      q: "trashed=false and 'root' in parents",
      fields: 'files(id, name, mimeType)',
      orderBy: 'name'
    });
    
    rootFiles.data.files.forEach(file => {
      console.log(`  - ${file.name} (${file.mimeType}) - ID: ${file.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing folders:', error.message);
  }
}

listAllFolders(); 