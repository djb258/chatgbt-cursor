// Load environment variables from google.env
require('dotenv').config({ path: 'google.env' });

const GoogleDriveIntegration = require('./google-drive-integration');

async function testGoogleDrive() {
  console.log('🧪 Testing Google Drive Integration...');
  
  try {
    const drive = new GoogleDriveIntegration();
    
    // Test 1: List files
    console.log('\n📋 Testing file listing...');
    const files = await drive.listFiles();
    console.log('Files in Drive:', files.length);
    files.forEach(file => console.log(`  - ${file.name} (${file.id})`));
    
    // Test 2: Upload a test file
    console.log('\n📤 Testing file upload...');
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testFilePath = './test-upload.txt';
    
    // Create test file
    require('fs').writeFileSync(testFilePath, testContent);
    
    // Upload it
    const uploadResult = await drive.uploadFile(testFilePath, 'test-upload.txt');
    console.log('Upload result:', uploadResult);
    
    // Clean up test file
    require('fs').unlinkSync(testFilePath);
    
    console.log('\n✅ Google Drive integration test completed!');
    
  } catch (error) {
    console.error('\n❌ Google Drive integration test failed:');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check if GOOGLE_DRIVE_CREDENTIALS is set in google.env');
    console.error('2. Check if GOOGLE_DRIVE_FOLDER_ID is set in google.env');
    console.error('3. Check if service account has access to the folder');
    console.error('4. Check if Google Drive API is enabled');
  }
}

testGoogleDrive(); 