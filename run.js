#!/usr/bin/env node

/**
 * This script is used to run the application.
 * It can be executed with `node run.js` or simply `./run.js` if the file has executable permissions.
 * 
 * Options:
 * --init-db: Initialize the database before starting the application
 * --help: Show help information
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command-line arguments
const args = process.argv.slice(2);
const options = {
  initDb: args.includes('--init-db'),
  help: args.includes('--help'),
};

// Show help information if requested
if (options.help) {
  console.log(`
Usage: node run.js [options]

Options:
  --init-db    Initialize the database before starting the application
  --help       Show this help information
  `);
  process.exit(0);
}

// Initialize the database if requested
if (options.initDb) {
  console.log('Initializing the database...');
  try {
    // Run the database initialization script
    execSync('node scripts/init-db.js', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname),
    });
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Define the command to run
const command = 'npm';
const npmArgs = ['run', 'dev'];

console.log('Starting the application...');

// Spawn the process
const child = spawn(command, npmArgs, {
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
