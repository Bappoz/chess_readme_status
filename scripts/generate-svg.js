import fs from "node:fs";
import path from "node:path";

const CHESS_USERNAME = process.env.CHESS_USERNAME || "bappozl";
const OUTPUT_DIR = "assets";
const CACHE_FILE = path.join(OUTPUT_DIR, ".cache.json");
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// ─── Design config ──────────────────────────────────────────────────────────

const MODE_PIECES = { blitz: "♞", rapid: "♛", bullet: "♟", daily: "♚" };
const MODE_LABELS = { blitz: "BLITZ", rapid: "RAPID", bullet: "BULLET", daily: "DAILY" };

const STYLES = {
  premium:           { text:"#e9eaec", bg:"#111317", acc:"#8ac054", down:"#d9694a", areaOp:".13", peakOp:".3",  chipOp:".14", extra:"" },
  editorial:         { text:"#f3efe6", bg:"#141210", acc:"#d8a24a", down:"#c56a4a", areaOp:".05", peakOp:".28", chipOp:".14", extra:".rule{stroke:#3a352c}" },
  wood:              { text:"#f1e6d2", bg:"#241811", acc:"#e7bd6b", down:"#d98a5a", areaOp:".12", peakOp:".32", chipOp:".14", extra:".sq{fill:#fff;opacity:.045}" },
  tech:              { text:"#cfd8d1", bg:"#0a0d0c", acc:"#48d1ae", down:"#e0715a", areaOp:".1",  peakOp:".32", chipOp:".14", extra:".grid{stroke:#1a221f;stroke-width:1}" },
  glass:             { text:"#e7eaf6", bg:"#0c1225", acc:"#8098ff", down:"#e0715a", areaOp:".14", peakOp:".3",  chipOp:".14", extra:".panel{fill:#fff;opacity:.045}.stroke{stroke:#fff;opacity:.08;fill:none}" },
  piece:             { text:"#eef1f3", bg:"#0d0f13", acc:"#9bd35e", down:"#d9694a", areaOp:".12", peakOp:".3",  chipOp:".14", extra:"" },
  light:             { text:"#1b1e1b", bg:"#f4f6f1", acc:"#5f8f37", down:"#c1573a", areaOp:".12", peakOp:".35", chipOp:".13", extra:"" },
  "light-editorial": { text:"#241f16", bg:"#f8f2e6", acc:"#a9762a", down:"#b26038", areaOp:".07", peakOp:".3",  chipOp:".14", extra:".rule{stroke:#e0d5bf}" },
};

// ─── SVG utilities ──────────────────────────────────────────────────────────

function buildCSS(styleName) {
  const s = STYLES[styleName] || STYLES.premium;
  return [
    `text{fill:${s.text}}`,
    `.bg{fill:${s.bg}}`,
    `.acc{fill:${s.acc}}`,
    `.ln{stroke:${s.acc}}`,
    `.area{fill:${s.acc};opacity:${s.areaOp}}`,
    `.peak{stroke:${s.acc};opacity:${s.peakOp}}`,
    `.chip{fill:${s.acc};opacity:${s.chipOp}}`,
    `.down{fill:${s.down}}`,
    s.extra,
    `svg{font-family:'Space Grotesk',system-ui,sans-serif}`,
    `.lbl{font-weight:600;font-size:11px;letter-spacing:.16em}`,
    `.big{font-weight:700;font-size:34px;letter-spacing:-.02em}`,
    `.mid{font-weight:600;font-size:14px}`,
    `.mut{font-weight:500;font-size:11px;opacity:.5}`,
    `.ser{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:0}`,
    `.mono{font-family:'JetBrains Mono',monospace}`,
    `.ln{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}`,
    `.thin{stroke-width:1.6}`,
    `.draw{stroke-dasharray:1200;stroke-dashoffset:1200;animation:draw 2.3s cubic-bezier(.6,.05,.2,1) forwards .25s}`,
    `.dot{animation:pulse 2s ease-in-out infinite}`,
    `.glow{animation:glow 3.4s ease-in-out infinite}`,
    `.float{animation:float 6.5s ease-in-out infinite}`,
    `.shim{animation:shim 3s ease-in-out infinite}`,
    `@keyframes draw{to{stroke-dashoffset:0}}`,
    `@keyframes pulse{0%,100%{r:4.5;opacity:1}50%{r:8;opacity:.45}}`,
    `@keyframes glow{0%,100%{opacity:.14}50%{opacity:.34}}`,
    `@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`,
    `@keyframes shim{0%,100%{opacity:.5}50%{opacity:1}}`,
  ].join("");
}

