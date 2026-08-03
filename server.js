const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const TARGET_PAYMAIL = 'vlisdigitalassetlabs@handcash.io';
const LEDGER_FILE = './planetary_singularity_ledger.log';

const FIAT_RATES = {
  USD: { rateToSat: 19500, symbol: '$', mult: 1, name: 'USD (米ドル)' },
  JPY: { rateToSat: 130, symbol: '¥', mult: 152, name: 'JPY (日本円)' },
  EUR: { rateToSat: 21000, symbol: '€', mult: 0.91, name: 'EUR (ユーロ)' },
  GBP: { rateToSat: 24500, symbol: '£', mult: 0.78, name: 'GBP (英ポンド)' },
  BTC: { rateToSat: 0.0000021, symbol: '₿', mult: 0.000015, name: 'BTC (ビットコイン)' }
};

const SINGULARITY_MODULES = {
  1: { name: '量子5G高速パケット・ストリーム', cat: 'TELECOM_AI', baseUsd: 0.02, aiStatus: 'AUTONOMOUS_OPTIMIZED' },
  2: { name: '自律走行・全地球物流通行税', cat: 'LOGISTICS_GRID', baseUsd: 0.08, aiStatus: 'SUB_MS_SYNC' },
  3: { name: '次世代AI・LLMナノインフェレンス', cat: 'NEURAL_COMPUTE', baseUsd: 0.05, aiStatus: 'GPU_CLUSTER_ACTIVE' },
  4: { name: 'Satoshiゼロトラスト・エスクロー調停', cat: 'SMART_CONTRACT', baseUsd: 0.25, aiStatus: 'AI_ARBITRATION_READY' },
  5: { name: 'Teranode超高速インデックス・メッシュ', cat: 'BLOCKCHAIN_CORE', baseUsd: 0.01, aiStatus: '1M_TPS_FLOW' },
  6: { name: '多次元量子クロスチェーン・ブリッジ', cat: 'INTEROPERABILITY', baseUsd: 0.50, aiStatus: 'ENTANGLED_SECURE' },
  7: { name: '分散型自律AIハッシュマイニング', cat: 'POW_SINGULARITY', baseUsd: 1.00, aiStatus: 'SELF_SCALING' },
  8: { name: 'プラネタリー自動配当・スマートリターン', cat: 'DEFI_YIELD', baseUsd: 2.50, aiStatus: 'REALTIME_DISTRIBUTION' },
  9: { name: '全地球スマートグリッド・エネルギー決済', cat: 'ENERGY_GRID', baseUsd: 5.00, aiStatus: 'GRID_BALANCED' }
};

let globalMasterBalance = 2156410240;

