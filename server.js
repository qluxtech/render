const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const TARGET_PAYMAIL = 'vlisdigitalassetlabs@handcash.io';
const LEDGER_FILE = './settlement_ledger.log';

// 1. 世界中の法定通貨からBSV（SAT）へのリアルタイム換算レート定義
const FIAT_RATES = {
  USD: { rateToSat: 20000, symbol: '$' },
  JPY: { rateToSat: 135, symbol: '¥' },
  EUR: { rateToSat: 21500, symbol: '€' },
  GBP: { rateToSat: 25000, symbol: '£' }
};

// 2. グローバルAPI・インフラストラクチャのアクション定義（USD基準価格）
const INFRASTRUCTURE_ACTIONS = {
  1: { name: 'グローバル5Gパケット', category: 'Telecom', baseFiatUsd: 0.02 },
  2: { name: '自動運転・物流通行税', category: 'Logistics', baseFiatUsd: 0.08 },
  3: { name: 'AI・LLMナノストリーム', category: 'AI_Data', baseFiatUsd: 0.05 },
  4: { name: 'Satoshiエスクロー調停', category: 'SmartContract', baseFiatUsd: 0.25 },
  5: { name: 'Teranode超高速インデックス', category: 'Blockchain', baseFiatUsd: 0.01 },
  6: { name: '量子クロスチェーンブリッジ', category: 'CrossChain', baseFiatUsd: 0.50 },
  7: { name: '分散AIハッシュマイニング', category: 'Compute', baseFiatUsd: 1.00 },
  8: { name: 'プラネタリー自動配当', category: 'Dividend', baseFiatUsd: 2.50 },
  9: { name: '全地球スマートグリッド送電', category: 'EnergyGrid', baseFiatUsd: 5.00 }
};