function chartPoints(history, x0, x1, yTop, yBottom) {
  if (history.length === 0) return [];
  const n = history.length;
  const ratings = history.map((h) => h.rating);
  const mn = Math.min(...ratings);
  const mx = Math.max(...ratings);
  const range = mx - mn || 1;
  const pad = range * 0.06;
  const yMin = mn - pad, yMax = mx + pad, yRange = yMax - yMin;
  return history.map((h, i) => ({
    x: x0 + (n > 1 ? i / (n - 1) : 0.5) * (x1 - x0),
    y: yBottom - ((h.rating - yMin) / yRange) * (yBottom - yTop),
  }));
}

function pline(pts) {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function areaPts(pts, yBase) {
  if (pts.length < 2) return "";
  return `${pline(pts)} ${pts[pts.length - 1].x.toFixed(1)},${yBase} ${pts[0].x.toFixed(1)},${yBase}`;
}

function trendOf(history, currentRating) {
  const last20 = history.slice(-20);
  if (last20.length < 2) return { str: "—", cls: "mut" };
  const diff = currentRating - last20[0].rating;
  return {
    str: diff > 0 ? `▲ +${diff}` : diff < 0 ? `▼ ${diff}` : `= ${diff}`,
    cls: diff >= 0 ? "acc" : "down",
  };
}

function winPct(wins, losses, draws) {
  const t = wins + losses + draws;
  return t > 0 ? Math.round((wins / t) * 100) : 0;
}

// ─── renderHero ─────────────────────────────────────────────────────────────

function renderHero(data, mode, styleName) {
  const css = buildCSS(styleName);
  const piece = MODE_PIECES[mode];
  const label = MODE_LABELS[mode];
  const { rating, best, wins, losses, draws, history } = data;
  const total = wins + losses + draws;
  const wp = winPct(wins, losses, draws);
  const tr = trendOf(history, rating);
  const r = rating || "—";
  const b = best || "—";

  if (styleName === "editorial" || styleName === "light-editorial") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 340 210" width="340" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<style>${css}</style>
<rect class="bg" width="340" height="210" rx="20"/>
<text class="mut" x="30" y="52" style="letter-spacing:.24em">${label} RATING</text>
<text class="acc ser" x="26" y="140" style="font-size:104px">${r}</text>
<line class="rule" x1="30" y1="162" x2="310" y2="162"/>
<text class="mid" x="30" y="188">Peak ${b}</text>
<text class="${tr.cls} mid" x="310" y="188" text-anchor="end">${tr.str}</text>
</svg>`;
  }

  if (styleName === "wood") {
    const miniPts = chartPoints(history.slice(-10), 196, 322, 165, 194);
    const miniLine = miniPts.length > 1 ? `<polyline class="ln draw" points="${pline(miniPts)}"/>` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 340 210" width="340" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<defs>
<filter id="bC" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
<linearGradient id="wC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c1e14"/><stop offset="1" stop-color="#1c120b"/></linearGradient>
</defs>
<style>${css}</style>
<rect width="340" height="210" rx="20" fill="url(#wC)"/>
<rect class="sq" x="0" y="140" width="34" height="34"/><rect class="sq" x="68" y="140" width="34" height="34"/>
<rect class="sq" x="34" y="174" width="34" height="34"/><rect class="sq" x="102" y="174" width="34" height="34"/>
<ellipse class="acc glow" cx="92" cy="112" rx="60" ry="60" filter="url(#bC)"/>
<text class="acc float ser" x="92" y="166" text-anchor="middle" style="font-size:150px">${piece}</text>
<text class="mut" x="196" y="50">${label}</text>
<text class="big ser" x="196" y="98" style="font-size:52px">${r}</text>
<text class="${tr.cls} mid" x="196" y="122">${tr.str}</text>
<text class="mut" x="196" y="150">${total} games · ${wp}% win</text>
${miniLine}
</svg>`;
  }

  if (styleName === "tech") {
    const techPts = chartPoints(history.slice(-10), 26, 314, 170, 190);
    const techLine = techPts.length > 1 ? `<polyline class="ln thin draw" points="${pline(techPts)}"/>` : "";
    const step = Math.max(1, Math.floor(techPts.length / 4));
    const nodes = techPts
      .filter((_, i) => i > 0 && i < techPts.length - 1 && i % step === 0)
      .map((p) => `<circle class="acc" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5"/>`)
      .join("");
    const last = techPts[techPts.length - 1];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 340 210" width="340" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<style>${css}</style>
<rect class="bg" width="340" height="210" rx="20"/>
<line class="grid" x1="0" y1="70" x2="340" y2="70"/><line class="grid" x1="0" y1="140" x2="340" y2="140"/>
<line class="grid" x1="113" y1="0" x2="113" y2="210"/><line class="grid" x1="226" y1="0" x2="226" y2="210"/>
<text class="mut mono" x="26" y="44">${mode}.rating</text>
<circle class="acc dot" cx="120" cy="40" r="4"/>
<text class="big mono acc shim" x="26" y="104" style="font-size:52px">${r}</text>
<text class="${tr.cls} mid mono" x="26" y="134">${tr.str} · win ${wp}%</text>
${techLine}${nodes}${last ? `<circle class="acc dot" cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="4"/>` : ""}
<text class="mut mono" x="314" y="200" text-anchor="end">n=${total}</text>
</svg>`;
  }

  if (styleName === "glass") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 340 210" width="340" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<defs>
<filter id="bE" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
<radialGradient id="gE" cx="30%" cy="0%" r="90%"><stop offset="0" stop-color="#1b2550"/><stop offset="1" stop-color="#0c1225"/></radialGradient>
</defs>
<style>${css}</style>
<rect width="340" height="210" rx="20" fill="url(#gE)"/>
<ellipse class="acc glow" cx="150" cy="96" rx="90" ry="60" filter="url(#bE)"/>
<rect class="panel" x="18" y="120" width="304" height="72" rx="14"/>
<rect class="stroke" x="18" y="120" width="304" height="72" rx="14"/>
<text class="mut" x="30" y="52">${label} RATING</text>
<text class="big" x="30" y="102" style="font-size:50px">${r}</text>
<text class="${tr.cls} mid" x="222" y="102">${tr.str}</text>
<text class="mut" x="34" y="150">PEAK</text><text class="mid" x="34" y="176">${b}</text>
<text class="mut" x="170" y="150">WIN</text><text class="mid" x="170" y="176">${wp}%</text>
<text class="mut" x="290" y="150" text-anchor="end">GAMES</text><text class="mid" x="290" y="176" text-anchor="end">${total}</text>
</svg>`;
  }

  if (styleName === "piece") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 380 210" width="380" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<defs>
<filter id="bF" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>
<linearGradient id="pF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7ef92"/><stop offset="1" stop-color="#79b843"/></linearGradient>
</defs>
<style>${css}</style>
<rect class="bg" width="380" height="210" rx="20"/>
<ellipse class="acc glow" cx="120" cy="120" rx="96" ry="88" filter="url(#bF)"/>
<text class="float ser" x="120" y="196" text-anchor="middle" style="font-size:210px" fill="url(#pF)">${piece}</text>
<text class="mut" x="238" y="58">${label}</text>
<text class="big" x="238" y="104" style="font-size:52px">${r}</text>
<text class="${tr.cls} mid" x="238" y="130">${tr.str}</text>
<line class="peak" x1="238" y1="150" x2="352" y2="150" stroke-dasharray="4 5"/>
<text class="mut" x="238" y="176">Peak ${b} · ${wp}% win</text>
<text class="mut" x="238" y="194">${total} games</text>
</svg>`;
  }

  // premium / light (1A / 1H)
  const miniPts = chartPoints(history.slice(-10), 196, 322, 165, 194);
  const miniLine = miniPts.length > 1 ? `<polyline class="ln draw" points="${pline(miniPts)}"/>` : "";
  const fid = styleName === "light" ? "bL" : "bA";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 340 210" width="340" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} hero">
<defs><filter id="${fid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="17"/></filter></defs>
<style>${css}</style>
<rect class="bg" width="340" height="210" rx="20"/>
<ellipse class="acc glow" cx="94" cy="118" rx="66" ry="66" filter="url(#${fid})"/>
<text class="acc float ser" x="94" y="170" text-anchor="middle" style="font-size:152px">${piece}</text>
<text class="mut" x="196" y="50">${label}</text>
<text class="big" x="196" y="94" style="font-size:46px">${r}</text>
<text class="${tr.cls} mid" x="196" y="120">${tr.str}</text>
<text class="mut" x="196" y="150">${total} games · ${wp}% win</text>
${miniLine}
</svg>`;
}

