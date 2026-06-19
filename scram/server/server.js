const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Proxy route for fetching external URLs
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL format
    new URL(targetUrl);
    
    // Proxy the request
    proxy.web(req, res, { target: targetUrl, changeOrigin: true }, (err) => {
      if (err) {
        res.status(500).json({ error: 'Proxy error: ' + err.message });
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid URL format' });
  }
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  res.status(500).json({ error: 'Failed to fetch URL: ' + err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Polar V2 proxy server running on http://localhost:${PORT}`);
});
