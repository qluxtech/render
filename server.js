const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const TARGET_PAYMAIL = 'vlisdigitalassetlabs@handcash.io';
const LEDGER_FILE = './settlement_ledger.log';

const FIAT_RATES = {
  USD: { rateToSat: 20000, symbol: '$', mult: 1 },
  JPY: { rateToSat: 135, symbol: '¥', mult: 150 },
  EUR: { rateToSat: 21500, symbol: '€', mult: 0.92 },
  GBP: { rateToSat: 25000, symbol: '£', mult: 0.79 }
};

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
  const logLine = '[' + entry.timestamp + '] SINGULARITY_MODE:' + entry.mode + ' | Currency:' + entry.currency + ' | Flow:' + entry.amountFormatted + ' | TXID:' + entry.txid + ' | Paymail:' + TARGET_PAYMAIL + '\n';
  fs.appendFile(LEDGER_FILE, logLine, function(err) {
    if (err) console.error('Failed to write ledger:', err);
  });
}

const HTML_CONTENT = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>QLUX-ENTERPRISE | Planetary Singularity BSV Exchange</title>\n' +
'  <style>\n' +
'    :root {\n' +
'      --bg-deep: #000103;\n' +
'      --bg-card: #040914;\n' +
'      --border-clr: #0d233a;\n' +
'      --accent-cyan: #00f0ff;\n' +
'      --success-green: #00ff66;\n' +
'      --warning-gold: #ffcc00;\n' +
'      --danger-pink: #ff0055;\n' +
'      --text-main: #e2e8f0;\n' +
'      --text-muted: #64748b;\n' +
'    }\n' +
'    * { box-sizing: border-box; }\n' +
'    body {\n' +
'      background-color: var(--bg-deep);\n' +
'      color: var(--text-main);\n' +
'      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'      margin: 0;\n' +
'      padding: 6px;\n' +
'      display: flex;\n' +
'      justify-content: center;\n' +
'    }\n' +
'    .wrapper { width: 100%; max-width: 1000px; }\n' +
'    header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid var(--border-clr); padding-bottom: 4px; }\n' +
'    header h1 { font-size: 13px; color: var(--accent-cyan); margin: 0; letter-spacing: 0.5px; font-weight: 900; }\n' +
'    header p { font-size: 5.5px; color: var(--success-green); margin: 2px 0 0; text-transform: uppercase; font-weight: 800; }\n' +
'    \n' +
'    .master-treasury {\n' +
'      background: linear-gradient(135deg, rgba(0,255,102,0.2) 0%, rgba(4,9,20,0.98) 100%);\n' +
'      border: 1px solid var(--success-green);\n' +
'      border-radius: 8px;\n' +
'      padding: 8px;\n' +
'      margin-bottom: 6px;\n' +
'      text-align: center;\n' +
'      box-shadow: 0 0 25px rgba(0,255,102,0.3);\n' +
'    }\n' +
'    .treasury-label { font-size: 6px; color: var(--success-green); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2px; }\n' +
'    .treasury-value { font-size: 21px; color: var(--success-green); font-weight: 900; font-family: monospace; }\n' +
'    .treasury-meta { font-size: 5px; color: var(--text-muted); margin-top: 2px; font-family: monospace; }\n' +
'\n' +
'    .fx-bar {\n' +
'      background: var(--bg-card);\n' +
'      border: 1px solid var(--accent-cyan);\n' +
'      border-radius: 6px;\n' +
'      padding: 6px;\n' +
'      margin-bottom: 6px;\n' +
'      display: flex;\n' +
'      justify-content: space-between;\n' +
'      align-items: center;\n' +
'    }\n' +
'    .fx-title { font-size: 7px; color: var(--accent-cyan); font-weight: 800; }\n' +
'    select.fx-select {\n' +
'      background: #000;\n' +
'      color: var(--success-green);\n' +
'      border: 1px solid var(--accent-cyan);\n' +
'      padding: 3px 6px;\n' +
'      border-radius: 4px;\n' +
'      font-size: 7px;\n' +
'      font-weight: bold;\n' +
'    }\n' +
'\n' +
'    .exchange-box {\n' +
'      background: linear-gradient(135deg, rgba(255,204,0,0.12) 0%, rgba(4,9,20,0.98) 100%);\n' +
'      border: 1px solid var(--warning-gold);\n' +
'      border-radius: 8px;\n' +
'      padding: 8px;\n' +
'      margin-bottom: 6px;\n' +
'    }\n' +
'    .exchange-title { font-size: 7.5px; color: var(--warning-gold); font-weight: 900; margin-bottom: 4px; text-transform: uppercase; }\n' +
'    .exchange-row { display: flex; gap: 5px; align-items: center; margin-bottom: 4px; }\n' +
'    input.ex-input {\n' +
'      background: #000;\n' +
'      color: var(--warning-gold);\n' +
'      border: 1px solid var(--warning-gold);\n' +
'      padding: 5px;\n' +
'      border-radius: 4px;\n' +
'      font-size: 7.5px;\n' +
'      width: 100%;\n' +
'      font-family: monospace;\n' +
'      font-weight: bold;\n' +
'    }\n' +
'\n' +
'    .grid-container {\n' +
'      display: grid;\n' +
'      grid-template-columns: 1fr 1fr 1fr;\n' +
'      gap: 5px;\n' +
'      margin-bottom: 6px;\n' +
'    }\n' +
'    @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr; } }\n' +
'    @media (max-width: 480px) { .grid-container { grid-template-columns: 1fr; } }\n' +
'\n' +
'    .section-block {\n' +
'      background: var(--bg-card);\n' +
'      border: 1px solid var(--border-clr);\n' +
'      border-radius: 6px;\n' +
'      padding: 5px;\n' +
'      display: flex;\n' +
'      flex-direction: column;\n' +
'      justify-content: space-between;\n' +
'    }\n' +
'    .block-title { color: var(--accent-cyan); font-size: 7px; font-weight: 800; margin-bottom: 2px; }\n' +
'\n' +
'    button {\n' +
'      background: linear-gradient(135deg, var(--accent-cyan) 0%, #004466 100%);\n' +
'      color: #000;\n' +
'      border: none;\n' +
'      padding: 5px;\n' +
'      font-weight: 900;\n' +
'      border-radius: 3px;\n' +
'      cursor: pointer;\n' +
'      width: 100%;\n' +
'      font-size: 6px;\n' +
'    }\n' +
'    button.gold {\n' +
'      background: linear-gradient(135deg, var(--warning-gold) 0%, #996600 100%);\n' +
'      color: #000;\n' +
'      font-size: 7px;\n' +
'      padding: 6px;\n' +
'    }\n' +
'    button.active { background: linear-gradient(135deg, var(--success-green) 0%, #005522); color: #fff; }\n' +
'\n' +
'    .terminal-container {\n' +
'      background: #000205;\n' +
'      border: 1px solid var(--border-clr);\n' +
'      padding: 5px;\n' +
'      border-radius: 6px;\n' +
'      font-family: monospace;\n' +
'      font-size: 5.5px;\n' +
'      height: 70px;\n' +
'      overflow-y: auto;\n' +
'      color: var(--success-green);\n' +
'    }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrapper">\n' +
'    <header>\n' +
'      <h1>QLUX-ENTERPRISE PLANETARY SINGULARITY BSV EXCHANGE</h1>\n' +
'      <p>The Ultimate Decentralized Multi-Currency & Teranode Gateway</p>\n' +
'    </header>\n' +
'\n' +
'    <div class="master-treasury">\n' +
'      <div class="treasury-label">Global Master Treasury Inflow Pool (BSV Native)</div>\n' +
'      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>\n' +
'      <div class="treasury-meta">Paymail: vlisdigitalassetlabs@handcash.io | Teranode Mesh: ONLINE</div>\n' +
'    </div>\n' +
'\n' +
'    <div class="fx-bar">\n' +
'      <div class="fx-title">🌐 換算基準法定通貨 (Global FX Selector)</div>\n' +
'      <select id="currencySelect" class="fx-select" onchange="updateAll()">\n' +
'        <option value="USD">USD ($ - 米ドル)</option>\n' +
'        <option value="JPY" selected>JPY (¥ - 日本円)</option>\n' +
'        <option value="EUR">EUR (€ - ユーロ)</option>\n' +
'        <option value="GBP">GBP (£ - 英ポンド)</option>\n' +
'      </select>\n' +
'    </div>\n' +
'\n' +
'    <div class="exchange-box">\n' +
'      <div class="exchange-title">⚡ 超高速双方向エクスチェンジ (BSV ⇄ 法定通貨 即時ルート)</div>\n' +
'      <div class="exchange-row">\n' +
'        <input type="number" id="satInput" class="ex-input" placeholder="SAT数を入力 (例: 100000)" oninput="calcSatToFiat()">\n' +
'        <span id="fiatOutput" style="font-size:7.5px; color:var(--warning-gold); font-weight:bold; white-space:nowrap; font-family:monospace;">= ¥0.00 JPY</span>\n' +
'      </div>\n' +
'      <button class="gold" onclick="executeBsvToFiat()">🚀 BSVから法定通貨へ瞬間エクスチェンジ＆送金執行</button>\n' +
'    </div>\n' +
'\n' +
'    <div class="grid-container" id="gridContainer"></div>\n' +
'\n' +
'    <div class="terminal-container" id="logBox">\n' +
'      [System] Planetary Singularity BSV Exchange online. Ready for ultra-high-speed settlement.\n' +
'    </div>\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    const RATES = { USD: {r:20000,s:"$",m:1}, JPY: {r:135,s:"¥",m:150}, EUR: {r:21500,s:"€",m:0.92}, GBP: {r:25000,s:"£",m:0.79} };\n' +
'    const ACTIONS = { 1:"5Gパケット", 2:"物流通行税", 3:"AIナノストリーム", 4:"エスクロー調停", 5:"高速インデックス", 6:"量子ブリッジ", 7:"AIマイニング", 8:"自動配当", 9:"スマートグリッド" };\n' +
'    const USD_VALS = { 1:0.02, 2:0.08, 3:0.05, 4:0.25, 5:0.01, 6:0.50, 7:1.00, 8:2.50, 9:5.00 };\n' +
'\n' +
'    function updateAll() {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const inf = RATES[cur];\n' +
'      const grid = document.getElementById("gridContainer");\n' +
'      grid.innerHTML = "";\n' +
'      for(let i=1; i<=9; i++) {\n' +
'        const fiat = (USD_VALS[i] * inf.m).toFixed(2);\n' +
'        const sat = Math.round(USD_VALS[i] * inf.r);\n' +
'        grid.innerHTML += \'<div class="section-block"><div><div class="block-title">\'+i+". "+ACTIONS[i]+\'</div></div><button id="b-\'+i+\'" onclick="exec(\'+i+\')">\'+ACTIONS[i]+\' (\'+inf.s+fiat+\' / \'+sat.toLocaleString()+\' SAT)</button></div>\';\n' +
'      }\n' +
'      calcSatToFiat();\n' +
'    }\n' +
'\n' +
'    function calcSatToFiat() {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const inf = RATES[cur];\n' +
'      const satVal = parseFloat(document.getElementById("satInput").value) || 0;\n' +
'      const fiatVal = (satVal / inf.r) * (cur === "JPY" ? 150 : cur === "EUR" ? 0.92 : cur === "GBP" ? 0.79 : 1);\n' +
'      document.getElementById("fiatOutput").innerText = "= " + inf.s + fiatVal.toFixed(2) + " " + cur;\n' +
'    }\n' +
'\n' +
'    updateAll();\n' +
'\n' +
'    function addLog(msg) {\n' +
'      const box = document.getElementById("logBox");\n' +
'      box.innerHTML += "<br>[" + new Date().toTimeString().split(" ")[0] + "] " + msg;\n' +
'      box.scrollTop = box.scrollHeight;\n' +
'    }\n' +
'\n' +
'    async function exec(id) {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const btn = document.getElementById("b-" + id);\n' +
'      const orig = btn.innerText;\n' +
'      btn.innerText = "⏳ 処理中...";\n' +
'      try {\n' +
'        const res = await fetch("/api/v1/execute", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({actionId:id, currency:cur}) });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'          btn.innerText = "✓ 完了";\n' +
'          btn.classList.add("active");\n' +
'          setTimeout(() => { btn.innerText = orig; btn.classList.remove("active"); }, 1000);\n' +
'          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";\n' +
'          addLog("[INFLOW] " + data.fiatFormatted + " -> +" + data.rewardSat.toLocaleString() + " SAT (TX: " + data.txid.substring(0,10) + ")");\n' +
'        }\n' +
'      } catch(e) { \n' +
'        btn.innerText = "❌ エラー";\n' +
'        setTimeout(() => { btn.innerText = orig; }, 1000);\n' +
'        addLog("[ERROR] Network failure"); \n' +
'      }\n' +
'    }\n' +
'\n' +
'    async function executeBsvToFiat() {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const satVal = parseInt(document.getElementById("satInput").value) || 0;\n' +
'      if(satVal <= 0) { alert("有効なSAT数を入力してください"); return; }\n' +
'      try {\n' +
'        const res = await fetch("/api/v1/exchange-out", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({satAmount: satVal, currency: cur}) });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";\n' +
'          addLog("[EXCHANGE-OUT] " + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted + " (TX: " + data.txid + ")");\n' +
'          alert("✨ 瞬間エクスチェンジ成功！\\n" + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted + "\\nPaymail: " + data.targetPaymail);\n' +
'        } else {\n' +
'          alert("エラー: " + data.error);\n' +
'        }\n' +
'      } catch(e) { addLog("[ERROR] Exchange out failed"); }\n' +
'    }\n' +
'  </script>\n' +
'</body>\n' +
'</html>';

