#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of the current script
const scriptDir = __dirname;

// Function to run a command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true
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

// Main function to run the application
async function main() {
  try {
    // Check if package.json exists
    const packageJsonPath = path.join(scriptDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Make sure you are in the correct directory.');
    }

    // Run the Next.js development server
    console.log('Starting Next.js development server...');
    await runCommand('npm', ['run', 'dev'], { cwd: scriptDir });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
