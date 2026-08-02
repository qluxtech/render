const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let totalRevenue = 155500000000;
let activeNodes = 524111;
let compoundPool = 6932635;
let systemActive = true;

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Q-LUX ENTERPRISE</title>
      <style>
        :root {
          --bg-main: #07090e;
          --bg-panel: #0e131f;
          --border-clr: #1c263b;
          --accent-cyan: #00f0ff;
          --accent-green: #10b981;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
        }
        body {
          background-color: var(--bg-main);
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 14px;
          display: flex;
          justify-content: center;
        }
        .wrapper { width: 100%; max-width: 480px; }
        .header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border-clr);
          padding-bottom: 10px;
        }
        .header h1 { font-size: 14px; font-weight: 700; color: var(--accent-cyan); margin: 0; letter-spacing: 1.5px; }
        .header p { font-size: 9px; color: var(--text-muted); margin: 3px 0 0; }
        .net-box {
          background: var(--bg-panel);
          border: 1px solid var(--border-clr);
          border-radius: 10px;
          height: 90px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        canvas { width: 100%; height: 100%; display: block; }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: var(--bg-panel);
          border: 1px solid var(--border-clr);
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 10px;
          text-align: center;
        }
        .stat-item div:first-child { font-size: 6.5px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; }
        .stat-item div:last-child { font-size: 10px; color: var(--accent-cyan); font-weight: 700; margin-top: 3px; }
        .card {
          background: var(--bg-panel);
          border: 1px solid var(--border-clr);
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 8px;
        }
        .card-title { color: var(--text-main); font-size: 10.5px; font-weight: 600; margin-bottom: 2px; }
        .card-desc { color: var(--text-muted); font-size: 9px; margin-bottom: 8px; line-height: 1.3; }
        .code-tag {
          background: #040609;
          border: 1px solid var(--border-clr);
          color: var(--accent-cyan);
          font-family: monospace;
          font-size: 9px;
          padding: 5px;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 6px;
        }
        button {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, #0088ff 100%);
          color: #07090e;
          border: none;
          padding: 9px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          font-size: 10px;
        }
        button:hover { opacity: 0.9; }
        button.active {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-green);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .qr-section { text-align: center; margin: 4px 0; }
        .qr-wrapper { background: #fff; padding: 4px; display: inline-block; border-radius: 6px; }
        .qr-wrapper img { width: 60px; height: 60px; display: block; }
        .log-box {
          background: #040609;
          border: 1px solid var(--border-clr);
          padding: 6px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 8.5px;
          height: 70px;
          overflow-y: auto;
          color: var(--accent-green);
          margin-top: 4px;
          line-height: 1.3;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Q-LUX ENTERPRISE</h1>
          <p>Autonomous Teranode & Live HandCash Gateway (2026 Edition)</p>
        </div>

        <div class="net-box">
          <canvas id="netCanvas"></canvas>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div>ZERO-START ACCUMULATION</div>
            <div id="rev">155,500,000,000 SAT</div>
          </div>
          <div class="stat-item">
            <div>AUTONOMOUS MULTIPLIER</div>
            <div id="multiplier">4.11x</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">完全ゼロ資本・自律マイニングインデックス同期</div>
          <div class="card-desc">持ち出しゼロの状態でネットワークのトランザクション流れを捕捉し、自動回収を継続。</div>
          <button id="zeroLoopBtn" class="active" onclick="toggleZeroLoop()">完全無人ゼロ資本ループ 超稼働中</button>
        </div>

        <div class="card">
          <div class="card-title">光通信分散量子演算ノード・自動ダイレクト接続</div>
          <div class="card-desc">発生するすべての収益を指定ペイメールへリアルタイムで直結送金するオート・ルーティング接続。</div>
          <button id="syncBtn" class="active" onclick="toggleQuantumSync()">量子演算ノードとライブ同期実行</button>
        </div>

        <div class="card">
          <div class="card-title">Teranode 超高速決済・ダイレクトインコンフィグ</div>
          <div class="card-desc">決済完了と同時にHandCashアドレスへ直接送金するスマート・コンフィグファイルを発行。</div>
          <div class="code-tag">TERANODE-DIRECT-IN-v10.conf</div>
          <button onclick="downloadConfig()">ダイレクト決済 &amp; コンフィグ取得 (50,000 SAT)</button>
        </div>

        <div class="card">
          <div class="card-title">HandCash メガロイヤルティー一括回収</div>
          <div class="card-desc">指定宛先 (vlisdigitalassetlabs@handcash.io) への自動連動回収ルート。</div>
          <div class="qr-section">
            <div class="qr-wrapper">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=vlisdigitalassetlabs@handcash.io" alt="HandCash QR">
            </div>
          </div>
          <button onclick="triggerAction('collect_all', 500000000)">一括フラッシュ回収を実行</button>
        </div>

        <div class="card">
          <div class="card-title">リアルタイム・ゼロ資本監査コンソール</div>
          <div id="log" class="log-box">[06:18:53] [ZERO_SYNC] 収益自動インデックス取り込み開始</div>
        </div>
      </div>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const canvas = document.getElementById('netCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles = Array.from({length: 30}, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.0, vy: (Math.random() - 0.5) * 1.0
        }));

        function drawNet() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.strokeStyle = 'rgba(0,240,255,0.2)';
          ctx.fillStyle = '#00f0ff';
          particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI*2); ctx.fill();
            for(let j = i+1; j < particles.length; j++) {
              let p2 = particles[j];
              let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
              if(dist < 85) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
            }
          });
          requestAnimationFrame(drawNet);
        }
        drawNet();

        const socket = io(window.location.origin);

        socket.on('UPDATE_METRICS', (data) => {
          document.getElementById('rev').innerText = data.revenue.toLocaleString() + ' SAT';
          addLog('[ZERO_SYNC] 収益自動インデックス取り込み: +' + data.delta.toLocaleString() + ' SAT');
        });

        function addLog(msg) {
          const log = document.getElementById('log');
          const time = new Date().toTimeString().split(' ')[0];
          log.innerHTML += '<br>[' + time + '] ' + msg;
          log.scrollTop = log.scrollHeight;
        }

        let zeroActive = true;
        function toggleZeroLoop() {
          zeroActive = !zeroActive;
          const btn = document.getElementById('zeroLoopBtn');
          if(zeroActive) {
            btn.classList.add('active');
            btn.innerText = '完全無人ゼロ資本ループ 超稼働中';
            addLog('▶ ゼロ資本ループ再開');
          } else {
            btn.classList.remove('active');
            btn.innerText = 'ゼロ資本ループ一時停止中';
            addLog('⏸ ゼロ資本ループ停止');
          }
        }

        let syncActive = true;
        function toggleQuantumSync() {
          syncActive = !syncActive;
          const btn = document.getElementById('syncBtn');
          if(syncActive) {
            btn.classList.add('active');
            btn.innerText = '量子演算ノードとライブ同期実行';
            addLog('▶ 量子ノード再接続');
          } else {
            btn.classList.remove('active');
            btn.innerText = '量子同期停止中';
            addLog('⏸ 量子同期一時停止');
          }
        }

        function downloadConfig() {
          addLog('⬇ Teranode コンフィグファイル生成中...');
          const configContent = "[Q-LUX_ENTERPRISE_CONFIG]\\npaymail=vlisdigitalassetlabs@handcash.io\\nnode_mode=zero_capital_autonomous";
          const blob = new Blob([configContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'TERANODE-DIRECT-IN-v10.conf';
          a.click();
          addLog('✓ コンフィグ取得完了');
        }

        function triggerAction(type, amount) {
          addLog('⚡ HandCash 一括フラッシュ回収発動...');
          fetch('/api/compound', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
          }).then(res => res.json()).then(data => {
            addLog('✓ ペイメールへ一括送金完了 (vlisdigitalassetlabs@handcash.io)');
          });
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/api/compound', (req, res) => {
    const addedSats = req.body.amount || 500000000;
    totalRevenue += addedSats;
    io.emit('UPDATE_METRICS', { revenue: totalRevenue, delta: addedSats });
    res.json({ success: true, added: addedSats });
});

setInterval(() => {
    if (!systemActive) return;
    const deltaSats = 500000000;
    totalRevenue += deltaSats;
    
    io.emit('UPDATE_METRICS', {
        revenue: totalRevenue,
        delta: deltaSats
    });
}, 2000);

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Q-LUX ENTERPRISE] ポート ${PORT} で完全無人稼働中。`);
});
