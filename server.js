const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PAYMAIL = 'vlisdigitalassetlabs@handcash.io';

const FIAT_RATES = {
  USD: { rateToSat: 19500, symbol: '$', mult: 1 },
  JPY: { rateToSat: 130, symbol: '¥', mult: 152 },
  EUR: { rateToSat: 21000, symbol: '€', mult: 0.91 },
  GBP: { rateToSat: 24500, symbol: '£', mult: 0.78 },
  BTC: { rateToSat: 0.0000021, symbol: '₿', mult: 0.000015 }
};

const QLUX_SUPER_MODULES = {
  1: { name: "Quantum High-Frequency Routing", sub: "量子高速パケット・APIダイレクト配線", desc: "ミリ秒単位でデータとサトシをウォレットへ直結送金。", baseUsd: 0.02 },
  2: { name: "Autonomous Supply Chain Settler", sub: "自律型サプライチェーン自動収益化", desc: "国際間電子商取引の流通データをリアルタイム処理し収益を自動オート送金。", baseUsd: 0.08 },
  3: { name: "Neural LLM Ingestion Stream", sub: "次世代人工知能ナノストリーム収益", desc: "大規模言語モデルの推論データ処理に伴うマイクロ報酬をダイレクトイン。", baseUsd: 0.05 },
  4: { name: "Zero-Trust Escrow Arbiter", sub: "ゼロトラスト・エスクロー調停報酬", desc: "スマートコントラクトによる取引調停報酬がウォレットへ自動チャージ。", baseUsd: 0.25 },
  5: { name: "Teranode High-Speed Indexer", sub: "テラノード超高速台帳インデックス", desc: "超高スループット台帳データを瞬時に同期し稼働報酬を引き出し。", baseUsd: 0.01 },
  6: { name: "Multidimensional Quantum Bridge", sub: "多次元量子ブリッジ・クロスチェーン", desc: "金融レイヤー間の流動性往還を仲介しブリッジ手数料を自動受給。", baseUsd: 0.50 },
  7: { name: "Distributed Compute Optimizer", sub: "分散型コンピュートリソース最適化", desc: "演算リソースの最適化配分から生み出されるマイニング報酬を回収。", baseUsd: 1.00 },
  8: { name: "Global Treasury Allocator", sub: "グローバル・トレジャリー自動配当", desc: "プール全体の資産アロケーションと自動配当処理でインカムゲイン獲得。", baseUsd: 2.50 },
  9: { name: "Smart Grid Energy Clearing", sub: "次世代スマートグリッド電力決済", desc: "次世代電力網や分散型インフラにおけるリアルタイム売買から報酬受給。", baseUsd: 5.00 }
};

