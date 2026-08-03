const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const TARGET_PAYMAIL = 'vlisdigitalassetlabs@handcash.io';
const LEDGER_FILE = './qlux_master_ledger.log';

const FIAT_RATES = {
  USD: { rateToSat: 19500, symbol: '$', mult: 1, name: 'USD (米ドル)' },
  JPY: { rateToSat: 130, symbol: '¥', mult: 152, name: 'JPY (日本円)' },
  EUR: { rateToSat: 21000, symbol: '€', mult: 0.91, name: 'EUR (ユーロ)' },
  GBP: { rateToSat: 24500, symbol: '£', mult: 0.78, name: 'GBP (英ポンド)' },
  BTC: { rateToSat: 0.0000021, symbol: '₿', mult: 0.000015, name: 'BTC (ビットコイン)' }
};

const QLUX_MODULES = {
  1: { 
    name: 'Quantum High-Frequency Packet Routing', 
    subtitle: '量子高速パケット・APIダイレクト配線', 
    baseUsd: 0.02, 
    desc: '次世代量子暗号網を介し、ミリ秒単位でデータパケットとサトシをあなた専用ウォレットへ直結送金。圧倒的なスピードを体感。' 
  },
  2: { 
    name: 'Autonomous Supply Chain Settlement', 
    subtitle: '自律型サプライチェーン自動収益化', 
    baseUsd: 0.08, 
    desc: '国際間電子商取引の流通データをリアルタイム処理し、発生する収益をワンタップでHandCashへ自動オート・ルーティング。' 
  },
  3: { 
    name: 'Neural LLM Ingestion Stream', 
    subtitle: '次世代人工知能ナノストリーム収益', 
    baseUsd: 0.05, 
    desc: '大規模言語モデル（LLM）の推論データ処理に伴うマイクロ報酬を、あなたのBSVアドレスへ遅延なくダイレクトイン。' 
  },
  4: { 
    name: 'Zero-Trust Escrow Arbitration', 
    subtitle: 'ゼロトラスト・エスクロー調停報酬', 
    baseUsd: 0.25, 
    desc: 'スマートコントラクトによる高度な取引調停が行われるたび、システム報酬が自動的にウォレットへチャージされる堅牢な仕組み。' 
  },
  5: { 
    name: 'Teranode High-Speed Indexer', 
    subtitle: 'テラノード超高速台帳インデックス', 
    baseUsd: 0.01, 
    desc: 'BSV基盤の超高スループット台帳データを瞬時に同期・インデックス化し、稼働報酬をリアルタイムに引き出し。' 
  },
  6: { 
    name: 'Multidimensional Quantum Bridge', 
    subtitle: '多次元量子ブリッジ・クロスチェーン', 
    baseUsd: 0.50, 
    desc: '異なるブロックチェーン間の流動性往還を安全に仲介し、高収益なブリッジ手数料を自動受給するアドバンス機能。' 
  },
  7: { 
    name: 'Distributed Compute Optimizer', 
    subtitle: '分散型コンピュートリソース最適化', 
    baseUsd: 1.00, 
    desc: 'グローバルな演算リソースの最適化配分から生み出されるマイニング報酬を、あなたの口座へダイレクトに流し込み。' 
  },
  8: { 
    name: 'Global Treasury Allocator', 
    subtitle: 'グローバル・トレジャリー自動配当', 
    baseUsd: 2.50, 
    desc: 'プール全体の資産アロケーションと自動配当処理を実行し、最大級のインカムゲインを瞬時に獲得。' 
  },
  9: { 
    name: 'Smart Grid Energy Clearing', 
    subtitle: '次世代スマートグリッド電力決済', 
    baseUsd: 5.00, 
    desc: '次世代電力網や分散型インフラにおけるリアルタイム売買決済から、最高峰のトランザクション報酬を自動回収。' 
  }
};

let globalMasterBalance = 2156410240;

