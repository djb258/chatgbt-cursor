#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const GoogleDriveIntegration = require('./google-drive-integration');

class ProjectContextBuilder {
  constructor() {
    this.projectRoot = process.cwd();
    this.contextFolder = './ai-context';
    this.googleDrive = new GoogleDriveIntegration();
  }

  // Build comprehensive project context
  async buildProjectContext() {
    console.log('🏗️  Building project context for AI...');
    
    // Create context folder
    if (!fs.existsSync(this.contextFolder)) {
      fs.mkdirSync(this.contextFolder, { recursive: true });
    }

    const context = {
      project: this.analyzeProject(),
      structure: this.analyzeFileStructure(),
      dependencies: this.analyzeDependencies(),
      git: this.analyzeGitHistory(),
      recent: this.analyzeRecentChanges(),
      documentation: this.findDocumentation(),
      configuration: this.analyzeConfiguration()
    };

    // Save context to files
    await this.saveContextFiles(context);
    
    // Upload to Google Drive
    await this.uploadToGoogleDrive();
    
    console.log('✅ Project context built and uploaded to Google Drive');
    return context;
  }

  // Analyze project metadata
  analyzeProject() {
    const project = {
      name: path.basename(this.projectRoot),
      path: this.projectRoot,
      timestamp: new Date().toISOString()
    };

    // Read package.json if exists
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        project.name = pkg.name || project.name;
        project.description = pkg.description;
        project.version = pkg.version;
        project.scripts = pkg.scripts;
        project.keywords = pkg.keywords;
      } catch (error) {
        console.log('⚠️  Could not parse package.json');
      }
    }

    // Read README if exists
    const readmePath = path.join(this.projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
      project.readme = fs.readFileSync(readmePath, 'utf8').substring(0, 2000) + '...';
    }

    return project;
  }

  // Analyze file structure
  analyzeFileStructure() {
    const structure = {
      files: [],
      directories: [],
      totalFiles: 0,
      totalSize: 0
    };

    const scanDirectory = (dir, depth = 0) => {
      if (depth > 3) return; // Limit depth
      
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const relativePath = path.relative(this.projectRoot, itemPath);
          
          // Skip node_modules, .git, etc.
          if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
            return;
          }

          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            structure.directories.push({
              path: relativePath,
              size: this.getDirectorySize(itemPath)
            });
            scanDirectory(itemPath, depth + 1);
          } else {
            structure.files.push({
              path: relativePath,
              size: stats.size,
              modified: stats.mtime.toISOString(),
              extension: path.extname(item)
            });
            structure.totalFiles++;
            structure.totalSize += stats.size;
          }
        });
      } catch (error) {
        console.log(`⚠️  Could not scan directory: ${dir}`);
      }
    };

    scanDirectory(this.projectRoot);
    
    // Sort by size and get top files
    structure.files.sort((a, b) => b.size - a.size);
    structure.topFiles = structure.files.slice(0, 20);
    
    return structure;
  }

  // Get directory size
  getDirectorySize(dirPath) {
    let size = 0;
    try {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
          size += this.getDirectorySize(itemPath);
        } else {
          size += stats.size;
        }
      });
    } catch (error) {
      // Ignore errors
    }
    return size;
  }

  // Analyze dependencies
  analyzeDependencies() {
    const dependencies = {
      node: null,
      python: null,
      other: []
    };

    // Node.js dependencies
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        dependencies.node = {
          dependencies: pkg.dependencies || {},
          devDependencies: pkg.devDependencies || {},
          totalDeps: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length
        };
      } catch (error) {
        console.log('⚠️  Could not analyze Node.js dependencies');
      }
    }

    // Python dependencies
    const requirementsPath = path.join(this.projectRoot, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      try {
        const requirements = fs.readFileSync(requirementsPath, 'utf8')
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => line.split('==')[0]);
        dependencies.python = {
          requirements: requirements,
          totalDeps: requirements.length
        };
      } catch (error) {
        console.log('⚠️  Could not analyze Python dependencies');
      }
    }

    return dependencies;
  }

  // Analyze Git history
  analyzeGitHistory() {
    const git = {
      hasGit: false,
      branch: null,
      lastCommit: null,
      recentCommits: [],
      contributors: []
    };

    try {
      // Check if git exists
      execSync('git status', { cwd: this.projectRoot, stdio: 'ignore' });
      git.hasGit = true;

      // Get current branch
      git.branch = execSync('git branch --show-current', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();

      // Get last commit
      git.lastCommit = execSync('git log -1 --format="%H|%an|%ae|%s|%ci"', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();

      // Get recent commits
      const recentCommits = execSync('git log --oneline -10', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim().split('\n');
      
      git.recentCommits = recentCommits.map(commit => {
        const [hash, ...message] = commit.split(' ');
        return { hash, message: message.join(' ') };
      });

      // Get contributors
      const contributors = execSync('git shortlog -sn --all', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim().split('\n');
      
      git.contributors = contributors.map(contributor => {
        const [count, ...name] = contributor.split('\t');
        return { count: parseInt(count), name: name.join(' ') };
      });

    } catch (error) {
      console.log('⚠️  Git analysis failed or not a git repository');
    }

    return git;
  }

  // Analyze recent changes
  analyzeRecentChanges() {
    const changes = {
      modifiedFiles: [],
      newFiles: [],
      deletedFiles: []
    };

    try {
      // Get modified files in last 7 days
      const modified = execSync('git diff --name-only --since="7 days ago"', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim().split('\n').filter(Boolean);
      
      changes.modifiedFiles = modified;

      // Get new files
      const newFiles = execSync('git ls-files --others --exclude-standard', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim().split('\n').filter(Boolean);
      
      changes.newFiles = newFiles;

    } catch (error) {
      console.log('⚠️  Could not analyze recent changes');
    }

    return changes;
  }

  // Find documentation
  findDocumentation() {
    const docs = {
      readme: null,
      documentation: [],
      comments: []
    };

    // Find README files
    const readmeFiles = ['README.md', 'README.txt', 'readme.md', 'readme.txt'];
    readmeFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        docs.readme = {
          path: file,
          size: fs.statSync(filePath).size,
          preview: fs.readFileSync(filePath, 'utf8').substring(0, 500) + '...'
        };
      }
    });

    // Find documentation folders
    const docFolders = ['docs', 'documentation', 'doc', 'wiki'];
    docFolders.forEach(folder => {
      const folderPath = path.join(this.projectRoot, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.md') || file.endsWith('.txt'))
          .map(file => ({
            path: `${folder}/${file}`,
            size: fs.statSync(path.join(folderPath, file)).size
          }));
        docs.documentation.push(...files);
      }
    });

    return docs;
  }

  // Analyze configuration files
  analyzeConfiguration() {
    const config = {
      files: [],
      environment: null
    };

    // Common config files
    const configFiles = [
      '.env', '.env.example', 'config.json', 'config.js', 'settings.json',
      'package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.js',
      'tailwind.config.js', 'postcss.config.js', 'eslint.config.js',
      'jest.config.js', 'cypress.config.js', 'docker-compose.yml', 'Dockerfile'
    ];

    configFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        config.files.push({
          name: file,
          size: fs.statSync(filePath).size,
          type: path.extname(file)
        });
      }
    });

    // Environment variables (from .env.example)
    const envExamplePath = path.join(this.projectRoot, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      config.environment = {
        variables: fs.readFileSync(envExamplePath, 'utf8')
          .split('\n')
          .filter(line => line.includes('=') && !line.startsWith('#'))
          .map(line => line.split('=')[0])
      };
    }

    return config;
  }

  // Save context to files
  async saveContextFiles(context) {
    // Save main context
    fs.writeFileSync(
      path.join(this.contextFolder, 'project-context.json'),
      JSON.stringify(context, null, 2)
    );

    // Save individual sections
    fs.writeFileSync(
      path.join(this.contextFolder, 'project-overview.md'),
      this.generateProjectOverview(context)
    );

    fs.writeFileSync(
      path.join(this.contextFolder, 'file-structure.md'),
      this.generateFileStructure(context.structure)
    );

    fs.writeFileSync(
      path.join(this.contextFolder, 'recent-changes.md'),
      this.generateRecentChanges(context.recent)
    );

    console.log('📄 Context files saved to ./ai-context/');
  }

  // Generate project overview
  generateProjectOverview(context) {
    return `# Project Overview: ${context.project.name}

## Basic Information
- **Name**: ${context.project.name}
- **Path**: ${context.project.path}
- **Last Updated**: ${context.project.timestamp}
- **Description**: ${context.project.description || 'No description available'}

## Project Structure
- **Total Files**: ${context.structure.totalFiles}
- **Total Size**: ${(context.structure.totalSize / 1024 / 1024).toFixed(2)} MB
- **Directories**: ${context.structure.directories.length}

## Dependencies
${context.dependencies.node ? `- **Node.js**: ${context.dependencies.node.totalDeps} dependencies` : ''}
${context.dependencies.python ? `- **Python**: ${context.dependencies.python.totalDeps} requirements` : ''}

## Git Information
- **Repository**: ${context.git.hasGit ? 'Yes' : 'No'}
- **Branch**: ${context.git.branch || 'N/A'}
- **Last Commit**: ${context.git.lastCommit ? context.git.lastCommit.split('|')[3] : 'N/A'}

## Recent Activity
- **Modified Files**: ${context.recent.modifiedFiles.length}
- **New Files**: ${context.recent.newFiles.length}

## Documentation
- **README**: ${context.documentation.readme ? 'Available' : 'Not found'}
- **Documentation Files**: ${context.documentation.documentation.length}

## Configuration
- **Config Files**: ${context.configuration.files.length}
- **Environment Variables**: ${context.configuration.environment ? context.configuration.environment.variables.length : 0}
`;
  }

  // Generate file structure
  generateFileStructure(structure) {
    let output = `# File Structure

## Top Files by Size
${structure.topFiles.map(file => 
  `- **${file.path}** (${(file.size / 1024).toFixed(2)} KB)`
).join('\n')}

## All Files
${structure.files.map(file => 
  `- ${file.path} (${(file.size / 1024).toFixed(2)} KB)`
).join('\n')}
`;

    return output;
  }

  // Generate recent changes
  generateRecentChanges(recent) {
    return `# Recent Changes (Last 7 Days)

## Modified Files
${recent.modifiedFiles.map(file => `- ${file}`).join('\n')}

## New Files
${recent.newFiles.map(file => `- ${file}`).join('\n')}
`;
  }

  // Upload to Google Drive
  async uploadToGoogleDrive() {
    try {
      console.log('📤 Uploading context to Google Drive...');
      const files = fs.readdirSync(this.contextFolder);
      for (const file of files) {
        const filePath = path.join(this.contextFolder, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          await this.googleDrive.uploadFile(filePath, file);
        }
      }
      console.log('✅ All context files uploaded to Google Drive');
    } catch (error) {
      console.log('⚠️  Could not upload to Google Drive:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const builder = new ProjectContextBuilder();
  builder.buildProjectContext().catch(console.error);
}

module.exports = ProjectContextBuilder; 