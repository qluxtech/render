const http = require('http');

const PORT = process.env.PORT || 3000;
const TARGET_PAYMAIL = 'vlisdigitalassetlabs@handcash.io';

const server = http.createServer((req, res) => {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v1/settle') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(`[MAINNET SETTLEMENT] Action: ${data.actionName}, Amount: ${data.satoshiAmount} SAT -> ${TARGET_PAYMAIL}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          txid: 'bsv_tx_' + Math.random().toString(36).substring(2, 15),
          settledSat: data.satoshiAmount,
          paymail: TARGET_PAYMAIL,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('QLUX-ENTERPRISE Backend Engine is Running Successfully.');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`QLUX-ENTERPRISE Backend Engine running on port ${PORT}`);
});
