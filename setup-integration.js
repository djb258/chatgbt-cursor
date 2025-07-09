#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ChatGPT Commander Integration Setup\n');

// Check if CLI is installed
function checkCLI() {
  try {
    execSync('chatgbt --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install CLI
function installCLI() {
  console.log('📦 Installing ChatGPT Commander CLI...');
  try {
    execSync('npm install -g chatgbt-commander-cli', { stdio: 'inherit' });
    console.log('✅ CLI installed successfully!');
    return true;
  } catch (error) {
    console.log('❌ Failed to install CLI. Please install manually:');
    console.log('   npm install -g chatgbt-commander-cli');
    return false;
  }
}

// Check API status
function checkAPI() {
  console.log('🔍 Checking API status...');
  try {
    const response = execSync('curl -s https://chatgbt-cursor.onrender.com/health', { encoding: 'utf8' });
    if (response.includes('ok')) {
      console.log('✅ API is running');
      return true;
    }
  } catch (error) {
    console.log('⚠️  API might not be running. Make sure to start the server:');
    console.log('   npm start');
    return false;
  }
}

// Main setup
async function setup() {
  console.log('1. Checking CLI installation...');
  if (!checkCLI()) {
    console.log('CLI not found. Installing...');
    if (!installCLI()) {
      return;
    }
  } else {
    console.log('✅ CLI already installed');
  }

  console.log('\n2. Checking API status...');
  checkAPI();

  console.log('\n3. Setup complete! Next steps:');
  console.log('   chatgbt register    # Register as client');
  console.log('   chatgbt chat        # Start chatting');
  console.log('   chatgbt llm -l      # List available LLMs');
  
  console.log('\n🎉 You\'re ready to use ChatGPT Commander!');
}

setup().catch(console.error); 