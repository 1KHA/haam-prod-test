#!/usr/bin/env node

/**
 * This script is used to run the application in development mode.
 * It's a simple wrapper around the Next.js development server.
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = __dirname;

// Run the Next.js development server
const nextDev = spawn('npx', ['next', 'dev'], {
  cwd: scriptDir,
  stdio: 'inherit',
  shell: true
});

// Handle process exit
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});

nextDev.on('close', (code) => {
  process.exit(code);
});
