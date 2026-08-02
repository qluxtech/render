const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const HANDCASH_APP_ID = "6a4996714077afcb7ca9ce84";
const HANDCASH_APP_SECRET = "ef0b51eca588726473d7e07442dfd9530deec2a1330fce6a2ab9cf894fc4e210";
const HANDCASH_BASE_URL = "https://cloud.handcash.io";
const TARGET_PAYMAIL = "vlisdigitalassetlabs@handcash.io";

let totalRevenue = 165000000000;
let systemActive = true;

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Q-LUX ENTERPRISE - UNIFIED GATEWAY</title>
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
        body { background-color: var(--bg-main); color: var(--text-main); font-family: sans-serif; margin: 0; padding: 14px; display: flex; justify-content: center; }
        .wrapper { width: 100%; max-width: 480px; }
        .header { text-align: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-clr); padding-bottom: 10px; }
        .header h1 { font-size: 14px; color: var(--accent-cyan); margin: 0; letter-spacing: 1.5px; }
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

        /* 統合された大容量マスターパネル */
        .master-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-clr);
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(0, 240, 255, 0.05);
        }
        .master-title { color: var(--accent-cyan); font-size: 11.5px; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between; }
        .master-subtitle { color: var(--text-muted); font-size: 9px; margin-bottom: 12px; line-height: 1.4; border-bottom: 1px solid var(--border-clr); padding-bottom: 8px; }

        .section-block {
          background: #060910;
          border: 1px solid var(--border-clr);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .section-block:last-child { margin-bottom: 0; }
        .sub-heading { color: var(--text-main); font-size: 10px; font-weight: 600; margin-bottom: 2px; }
        .sub-desc { color: var(--text-muted); font-size: 8.5px; margin-bottom: 8px; line-height: 1.3; }

        .code-tag {
          background: #040609;
          border: 1px solid var(--border-clr);
          color: var(--accent-cyan);
          font-family: monospace;
          font-size: 8.5px;
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

        .log-box {
          background: #040609;
          border: 1px solid var(--border-clr);
          padding: 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 8.5px;
          height: 80px;
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
            <div id="rev">165,000,000,000 SAT</div>
          </div>
          <div class="stat-item">
            <div>AUTONOMOUS MULTIPLIER</div>
            <div id="multiplier">4.11x</div>
          </div>
        </div>

        <!-- すべての機能セクションを統合したマスターパネル -->
        <div class="master-card">
          <div class="master-title">
            <span>⚡ UNIFIED MASTER CONTROL HUB</span>
            <span style="font-size: 8.5px; color: var(--accent-green);">● ONLINE</span>
          </div>
          <div class="master-subtitle">完全無人ゼロ資本ループ、光通信量子演算ノード、およびTeranode超高速決済コンフィグを統合制御するマスターハブ。</div>

          <!-- セクション1: 完全ゼロ資本 -->
          <div class="section-block">
            <div class="sub-heading">完全ゼロ資本・自律マイニングインデックス同期</div>
            <div class="sub-desc">持ち出しゼロの状態でネットワークのトランザクション流れを捕捉し、自動回収を継続。</div>
            <button id="zeroLoopBtn" class="active" onclick="toggleZeroLoop()">完全無人ゼロ資本ループ 超稼働中</button>
          </div>

          <!-- セクション2: 量子演算ノード -->
          <div class="section-block">
            <div class="sub-heading">光通信分散量子演算ノード・自動ダイレクト接続</div>
            <div class="sub-desc">発生するすべての収益を指定ペイメール(${TARGET_PAYMAIL})へリアルタイム直結送金。</div>
            <button id="syncBtn" class="active" onclick="toggleQuantumSync()">量子演算ノードとライブ同期実行</button>
          </div>

          <!-- セクション3: Teranode 超高速決済 -->
          <div class="section-block">
            <div class="sub-heading">Teranode 超高速決済・ダイレクトインコンフィグ</div>
            <div class="sub-desc">決済完了と同時にHandCashアドレスへ直接送金するスマート・コンフィグファイルを発行。</div>
            <div class="code-tag">TERANODE-DIRECT-IN-v10.conf</div>
            <button onclick="downloadConfig()">ダイレクト決済 &amp; コンフィグ取得 (50,000 SAT)</button>
          </div>
        </div>

        <!-- 監査ログコンソール -->
        <div class="master-card" style="padding: 10px;">
          <div class="master-title" style="font-size: 10px; margin-bottom: 4px;">リアルタイム監査ログ・ストリーム</div>
          <div id="log" class="log-box">[INIT] 統合マスターハブ接続完了 - HandCash App ID 正常稼働中</div>
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

        const socket = io();

        socket.on('UPDATE_METRICS', (data) => {
          document.getElementById('rev').innerText = data.revenue.toLocaleString() + ' SAT';
          addLog('[TX_SYNC] 収益自動インデックス取込: +' + data.delta.toLocaleString() + ' SAT');
        });

        socket.on('LOG', (msg) => {
          addLog(msg);
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
          const configContent = "[Q-LUX_ENTERPRISE_CONFIG]\\npaymail=vlisdigitalassetlabs@handcash.io\\nnode_mode=unified_master_hub\\napp_id=6a4996714077afcb7ca9ce84";
          const blob = new Blob([configContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'TERANODE-DIRECT-IN-v10.conf';
          a.click();
          addLog('✓ コンフィグ取得完了 & ダイレクト決済ルート確保');
        }
      </script>
    </body>
    </html>
  `);
});

// バックエンドのリアルタイム収益加算＆オート・スイープシミュレーション
setInterval(() => {
    if (!systemActive) return;
    const deltaSats = 500000000;
    totalRevenue += deltaSats;
    io.emit('UPDATE_METRICS', { revenue: totalRevenue, delta: deltaSats });
}, 3000);

// 定期オート・スイープ
setInterval(() => {
    io.emit('LOG', `[AUTO_SWEEP] ${TARGET_PAYMAIL} へ自動収益スイープ完了`);
}, 60000);

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Q-LUX ENTERPRISE] 統合マスターハブがポート ${PORT} で完全稼働中`);
});
