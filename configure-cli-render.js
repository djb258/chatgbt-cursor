#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RENDER_URL = 'https://chatgbt-cursor.onrender.com';

console.log('🔧 Configuring CLI for Render deployment...\n');

try {
  // Check if CLI is installed
  console.log('1. Checking if CLI is installed...');
  try {
    execSync('chatgbt --version', { stdio: 'pipe' });
    console.log('✅ CLI is installed');
  } catch (error) {
    console.log('❌ CLI not found. Installing...');
    execSync('npm install -g chatgbt-commander-cli', { stdio: 'inherit' });
    console.log('✅ CLI installed');
  }

  // Configure CLI to use Render URL
  console.log('\n2. Configuring CLI to use Render deployment...');
  
  // Get user's Render app name
  const renderAppName = process.argv[2] || 'chatgbt-cursor';
  const renderUrl = `https://${renderAppName}.onrender.com`;
  
  console.log(`Using Render URL: ${renderUrl}`);
  
  // Set the API URL in CLI config
  try {
    execSync(`chatgbt config set apiUrl ${renderUrl}`, { stdio: 'inherit' });
    console.log('✅ API URL configured');
  } catch (error) {
    console.log('⚠️ Could not set API URL automatically. Please run:');
    console.log(`   chatgbt config set apiUrl ${renderUrl}`);
  }

  // Register as client
  console.log('\n3. Registering as client...');
  try {
    execSync('chatgbt register', { stdio: 'inherit' });
    console.log('✅ Client registered');
  } catch (error) {
    console.log('⚠️ Registration failed. Please run manually:');
    console.log('   chatgbt register');
  }

  // Test connection
  console.log('\n4. Testing connection to Render...');
  try {
    execSync('chatgbt chat -m "Testing connection to Render deployment"', { stdio: 'inherit' });
    console.log('✅ Connection test successful');
  } catch (error) {
    console.log('⚠️ Connection test failed. Please check:');
    console.log('   - Render deployment is running');
    console.log('   - Environment variables are set correctly');
    console.log('   - Try: chatgbt chat -m "Hello"');
  }

  // Update package.json scripts
  console.log('\n5. Updating package.json scripts...');
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Update context:upload script
  packageJson.scripts['context:upload'] = `npm run context:build && curl -X POST ${renderUrl}/api/drive/sync -H 'Content-Type: application/json' -d '{"localFolder": "./ai-context"}'`;
  
  // Add new scripts
  packageJson.scripts['cli:render:test'] = `chatgbt chat -m "Testing Render deployment from ${renderUrl}"`;
  packageJson.scripts['cli:render:context'] = `npm run context:build && curl -X POST ${renderUrl}/api/drive/sync -H 'Content-Type: application/json' -d '{"localFolder": "./ai-context"}'`;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated');

  console.log('\n🎉 CLI configuration complete!');
  console.log('\n📋 Available commands:');
  console.log('   npm run cli:render:test     # Test Render connection');
  console.log('   npm run cli:render:context  # Upload context to Render');
  console.log('   chatgbt chat               # Start interactive chat');
  console.log('   chatgbt llm -l             # List available LLMs');
  console.log('   chatgbt config -l          # View configuration');

  console.log('\n🔗 Render URL:', renderUrl);
  console.log('📚 For more info, see: RENDER-DEPLOYMENT-UPDATE.md');

} catch (error) {
  console.error('❌ Configuration failed:', error.message);
  console.log('\n🔧 Manual setup:');
  console.log('1. Install CLI: npm install -g chatgbt-commander-cli');
  console.log('2. Set API URL: chatgbt config set apiUrl https://your-app.onrender.com');
  console.log('3. Register: chatgbt register');
  console.log('4. Test: chatgbt chat -m "Hello"');
} 