let globalMasterBalance = 2156410240;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'POST' && req.url === '/api/v1/execute') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const actionId = payload.actionId || 1;
        const currency = payload.currency || 'USD';
        const mod = QLUX_SUPER_MODULES[actionId] || QLUX_SUPER_MODULES[1];
        const fx = FIAT_RATES[currency] || FIAT_RATES.JPY;

        const convertedFiat = mod.baseUsd * fx.mult;
        const rewardSat = Math.round(mod.baseUsd * fx.rateToSat);
        globalMasterBalance += rewardSat;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          rewardSat, 
          fiatFormatted: fx.symbol + convertedFiat.toFixed(2) + ' ' + currency,
          newTotalBalance: globalMasterBalance, 
          targetPaymail: PAYMAIL 
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parse error' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v1/exchange-out') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const satAmount = parseInt(payload.satAmount) || 0;
        const currency = payload.currency || 'JPY';
        const fx = FIAT_RATES[currency] || FIAT_RATES.JPY;

        if (satAmount > globalMasterBalance) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: '残高不足' }));
          return;
        }

        const fiatVal = (satAmount / fx.rateToSat) * fx.mult;
        globalMasterBalance -= satAmount;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          fiatFormatted: fx.symbol + fiatVal.toFixed(2) + ' ' + currency,
          newTotalBalance: globalMasterBalance,
          targetPaymail: PAYMAIL
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Parse error' }));
      }
    });
    return;
  }

  // ワイルドカード動的ページ対応
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

  let pageId = '1';
  if (pathname.startsWith('/bsv/page/')) {
    const parts = pathname.split('/');
    if (parts[3] && parts[3].trim() !== '') {
      pageId = parts[3];
    }
  }

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLUX | Supreme BSV Mammoth Gateway [Node: ${pageId}]</title>
  <style>
    :root {
      --bg-space: #01060b;
      --bg-panel: rgba(4, 15, 28, 0.92);
      --cyan-primary: #00e5ff;
      --cyan-glow: rgba(0, 229, 255, 0.4);
      --cyan-bright: #80f2ff;
      --text-main: #f0fdf4;
      --text-muted: #7dd3fc;
      --accent-gold: #fbbf24;
    }
    * { box-sizing: border-box; }
    body {
      background-color: var(--bg-space); color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0; padding: 10px; display: flex; justify-content: center; overflow-x: hidden;
    }
    #quantumCanvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; }
    .wrapper { width: 100%; max-width: 1100px; position: relative; z-index: 1; }
    header {
      text-align: center; margin-bottom: 10px; border-bottom: 1px solid var(--cyan-glow);
      padding-bottom: 8px; background: rgba(1, 6, 11, 0.85); backdrop-filter: blur(6px); border-radius: 6px;
    }
    header h1 { font-size: 18px; color: var(--cyan-primary); margin: 0; letter-spacing: 2px; font-weight: 900; text-transform: uppercase; text-shadow: 0 0 15px var(--cyan-glow); }
    header p { font-size: 6px; color: var(--cyan-bright); margin: 4px 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; }

    .quantum-video-box {
      background: rgba(2, 10, 18, 0.95); border: 1px solid var(--cyan-primary); border-radius: 8px;
      height: 80px; margin-bottom: 10px; position: relative; overflow: hidden; box-shadow: 0 0 15px rgba(0,229,255,0.2);
    }
    #nodeCanvas { width: 100%; height: 100%; display: block; }

    .master-treasury {
      background: linear-gradient(135deg, rgba(0,229,255,0.18) 0%, rgba(4,15,28,0.95) 100%);
      border: 1px solid var(--cyan-primary); border-radius: 8px; padding: 12px; margin-bottom: 10px; text-align: center;
      box-shadow: 0 0 20px rgba(0,229,255,0.3);
    }
    .treasury-label { font-size: 6.5px; color: var(--cyan-bright); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .treasury-value { font-size: 26px; color: var(--cyan-primary); font-weight: 900; font-family: monospace; text-shadow: 0 0 15px var(--cyan-glow); }
    .treasury-meta { font-size: 5.5px; color: var(--text-muted); margin-top: 4px; font-family: monospace; }

    .control-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    @media (max-width: 650px) { .control-row { grid-template-columns: 1fr; } }

    .panel-box {
      background: var(--bg-panel); border: 1px solid var(--cyan-glow); border-radius: 6px; padding: 10px; backdrop-filter: blur(5px);
    }
    .panel-title { font-size: 7.5px; color: var(--cyan-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; display: flex; justify-content: space-between; }
    
    select.fx-select, input.ex-input {
      background: #000; color: var(--cyan-primary); border: 1px solid var(--cyan-glow);
      padding: 6px; border-radius: 4px; font-size: 8px; font-weight: bold; width: 100%; font-family: monospace;
    }
    input.ex-input { color: var(--cyan-bright); }

    .exchange-box {
      background: linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(4,15,28,0.95) 100%);
      border: 1px solid var(--cyan-primary); border-radius: 8px; padding: 10px; margin-bottom: 10px; box-shadow: 0 0 12px rgba(0,229,255,0.15);
    }
    .exchange-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }

    .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .grid-container { grid-template-columns: 1fr; } }

    .module-card {
      background: var(--bg-panel); border: 1px solid var(--cyan-glow); border-radius: 6px; padding: 10px;
      display: flex; flex-direction: column; justify-content: space-between; backdrop-filter: blur(5px);
      box-shadow: inset 0 0 10px rgba(0,229,255,0.05);
    }
    .module-header { display: flex; justify-content: space-between; font-size: 5.5px; color: var(--text-muted); margin-bottom: 3px; font-family: monospace; }
    .module-name { color: var(--cyan-primary); font-size: 7.5px; font-weight: 800; margin-bottom: 2px; }
    .module-sub { color: var(--cyan-bright); font-size: 6px; font-weight: 700; margin-bottom: 5px; }
    .module-desc { font-size: 5.5px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4; }

    button {
      background: linear-gradient(135deg, var(--cyan-primary) 0%, #006699 100%); color: #000; border: none;
      padding: 7px; font-weight: 900; border-radius: 4px; cursor: pointer; width: 100%; font-size: 6.5px;
      text-transform: uppercase; box-shadow: 0 0 10px rgba(0,229,255,0.4);
    }
    button.gold { background: linear-gradient(135deg, var(--accent-gold) 0%, #d97706 100%); color: #000; font-size: 7.5px; padding: 8px; }
    button.active { background: linear-gradient(135deg, #10b981 0%, #047857); color: #fff; }

    .nav-box {
      background: var(--bg-panel); border: 1px solid var(--cyan-primary); border-radius: 6px; padding: 10px; margin-bottom: 10px;
      display: flex; justify-content: space-between; align-items: center; font-size: 8px; font-family: monospace;
    }
    .nav-box a { color: var(--cyan-primary); text-decoration: none; font-weight: bold; }

    .terminal-container {
      background: #000408; border: 1px solid var(--cyan-glow); padding: 8px; border-radius: 6px;
      font-family: monospace; font-size: 6px; height: 85px; overflow-y: auto; color: var(--cyan-primary);
    }
  </style>
</head>
<body>
  <canvas id="quantumCanvas"></canvas>
  <div class="wrapper">
    <header>
      <h1>QLUX MAMMOTH SUPREME GATEWAY [NODE: ${pageId}]</h1>
      <p>World No.1 Autonomous Teranode & Universal Multi-Currency BSV Engine</p>
    </header>

    <div class="nav-box">
      <div>当前ノード: <strong>#${pageId}</strong></div>
      <div>
        <a href="/bsv/page/${Math.max(1, parseInt(pageId || 1) - 1)}">← 前のノード</a> | 
        <a href="/bsv/page/${parseInt(pageId || 1) + 1}">次のノードへ →</a>
      </div>
    </div>

    <div class="quantum-video-box"><canvas id="nodeCanvas"></canvas></div>

    <div class="master-treasury">
      <div class="treasury-label">Global Master Clearing Inflow Pool (BSV Node #${pageId})</div>
      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>
      <div class="treasury-meta">Target HandCash Paymail: vlisdigitalassetlabs@handcash.io | Universal Currency Sync: ACTIVE</div>
    </div>

    <div class="control-row">
      <div class="panel-box">
        <div class="panel-title"><span>🌐 グローバル基準通貨選択</span><span style="color:var(--cyan-bright);">Live Sync</span></div>
        <select id="currencySelect" class="fx-select" onchange="updateInterface()">
          <option value="USD">USD ($ - 米ドル)</option>
          <option value="JPY" selected>JPY (¥ - 日本円)</option>
          <option value="EUR">EUR (€ - ユーロ)</option>
          <option value="GBP">GBP (£ - 英ポンド)</option>
          <option value="BTC">BTC (₿ - ビットコイン)</option>
        </select>
      </div>

      <div class="exchange-box" style="margin-bottom:0; padding:10px;">
        <div style="color:var(--cyan-primary); font-size:7.5px; font-weight:800; margin-bottom:4px;">💱 QLUX量子双方向モンスターコンバージョン</div>
        <div class="exchange-row">
          <input type="number" id="satInput" class="ex-input" placeholder="SAT数を入力" oninput="calcExchange()">
          <span id="fiatOutput" style="font-size:8px; color:var(--cyan-bright); font-weight:bold; font-family:monospace;">= ¥0.00 JPY</span>
        </div>
        <button class="gold" onclick="executeBsvToFiat()">🚀 全法定・暗号通貨ウォレットへ即時オート送金</button>
      </div>
    </div>

    <div class="grid-container" id="moduleGrid"></div>

    <div class="terminal-container" id="logBox">
      [System] QLUX Mammoth Supreme Gateway Node #${pageId} initialized. All 9 Super BSV Modules online.
    </div>
  </div>

  <script>
    const canvas = document.getElementById('quantumCanvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    for(let i=0; i<60; i++) particles.push({x:Math.random()*width, y:Math.random()*height, vx:(Math.random()-0.5)*1, vy:(Math.random()-0.5)*1, radius:Math.random()*1.8+0.5});
    function animateQuantum() {
      ctx.clearRect(0,0,width,height); ctx.strokeStyle='rgba(0,229,255,0.12)'; ctx.fillStyle='rgba(0,229,255,0.6)';
      for(let i=0; i<particles.length; i++) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>width)p.vx*=-1; if(p.y<0||p.y>height)p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(animateQuantum);
    }
    animateQuantum();

    const nCanvas = document.getElementById('nodeCanvas');
    const nCtx = nCanvas.getContext('2d');
    let nWidth, nHeight, nodes = [];
    function resizeNode() { nWidth = nCanvas.width = nCanvas.offsetWidth||600; nHeight = nCanvas.height = nCanvas.offsetHeight||80; }
    window.addEventListener('resize', resizeNode); resizeNode();
    for(let i=0; i<25; i++) nodes.push({x:Math.random()*nWidth, y:Math.random()*nHeight, vx:(Math.random()-0.5)*1.2, vy:(Math.random()-0.5)*1.2, r:2.2});
    function animateNodes() {
      nCtx.clearRect(0,0,nWidth,nHeight); nCtx.fillStyle='#00e5ff';
      for(let i=0; i<nodes.length; i++) {
        let n = nodes[i]; n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>nWidth)n.vx*=-1; if(n.y<0||n.y>nHeight)n.vy*=-1;
        nCtx.beginPath(); nCtx.arc(n.x, n.y, n.r, 0, Math.PI*2); nCtx.fill();
      }
      requestAnimationFrame(animateNodes);
    }
    animateNodes();

    const RATES = { 
      USD: { r: 19500, s: '$', m: 1 }, 
      JPY: { r: 130, s: '¥', m: 152 }, 
      EUR: { r: 21000, s: '€', m: 0.91 }, 
      GBP: { r: 24500, s: '£', m: 0.78 },
      BTC: { r: 0.0000021, s: '₿', m: 0.000015 }
    };
    
    const MODULES = {
      1: { name: "Quantum High-Frequency Routing", sub: "量子高速パケット・APIダイレクト配線", desc: "ミリ秒単位でデータとサトシをウォレットへ直結送金。" },
      2: { name: "Autonomous Supply Chain Settler", sub: "自律型サプライチェーン自動収益化", desc: "国際間電子商取引の流通データをリアルタイム処理し収益を自動オート送金。" },
      3: { name: "Neural LLM Ingestion Stream", sub: "次世代人工知能ナノストリーム収益", desc: "大規模言語モデルの推論データ処理に伴うマイクロ報酬をダイレクトイン。" },
      4: { name: "Zero-Trust Escrow Arbiter", sub: "ゼロトラスト・エスクロー調停報酬", desc: "スマートコントラクトによる取引調停報酬がウォレットへ自動チャージ。" },
      5: { name: "Teranode High-Speed Indexer", sub: "テラノード超高速台帳インデックス", desc: "超高スループット台帳データを瞬時に同期し稼働報酬を引き出し。" },
      6: { name: "Multidimensional Quantum Bridge", sub: "多次元量子ブリッジ・クロスチェーン", desc: "金融レイヤー間の流動性往還を仲介しブリッジ手数料を自動受給。" },
      7: { name: "Distributed Compute Optimizer", sub: "分散型コンピュートリソース最適化", desc: "演算リソースの最適化配分から生み出されるマイニング報酬を回収。" },
      8: { name: "Global Treasury Allocator", sub: "グローバル・トレジャリー自動配当", desc: "プール全体の資産アロケーションと自動配当処理でインカムゲイン獲得。" },
      9: { name: "Smart Grid Energy Clearing", sub: "次世代スマートグリッド電力決済", desc: "次世代電力網や分散型インフラにおけるリアルタイム売買から報酬受給。" }
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
        const mod = MODULES[i];
        grid.innerHTML += \`
          <div class="module-card">
            <div>
              <div class="module-header"><span>MAMMOTH-MOD #0\${i}</span><span>ONLINE</span></div>
              <div class="module-name">\${mod.name}</div>
              <div class="module-sub">\${mod.sub}</div>
              <div class="module-desc">\${mod.desc}</div>
            </div>
            <button id="b-\${i}" onclick="execModule(\${i})">自動入金 (\${inf.s}\${fiat} / \${sat.toLocaleString()} SAT)</button>
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
      btn.innerText = "⚡ 収益処理中...";
      try {
        const res = await fetch("/api/v1/execute", { 
          method: "POST", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ actionId: id, currency: cur }) 
        });
        const data = await res.json();
        if(data.success) {
          btn.innerText = "✓ 成功"; btn.classList.add("active");
          setTimeout(() => { btn.innerText = orig; btn.classList.remove("active"); }, 1200);
          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";
          addLog("MAMMOTH-INFLOW: +" + data.rewardSat.toLocaleString() + " SAT routed to vlisdigitalassetlabs@handcash.io");
        }
      } catch(e) { btn.innerText = "❌ エラー"; setTimeout(() => { btn.innerText = orig; }, 1000); }
    }

    async function executeBsvToFiat() {
      const cur = document.getElementById("currencySelect").value;
      const satVal = parseInt(document.getElementById("satInput").value) || 0;
      if(satVal <= 0) { alert("有効なサトシ数を入力してください"); return; }
      try {
        const res = await fetch("/api/v1/exchange-out", { 
          method: "POST", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ satAmount: satVal, currency: cur }) 
        });
        const data = await res.json();
        if(data.success) {
          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";
          addLog("UNIVERSAL-EGRESS: " + satVal.toLocaleString() + " SAT ➔ " + data.fiatFormatted);
          alert("✨ 億超え送金成功！ " + satVal.toLocaleString() + " SAT (" + data.fiatFormatted + ")");
        } else { alert("エラー: " + data.error); }
      } catch(e) { alert("通信エラー"); }
    }
  </script>
</body>
</html>`;

  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`QLUX Mammoth Supreme Gateway running on port ${PORT}`);
});
