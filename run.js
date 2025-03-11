#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this script is located
const scriptDir = __dirname;

// Function to run a command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const proc = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Main function to start the application
async function main() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync(path.join(scriptDir, 'package.json'))) {
      console.error('Error: package.json not found. Make sure you are running this script from the project root.');
      process.exit(1);
    }

    // Run the development server
    await runCommand('npm', ['run', 'dev'], { cwd: scriptDir });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