// ─── renderLine ─────────────────────────────────────────────────────────────

function renderLine(data, mode, styleName) {
  const css = buildCSS(styleName);
  const piece = MODE_PIECES[mode];
  const label = MODE_LABELS[mode];
  const { rating, best, wins, losses, draws, history } = data;
  const total = wins + losses + draws;
  const wp = winPct(wins, losses, draws);
  const last20 = history.slice(-20);
  const tr = trendOf(history, rating);
  const r = rating || "—";
  const b = best || "—";

  if (styleName === "editorial" || styleName === "light-editorial") {
    const pts = chartPoints(last20, 44, 446, 112, 190);
    const lastPt = pts[pts.length - 1];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<style>${css}</style>
<rect class="bg" width="470" height="210" rx="20"/>
<text class="mut" x="30" y="40" style="letter-spacing:.22em">${label} · RATING HISTORY</text>
<text class="acc ser" x="30" y="86" style="font-size:52px">${r}</text>
<text class="${tr.cls} mid" x="140" y="84">${tr.str}</text>
<line class="rule" x1="30" y1="104" x2="440" y2="104"/>
${pts.length > 1 ? `<polyline class="ln thin draw" points="${pline(pts)}"/>` : ""}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="3.5"/>` : ""}
<text class="mut" x="30" y="200">${wp}% win · ${total} games · last ${last20.length} games</text>
</svg>`;
  }

  if (styleName === "wood") {
    const pts = chartPoints(last20, 44, 446, 75, 182);
    const lastPt = pts[pts.length - 1];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<defs>
<linearGradient id="wC2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c1e14"/><stop offset="1" stop-color="#1c120b"/></linearGradient>
</defs>
<style>${css}</style>
<rect width="470" height="210" rx="20" fill="url(#wC2)"/>
<rect class="sq" x="24" y="150" width="26" height="26"/><rect class="sq" x="76" y="150" width="26" height="26"/><rect class="sq" x="50" y="176" width="26" height="26"/>
<text class="acc ser" x="30" y="42" style="font-size:22px">${piece}</text>
<text class="mut" x="58" y="30">${label}</text>
<text class="mid" x="58" y="47">Rating history</text>
<text class="big ser" x="446" y="44" text-anchor="end" style="font-size:38px">${r}</text>
<text class="${tr.cls} mid" x="446" y="62" text-anchor="end">${tr.str}</text>
<line class="peak" x1="44" y1="52" x2="446" y2="52" stroke-dasharray="4 5"/>
<text class="mut" x="245" y="46" text-anchor="middle" style="font-size:9px;letter-spacing:.1em">PEAK ${b}</text>
${pts.length > 1 ? `<polygon class="area" points="${areaPts(pts, 182)}"/>` : ""}
${pts.length > 1 ? `<polyline class="ln draw" points="${pline(pts)}"/>` : ""}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="4.5"/>` : ""}
<text class="mut" x="24" y="200">Peak ${b} · ${wp}% win · ${total} games · last ${last20.length}</text>
</svg>`;
  }

  if (styleName === "tech") {
    const pts = chartPoints(last20, 44, 446, 60, 180);
    const lastPt = pts[pts.length - 1];
    const step = Math.max(1, Math.floor(pts.length / 4));
    const nodes = pts
      .filter((_, i) => i > 0 && i < pts.length - 1 && i % step === 0)
      .map((p) => `<circle class="acc" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6"/>`)
      .join("");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<style>${css}</style>
<rect class="bg" width="470" height="210" rx="20"/>
<line class="grid" x1="44" y1="60" x2="446" y2="60"/><line class="grid" x1="44" y1="100" x2="446" y2="100"/>
<line class="grid" x1="44" y1="140" x2="446" y2="140"/><line class="grid" x1="44" y1="180" x2="446" y2="180"/>
<line class="grid" x1="44" y1="52" x2="44" y2="188"/><line class="grid" x1="245" y1="52" x2="245" y2="188"/><line class="grid" x1="446" y1="52" x2="446" y2="188"/>
<text class="mut mono" x="24" y="30">${mode.toUpperCase()}.RATING</text>
<text class="big mono" x="446" y="34" text-anchor="end" style="font-size:28px">${r}</text>
<text class="${tr.cls} mono mid" x="446" y="52" text-anchor="end">${tr.str}</text>
${pts.length > 1 ? `<polyline class="ln draw" points="${pline(pts)}"/>` : ""}
${nodes}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="4.5"/>` : ""}
<text class="mut mono" x="44" y="202">a1</text><text class="mut mono" x="245" y="202" text-anchor="middle">d4</text><text class="mut mono" x="446" y="202" text-anchor="end">h8</text>
</svg>`;
  }

  if (styleName === "glass") {
    const pts = chartPoints(last20, 44, 446, 82, 180);
    const lastPt = pts[pts.length - 1];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<defs>
<filter id="bE2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
<radialGradient id="gE2" cx="80%" cy="10%" r="90%"><stop offset="0" stop-color="#1b2550"/><stop offset="1" stop-color="#0c1225"/></radialGradient>
</defs>
<style>${css}</style>
<rect width="470" height="210" rx="20" fill="url(#gE2)"/>
<ellipse class="acc glow" cx="410" cy="80" rx="80" ry="60" filter="url(#bE2)"/>
<text class="mut" x="26" y="34">${label} · RATING HISTORY</text>
<text class="big" x="446" y="40" text-anchor="end" style="font-size:30px">${r}</text>
<text class="${tr.cls} mid" x="446" y="58" text-anchor="end">${tr.str}</text>
<rect class="panel" x="18" y="66" width="434" height="128" rx="14"/>
<rect class="stroke" x="18" y="66" width="434" height="128" rx="14"/>
<line class="peak" x1="44" y1="82" x2="446" y2="82" stroke-dasharray="4 5"/>
<text class="mut" x="44" y="78" style="font-size:9px">PEAK ${b}</text>
${pts.length > 1 ? `<polygon class="area" points="${areaPts(pts, 182)}"/>` : ""}
${pts.length > 1 ? `<polyline class="ln draw" points="${pline(pts)}"/>` : ""}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="4.5"/>` : ""}
</svg>`;
  }

  if (styleName === "piece") {
    const pts = chartPoints(last20, 150, 446, 110, 182);
    const lastPt = pts[pts.length - 1];
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<defs><filter id="bF2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter></defs>
<style>${css}</style>
<rect class="bg" width="470" height="210" rx="20"/>
<ellipse class="acc glow" cx="60" cy="150" rx="60" ry="60" filter="url(#bF2)"/>
<text class="acc float ser" x="58" y="188" text-anchor="middle" style="font-size:120px">${piece}</text>
<text class="mut" x="150" y="40">${label} RATING</text>
<text class="big" x="150" y="80" style="font-size:38px">${r}</text>
<text class="${tr.cls} mid" x="270" y="80">${tr.str}</text>
${pts.length > 1 ? `<polygon class="area" points="${areaPts(pts, 182)}"/>` : ""}
${pts.length > 1 ? `<polyline class="ln draw" points="${pline(pts)}"/>` : ""}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="4.5"/>` : ""}
<text class="mut" x="150" y="202">Peak ${b} · ${wp}% win · ${total} games</text>
</svg>`;
  }

  // premium / light (1A / 1H)
  const pts = chartPoints(last20, 44, 446, 75, 182);
  const lastPt = pts[pts.length - 1];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 470 210" width="470" height="210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history">
<style>${css}</style>
<rect class="bg" width="470" height="210" rx="20"/>
<rect class="chip" x="24" y="20" width="30" height="30" rx="9"/>
<text class="acc ser" x="39" y="42" text-anchor="middle" style="font-size:19px">${piece}</text>
<text class="mut" x="66" y="30">${label}</text>
<text class="mid" x="66" y="47">Rating history</text>
<text class="big" x="446" y="42" text-anchor="end">${r}</text>
<text class="${tr.cls} mid" x="446" y="61" text-anchor="end">${tr.str}</text>
<line class="peak" x1="44" y1="52" x2="446" y2="52" stroke-dasharray="4 5"/>
<text class="mut" x="245" y="46" text-anchor="middle" style="font-size:9px;letter-spacing:.1em">PEAK ${b}</text>
${pts.length > 1 ? `<polygon class="area" points="${areaPts(pts, 182)}"/>` : ""}
${pts.length > 1 ? `<polyline class="ln draw" points="${pline(pts)}"/>` : ""}
${lastPt ? `<circle class="acc dot" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="4.5"/>` : ""}
<text class="mut" x="24" y="200">Peak ${b} · ${wp}% win · ${total} games · last ${last20.length}</text>
</svg>`;
}

// ─── renderSummary ───────────────────────────────────────────────────────────

function renderSummary(allData, styleName, username) {
  const css = buildCSS(styleName);
  const isEd = styleName === "editorial" || styleName === "light-editorial";
  const modes = ["blitz", "rapid", "bullet", "daily"];

  const totalGames = modes.reduce((s, m) => {
    const d = allData[m];
    return s + d.wins + d.losses + d.draws;
  }, 0);

  const secs = [
    { mode: "blitz",  x0: 40,  x1: 176, lx: 40,  divX: 215 },
    { mode: "rapid",  x0: 240, x1: 376, lx: 240, divX: 415 },
    { mode: "bullet", x0: 440, x1: 576, lx: 440, divX: 615 },
    { mode: "daily",  x0: 640, x1: 776, lx: 640, divX: null },
  ];

  const bodyParts = secs.map(({ mode, x0, x1, lx, divX }) => {
    const d = allData[mode];
    const tr = trendOf(d.history, d.rating);
    const miniPts = chartPoints(d.history.slice(-8), x0, x1, 160, 182);
    const miniLine = miniPts.length > 1 ? `<polyline class="ln thin draw" points="${pline(miniPts)}"/>` : "";
    const rating = d.rating || "—";
    const divEl = divX
      ? isEd
        ? `<line class="rule" x1="${divX}" y1="70" x2="${divX}" y2="168"/>`
        : `<line class="peak" x1="${divX}" y1="70" x2="${divX}" y2="176" stroke-dasharray="0"/>`
      : "";

    const section = isEd
      ? `<g>
<text class="mut" x="${lx}" y="84">${MODE_LABELS[mode]}</text>
<text class="acc ser" x="${lx}" y="128" style="font-size:44px">${rating}</text>
<text class="${tr.cls} mid" x="${lx}" y="152">${tr.str}</text>
${miniLine}
</g>`
      : `<g>
<text class="mut" x="${lx}" y="86">${MODE_LABELS[mode]}</text>
<text class="big" x="${lx}" y="122" style="font-size:32px">${rating}</text>
<text class="${tr.cls} mid" x="${lx}" y="146">${tr.str}</text>
${miniLine}
</g>`;

    return section + "\n" + divEl;
  }).join("\n");

  // Style-specific bg / decoration
  let defs = "";
  let bgEl = `<rect class="bg" width="840" height="200" rx="20"/>`;
  let decorations = "";

  if (styleName === "wood") {
    defs = `<defs><linearGradient id="wCS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c1e14"/><stop offset="1" stop-color="#1c120b"/></linearGradient></defs>`;
    bgEl = `<rect width="840" height="200" rx="20" fill="url(#wCS)"/>`;
    decorations = `<rect class="sq" x="0" y="140" width="26" height="26"/><rect class="sq" x="52" y="140" width="26" height="26"/><rect class="sq" x="26" y="166" width="26" height="26"/>`;
  } else if (styleName === "glass") {
    defs = `<defs><radialGradient id="gCS" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#1b2550"/><stop offset="1" stop-color="#0c1225"/></radialGradient></defs>`;
    bgEl = `<rect width="840" height="200" rx="20" fill="url(#gCS)"/>`;
  } else if (styleName === "tech") {
    decorations = `<line class="grid" x1="30" y1="68" x2="810" y2="68"/><line class="grid" x1="30" y1="120" x2="810" y2="120"/><line class="grid" x1="30" y1="172" x2="810" y2="172"/>`;
  }

  if (isEd) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 840 200" width="840" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chess.com stats summary">
