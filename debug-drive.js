// Load environment variables from google.env
require('dotenv').config({ path: 'google.env' });

const GoogleDriveIntegration = require('./google-drive-integration');

async function debugDrive() {
  console.log('🔍 Debugging Google Drive integration...');
  
  try {
    console.log('1. Creating GoogleDriveIntegration instance...');
    const drive = new GoogleDriveIntegration();
    
    console.log('2. Checking if drive.drive exists:', !!drive.drive);
    console.log('3. Checking folder ID:', drive.folderId);
    
    console.log('4. Testing basic API call...');
    const response = await drive.drive.files.list({
      pageSize: 10,
      fields: 'files(id, name)'
    });
    
    console.log('5. Response received:', response.data);
    console.log('6. Files found:', response.data.files.length);
    
    if (response.data.files.length > 0) {
      response.data.files.forEach(file => {
        console.log(`   - ${file.name} (${file.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

debugDrive(); 