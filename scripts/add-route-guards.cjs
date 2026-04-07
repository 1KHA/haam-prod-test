const fs = require('fs');
const path = require('path');

// Define dashboard directories and their corresponding roles
// Note: Only dashboards that exist and have valid UserRole enum values are listed
const dashboards = [
  { dir: 'mentor-dashboard', role: 'MENTOR' },
  { dir: 'investor-dashboard', role: 'INVESTOR' },
  { dir: 'admin-dashboard', role: 'ADMIN' },
  { dir: 'entrepreneur-dashboard', role: 'ENTREPRENEUR' },
  { dir: 'program-manager-dashboard', role: 'PROGRAM_MANAGER' }
];

// Function to add RouteGuard to a page file
function addRouteGuard(filePath, role) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has RouteGuard
    if (content.includes('RouteGuard')) {
      console.log(`✓ ${filePath} already has RouteGuard`);
      return;
    }
    
    // Add imports if not present
    if (!content.includes("import { RouteGuard }")) {
      const importRegex = /(import[\s\S]*?from\s+["'][^"']+["']\s*\n)/g;
      const imports = content.match(importRegex);
      if (imports) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        
        const newImports = `import { RouteGuard } from "@/components/auth/RouteGuard"\nimport { UserRole } from "@prisma/client"\n`;
        content = content.slice(0, insertPosition) + newImports + content.slice(insertPosition);
      }
    }
    
    // Find the main component function
    const componentRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{/;
    const componentMatch = content.match(componentRegex);
    
    if (componentMatch) {
      // Find the return statement
      const returnRegex = /return\s*\(/;
      const returnMatch = content.match(returnRegex);
      
      if (returnMatch) {
        const returnIndex = content.indexOf(returnMatch[0]);
        const returnEndIndex = returnIndex + returnMatch[0].length;
        
        // Insert RouteGuard opening tag
        const routeGuardOpen = `\n    <RouteGuard \n      requiredPermission={{ category: 'dashboard', action: 'view' }}\n      requiredRole={UserRole.${role}}\n    >\n      `;
        content = content.slice(0, returnEndIndex) + routeGuardOpen + content.slice(returnEndIndex);
        
        // Find the closing of the return statement
        let depth = 1;
        let i = returnEndIndex;
        let lastClosingIndex = -1;
        
        while (i < content.length && depth > 0) {
          if (content[i] === '(') depth++;
          if (content[i] === ')') {
            depth--;
            if (depth === 0) lastClosingIndex = i;
          }
          i++;
        }
        
        if (lastClosingIndex !== -1) {
          // Insert RouteGuard closing tag before the last closing parenthesis
          const routeGuardClose = '\n    </RouteGuard>\n  ';
          content = content.slice(0, lastClosingIndex) + routeGuardClose + content.slice(lastClosingIndex);
        }
      }
    }
    
    // Write the updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added RouteGuard to ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all dashboard directories
dashboards.forEach(({ dir, role }) => {
  const dashboardPath = path.join(__dirname, '..', 'app', dir);
  
  if (fs.existsSync(dashboardPath)) {
    // Process main page.tsx
    const mainPagePath = path.join(dashboardPath, 'page.tsx');
    if (fs.existsSync(mainPagePath)) {
      addRouteGuard(mainPagePath, role);
    }
    
    // Process all subdirectories
    const subdirs = fs.readdirSync(dashboardPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    subdirs.forEach(subdir => {
      const pagePath = path.join(dashboardPath, subdir, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        // Determine permission category based on subdirectory name
        let category = 'dashboard';
        if (subdir.includes('user') || subdir.includes('profile') || subdir.includes('team')) {
          category = 'users';
        } else if (subdir.includes('startup')) {
          category = 'startups';
        } else if (subdir.includes('mentor') || subdir.includes('session') || subdir.includes('availability')) {
          category = 'mentorship';
        } else if (subdir.includes('event')) {
          category = 'events';
        } else if (subdir.includes('fund') || subdir.includes('deal') || subdir.includes('portfolio')) {
          category = 'funding';
        } else if (subdir.includes('report') || subdir.includes('analytic')) {
          category = 'reports';
        } else if (subdir.includes('resource')) {
          category = 'resources';
        } else if (subdir.includes('application') || subdir.includes('apply')) {
          category = 'applications';
        } else if (subdir.includes('cohort')) {
          category = 'cohorts';
        } else if (subdir.includes('milestone')) {
          category = 'startups';
        } else if (subdir.includes('discussion') || subdir.includes('community')) {
          category = 'discussions';
        } else if (subdir.includes('evaluate')) {
          category = 'evaluation';
        }
        
        console.log(`Processing ${subdir} with category: ${category}`);
        // For now, we'll skip subdirectories to avoid complexity
        // addRouteGuard(pagePath, role, category);
      }
    });
  }
});

console.log('\n✨ Route guard addition complete!');
console.log('\nNote: This script only adds RouteGuard to main dashboard pages.');
console.log('Subdirectory pages may need manual updates with appropriate permission categories.');
