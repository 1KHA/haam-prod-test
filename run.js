#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of the current script
const scriptDir = __dirname;

// Check if package.json exists
const packageJsonPath = path.join(scriptDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in the current directory.');
  process.exit(1);
}

// Read package.json to check for scripts
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Check if the dev script exists
if (!packageJson.scripts || !packageJson.scripts.dev) {
  console.error('Error: "dev" script not found in package.json.');
  process.exit(1);
}

console.log('Starting development server...');

// Run the dev script using npm
const npmProcess = spawn('npm', ['run', 'dev'], {
  cwd: scriptDir,
  stdio: 'inherit',
  shell: true
});

npmProcess.on('error', (error) => {
  console.error('Failed to start development server:', error.message);
  process.exit(1);
});

npmProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
    process.exit(code);
  }
});
