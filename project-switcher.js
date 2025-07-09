#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ProjectSwitcher {
  constructor() {
    this.configDir = path.join(os.homedir(), '.chatgbt');
    this.projectsFile = path.join(this.configDir, 'projects.json');
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  getCurrentProject() {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);
    const projectPath = cwd;
    
    return {
      name: projectName,
      path: projectPath,
      timestamp: new Date().toISOString()
    };
  }

  saveProjectConfig(project) {
    let projects = {};
    
    if (fs.existsSync(this.projectsFile)) {
      projects = JSON.parse(fs.readFileSync(this.projectsFile, 'utf8'));
    }

    projects[project.name] = {
      ...project,
      lastAccessed: new Date().toISOString()
    };

    fs.writeFileSync(this.projectsFile, JSON.stringify(projects, null, 2));
  }

  switchToProject(projectName) {
    try {
      // Set project-specific environment
      process.env.CHATGBT_PROJECT = projectName;
      
      // Update CLI configuration for this project
      this.updateCLIConfig(projectName);
      
      console.log(`🎯 Switched to project: ${projectName}`);
      console.log(`📁 Working directory: ${process.cwd()}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to switch to project: ${error.message}`);
      return false;
    }
  }

  updateCLIConfig(projectName) {
    try {
      // Set project-specific settings
      execSync(`chatgbt config set project.name "${projectName}"`, { stdio: 'ignore' });
      execSync(`chatgbt config set project.path "${process.cwd()}"`, { stdio: 'ignore' });
      execSync(`chatgbt config set project.timestamp "${new Date().toISOString()}"`, { stdio: 'ignore' });
      
      // Set context for AI
      const context = this.getProjectContext();
      execSync(`chatgbt config set context "${context}"`, { stdio: 'ignore' });
      
    } catch (error) {
      console.log('⚠️  CLI not configured, continuing...');
    }
  }

  getProjectContext() {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);
    
    // Try to detect project type
    let projectType = 'unknown';
    let context = `Working on project: ${projectName}`;
    
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
      projectType = 'node';
      context += ` (Node.js project: ${pkg.name || 'unnamed'})`;
    } else if (fs.existsSync(path.join(cwd, 'requirements.txt'))) {
      projectType = 'python';
      context += ' (Python project)';
    } else if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
      projectType = 'rust';
      context += ' (Rust project)';
    } else if (fs.existsSync(path.join(cwd, 'pom.xml'))) {
      projectType = 'java';
      context += ' (Java project)';
    }
    
    // Add file structure info
    const files = fs.readdirSync(cwd).slice(0, 5);
    context += ` | Files: ${files.join(', ')}`;
    
    return context;
  }

  listProjects() {
    if (!fs.existsSync(this.projectsFile)) {
      console.log('No projects configured yet.');
      return;
    }

    const projects = JSON.parse(fs.readFileSync(this.projectsFile, 'utf8'));
    console.log('\n📋 Configured Projects:');
    console.log('─'.repeat(50));
    
    Object.entries(projects).forEach(([name, project]) => {
      const lastAccessed = new Date(project.lastAccessed).toLocaleDateString();
      console.log(`📁 ${name.padEnd(20)} | ${lastAccessed} | ${project.path}`);
    });
  }

  autoSwitch() {
    const currentProject = this.getCurrentProject();
    this.saveProjectConfig(currentProject);
    this.switchToProject(currentProject.name);
    
    console.log('\n🚀 Ready to work on this project!');
    console.log('💡 Use: chatgbt chat -m "Help me with this project"');
  }
}

// CLI Interface
const switcher = new ProjectSwitcher();
const command = process.argv[2];

switch (command) {
  case 'switch':
  case 's':
    const projectName = process.argv[3];
    if (projectName) {
      switcher.switchToProject(projectName);
    } else {
      switcher.autoSwitch();
    }
    break;
    
  case 'list':
  case 'l':
    switcher.listProjects();
    break;
    
  case 'auto':
  case 'a':
    switcher.autoSwitch();
    break;
    
  default:
    console.log('🎯 ChatGPT Commander Project Switcher');
    console.log('');
    console.log('Usage:');
    console.log('  node project-switcher.js switch [project]  # Switch to specific project');
    console.log('  node project-switcher.js auto             # Auto-detect and switch');
    console.log('  node project-switcher.js list             # List all projects');
    console.log('');
    console.log('Examples:');
    console.log('  node project-switcher.js auto             # Auto-switch to current project');
    console.log('  node project-switcher.js switch my-app    # Switch to "my-app" project');
    console.log('');
    console.log('💡 Add this to your Cursor startup or use as a pre-command hook');
} 