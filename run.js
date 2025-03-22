#!/usr/bin/env node

/**
 * This script serves as an entry point for running the application.
 * It provides a convenient way to start the development server.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Print banner
console.log(`${colors.fg.cyan}${colors.bright}
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ${colors.fg.yellow}██╗  ██╗ █████╗  █████╗ ███╗   ███╗${colors.fg.cyan}                                 ║
║   ${colors.fg.yellow}██║  ██║██╔══██╗██╔══██╗████╗ ████║${colors.fg.cyan}                                 ║
║   ${colors.fg.yellow}███████║███████║███████║██╔████╔██║${colors.fg.cyan}                                 ║
║   ${colors.fg.yellow}██╔══██║██╔══██║██╔══██║██║╚██╔╝██║${colors.fg.cyan}                                 ║
║   ${colors.fg.yellow}██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║${colors.fg.cyan}                                 ║
║   ${colors.fg.yellow}╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝${colors.fg.cyan}                                 ║
║                                                                           ║
║   ${colors.fg.white}Hackathon & Accelerator Management Platform${colors.fg.cyan}                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error(`${colors.fg.red}Error: package.json not found. Make sure you're running this script from the project root.${colors.reset}`);
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'dev'; // Default to 'dev' if no command is provided

// Define available commands
const availableCommands = {
  dev: {
    description: 'Start the development server',
    script: 'next dev',
  },
  build: {
    description: 'Build the application for production',
    script: 'next build',
  },
  start: {
    description: 'Start the production server',
    script: 'next start',
  },
  lint: {
    description: 'Run linting',
    script: 'next lint',
  },
  prisma: {
    description: 'Run Prisma commands (e.g., migrate, generate)',
    script: args.slice(1).join(' ') ? `npx prisma ${args.slice(1).join(' ')}` : 'npx prisma',
  },
  seed: {
    description: 'Seed the database',
    script: 'node prisma/seed.js',
  },
  help: {
    description: 'Show this help message',
    script: null,
  },
};

// Show help if requested or if command is not recognized
if (command === 'help' || !availableCommands[command]) {
  console.log(`\n${colors.fg.yellow}${colors.bright}Available commands:${colors.reset}\n`);
  
  Object.keys(availableCommands).forEach(cmd => {
    console.log(`  ${colors.fg.green}${cmd.padEnd(10)}${colors.reset} - ${availableCommands[cmd].description}`);
  });
  
  console.log('\n');
  process.exit(command === 'help' ? 0 : 1);
}

// Execute the command
const script = availableCommands[command].script;
if (!script) {
  process.exit(0);
}

console.log(`${colors.fg.yellow}Executing: ${colors.fg.white}${script}${colors.reset}\n`);

// Split the script into command and arguments
const [cmd, ...cmdArgs] = script.split(' ');

// Determine whether to use npm or npx
const executable = cmd === 'npx' ? 'npx' : 'npm';
const execArgs = cmd === 'npx' ? cmdArgs : ['run', cmd, ...cmdArgs];

// Spawn the process
const child = spawn(executable, execArgs, { 
  stdio: 'inherit',
  shell: process.platform === 'win32' // Use shell on Windows
});

// Handle process exit
child.on('close', (code) => {
  if (code !== 0) {
    console.error(`${colors.fg.red}Command exited with code ${code}${colors.reset}`);
  }
  process.exit(code);
});

// Handle process errors
child.on('error', (err) => {
  console.error(`${colors.fg.red}Failed to start command: ${err}${colors.reset}`);
  process.exit(1);
});
