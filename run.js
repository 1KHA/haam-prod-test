#!/usr/bin/env node

/**
 * This script is used to run the application.
 * It can be executed with `node run.js` or simply `./run.js` if the file has executable permissions.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the command to run
const command = 'npm';
const args = ['run', 'dev'];

console.log('Starting the application...');

// Spawn the process
const child = spawn(command, args, {
  stdio: 'inherit', // This will pipe the child's stdio to the parent process
  shell: true,
  cwd: path.resolve(__dirname) // Ensure we're running in the correct directory
});

// Handle process events
child.on('error', (error) => {
  console.error(`Error starting the process: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.log(`Process exited with code ${code}`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  child.kill('SIGTERM');
});