let globalMasterBalance = 2156410240;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/v1/execute') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const actionId = payload.actionId || 1;
        const currency = payload.currency || 'USD';
        const actionConfig = INFRASTRUCTURE_ACTIONS[actionId];
        const fx = FIAT_RATES[currency] || FIAT_RATES.USD;

        const fiatAmountUsd = actionConfig.baseFiatUsd;
        const convertedFiat = fiatAmountUsd * fx.mult;
        const rewardSat = Math.round(fiatAmountUsd * fx.rateToSat);
        globalMasterBalance += rewardSat;

        const record = {
          mode: 'INFLOW_INGRESS',
          actionId,
          currency,
          fiatFormatted: fx.symbol + convertedFiat.toFixed(2) + ' ' + currency,
          amountFormatted: '+' + rewardSat.toLocaleString() + ' SAT',
          rewardSat,
          txid: 'tx_in_' + Math.random().toString(36).substring(2, 12),
          timestamp: new Date().toISOString()
        };

        appendLedger(record);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...record, newTotalBalance: globalMasterBalance }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parse error' }));
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
          res.end(JSON.stringify({ success: false, error: 'プール残高が不足しています' }));
          return;
        }

        const fiatVal = (satAmount / fx.rateToSat) * fx.mult;
        globalMasterBalance -= satAmount;

        const record = {
          mode: 'OUTFLOW_EXCHANGE',
          currency,
          amountFormatted: '-' + satAmount.toLocaleString() + ' SAT',
          fiatFormatted: fx.symbol + fiatVal.toFixed(2) + ' ' + currency,
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
        res.end(JSON.stringify({ success: false, error: 'Exchange parse error' }));
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
  console.log('Planetary Singularity BSV Exchange Server running on port ' + PORT);
});