${defs}
<style>${css}</style>
${bgEl}
${decorations}
<text class="mut" x="30" y="36" style="letter-spacing:.22em">CHESS.COM · @${username} · ${totalGames} GAMES</text>
<line class="rule" x1="30" y1="50" x2="810" y2="50"/>
${bodyParts}
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 840 200" width="840" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chess.com stats summary">
${defs}
<style>${css}</style>
${bgEl}
${decorations}
<text class="mut" x="30" y="36">CHESS.COM · @${username}</text>
<text class="mut" x="810" y="36" text-anchor="end">${totalGames} games · updated every 6h</text>
<line class="peak" x1="30" y1="52" x2="810" y2="52" stroke-dasharray="0"/>
${bodyParts}
</svg>`;
}

// ─── Data fetching (unchanged) ───────────────────────────────────────────────

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const cacheAge = Date.now() - cacheData.timestamp;
      if (cacheAge < CACHE_MAX_AGE) {
        console.log(`  Loaded cache (${Math.round(cacheAge / (1000 * 60 * 60))}h old)`);
        return cacheData;
      } else {
        console.log(`  Cache too old (${Math.round(cacheAge / (1000 * 60 * 60))}h), ignoring`);
      }
    }
  } catch (error) {
    console.warn(`  Failed to load cache: ${error.message}`);
  }
  return null;
}

function saveCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), username: CHESS_USERNAME, ...data }, null, 2));
    console.log(`  Cache saved successfully`);
  } catch (error) {
    console.warn(`  Failed to save cache: ${error.message}`);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, maxRetries = 5) {
  const baseDelay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Fetching: ${url.split("/").slice(-2).join("/")}${attempt > 0 ? ` (retry ${attempt}/${maxRetries})` : ""}`);
      const response = await fetch(url, { ...options, headers: { "User-Agent": "ChessReadmeStats/1.0", ...options.headers } });
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        console.log(`  Rate limited! Waiting ${Math.round(waitTime / 1000)}s...`);
        await sleep(waitTime);
        continue;
      }
      if (response.status >= 500 && response.status < 600) {
        if (attempt < maxRetries) { await sleep(baseDelay * Math.pow(2, attempt)); continue; }
      }
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt < maxRetries) { await sleep(baseDelay * Math.pow(2, attempt)); continue; }
      throw error;
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

