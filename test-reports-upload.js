const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { URLSearchParams } = require('url');
const { Readable } = require('stream');

// Helper function to convert FormData to a format node-fetch can handle
async function formDataToBlob(formData) {
  const boundary = Math.random().toString(36).substring(2);
  const chunks = [];
  
  for (const [name, value] of Object.entries(formData)) {
    const chunk = `--${boundary}\r\nContent-Disposition: form-data; name="${name}"`;
    
    if (value.contentType && value.filename) {
      // This is a file
      chunks.push(Buffer.from(`${chunk}; filename="${value.filename}"\r\nContent-Type: ${value.contentType}\r\n\r\n`));
      chunks.push(value.data);
      chunks.push(Buffer.from('\r\n'));
    } else {
      // This is a field
      chunks.push(Buffer.from(`${chunk}\r\n\r\n${value}\r\n`));
    }
  }
  
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    buffer: Buffer.concat(chunks),
    boundary
  };
}

// Admin token - this is the same one from the logs
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmU0ZWU1MS05MTI1LTQ5OTAtYmFmYi04YjJmNTI5NTQ3NzMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzY1NDQ0OTc3LCJleHAiOjE3NjYwNDk3Nzd9.1xiR19-k8o5SHbbMPN57cTwo1CyBD-y4Rv8HHHNxWsE';

async function testReportsUpload() {
  try {
    console.log('Creating test file...');
    // Create a small test file
    const testFilePath = path.join(__dirname, 'test-report.txt');
    fs.writeFileSync(testFilePath, 'This is a test report file.');
    
    console.log('Preparing form data...');
    // Read file as buffer
    const fileBuffer = fs.readFileSync(testFilePath);
    
    // Create custom formData object
    const formData = {
      'file': {
        filename: 'test-report.txt',
        contentType: 'text/plain',
        data: fileBuffer
      }
    };
    
    console.log('Converting form data to proper format...');
    const { buffer, boundary } = await formDataToBlob(formData);
    
    console.log('Sending request to upload endpoint...');
    // Send request to the reports upload endpoint
    const response = await fetch('http://localhost:3000/api/admin/reports/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: buffer
    });
    
    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Clean up test file
    console.log('Cleaning up test file...');
    fs.unlinkSync(testFilePath);
    
    if (response.ok) {
      console.log('✅ Test passed! The upload endpoint is working correctly.');
    } else {
      console.log('❌ Test failed! The upload endpoint returned an error.');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testReportsUpload();
