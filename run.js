#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of the current script
const currentDir = __dirname;

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to check if Next.js is installed
function isNextJsInstalled() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
    return packageJson.dependencies && packageJson.dependencies.next;
  } catch (err) {
    return false;
  }
}

// Main function to run the application
function runApp() {
  console.log('Starting HAAM application...');
  
  // Check if node_modules exists, if not run npm install
  if (!directoryExists(path.join(currentDir, 'node_modules'))) {
    console.log('Node modules not found. Installing dependencies...');
    try {
      execSync('npm install', { cwd: currentDir, stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to install dependencies:', error.message);
      process.exit(1);
    }
  }
  
  // Check if Next.js is installed
  if (!isNextJsInstalled()) {
    console.error('Next.js is not installed. Please make sure it is listed in your package.json dependencies.');
    process.exit(1);
  }
  
  // Run the Next.js development server
  try {
    console.log('Starting Next.js development server...');
    execSync('npm run dev', { cwd: currentDir, stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to start Next.js development server:', error.message);
    process.exit(1);
  }
}

// Run the application
runApp();