async function fetchChessStats(username) {
  const response = await fetchWithRetry(`https://api.chess.com/pub/player/${username}/stats`);
  return response.json();
}

async function fetchGameArchives(username) {
  try {
    const response = await fetchWithRetry(`https://api.chess.com/pub/player/${username}/games/archives`);
    return response.json();
  } catch (error) {
    console.error(`  Failed to fetch archives: ${error.message}`);
    return { archives: [] };
  }
}

async function fetchMonthGames(archiveUrl) {
  try {
    const response = await fetchWithRetry(archiveUrl);
    return response.json();
  } catch (error) {
    console.error(`  Failed to fetch month games: ${error.message}`);
    return { games: [] };
  }
}

function extractRatingHistory(games, username, gameType) {
  const history = [];
  const lowerUsername = username.toLowerCase();
  for (const game of games) {
    if (game.time_class !== gameType) continue;
    const isWhite = game.white.username.toLowerCase() === lowerUsername;
    const player = isWhite ? game.white : game.black;
    if (player.rating) {
      history.push({ date: new Date(game.end_time * 1000), rating: player.rating });
    }
  }
  return history.sort((a, b) => a.date - b.date);
}

function extractStats(data) {
  const getMode = (mode) => {
    const m = data?.[mode];
    return { rating: m?.last?.rating || 0, best: m?.best?.rating || 0, wins: m?.record?.win || 0, losses: m?.record?.loss || 0, draws: m?.record?.draw || 0 };
  };
  return { rapid: getMode("chess_rapid"), blitz: getMode("chess_blitz"), bullet: getMode("chess_bullet"), daily: getMode("chess_daily") };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("Chess.com Stats Generator");
  console.log("=".repeat(60));
  console.log(`User: ${CHESS_USERNAME}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log("");

  if (!CHESS_USERNAME?.trim()) throw new Error("CHESS_USERNAME is required.");

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Loading cache...");
  const cache = loadCache();
  console.log("");

  let stats, allGames = [], usedCache = false;

  try {
    console.log("Fetching player stats...");
    const rawStats = await fetchChessStats(CHESS_USERNAME);
    stats = extractStats(rawStats);
    console.log(`  Rapid: ${stats.rapid.rating}  Blitz: ${stats.blitz.rating}  Bullet: ${stats.bullet.rating}  Daily: ${stats.daily.rating}`);
    console.log("");
  } catch (error) {
    console.error(`ERROR: Failed to fetch player stats — ${error.message}`);
    if (cache?.stats) { stats = cache.stats; usedCache = true; console.log("  Using cached stats\n"); }
    else throw error;
  }

  if (!usedCache) {
    try {
      console.log("Fetching game history...");
      const archives = await fetchGameArchives(CHESS_USERNAME);
      const recentArchives = (archives.archives || []).slice(-3);
      console.log(`  Fetching last ${recentArchives.length} archive months...`);
      for (const url of recentArchives) {
        const monthData = await fetchMonthGames(url);
        if (monthData.games?.length) allGames = allGames.concat(monthData.games);
      }
      console.log(`  Total games loaded: ${allGames.length}\n`);
    } catch (error) {
      console.error(`ERROR: Failed to fetch game history — ${error.message}`);
      if (cache?.allGames) { allGames = cache.allGames; console.log("  Using cached game history\n"); }
    }
  } else if (cache?.allGames) {
    allGames = cache.allGames;
  }

  const modes = ["blitz", "rapid", "bullet", "daily"];
  const gameTypes = { blitz: "blitz", rapid: "rapid", bullet: "bullet", daily: "daily" };
  const histories = {};
  console.log("Processing rating history...");
  for (const mode of modes) {
    histories[mode] = extractRatingHistory(allGames, CHESS_USERNAME, gameTypes[mode]);
    console.log(`  ${mode}: ${histories[mode].length} data points`);
  }
  console.log("");

  if (!usedCache) {
    console.log("Saving cache...");
    saveCache({ stats, allGames });
    console.log("");
  }

  // Build unified data object
  const allData = {};
  for (const mode of modes) {
    allData[mode] = { ...stats[mode], history: histories[mode] };
  }

  // Generate SVGs for all styles × all card types
  const styleNames = Object.keys(STYLES);
  console.log(`Generating SVGs for ${styleNames.length} styles × ${modes.length * 2 + 1} card types...\n`);

  let count = 0;
  for (const styleName of styleNames) {
    const suffix = styleName === "premium" ? "" : `-${styleName}`;
    try {
      // Summary card (replaces old main card)
      fs.writeFileSync(`${OUTPUT_DIR}/chess-stats${suffix}.svg`, renderSummary(allData, styleName, CHESS_USERNAME));
      count++;

      for (const mode of modes) {
        // Line chart (replaces old per-mode line charts)
        fs.writeFileSync(`${OUTPUT_DIR}/chess-stats-${mode}${suffix}.svg`, renderLine(allData[mode], mode, styleName));
        // Hero card (new card type)
        fs.writeFileSync(`${OUTPUT_DIR}/chess-stats-${mode}-hero${suffix}.svg`, renderHero(allData[mode], mode, styleName));
        count += 2;
      }
      console.log(`  ✓ ${styleName} (9 files)`);
    } catch (error) {
      console.error(`  ✗ ${styleName} failed: ${error.message}`);
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log(`SUCCESS: Generated ${count} SVG files`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\n" + "=".repeat(60));
  console.error("FATAL ERROR:", err.message);
  if (err.stack) console.error(err.stack);
  console.error("=".repeat(60));
  process.exit(1);
});
