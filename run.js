#!/usr/bin/env node

/**
 * This script is used to run the Next.js application.
 * It provides a convenient way to start the development server.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this script is located
const scriptDir = __dirname;

// Check if package.json exists
const packageJsonPath = path.join(scriptDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in the current directory.');
  process.exit(1);
}

// Read package.json to check if it's a Next.js project
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (!dependencies.next) {
    console.warn('Warning: This does not appear to be a Next.js project (next not found in dependencies).');
  }
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Run the Next.js development server
console.log('Starting Next.js development server...');

const nextDev = spawn('npm', ['run', 'dev'], {
  cwd: scriptDir,
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (error) => {
  console.error('Failed to start development server:', error.message);
  process.exit(1);
});

nextDev.on('close', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Stopping development server...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping development server...');
  nextDev.kill('SIGTERM');
});
