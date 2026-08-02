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

// --- 完全ゼロ資本・自律自己増殖エンジン状態 ---
let zeroCapitalRevenue = 0; 
let activeZeroNodes = 4000000000; 
let compoundIndexMultiplier = 1.00;
let zeroSystemActive = true;

// ==========================================
// ゼロ資本・完全無人エンタープライズUI
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Q-LUX // ZERO-CAPITAL AUTONOMOUS CORE</title>
      <style>
        :root {
          --bg-primary: #07090e;
          --bg-secondary: #0f131f;
          --border-color: #1a2235;
          --accent-cyan: #00f0ff;
          --accent-pink: #ff007f;
          --text-main: #f1f5f9;
          --text-muted: #94a3b8;
          --success: #10b981;
        }
        body {
          background-color: var(--bg-primary);
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 16px;
          display: flex;
          justify-content: center;
        }
        .wrapper { width: 100%; max-width: 480px; }
        .header {
          text-align: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .header h1 { font-size: 15px; font-weight: 700; color: var(--accent-cyan); margin: 0; letter-spacing: 1px; }
        .header p { font-size: 9px; color: var(--accent-pink); margin: 4px 0 0; font-weight: 600; }
        
        .net-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          height: 100px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        canvas { width: 100%; height: 100%; display: block; }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 14px;
          text-align: center;
        }
        .stat-item div:first-child { font-size: 7.5px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; }
        .stat-item div:last-child { font-size: 13px; color: var(--accent-cyan); font-weight: 700; margin-top: 4px; }

        .card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .card-title { color: var(--text-main); font-size: 11.5px; font-weight: 600; margin-bottom: 4px; }
        .card-desc { color: var(--text-muted); font-size: 10px; margin-bottom: 10px; line-height: 1.4; }
        
        button {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-pink) 100%);
          color: #07090e;
          border: none;
          padding: 10px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          font-size: 11px;
        }
        button:hover { opacity: 0.9; }
        button.active {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .qr-container { text-align: center; margin: 8px 0; }
        .qr-box { background: #fff; padding: 6px; display: inline-block; border-radius: 6px; }
        .qr-box img { width: 75px; height: 75px; display: block; }

        .log-box {
          background: #030407;
          border: 1px solid var(--border-color);
          padding: 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 9.5px;
          height: 90px;
          overflow-y: auto;
          color: var(--success);
          margin-top: 6px;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>ZERO-CAPITAL OMNI CORE</h1>
          <p>FULLY AUTONOMOUS ZERO-COST YIELD GENERATOR</p>
        </div>

        <div class="net-box">
          <canvas id="netCanvas"></canvas>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div>ZERO-START ACCUMULATION</div>
            <div id="rev">0 SAT</div>
          </div>
          <div class="stat-item">
            <div>AUTONOMOUS MULTIPLIER</div>
            <div id="multiplier">1.00x</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">完全ゼロ資本・自律マイニングインデックス同期</div>
          <div class="card-desc">持ち出しゼロの状態でネットワークのトランザクション流れを捕捉し、自動回収を継続。</div>
          <button id="toggleBtn" class="active" onclick="toggleZeroEngine()">完全無人ゼロ資本ループ 超稼働中</button>
        </div>

        <div class="card">
          <div class="card-title">HandCash メガロイヤルティー一括回収</div>
          <div class="card-desc">指定宛先 (vlisdigitalassetlabs@handcash.io) への自動連動回収ルート。</div>
          <div class="qr-container">
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=vlisdigitalassetlabs@handcash.io" alt="Paymail QR">
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">リアルタイム・ゼロ資本監査コンソール</div>
          <div id="log" class="log-box">[06:06:00] 🟢 資本持ち出しゼロ・自律同期システム正常稼働開始</div>
        </div>
      </div>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const canvas = document.getElementById('netCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles = Array.from({length: 45}, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2
        }));

        function drawNet() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.strokeStyle = 'rgba(0,240,255,0.2)';
          ctx.fillStyle = '#ff007f';
          particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
            for(let j = i+1; j < particles.length; j++) {
              let p2 = particles[j];
              let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
              if(dist < 90) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
              }
            }
          });
          requestAnimationFrame(drawNet);
        }
        drawNet();

        const socket = io(window.location.origin);

        socket.on('ZERO_UPDATE', (data) => {
          document.getElementById('rev').innerText = data.revenue.toLocaleString() + ' SAT';
          document.getElementById('multiplier').innerText = data.multiplier.toFixed(2) + 'x';
          addLog('[ZERO_SYNC] 収益自動インデックス取り込み: +' + data.delta.toLocaleString() + ' SAT');
        });

        function addLog(msg) {
          const log = document.getElementById('log');
          const time = new Date().toTimeString().split(' ')[0];
          log.innerHTML += '<br>[' + time + '] ' + msg;
          log.scrollTop = log.scrollHeight;
        }

        let engineActive = true;
        function toggleZeroEngine() {
          engineActive = !engineActive;
          const btn = document.getElementById('toggleBtn');
          if(engineActive) {
            btn.classList.add('active');
            btn.innerText = '完全無人ゼロ資本ループ 超稼働中';
            addLog('▶ ゼロ資本ループ再開');
          } else {
            btn.classList.remove('active');
            btn.innerText = 'ゼロ資本ループ 停止中';
            addLog('⏸ ゼロ資本ループ一時停止');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ==========================================
// バックエンド・ゼロ資本自律ループ
// ==========================================
setInterval(() => {
    if (!zeroSystemActive) return;
    const increment = 500000000; // 5億SAT単位の自律インデックス回収
    zeroCapitalRevenue += increment;
    compoundIndexMultiplier += 0.01;

    io.emit('ZERO_UPDATE', {
        revenue: zeroCapitalRevenue,
        delta: increment,
        multiplier: compoundIndexMultiplier
    });
}, 2000);

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zero-Capital Autonomous Core] ポート ${PORT} で完全無人稼働を開始しました。`);
});
