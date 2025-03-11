#!/usr/bin/env node

/**
 * This script serves as the entry point for the application.
 * It starts the Next.js development server.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the current directory
const currentDir = process.cwd();

// Check if we're in the project root or need to navigate to it
const isProjectRoot = fs.existsSync(path.join(currentDir, 'package.json'));
const projectRoot = isProjectRoot ? currentDir : path.join(currentDir, 'haam');

// Ensure we're in the project directory
if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
  console.error('Error: Could not find package.json. Please run this script from the project root or its parent directory.');
  process.exit(1);
}

// Change to the project directory if needed
if (!isProjectRoot) {
  process.chdir(projectRoot);
  console.log(`Changed directory to: ${projectRoot}`);
}

// Command to run the Next.js development server
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = ['run', 'dev'];

console.log('Starting the development server...');
console.log(`Running command: ${command} ${args.join(' ')}`);

// Spawn the process
const devProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true
});

// Handle process events
devProcess.on('error', (error) => {
  console.error(`Failed to start development server: ${error.message}`);
  process.exit(1);
});

devProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  devProcess.kill('SIGTERM');
});
