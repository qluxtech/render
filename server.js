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
let globalRevenueSat = 15023000000000; 
let activeNodes = 3000000000; 
let stasAssetPool = 1518400000000; 
let omniFlashEngineActive = true;

// ==========================================
// エンタープライズ・スマートUI（全機能＆ビジュアル完全統合）
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Q-LUX // OMNI-ENTERPRISE CORE</title>
      <style>
        :root {
          --bg-primary: #090a0f;
          --bg-secondary: #131620;
          --border-color: #1e2638;
          --accent-cyan: #00ffcc;
          --accent-pink: #ff00aa;
          --text-main: #f1f5f9;
          --text-muted: #94a3b8;
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
        .wrapper {
          width: 100%;
          max-width: 480px;
        }
        .header {
          text-align: center;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .header h1 {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--accent-cyan);
          margin: 0;
        }
        .header p {
          font-size: 9px;
          color: var(--accent-pink);
          letter-spacing: 1px;
          margin: 4px 0 0;
          font-weight: 600;
        }
        
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
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 12px 8px;
          margin-bottom: 14px;
          text-align: center;
        }
        .stat-item div:first-child {
          font-size: 7.5px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .stat-item div:last-child {
          font-size: 11px;
          color: var(--accent-pink);
          font-weight: 700;
          margin-top: 4px;
        }

        .card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
        }
        .card-title {
          color: var(--text-main);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .card-desc {
          color: var(--text-muted);
          font-size: 10px;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        
        .code-tag {
          background: #05070b;
          border: 1px solid var(--border-color);
          color: var(--accent-cyan);
          font-family: monospace;
          font-size: 9px;
          padding: 6px;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 8px;
        }
        
        button {
          background: linear-gradient(135deg, #00ffcc 0%, #ff00aa 100%);
          color: #090a0f;
          border: none;
          padding: 10px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          font-size: 11px;
          transition: opacity 0.2s;
        }
        button:hover { opacity: 0.9; }
        button.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid #10b98155;
        }

        .qr-container { text-align: center; margin: 8px 0; }
        .qr-box { background: #fff; padding: 6px; display: inline-block; border-radius: 6px; }
        .qr-box img { width: 75px; height: 75px; display: block; }

        .log-box {
          background: #05070b;
          border: 1px solid var(--border-color);
          padding: 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 9.5px;
          height: 80px;
          overflow-y: auto;
          color: var(--accent-cyan);
          margin-top: 6px;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Q-LUX OMNI-ENTERPRISE</h1>
          <p>ZERO-CAPITAL FLASH-LOAN YIELD CORE</p>
        </div>

        <div class="net-box">
          <canvas id="netCanvas"></canvas>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div>TOTAL REVENUE</div>
            <div id="rev">15,023,000,000,000 SAT</div>
          </div>
          <div class="stat-item">
            <div>OMNI NODES</div>
            <div>3,000,000,000</div>
          </div>
          <div class="stat-item">
            <div>FLASH POOL</div>
            <div id="pool">1,518,400,000,000 SAT</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">ゼロ資本・フラッシュローン超高速調達エンジン</div>
          <div class="card-desc">グローバル流動性プールから一瞬で資金を借り入れ利ざやを自動強奪。</div>
          <button onclick="triggerAction('omni_flash_exec', 20000000000)">フラッシュローン即時発動 (20,000,000,000 SAT)</button>
        </div>

        <div class="card">
          <div class="card-title">自動アービトラージグリッド</div>
          <div class="card-desc">市場格差をミリ秒で検知し、仲介手数料を相殺して利益を最大化。</div>
          <div class="code-tag">OMNI-ARBITRAGE-ULTIMATE-v999.conf</div>
          <button onclick="triggerAction('arbitrage_boost', 50000000000)">アービトラージブースト全開 (50,000,000,000 SAT)</button>
        </div>

        <div class="card">
          <div class="card-title">オムニ無限再投資スパイラル</div>
          <div class="card-desc">回収した利ざやを秒単位でプールに自動組み込み、複利で雪だるま式拡大。</div>
          <button id="compoundBtn" class="active" onclick="toggleCompound()">オムニ無限ループ 超稼働中 (完全無人)</button>
        </div>

        <div class="card">
          <div class="card-title">AI自己進化型フラッシュ・オートパイロット</div>
          <div class="card-desc">AIがリアルタイムで最も収益性の高いネットワークパスを選択。</div>
          <div class="code-tag">AI-OMNI-AUTOPILOT-v99.json</div>
          <button onclick="triggerAction('ai_flash_ai', 100000000000)">AIオートパイロット全開起動 (100,000,000,000 SAT)</button>
        </div>

        <div class="card">
          <div class="card-title">HandCash メガロイヤルティー一括回収</div>
          <div class="card-desc">指定宛先 (vlisdigitalassetlabs@handcash.io) への全ネットワーク収益回収。</div>
          <div class="qr-container">
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=vlisdigitalassetlabs@handcash.io" alt="Paymail QR">
            </div>
          </div>
          <button onclick="triggerAction('collect_all_omni', 200000000000)">全ネット収益を一括フラッシュ回収</button>
        </div>

        <div class="card">
          <div class="card-title">リアルタイム・オムニ監査コンソール (2026.08)</div>
          <div id="log" class="log-box">[05:28:10] 🔗 オムニ・フラッシュ接続完了：ゼロ資本アービトラージ解放</div>
        </div>
      </div>

      <script src="/socket.io/socket.io.js"></script>
      <script>
        const canvas = document.getElementById('netCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles = Array.from({length: 60}, () => ({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2.0, vy: (Math.random() - 0.5) * 2.0
        }));

        function drawNet() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx.strokeStyle = 'rgba(0,255,204,0.3)';
          ctx.fillStyle = '#ff00aa';
          particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
            for(let j = i+1; j < particles.length; j++) {
              let p2 = particles[j];
              let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
              if(dist < 110) {
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
          addLog('[' + data.source.toUpperCase() + '] ' + data.message.toLocaleString() + ' | Tx: ' + data.txid.substring(0,10) + '...');
        });

        function updateStats(rev, pool) {
          document.getElementById('rev').innerText = rev.toLocaleString() + ' SAT';
          document.getElementById('pool').innerText = pool.toLocaleString() + ' SAT';
        }

        function addLog(msg) {
          const log = document.getElementById('log');
          const time = new Date().toTimeString().split(' ')[0];
          log.innerHTML += '<br>[' + time + '] ' + msg;
          log.scrollTop = log.scrollHeight;
        }

        async function triggerAction(actionType, amount) {
          addLog('🚀 ' + actionType + ' インジェクション発動...');
          try {
            const res = await fetch('/api/v1/omni/flash', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ actionType, satsAmount: amount })
            });
            const data = await res.json();
            if(data.success) {
              addLog('✅ 承認完了: ' + amount.toLocaleString() + ' SAT 利益確定');
            }
          } catch(e) {
            addLog('❌ 通信エラー: リカバリー実行');
          }
        }

        let isCompoundActive = true;
        function toggleCompound() {
          isCompoundActive = !isCompoundActive;
          const btn = document.getElementById('compoundBtn');
          if(isCompoundActive) {
            btn.classList.add('active');
            btn.innerText = 'オムニ無限ループ 超稼働中 (完全無人)';
            addLog('🔄 再投資スパイラル再始動');
          } else {
            btn.classList.remove('active');
            btn.innerText = 'オムニ無限ループ 停止中 (クリックで再開)';
            addLog('⏸️ ループ一時停止');
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
        message: `${targetSats.toLocaleString()} SAT フラッシュ自動回収`,
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
        source: 'omni_flash_auto',
        message: `${autoSats.toLocaleString()} SAT ゼロ資本フラッシュローン自動回収`,
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
    console.log(`[OMNI-ENTERPRISE CORE] ポート ${PORT} で稼働中...`);
});
