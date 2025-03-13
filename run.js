#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the current directory
const currentDir = __dirname;

// Run the development server
try {
  console.log('Starting the development server...');
  execSync('npm run dev', { 
    cwd: currentDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to start the development server:', error.message);
  process.exit(1);
}