function appendLedger(entry) {
  const logLine = `[${entry.timestamp}] QLUX_PAYOUT:${entry.mode} | Currency:${entry.currency} | Target:${TARGET_PAYMAIL} | Flow:${entry.amountFormatted} | Hash:${entry.auditHash}\n`;
  fs.appendFile(LEDGER_FILE, logLine, err => { if (err) console.error('Ledger error:', err); });
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QLUX | Autonomous Teranode & Live HandCash Gateway</title>
  <style>
    :root {
      --bg-space: #01060b;
      --bg-panel: rgba(4, 15, 28, 0.9);
      --cyan-primary: #00e5ff;
      --cyan-glow: rgba(0, 229, 255, 0.4);
      --cyan-bright: #80f2ff;
      --text-main: #f0fdf4;
      --text-muted: #7dd3fc;
    }
    * { box-sizing: border-box; }
    body {
      background-color: var(--bg-space);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 8px;
      display: flex;
      justify-content: center;
      overflow-x: hidden;
    }
    #quantumCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
    }
    .wrapper { width: 100%; max-width: 1050px; position: relative; z-index: 1; }
    header {
      text-align: center;
      margin-bottom: 8px;
      border-bottom: 1px solid var(--cyan-glow);
      padding-bottom: 6px;
      background: rgba(1, 6, 11, 0.85);
      backdrop-filter: blur(6px);
      border-radius: 6px;
    }
    header h1 { font-size: 15px; color: var(--cyan-primary); margin: 0; letter-spacing: 2px; font-weight: 900; text-transform: uppercase; text-shadow: 0 0 12px var(--cyan-glow); }
    header p { font-size: 5.5px; color: var(--cyan-bright); margin: 3px 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }

    .quantum-video-box {
      background: rgba(2, 10, 18, 0.95);
      border: 1px solid var(--cyan-primary);
      border-radius: 8px;
      height: 90px;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 15px rgba(0,229,255,0.2);
    }
    #nodeCanvas { width: 100%; height: 100%; display: block; }

    .master-treasury {
      background: linear-gradient(135deg, rgba(0,229,255,0.18) 0%, rgba(4,15,28,0.95) 100%);
      border: 1px solid var(--cyan-primary);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
      text-align: center;
      box-shadow: 0 0 18px rgba(0,229,255,0.25);
    }
    .treasury-label { font-size: 6px; color: var(--cyan-bright); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
    .treasury-value { font-size: 24px; color: var(--cyan-primary); font-weight: 900; font-family: monospace; text-shadow: 0 0 12px var(--cyan-glow); }
    .treasury-meta { font-size: 5px; color: var(--text-muted); margin-top: 3px; font-family: monospace; }

    .control-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    @media (max-width: 650px) { .control-row { grid-template-columns: 1fr; } }

    .panel-box {
      background: var(--bg-panel);
      border: 1px solid var(--cyan-glow);
      border-radius: 6px;
      padding: 8px;
      backdrop-filter: blur(5px);
    }
    .panel-title { font-size: 7px; color: var(--cyan-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; display: flex; justify-content: space-between; }
    
    select.fx-select, input.ex-input {
      background: #000;
      color: var(--cyan-primary);
      border: 1px solid var(--cyan-glow);
      padding: 6px;
      border-radius: 4px;
      font-size: 7.5px;
      font-weight: bold;
      width: 100%;
      font-family: monospace;
    }
    input.ex-input { color: var(--cyan-bright); }

    .exchange-box {
      background: linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(4,15,28,0.95) 100%);
      border: 1px solid var(--cyan-primary);
      border-radius: 8px;
      padding: 8px;
      margin-bottom: 8px;
      box-shadow: 0 0 10px rgba(0,229,255,0.15);
    }
    .exchange-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }

    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-bottom: 8px;
    }
    @media (max-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .grid-container { grid-template-columns: 1fr; } }

    .module-card {
      background: var(--bg-panel);
      border: 1px solid var(--cyan-glow);
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
    }
    .module-card:hover {
      border-color: var(--cyan-primary);
      box-shadow: 0 0 14px rgba(0,229,255,0.35);
    }
    .module-header { display: flex; justify-content: space-between; font-size: 5.5px; color: var(--text-muted); margin-bottom: 2px; font-family: monospace; }
    .module-name { color: var(--cyan-primary); font-size: 7px; font-weight: 800; margin-bottom: 1px; }
    .module-sub { color: var(--cyan-bright); font-size: 6px; font-weight: 700; margin-bottom: 4px; }
    .module-desc { font-size: 5.5px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.3; }

    button {
      background: linear-gradient(135deg, var(--cyan-primary) 0%, #006699 100%);
      color: #000;
      border: none;
      padding: 6px;
      font-weight: 900;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      font-size: 6px;
      text-transform: uppercase;
      box-shadow: 0 0 8px rgba(0,229,255,0.4);
      transition: all 0.2s ease;
    }
    button:hover { filter: brightness(1.2); box-shadow: 0 0 14px var(--cyan-primary); }
    button.gold {
      background: linear-gradient(135deg, var(--cyan-bright) 0%, #0099cc 100%);
      color: #000;
      font-size: 7px;
      padding: 7px;
    }
    button.active { background: linear-gradient(135deg, #10b981 0%, #047857); color: #fff; box-shadow: 0 0 12px #10b981; }

    .qr-container {
      background: var(--bg-panel);
      border: 1px solid var(--cyan-primary);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
      text-align: center;
      box-shadow: 0 0 12px rgba(0,229,255,0.2);
    }
    .qr-title { font-size: 7.5px; color: var(--cyan-primary); font-weight: 800; margin-bottom: 6px; text-transform: uppercase; }
    .qr-box-inner {
      background: #fff;
      display: inline-block;
      padding: 8px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .qr-box-inner img { width: 120px; height: 120px; display: block; }
    .qr-desc { font-size: 6px; color: var(--text-muted); font-family: monospace; }

    .terminal-container {
      background: #000408;
      border: 1px solid var(--cyan-glow);
      padding: 6px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 5.5px;
      height: 75px;
      overflow-y: auto;
      color: var(--cyan-primary);
    }
  </style>
</head>
<body>
  <canvas id="quantumCanvas"></canvas>

  <div class="wrapper">
    <header>
      <h1>QLUX</h1>
      <p>Autonomous Teranode & Live HandCash Gateway (2026 Edition)</p>
    </header>

    <div class="quantum-video-box">
      <canvas id="nodeCanvas"></canvas>
    </div>

    <div class="master-treasury">
      <div class="treasury-label">Global Master Clearing Inflow Pool (BSV Native / Teranode)</div>
      <div id="masterBalance" class="treasury-value">2,156,410,240 SAT</div>
      <div class="treasury-meta">Target HandCash Paymail: vlisdigitalassetlabs@handcash.io | Auto-Deposit: ACTIVE</div>
    </div>

    <div class="control-row">
      <div class="panel-box">
        <div class="panel-title"><span>🌐 グローバル基準通貨選択 (FX Selector)</span><span style="color:var(--cyan-bright);">Live Sync</span></div>
        <select id="currencySelect" class="fx-select" onchange="updateInterface()">
          <option value="USD">USD ($ - 米ドル)</option>
          <option value="JPY" selected>JPY (¥ - 日本円)</option>
          <option value="EUR">EUR (€ - ユーロ)</option>
          <option value="GBP">GBP (£ - 英ポンド)</option>
          <option value="BTC">BTC (₿ - ビットコイン)</option>
        </select>
      </div>

      <div class="exchange-box" style="margin-bottom:0; padding:8px;">
        <div class="exchange-title" style="color:var(--cyan-primary); font-size:7px; font-weight:800; margin-bottom:4px;">💱 QLUX量子双方向コンバージョン (BSV ⇄ 法定通貨)</div>
        <div class="exchange-row">
          <input type="number" id="satInput" class="ex-input" placeholder="SAT数を入力 (例: 100000)" oninput="calcExchange()">
          <span id="fiatOutput" style="font-size:7.5px; color:var(--cyan-bright); font-weight:bold; white-space:nowrap; font-family:monospace;">= ¥0.00 JPY</span>
        </div>
        <button class="gold" onclick="executeBsvToFiat()">🚀 ウォレットへ即時オート送金＆クリアリング執行</button>
      </div>
    </div>

    <div class="grid-container" id="moduleGrid"></div>

    <div class="qr-container">
      <div class="qr-title">📲 HandCashウォレット受取用 QRコード (vlisdigitalassetlabs@handcash.io)</div>
      <div class="qr-box-inner">
        <img id="qrImage" src="" alt="HandCash Paymail QR">
      </div>
      <div class="qr-desc">スキャンまたはタップであなた専用HandCashウォレットへダイレクト送金アクセス</div>
    </div>

    <div class="terminal-container" id="logBox">
      [System] QLUX Autonomous Gateway initialized. Live HandCash auto-routing connected to vlisdigitalassetlabs@handcash.io. Ready.
    </div>
  </div>

  <script>
    const canvas = document.getElementById('quantumCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for(let i=0; i<70; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    function animateQuantum() {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.14)';
      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';

      for(let i=0; i<particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > width) p.vx *= -1;
        if(p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for(let j=i+1; j<particles.length; j++) {
          let p2 = particles[j];
          let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if(dist < 110) {
            ctx.lineWidth = (1 - dist / 110) * 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateQuantum);
    }
    animateQuantum();

    const nCanvas = document.getElementById('nodeCanvas');
    const nCtx = nCanvas.getContext('2d');
    let nWidth, nHeight;
    let nodes = [];

    function resizeNodeCanvas() {
      nWidth = nCanvas.width = nCanvas.offsetWidth || 600;
      nHeight = nCanvas.height = nCanvas.offsetHeight || 90;
    }
    window.addEventListener('resize', resizeNodeCanvas);
    resizeNodeCanvas();

    for(let i=0; i<25; i++) {
      nodes.push({
        x: Math.random() * nWidth,
        y: Math.random() * nHeight,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: Math.random() * 2 + 1
      });
    }

    function animateNodes() {
      nCtx.clearRect(0, 0, nWidth, nHeight);
      nCtx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      nCtx.fillStyle = 'var(--cyan-primary)';

      for(let i=0; i<nodes.length; i++) {
        let n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x < 0 || n.x > nWidth) n.vx *= -1;
        if(n.y < 0 || n.y > nHeight) n.vy *= -1;

        nCtx.beginPath();
        nCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        nCtx.fillStyle = '#00e5ff';
        nCtx.fill();

        for(let j=i+1; j<nodes.length; j++) {
          let n2 = nodes[j];
          let d = Math.hypot(n.x - n2.x, n.y - n2.y);
          if(d < 85) {
            nCtx.lineWidth = (1 - d / 85) * 1.2;
            nCtx.beginPath();
            nCtx.moveTo(n.x, n.y);
            nCtx.lineTo(n2.x, n2.y);
            nCtx.stroke();
          }
        }
      }
      requestAnimationFrame(animateNodes);
    }
    animateNodes();

    const paymailUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=paymail:vlisdigitalassetlabs@handcash.io&color=00e5ff&bgcolor=01060b";
    document.getElementById("qrImage").src = paymailUrl;

    const RATES = { 
      USD: { r: 19500, s: '$', m: 1 }, 
      JPY: { r: 130, s: '¥', m: 152 }, 
      EUR: { r: 21000, s: '€', m: 0.91 }, 
      GBP: { r: 24500, s: '£', m: 0.78 },
      BTC: { r: 0.0000021, s: '₿', m: 0.000015 }
    };
    
    const MODULES = {
      1: { name: "Quantum High-Frequency Routing", sub: "量子高速パケット・APIダイレクト配線", desc: "次世代量子暗号網を介し、ミリ秒単位でデータとサトシをあなた専用ウォレットへ直結送金。" },
      2: { name: "Autonomous Supply Chain Settler", sub: "自律型サプライチェーン自動収益化", desc: "国際間電子商取引の流通データをリアルタイム処理し、収益をワンタップで自動オート送金。" },
      3: { name: "Neural LLM Ingestion Stream", sub: "次世代人工知能ナノストリーム収益", desc: "大規模言語モデルの推論データ処理に伴うマイクロ報酬をアドレスへダイレクトイン。" },
      4: { name: "Zero-Trust Escrow Arbiter", sub: "ゼロトラスト・エスクロー調停報酬", desc: "スマートコントラクトによる取引調停が行われるたび、システム報酬がウォレットへ自動チャージ。" },
      5: { name: "Teranode High-Speed Indexer", sub: "テラノード超高速台帳インデックス", desc: "BSV基盤の超高スループット台帳データを瞬時に同期し、稼働報酬をリアルタイムに引き出し。" },
      6: { name: "Multidimensional Quantum Bridge", sub: "多次元量子ブリッジ・クロスチェーン", desc: "異なる金融レイヤー間の流動性往還を仲介し、高収益なブリッジ手数料を自動受給するアドバンス機能。" },
      7: { name: "Distributed Compute Optimizer", sub: "分散型コンピュートリソース最適化", desc: "分散された演算リソースの最適化配分から生み出されるマイニング報酬をダイレクトに回収。" },
      8: { name: "Global Treasury Allocator", sub: "グローバル・トレジャリー自動配当", desc: "プール全体の資産アロケーションと自動配当処理を実行し、最大級のインカムゲインを瞬時獲得。" },
      9: { name: "Smart Grid Energy Clearing", sub: "次世代スマートグリッド電力決済", desc: "次世代電力網や分散型インフラにおけるリアルタイム売買から、最高峰の報酬を自動受給。" }
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
        grid.innerHTML += `
          <div class="module-card">
            <div>
              <div class="module-header"><span>QLUX-MOD #0${i}</span><span style="color:var(--cyan-primary);">AUTO-DEPOSIT READY</span></div>
              <div class="module-name">${mod.name}</div>
              <div class="module-sub">${mod.sub}</div>
              <div class="module-desc">${mod.desc}</div>
            </div>
            <button id="b-${i}" onclick="execModule(${i})">ウォレットへ自動入金 (${inf.s}${fiat} / ${sat.toLocaleString()} SAT)</button>
          </div>
        `;
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
      btn.innerText = "⚡ オート送金中...";
      try {
        const res = await fetch("/api/v1/execute", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ actionId: id, currency: cur }) 
        });
        const data = await res.json();
        if(data.success) {
          btn.innerText = "✓ 入金完了";
          btn.classList.add("active");
          setTimeout(() => { btn.innerText = orig; btn.classList.remove("active"); }, 1200);
          document.getElementById("masterBalance").innerText = data.newTotalBalance.toLocaleString() + " SAT";
          addLog("[HANDCASH-AUTO-DEPOSIT] " + data.fiatFormatted + " ➔ +" + data.rewardSat.toLocaleString() + " SAT sent to vlisdigitalassetlabs@handcash.io (Hash: " + data.auditHash.substring(0,10) + ")");
        }
      } catch(e) { 
        btn.innerText = "❌ エラー";
        setTimeout(() => { btn.innerText = orig; }, 1000);
        addLog("[ERROR] Auto-deposit routing failure"); 
      }
    }

    async function executeBsvToFiat() {
      const cur = document.getElementById("currencySelect").value;
      const satVal = parseInt(document.getElementById("satInput").value) || 0;
      if(satVal <= 0) { alert("有効なサトシ数値を入力し