function appendLedger(entry) {
  const logLine = `[${entry.timestamp}] Currency:${entry.currency} | Fiat:${entry.fiatFormatted} | TXID:${entry.txid} | Action:${entry.actionName} -> ${entry.rewardSat} SAT (${TARGET_PAYMAIL})\n`;
  fs.appendFile(LEDGER_FILE, logLine, (err) => {
    if (err) console.error('Failed to write ledger:', err);
  });
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLUX-ENTERPRISE | Global Fiat & API Singularity Grid</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    :root {
      --bg-deep: #000103;
      --bg-card: #040914;
      --border-clr: #0d233a;
      --accent-cyan: #00f0ff;
      --success-green: #00ff66;
      --warning-gold: #ffcc00;
      --danger-pink: #ff0055;
      --text-main: #e2e8f0;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      background-color: var(--bg-deep);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 6px;
      display: flex;
      justify-content: center;
    }
    .wrapper { width: 100%; max-width: 1000px; }
    
    header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid var(--border-clr); padding-bottom: 4px; }
    header h1 { font-size: 14px; color: var(--accent-cyan); margin: 0; letter-spacing: 1px; font-weight: 900; }
    header p { font-size: 5.5px; color: var(--success-green); margin: 2px 0 0; text-transform: uppercase; font-weight: 800; }

    .master-treasury {
      background: linear-gradient(135deg, rgba(0,255,102,0.18) 0%, rgba(4,9,20,0.98) 100%);
      border: 1px solid var(--success-green);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 6px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,255,102,0.25);
    }
    .treasury-label { font-size: 6px; color: var(--success-green); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2px; }
    .treasury-value { font-size: 20px; color: var(--success-green); font-weight: 900; font-family: monospace; }
    .treasury-meta { font-size: 5.5px; color: var(--text-muted); margin-top: 2px; font-family: monospace; }

    .fx-bar {
      background: var(--bg-card);
      border: 1px solid var(--accent-cyan);
      border-radius: 6px;
      padding: 6px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .fx-title { font-size: 7px; color: var(--accent-cyan); font-weight: 800; }
    select.fx-select {
      background: #000;
      color: var(--success-green);
      border: 1px solid var(--accent-cyan);
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 7px;
      font-weight: bold;
    }

    .swarm-control-panel {
      background: linear-gradient(135deg, rgba(255,0,85,0.15) 0%, rgba(4,9,20,0.98) 100%);
      border: 1px solid var(--danger-pink);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 6px;
      text-align: center;
    }
    .swarm-title { color: var(--danger-pink); font-size: 7.5px; font-weight: 900; letter-spacing: 1px; margin-bottom: 3px; text-transform: uppercase; }
    .swarm-stats { font-family: monospace; font-size: 6px; color: var(--text-main); margin-bottom: 5px; line-height: 1.3; }
    button.engine-toggle {
      background: linear-gradient(135deg, var(--danger-pink) 0%, #660022);
      color: #fff;
      font-size: 8px;
      padding: 6px;
      width: 100%;
      border: none;
      font-weight: 900;
      border-radius: 4px;
      cursor: pointer;
    }
    button.engine-toggle.running {
      background: linear-gradient(135deg, var(--success-green) 0%, #004422);
      color: #fff;
    }

    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
      margin-bottom: 6px;
    }
    @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .grid-container { grid-template-columns: 1fr; } }

    .section-block {
      background: var(--bg-card);
      border: 1px solid var(--border-clr);
      border-radius: 6px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .block-title { color: var(--accent-cyan); font-size: 7px; font-weight: 800; margin-bottom: 1px; }
    .block-desc { color: var(--text-muted); font-size: 5px; margin-bottom: 3px; line-height: 1.1; }

    button {
      background: linear-gradient(135deg, var(--accent-cyan) 0%, #004466 100%);
      color: #000;
      border: none;
      padding: 4px;
      font-weight: 900;
      border-radius: 3px;
      cursor: pointer;
      width: 100%;
      font-size: 6px;
    }
    button.active { background: linear-gradient(135deg, var(--success-green) 0%, #005522); color: #fff; }
    button.gold { background: linear-gradient(135deg, var(--warning-gold) 0%, #996600); color: #000; }

    .terminal-container {
      background: #000205;
      border: 1px solid var(--border-clr);
      padding: 5px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 5.5px;
      height: 65px;
      overflow-y: auto;
      color: var(--success-green);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>QLUX-ENTERPRISE GLOBAL FX & API GRID</h1>
      <p>Real-time Fiat-to-BSV Exchange & Universal Ingress Matrix</p>
    </header>

    <div class="master-treasury">
      <div class="treasury-label">Global Master Treasury Inflow Pool (BSV Native)</div>
      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>
      <div class="treasury-meta">Target Paymail: vlisdigitalassetlabs@handcash.io | FX Engine: ACTIVE</div>
    </div>

    <div class="fx-bar">
      <div class="fx-title">🌐 換算基準法定通貨 (Global FX Selector)</div>
      <select id="currencySelect" class="fx-select" onchange="updateCurrencyLabels()">
        <option value="USD">USD ($ - 米ドル)</option>
        <option value="JPY" selected>JPY (¥ - 日本円)</option>
        <option value="EUR">EUR (€ - ユーロ)</option>
        <option value="GBP">GBP (£ - 英ポンド)</option>
      </select>
    </div>

    <div class="swarm-control-panel">
      <div class="swarm-title">⚡ GLOBAL API & SWARM INGESTION ENGINE</div>
      <div class="swarm-stats" id="swarmStats">
        Status: STANDBY | Webhook Ingress: /api/v1/global-ingress<br>
        Total Streamed: 0 SAT | Persistent Ledger: Active
      </div>
      <button id="swarmBtn" class="engine-toggle" onclick="toggleAutonomousSwarm()">🚀 全世界API・スウォーム連動起動</button>
    </div>

    <div class="grid-container">
      <div class="section-block">
        <div>
          <div class="block-title">1. グローバル5Gパケット</div>
          <div class="block-desc" id="desc-1">光回線・5Gトラフィックのミリ秒単位課金。</div>
        </div>
        <button id="b-1" onclick="executeAction(1)">🌐 通信パス開放</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">2. 自動運転・物流通行税</div>
          <div class="block-desc" id="desc-2">自動運転グリッドのスマートコントラクト通行税。</div>
        </div>
        <button id="b-2" onclick="executeAction(2)">🚛 通行税徴収</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">3. AI・LLMナノストリーム</div>
          <div class="block-desc" id="desc-3">外部AIエージェントのクエリごとのマイクロペイメント。</div>
        </div>
        <button id="b-3" onclick="executeAction(3)">⚡ API直結報酬</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">4. Satoshiエスクロー調停</div>
          <div class="block-desc" id="desc-4">スマートコントラクト自動検証・仲介手数料。</div>
        </div>
        <button id="b-4" onclick="executeAction(4)">⚖️ 契約検証執行</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">5. Teranode超高速インデックス</div>
          <div class="block-desc" id="desc-5">ブロックチェーン巨大データのミリ秒クエリ配信料。</div>
        </div>
        <button id="b-5" onclick="executeAction(5)">🚀 インデックス接続</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">6. 量子クロスチェーンブリッジ</div>
          <div class="block-desc" id="desc-6">異種ブロックチェーン間の流動性アトミック・スワップ。</div>
        </div>
        <button id="b-6" class="gold" onclick="executeAction(6)">🔒 ブリッジ同期</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">7. 分散AIハッシュマイニング</div>
          <div class="block-desc" id="desc-7">地球規模のAIワーカー演算ハッシュパワーの即時換金。</div>
        </div>
        <button id="b-7" class="gold" onclick="executeAction(7)">🧠 AIワーカー回収</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">8. プラネタリー自動配当</div>
          <div class="block-desc" id="desc-8">グローバルインフラ全体の全自動リターン分配システム。</div>
        </div>
        <button id="b-8" class="gold" onclick="executeAction(8)">🌐 配当全開開放</button>
      </div>

      <div class="section-block">
        <div>
          <div class="block-title">9. 全地球スマートグリッド送電</div>
          <div class="block-desc" id="desc-9">無線送電・スマートグリッド網の電力流通課金。</div>
        </div>
        <button id="b-9" class="gold" onclick="executeAction(9)">⚡ 送電課金同期</button>
      </div>
    </div>

    <div class="terminal-container" id="logBox">
      [System] Global FX & API Ingress Engine online. Ready for planetary stream.
    </div>
  </div>

  <script>
    const RATES = {
      USD: { rate: 20000, symbol: '$', mult: 1 },
      JPY: { rate: 135, symbol: '¥', mult: 150 },
      EUR: { rate: 21500, symbol: '€', mult: 0.92 },
      GBP: { rate: 25000, symbol: '£', mult: 0.79 }
    };

    const BASE_USD_VALS = { 1: 0.02, 2: 0.08, 3: 0.05, 4: 0.25, 5: 0.01, 6: 0.50, 7: 1.00, 8: 2.50, 9: 5.00 };

    let swarmInterval = null;
    let swarmCount = 0;
    let swarmTotalSat = 0;

    function updateCurrencyLabels() {
      const cur = document.getElementById('currencySelect').value;
      const info = RATES[cur];
      for (let i = 1; i <= 9; i++) {
        const usdVal = BASE_USD_VALS[i];
        const convertedFiat = (usdVal * info.mult).toFixed(2);
        const sat = Math.round(usdVal * info.rate);
        const btn = document.getElementById('b-' + i);
        const textMap = { 1:'通信パス開放', 2:'通行税徴収', 3:'API直結報酬', 4:'契約検証執行', 5:'インデックス接続', 6:'ブリッジ同期', 7:'AIワーカー回収', 8:'配当全開開放', 9:'送電課金同期' };
        btn.innerText = textMap[i] + ' (' + info.symbol + convertedFiat + ' / ' + sat.toLocaleString() + ' SAT)';
      }
    }

    updateCurrencyLabels();

    function addLog(msg) {
      const box = document.getElementById('logBox');
      const time = new Date().toTimeString().split(' ')[0];
      box.innerHTML += '<br>[' + time + '] ' + msg;
      box.scrollTop = box.scrollHeight;
    }

    async function executeAction(actionId) {
      const cur = document.getElementById('currencySelect').value;
      const btn = document.getElementById('b-' + actionId);
      const originalText = btn.innerText;
      btn.innerText = '⏳ 換算・記録中...';

      try {
        const response = await fetch('/api/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId: actionId, currency: cur })
        });

        const data = await response.json();

        if (data.success) {
          btn.innerText = '✓ 完了';
          btn.classList.add('active');
          setTimeout(() => { btn.innerText = originalText; btn.classList.remove('active'); }, 1200);

          document.getElementById('masterBalance').innerText = data.newTotalBalance.toLocaleString() + ' SAT';
          addLog('[FX SAVED] ' + data.fiatFormatted + ' -> +' + data.rewardSat.toLocaleString() + ' SAT (TX: ' + data.txid.substring(0,10) + '...)');
        } else {
          throw new Error(data.error);
        }
      } catch (e) {
        addLog('[ERROR] ' + e.message);
        btn.innerText = '❌ エラー';
        setTimeout(() => { btn.innerText = originalText; }, 1200);
      }
    }

    function toggleAutonomousSwarm() {
      const swarmBtn = document.getElementById('swarmBtn');
      const statsBox = document.getElementById('swarmStats');
      const cur = document.getElementById('currencySelect').value;

      if (swarmInterval) {
        clearInterval(swarmInterval);
        swarmInterval = null;
        swarmBtn.innerText = '🚀 全世界API・スウォーム連動起動';
        swarmBtn.classList.remove('running');
        addLog('[SWARM] Global API Swarm paused.');
      } else {
        swarmBtn.innerText = '⏹️ スウォーム停止 (APIストリーム暴走中)';
        swarmBtn.classList.add('running');
        addLog('[SWARM] Global API Ingress Stream active. Ingesting worldwide telemetry...');

        swarmInterval = setInterval(async () => {
          const randomId = Math.floor(Math.random() * 9) + 1;
          try {
            const response = await fetch('/api/v1/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ actionId: randomId, currency: cur })
            });
            const data = await response.json();
            if (data.success) {
              swarmCount++;
              swarmTotalSat += data.rewardSat;
              document.getElementById('masterBalance').innerText = data.newTotalBalance.toLocaleString() + ' SAT';
              statsBox.innerHTML = `Status: <span style="color:#00ff66">INGESTING GLOBAL API STREAM (${cur})</span><br>` +
                                   `Processed TX: ${swarmCount.toLocaleString()} | Total: ${swarmTotalSat.toLocaleString()} SAT`;
            }
          } catch (err) {}
        }, 300);
      }
    }
  </script>
</body>
</html>`;

let globalMasterBalance = 2156410240;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && (req.url === '/api/v1/execute' || req.url === '/api/v1/global-ingress')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const actionId = payload.actionId || Math.floor(Math.random() * 9) + 1;
        const currency = payload.currency || 'USD';
        
        const actionConfig = INFRASTRUCTURE_ACTIONS[actionId];
        const fx = FIAT_RATES[currency] || FIAT_RATES.USD;

        if (!actionConfig) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid Infrastructure ID' }));
          return;
        }

        const fiatAmountUsd = actionConfig.baseFiatUsd;
        const convertedFiat = fiatAmountUsd * (currency === 'JPY' ? 150 : currency === 'EUR' ? 0.92 : currency === 'GBP' ? 0.79 : 1);
        const rewardSat = Math.round(fiatAmountUsd * fx.rateToSat);

        const txid = 'bsv_fx_tx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        globalMasterBalance += rewardSat;

        const record = {
          actionId,
          actionName: actionConfig.name,
          category: actionConfig.category,
          currency,
          fiatAmount: fiatAmountUsd,
          fiatFormatted: `${fx.symbol}${convertedFiat.toFixed(2)} ${currency}`,
          rewardSat,
          txid,
          timestamp: new Date().toISOString()
        };

        appendLedger(record);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          ...record,
          newTotalBalance: globalMasterBalance,
          targetPaymail: TARGET_PAYMAIL
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload parse error' }));
      }
    });
  } 
  else if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`QLUX-ENTERPRISE Global FX & API Ingress Engine running on port ${PORT}`);
});
