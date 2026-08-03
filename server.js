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
  const logLine = '[' + entry.timestamp + '] Mode:' + entry.mode + ' | Currency:' + entry.currency + ' | Amount:' + entry.amountFormatted + ' | TXID:' + entry.txid + '\n';
  fs.appendFile(LEDGER_FILE, logLine, function(err) {
    if (err) console.error('Failed to write ledger:', err);
  });
}

const HTML_CONTENT = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>QLUX-ENTERPRISE | Ultimate Global FX & BSV Exchange</title>\n' +
'  <style>\n' +
'    body { background-color: #000103; color: #e2e8f0; font-family: sans-serif; margin: 0; padding: 6px; display: flex; justify-content: center; }\n' +
'    .wrapper { width: 100%; max-width: 1000px; }\n' +
'    header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid #0d233a; padding-bottom: 4px; }\n' +
'    header h1 { font-size: 14px; color: #00f0ff; margin: 0; font-weight: 900; }\n' +
'    header p { font-size: 5.5px; color: #00ff66; margin: 2px 0 0; font-weight: 800; }\n' +
'    .master-treasury { background: rgba(0,255,102,0.18); border: 1px solid #00ff66; border-radius: 8px; padding: 8px; margin-bottom: 6px; text-align: center; }\n' +
'    .treasury-label { font-size: 6px; color: #00ff66; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }\n' +
'    .treasury-value { font-size: 20px; color: #00ff66; font-weight: 900; font-family: monospace; }\n' +
'    .exchange-box { background: linear-gradient(135deg, rgba(0,240,255,0.1) 0%, #040914 100%); border: 1px solid #00f0ff; border-radius: 8px; padding: 8px; margin-bottom: 6px; }\n' +
'    .exchange-title { font-size: 7.5px; color: #00f0ff; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; }\n' +
'    .exchange-row { display: flex; gap: 5px; align-items: center; margin-bottom: 4px; }\n' +
'    input.ex-input { background: #000; color: #00ff66; border: 1px solid #00f0ff; padding: 4px; border-radius: 4px; font-size: 7px; width: 100%; font-family: monospace; }\n' +
'    select.fx-select { background: #000; color: #00ff66; border: 1px solid #00f0ff; padding: 4px; border-radius: 4px; font-size: 7px; font-weight: bold; }\n' +
'    .fx-bar { background: #040914; border: 1px solid #00f0ff; border-radius: 6px; padding: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }\n' +
'    .fx-title { font-size: 7px; color: #00f0ff; font-weight: 800; }\n' +
'    .grid-container { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 6px; }\n' +
'    .section-block { background: #040914; border: 1px solid #0d233a; border-radius: 6px; padding: 5px; display: flex; flex-direction: column; justify-content: space-between; }\n' +
'    .block-title { color: #00f0ff; font-size: 7px; font-weight: 800; margin-bottom: 1px; }\n' +
'    button { background: linear-gradient(135deg, #00f0ff 0%, #004466 100%); color: #000; border: none; padding: 4px; font-weight: 900; border-radius: 3px; cursor: pointer; width: 100%; font-size: 6px; }\n' +
'    button.gold { background: linear-gradient(135deg, #ffcc00 0%, #996600 100%); color: #000; }\n' +
'    .terminal-container { background: #000205; border: 1px solid #0d233a; padding: 5px; border-radius: 6px; font-family: monospace; font-size: 5.5px; height: 65px; overflow-y: auto; color: #00ff66; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrapper">\n' +
'    <header>\n' +
'      <h1>QLUX-ENTERPRISE ULTIMATE BSV EXCHANGE</h1>\n' +
'      <p>Planetary Dual-Directional Fiat & BSV Singularity Gateway</p>\n' +
'    </header>\n' +
'    <div class="master-treasury">\n' +
'      <div class="treasury-label">Global Master Treasury Inflow Pool (BSV Native)</div>\n' +
'      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>\n' +
'    </div>\n' +
'    <div class="fx-bar">\n' +
'      <div class="fx-title">🌐 グローバル基準通貨選択 (Global FX Selector)</div>\n' +
'      <select id="currencySelect" class="fx-select" onchange="updateAll()">\n' +
'        <option value="USD">USD ($ - 米ドル)</option>\n' +
'        <option value="JPY" selected>JPY (¥ - 日本円)</option>\n' +
'        <option value="EUR">EUR (€ - ユーロ)</option>\n' +
'        <option value="GBP">GBP (£ - 英ポンド)</option>\n' +
'      </select>\n' +
'    </div>\n' +
'    <div class="exchange-box">\n' +
'      <div class="exchange-title">💱 双方向リアルタイム・エクスチェンジ (BSV ⇄ 法定通貨)</div>\n' +
'      <div class="exchange-row">\n' +
'        <input type="number" id="satInput" class="ex-input" placeholder="SAT数を入力 (例: 100000)" oninput="calcSatToFiat()">\n' +
'        <span id="fiatOutput" style="font-size:7px; color:#00ff66; font-weight:bold; white-space:nowrap;">= ¥0.00 JPY</span>\n' +
'      </div>\n' +
'      <button class="gold" onclick="executeBsvToFiat()">🚀 BSVから法定通貨へエクスチェンジ＆送金実行</button>\n' +
'    </div>\n' +
'    <div class="grid-container" id="gridContainer"></div>\n' +
'    <div class="terminal-container" id="logBox">[System] Ultimate Dual-Directional Exchange online. Ready.</div>\n' +
'  </div>\n' +
'  <script>\n' +
'    const RATES = { USD: {r:20000,s:"$",m:1}, JPY: {r:135,s:"¥",m:150}, EUR: {r:21500,s:"€",m:0.92}, GBP: {r:25000,s:"£",m:0.79} };\n' +
'    const ACTIONS = { 1:"5Gパケット", 2:"物流通行税", 3:"AIナノストリーム", 4:"エスクロー調停", 5:"高速インデックス", 6:"量子ブリッジ", 7:"AIマイニング", 8:"自動配当", 9:"スマートグリッド" };\n' +
'    const USD_VALS = { 1:0.02, 2:0.08, 3:0.05, 4:0.25, 5:0.01, 6:0.50, 7:1.00, 8:2.50, 9:5.00 };\n' +
'    \n' +
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
'    \n' +
'    function calcSatToFiat() {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const inf = RATES[cur];\n' +
'      const satVal = parseFloat(document.getElementById("satInput").value) || 0;\n' +
'      // 1 SATあたりの法定通貨価値を算出 (Rate is USD/EUR/JPY per 1 SAT? No, rateToSat is SAT per 1 USD)\n' +
'      // USD rateToSat = 20000 (1 USD = 20000 SAT -> 1 SAT = 1/20000 USD)\n' +
'      const fiatVal = (satVal / inf.r) * (cur === "JPY" ? 150 : cur === "EUR" ? 0.92 : cur === "GBP" ? 0.79 : 1);\n' +
'      document.getElementById("fiatOutput").innerText = "= " + inf.s + fiatVal.toFixed(2) + " " + cur;\n' +
'    }\n' +
'    \n' +
'    updateAll();\n' +
'    \n' +
'    function addLog(msg) {\n' +
'      const box = document.getElementById("logBox");\n' +
'      box.innerHTML += "<br>[" + new Date().toTimeString().split(" ")[0] + "] " + msg;\n' +
'      box.scrollTop = box.scrollHeight;\n' +
'    }\n' +
'    \n' +
'    async function exec(id) {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      try {\n' +
'        const res = await fetch("/api/v1/execute", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({actionId:id, currency:cur}) });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";\n' +
'          addLog("[INFLOW] " + data.fiatFormatted + " -> +" + data.rewardSat.toLocaleString() + " SAT");\n' +
'        }\n' +
'      } catch(e) { addLog("[ERROR] Network error"); }\n' +
'    }\n' +
'    \n' +
'    async function executeBsvToFiat() {\n' +
'      const cur = document.getElementById("currencySelect").value;\n' +
'      const satVal = parseInt(document.getElementById("satInput").value) || 0;\n' +
'      if(satVal <= 0) { alert("有効なSAT数を入力してください"); return;\n' +
'      }\n' +
'      try {\n' +
'        const res = await fetch("/api/v1/exchange-out", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({satAmount: satVal, currency: cur}) });\n' +
'        const data = await res.json();\n' +
'        if(data.success) {\n' +
'          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";\n' +
'          addLog("[EXCHANGE-OUT] " + satVal.toLocaleString() + " SAT converted to " + data.fiatFormatted + " (TX: " + data.txid + ")");\n' +
'          alert("エクスチェンジ成功！\\n" + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted + "\\nPaymail: " + data.targetPaymail);\n' +
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
          mode: 'INFLOW',
          actionId,
          currency,
          fiatFormatted: fx.symbol + convertedFiat.toFixed(2) + ' ' + currency,
          amountFormatted: '+' + rewardSat.toLocaleString() + ' SAT',
          rewardSat,
          txid: 'tx_in_' + Math.random().toString(36).substring(2, 10),
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
          txid: 'tx_out_' + Math.random().toString(36).substring(2, 10),
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
  console.log('Ultimate BSV Exchange Server running on port ' + PORT);
});
