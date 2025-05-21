/**
 * Simple Node.js server script to serve the visual-diff/index.html file
 * and open it in the default browser.
 */

const express = require('express');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Create Express app
const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../')));

// Default route redirects to the terraform/index.html
app.get('/', (req, res) => {
  res.redirect('/public/visual-diff/index.html');
});

// Start the server
const server = app.listen(PORT, HOST, async () => {
  const url = `http://${HOST}:${PORT}/public/visual-diff/index.html`;
  console.log(`Server running at ${url}`);
  
  try {
    // Use dynamic import for the 'open' package
    const open = await import('open');
    await open.default(url);
  } catch (err) {
    console.error('Failed to open browser:', err);
    console.log(`Please open ${url} manually in your browser`);
  }
  
  console.log('Press Ctrl+C to stop the server');
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