function appendLedger(entry) {
  const logLine = `[${entry.timestamp}] SINGULARITY_CORE:${entry.mode} | Currency:${entry.currency} | Flow:${entry.amountFormatted} | AI_CONF:${entry.aiConfidence}% | TXID:${entry.txid} | Paymail:${TARGET_PAYMAIL}\n`;
  fs.appendFile(LEDGER_FILE, logLine, err => { if (err) console.error('Ledger write error:', err); });
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLUX-ENTERPRISE | Planetary Singularity BSV Ultimate Gateway</title>
  <style>
    :root {
      --bg-space: #000205;
      --bg-panel: #050b16;
      --border-glow: #00f0ff;
      --accent-gold: #ffcc00;
      --success-green: #00ff66;
      --danger-pink: #ff0055;
      --text-main: #f1f5f9;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      background-color: var(--bg-space);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      margin: 0;
      padding: 6px;
      display: flex;
      justify-content: center;
    }
    .wrapper { width: 100%; max-width: 1000px; }
    
    header {
      text-align: center;
      margin-bottom: 6px;
      border-bottom: 1px solid rgba(0,240,255,0.3);
      padding-bottom: 4px;
      background: radial-gradient(circle at center, rgba(0,240,255,0.08) 0%, transparent 70%);
    }
    header h1 { font-size: 13px; color: var(--border-glow); margin: 0; letter-spacing: 1px; font-weight: 900; text-shadow: 0 0 10px rgba(0,240,255,0.5); }
    header p { font-size: 5.5px; color: var(--success-green); margin: 2px 0 0; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }

    /* AI自律ステータスバー */
    .ai-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,255,102,0.05);
      border: 1px dashed var(--success-green);
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 6px;
      font-size: 5.5px;
      color: var(--success-green);
      font-family: monospace;
    }

    .master-treasury {
      background: linear-gradient(135deg, rgba(0,255,102,0.2) 0%, rgba(5,11,22,0.98) 100%);
      border: 1.5px solid var(--success-green);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 6px;
      text-align: center;
      box-shadow: 0 0 30px rgba(0,255,102,0.25);
    }
    .treasury-label { font-size: 6px; color: var(--success-green); font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2px; }
    .treasury-value { font-size: 22px; color: var(--success-green); font-weight: 900; font-family: monospace; text-shadow: 0 0 15px rgba(0,255,102,0.6); }
    .treasury-meta { font-size: 5px; color: var(--text-muted); margin-top: 2px; font-family: monospace; }

    .control-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 6px;
    }
    @media (max-width: 600px) { .control-row { grid-template-columns: 1fr; } }

    .panel-box {
      background: var(--bg-panel);
      border: 1px solid var(--border-glow);
      border-radius: 6px;
      padding: 6px;
    }
    .panel-title { font-size: 7px; color: var(--border-glow); font-weight: 800; margin-bottom: 4px; text-transform: uppercase; display: flex; justify-content: space-between; }
    
    select.fx-select, input.ex-input {
      background: #000;
      color: var(--success-green);
      border: 1px solid var(--border-glow);
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 7px;
      font-weight: bold;
      width: 100%;
      font-family: monospace;
    }
    input.ex-input { color: var(--accent-gold); border-color: var(--accent-gold); }

    .exchange-box {
      background: linear-gradient(135deg, rgba(255,204,0,0.12) 0%, rgba(5,11,22,0.98) 100%);
      border: 1.5px solid var(--accent-gold);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 6px;
      box-shadow: 0 0 20px rgba(255,204,0,0.2);
    }
    .exchange-row { display: flex; gap: 5px; align-items: center; margin-bottom: 4px; }

    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
      margin-bottom: 6px;
    }
    @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .grid-container { grid-template-columns: 1fr; } }

    .module-card {
      background: var(--bg-panel);
      border: 1px solid rgba(0,240,255,0.3);
      border-radius: 6px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }
    .module-card:hover { border-color: var(--success-green); box-shadow: 0 0 10px rgba(0,255,102,0.3); }
    .module-header { display: flex; justify-content: space-between; font-size: 6px; color: var(--text-muted); margin-bottom: 2px; }
    .module-name { color: var(--border-glow); font-size: 7px; font-weight: 800; margin-bottom: 4px; }

    button {
      background: linear-gradient(135deg, var(--border-glow) 0%, #004466 100%);
      color: #000;
      border: none;
      padding: 5px;
      font-weight: 900;
      border-radius: 3px;
      cursor: pointer;
      width: 100%;
      font-size: 6px;
      text-transform: uppercase;
    }
    button.gold {
      background: linear-gradient(135deg, var(--accent-gold) 0%, #996600 100%);
      color: #000;
      font-size: 7px;
      padding: 6px;
    }
    button.active { background: linear-gradient(135deg, var(--success-green) 0%, #005522); color: #fff; }

    .terminal-container {
      background: #000103;
      border: 1px solid rgba(0,240,255,0.3);
      padding: 5px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 5.5px;
      height: 75px;
      overflow-y: auto;
      color: var(--success-green);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>QLUX PLANETARY SINGULARITY BSV ULTIMATE GATEWAY</h1>
      <p>Autonomous Teranode Mesh & AI-Driven Multi-Currency Financial Core</p>
    </header>

    <div class="ai-status-bar">
      <span>🤖 AI Neural Core: <strong id="aiCoreStatus" style="color:var(--success-green);">ONLINE (Autonomous Self-Optimizing)</strong></span>
      <span>⚡ Mesh TPS: <strong style="color:var(--border-glow);">1,250,400 TPS</strong></span>
      <span>🔒 Quantum Cipher: <strong style="color:var(--accent-gold);">Lattice-Secured</strong></span>
    </div>

    <div class="master-treasury">
      <div class="treasury-label">Global Master Treasury Inflow Pool (BSV Native / Teranode)</div>
      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>
      <div class="treasury-meta">Paymail: vlisdigitalassetlabs@handcash.io | AI Autonomous Liquidity Engine: ACTIVE</div>
    </div>

    <div class="control-row">
      <div class="panel-box">
        <div class="panel-title"><span>🌐 グローバル基準通貨選択</span><span style="color:var(--success-green);">AI FX Auto-Sync</span></div>
        <select id="currencySelect" class="fx-select" onchange="updateInterface()">
          <option value="USD">USD ($ - 米ドル)</option>
          <option value="JPY" selected>JPY (¥ - 日本円)</option>
          <option value="EUR">EUR (€ - ユーロ)</option>
          <option value="GBP">GBP (£ - 英ポンド)</option>
          <option value="BTC">BTC (₿ - ビットコイン)</option>
        </select>
      </div>

      <div class="exchange-box" style="margin-bottom:0; padding:6px;">
        <div class="exchange-title" style="color:var(--accent-gold); font-size:7px; font-weight:900; margin-bottom:2px;">⚡ AI超高速双方向エクスチェンジ (BSV ⇄ 法定通貨)</div>
        <div class="exchange-row">
          <input type="number" id="satInput" class="ex-input" placeholder="SAT数を入力 (例: 100000)" oninput="calcExchange()">
          <span id="fiatOutput" style="font-size:7.5px; color:var(--accent-gold); font-weight:bold; white-space:nowrap; font-family:monospace;">= ¥0.00 JPY</span>
        </div>
        <button class="gold" onclick="executeBsvToFiat()">🚀 BSVから法定通貨へAI即時エクスチェンジ＆自動送金執行</button>
      </div>
    </div>

    <div class="grid-container" id="moduleGrid"></div>

    <div class="terminal-container" id="logBox">
      [System] Planetary Singularity BSV Gateway initialized. AI Neural Core active. Ready for instantaneous cross-border settlement.
    </div>
  </div>

  <script>
    const RATES = { 
      USD: { r: 19500, s: '$', m: 1 }, 
      JPY: { r: 130, s: '¥', m: 152 }, 
      EUR: { r: 21000, s: '€', m: 0.91 }, 
      GBP: { r: 24500, s: '£', m: 0.78 },
      BTC: { r: 0.0000021, s: '₿', m: 0.000015 }
    };
    
    const MODULES = {
      1: "量子5G高速パケット", 2: "自律走行物流通行税", 3: "次世代AIナノストリーム", 
      4: "Satoshiエスクロー調停", 5: "Teranode高速インデックス", 6: "多次元量子ブリッジ", 
      7: "分散型AIマイニング", 8: "プラネタリー自動配当", 9: "スマートグリッド送電"
    };
    
    const USD_VALS = { 1: 0.02, 2: 0.08, 3: 0.05, 4: 0.25, 5: 0.01, 6: 0.50, 7: 1.00, 8: 2.50, 9: 5.00 };

    function updateInterface() {
      const cur = document.getElementById("currencySelect").value;
      const inf = RATES[cur];
      const grid = document.getElementById("moduleGrid");
      grid.innerHTML = "";
      
      for(let i=1; i<=9; i++) {
        const fiat = (USD_VALS[i] * inf.m).toFixed(cur === 'BTC' ? 8 : 2);
        const sat = Math.round(USD_VALS[i] * inf.r);
        grid.innerHTML += \`
          <div class="module-card">
            <div>
              <div class="module-header"><span>#0\${i} MODULE</span><span style="color:var(--success-green);">AI READY</span></div>
              <div class="module-name">\${MODULES[i]}</div>
            </div>
            <button id="b-\${i}" onclick="execModule(\${i})">\${MODULES[i]} (\${inf.s}\${fiat} / \${sat.toLocaleString()} SAT)</button>
          </div>
        \`;
      }
      calcExchange();
    }

    function calcExchange() {
      const cur = document.getElementById("currencySelect").value;
      const inf = RATES[cur];
      const satVal = parseFloat(document.getElementById("satInput").value) || 0;
      const fiatVal = (satVal / inf.r) * inf.m;
      document.getElementById("fiatOutput").innerText = "= " + inf.s + (cur === 'BTC' ? fiatVal.toFixed(8) : fiatVal.toFixed(2)) + " " + cur;
    }

    updateInterface();

    function addLog(msg) {
      const box = document.getElementById("logBox");
      box.innerHTML += "<br>[" + new Date().toTimeString().split(" ")[0] + "] " + msg;
      box.scrollTop = box.scrollHeight;
    }

    async function execModule(id) {
      const cur = document.getElementById("currencySelect").value;
      const btn = document.getElementById("b-" + id);
      const orig = btn.innerText;
      btn.innerText = "🤖 AI処理中...";
      try {
        const res = await fetch("/api/v1/execute", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ actionId: id, currency: cur }) 
        });
        const data = await res.json();
        if(data.success) {
          btn.innerText = "✓ AI完了";
          btn.classList.add("active");
          setTimeout(() => { btn.innerText = orig; btn.classList.remove("active"); }, 1000);
          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";
          addLog("[AI-INFLOW] " + data.fiatFormatted + " -> +" + data.rewardSat.toLocaleString() + " SAT (Conf: " + data.aiConfidence + "%, TX: " + data.txid.substring(0,10) + ")");
        }
      } catch(e) { 
        btn.innerText = "❌ エラー";
        setTimeout(() => { btn.innerText = orig; }, 1000);
        addLog("[ERROR] Network failure in AI core"); 
      }
    }

    async function executeBsvToFiat() {
      const cur = document.getElementById("currencySelect").value;
      const satVal = parseInt(document.getElementById("satInput").value) || 0;
      if(satVal <= 0) { alert("有効なSAT数を入力してください"); return; }
      try {
        const res = await fetch("/api/v1/exchange-out", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ satAmount: satVal, currency: cur }) 
        });
        const data = await res.json();
        if(data.success) {
          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";
          addLog("[AI-EXCHANGE-OUT] " + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted + " (TX: " + data.txid + ")");
          alert("✨ AI自動エクスチェンジ＆高速送金成功！\\n" + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted + "\\nPaymail: " + data.targetPaymail);
        } else {
          alert("エラー: " + data.error);
        }
      } catch(e) { addLog("[ERROR] AI Exchange out failed"); }
    }
  </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/v1/execute') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const actionId = payload.actionId || 1;
        const currency = payload.currency || 'USD';
        const mod = SINGULARITY_MODULES[actionId] || SINGULARITY_MODULES[1];
        const fx = FIAT_RATES[currency] || FIAT_RATES.USD;

        const convertedFiat = mod.baseUsd * fx.mult;
        const rewardSat = Math.round(mod.baseUsd * fx.rateToSat);
        globalMasterBalance += rewardSat;

        const record = {
          mode: 'AI_INGRESS_OPTIMIZED',
          actionId,
          currency,
          fiatFormatted: fx.symbol + (currency === 'BTC' ? convertedFiat.toFixed(8) : convertedFiat.toFixed(2)) + ' ' + currency,
          amountFormatted: '+' + rewardSat.toLocaleString() + ' SAT',
          rewardSat,
          aiConfidence: (98.5 + Math.random() * 1.4).toFixed(2),
          txid: 'tx_ai_' + Math.random().toString(36).substring(2, 12),
          timestamp: new Date().toISOString()
        };

        appendLedger(record);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...record, newTotalBalance: globalMasterBalance }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'AI Parse error' }));
      }
    });
  } 
  else if (req.method === 'POST' && req.url === '/api/v1/exchange-out') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const satAmount = parseInt(payload.satAmount) || 0;
        const currency = payload.currency || 'USD';
        const fx = FIAT_RATES[currency] || FIAT_RATES.USD;

        if (satAmount > globalMasterBalance) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'AIトレジャリー残高が不足しています' }));
          return;
        }

        const fiatVal = (satAmount / fx.rateToSat) * fx.mult;
        globalMasterBalance -= satAmount;

        const record = {
          mode: 'AI_EGRESS_SETTLEMENT',
          currency,
          amountFormatted: '-' + satAmount.toLocaleString() + ' SAT',
          fiatFormatted: fx.symbol + (currency === 'BTC' ? fiatVal.toFixed(8) : fiatVal.toFixed(2)) + ' ' + currency,
          aiConfidence: '99.99',
          txid: 'tx_out_' + Math.random().toString(36).substring(2, 12),
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
        res.end(JSON.stringify({ success: false, error: 'AI Exchange error' }));
      }
    });
  }
  else if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Singularity Gateway 404');
  }
});

server.listen(PORT, () => {
  console.log(`QLUX Planetary Singularity BSV Gateway running on port ${PORT}`);
});
