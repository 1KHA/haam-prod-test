/**
 * Test Server for Reports API Testing
 * 
 * This script starts a local server to serve the test-reports.html
 * file, allowing for easy testing of the reports API endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  try {
    // Handle file requests
    if (req.url === '/' || req.url === '/index.html') {
      // Serve the main test-reports.html file
      const filePath = path.join(__dirname, 'test-reports.html');
      const content = fs.readFileSync(filePath);
      
      res.setHeader('Content-Type', 'text/html');
      res.end(content);
      console.log(`Served: ${filePath}`);
      return;
    }
    
    // Handle other static files
    if (req.url.startsWith('/')) {
      const filePath = path.join(__dirname, req.url);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        
        // Set appropriate content type based on file extension
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'text/javascript';
        
        res.setHeader('Content-Type', contentType);
        res.end(content);
        console.log(`Served: ${filePath}`);
        return;
      }
    }
    
    // If no file was found, return 404
    res.statusCode = 404;
    res.end('File not found');
    console.log(`404: ${req.url}`);
    
  } catch (err) {
    console.error('Error serving request:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
  console.log(`Open your browser to test the Reports API`);
});
