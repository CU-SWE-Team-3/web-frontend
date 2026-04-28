const http = require('http');

http.get('http://localhost:5173/api/playlists', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("Raw response (truncated to 2000 chars):", data.substring(0, 2000));
  });
}).on('error', (err) => console.log('Error:', err.message));
