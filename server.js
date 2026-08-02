  const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- システム内部状態 ---
let globalRevenueSat = 15038000000000; 
let activeNodes = 3000000000; 
let stasAssetPool = 1530400000000; 
let omniFlashEngineActive = true;

// ==========================================
// エンタープライズ外見 × フル機能統合UI
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Q-LUX // ENTERPRISE OMNI CORE</title>
      <style>
        :root {
          --bg-primary: #0a0b0d;
          --bg-secondary: #12141a;
          --border-color: #222734;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent-cyan: #06b6d4;
          --accent-green: #10b981;
        }
        body {
          background-color: var(--bg-primary);
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          width: 100%;
          max-width: 520px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 14px;
        }
        .brand {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: var(--text-main);
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: var(--accent-green);
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .status-dot {
          width: 6px;
          height: 6px;
          background-color: var(--accent-green);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-green);
        }

        .net-panel {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          height: 110px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        canvas { width: 100%; height: 100%; display: block; }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .metric-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .metric-title {
          font-size: 9px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
          font-variant-numeric: tabular-nums;
        }

        .panel {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 14px;
        }
        .panel-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-main);
        }
        .panel-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        
        .code-tag {
          background: #050608;
          border: 1px solid var(--border-color);
          color: var(--accent-cyan);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          padding: 6px;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .btn-enterprise {
          background-color: var(--text-main);
          color: var(--bg-primary);
          border: none;
          width: 100%;
          padding: 11px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-enterprise:hover { opacity: 0.9; }
        .btn-enterprise.active {
          background-color: rgba(16, 185, 129, 0.15);
          color: var(--accent-green);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .qr-section { text-align: center; margin: 10px 0; }
        .qr-wrapper { background: #fff; padding: 6px; display: inline-block; border-radius: 6px; }
        .qr-wrapper img { width: 72px; height: 72px; display: block; }

        .console-box {
          background-color: #050608;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          color: var(--accent-cyan);
          height: 90px;
          overflow-y: auto;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="brand">Q-LUX // OMNI-ENTERPRISE</div>
          <div class="status-badge">
            <div class="status-dot"></div>
            QUANTUM SYNCED
          </div>
        </header>

        <div class="net-panel">
          <canvas id="netCanvas"></canvas>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">TOTAL REVENUE</div>
            <div class="metric-value" id="rev">15,038B SAT</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">OMNI NODES</div>
            <div class="metric-value">3.0B</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">FLASH POOL</div>
            <div class="metric-value" id="pool">1,530B SAT</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">ゼロ資本・フラッシュローン超高速調達エンジン</div>
          <div class="panel-desc">グローバル流動性プールから一瞬で資金を借り入れ利ざやを自動強奪。</div>
          <button class="btn-enterprise" onclick="triggerAction('omni_flash_exec', 20000000000)">フラッシュローン即時発動 (20,000,000,000 SAT)</button>
        </div>

        <div class="panel">
          <div class="panel-title">自動アービトラージグリッド</div>
          <div class="panel-desc">市場格差をミリ秒で検知し、仲介手数料を相殺して利益を最大化。</div>
          <div class="code-tag">OMNI-ARBITRAGE-ULTIMATE-v999.conf</div>
          <button class="btn-enterprise" onclick="triggerAction('arbitrage_boost', 50000000000)">アービトラージブースト全開 (50,000,000,000 SAT)</button>
        </div>

        <div class="panel">
          <div class="panel-title">オムニ無限再投資スパイラル</div>
          <div class="panel-desc">回収した利ざやを秒単位でプールに自動組み込み、複利で雪だるま式拡大。</div>
          <button id="compoundBtn" class="btn-enterprise active" onclick="toggleCompound()">オムニ無限ループ 超稼働中 (完全無人)</button>
        </div>

        <div class="panel">
          <div class="panel-title">AI自己進化型フラッシュ・オートパイロット</div>
          <div class="panel-desc">AIがリアルタイムで最も収益性の高いネットワークパスを選択。</div>
          <div class="code-tag">AI-OMNI-AUTOPILOT-v99.json</div>
          <button class="btn-enterprise" onclick="triggerAction('ai_flash_ai', 100000000000)">AIオートパイロット全開起動 (100,000,000,000 SAT)</button>
        </div>

        <div class="panel">
          <div class="panel-title">HandCash メガロイヤルティー一括回収</div>
          <div class="panel-desc">指定宛先 (vlisdigitalassetlabs@handcash.io) への全ネットワーク収益回収。</div>
          <div class="qr-section">
            <div class="qr-wrapper">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=vlisdigitalassetlabs@handcash.io" alt="Paymail QR">
            </div>
          </div>
          <button class="btn-enterprise" onclick="triggerAction('collect_all_omni', 200000000000)">全ネット収益を一括フラッシュ回収</button>
        </div>

        <div class="panel">
          <div class="panel-title">リアルタイム・オムニ監査コンソール (2026.08)</div>
          <div id="log" class="console-box">[05:48:00] システム初期化完了：エンタープライズ量子同期確立</div>
        </div>
      </div>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const canvas = document.getElementById('netCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles = Array.from({length: 50}, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5
        }));

        function drawNet() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.strokeStyle = 'rgba(6,182,212,0.25)';
          ctx.fillStyle = '#06b6d4';
          particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
            for(let j = i+1; j < particles.length; j++) {
              let p2 = particles[j];
              let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
              if(dist < 100) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
              }
            }
          });
          requestAnimationFrame(drawNet);
        }
        drawNet();

        const socket = io(window.location.origin);
        
        socket.on('INIT_STATE', (data) => {
          updateStats(data.revenue, data.compoundPool);
        });

        socket.on('LIVE_UPDATE', (data) => {
          updateStats(data.revenue, data.compoundPool);
          addLog('[' + data.source.toUpperCase() + '] ' + data.message.toLocaleString() + ' | Tx: ' + data.txid.substring(0,8) + '...');
        });

        function updateStats(rev, pool) {
          document.getElementById('rev').innerText = (rev / 1000000000).toFixed(1) + 'B SAT';
          document.getElementById('pool').innerText = (pool / 1000000000).toFixed(1) + 'B SAT';
        }

        function addLog(msg) {
          const log = document.getElementById('log');
          const time = new Date().toTimeString().split(' ')[0];
          log.innerHTML += '<br>[' + time + '] ' + msg;
          log.scrollTop = log.scrollHeight;
        }

        async function triggerAction(actionType, amount) {
          addLog('⚡ ' + actionType + ' 実行アロケーション確立...');
          try {
            const res = await fetch('/api/v1/omni/flash', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ actionType, satsAmount: amount })
            });
            const data = await res.json();
            if(data.success) {
              addLog('✓ 処理完了: ' + amount.toLocaleString() + ' SAT 流動性統合');
            }
          } catch(e) {
            addLog('! ルーティング例外を自動回避');
          }
        }

        let isCompoundActive = true;
        function toggleCompound() {
          isCompoundActive = !isCompoundActive;
          const btn = document.getElementById('compoundBtn');
          if(isCompoundActive) {
            btn.classList.add('active');
            btn.innerText = 'オムニ無限ループ 超稼働中 (完全無人)';
            addLog('⟳ 再投資スパイラル再同期');
          } else {
            btn.classList.remove('active');
            btn.innerText = 'オムニ無限ループ 停止中 (クリックで再開)';
            addLog('⏸ ループ一時停止');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ==========================================
// バックエンドロジック
// ==========================================
app.post('/api/v1/omni/flash', async (req, res) => {
    const { actionType, satsAmount } = req.body;
    const targetSats = satsAmount || 2000000000;

    globalRevenueSat += targetSats;
    stasAssetPool += Math.floor(targetSats * 0.8);
    const mockTxId = crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex');

    io.emit('LIVE_UPDATE', {
        source: actionType,
        message: `${targetSats.toLocaleString()} SAT 自動回収・同期`,
        revenue: globalRevenueSat,
        compoundPool: stasAssetPool,
        txid: mockTxId
    });

    res.json({ success: true, txid: mockTxId, revenue: globalRevenueSat, compoundPool: stasAssetPool });
});

setInterval(() => {
    if (!omniFlashEngineActive) return;
    const autoSats = 1000000000;
    globalRevenueSat += autoSats;
    stasAssetPool += Math.floor(autoSats * 0.8);
    const backgroundTxId = crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex');
    
    io.emit('LIVE_UPDATE', {
        source: 'quantum_sync',
        message: `${autoSats.toLocaleString()} SAT 自動インデックス同期`,
        revenue: globalRevenueSat,
        compoundPool: stasAssetPool,
        txid: backgroundTxId
    });
}, 1500);

io.on('connection', (socket) => {
    socket.emit('INIT_STATE', {
        revenue: globalRevenueSat,
        nodes: activeNodes,
        compoundPool: stasAssetPool
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Q-LUX Enterprise Omni Core] ポート ${PORT} で稼働中...`);
});
