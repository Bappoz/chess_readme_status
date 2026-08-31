import fs from "node:fs";
import path from "node:path";

const CHESS_USERNAME = process.env.CHESS_USERNAME || "bappozl";
const OUTPUT_DIR = "assets";
const CACHE_FILE = path.join(OUTPUT_DIR, ".cache.json");
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// ─── Design system: "Rank" ──────────────────────────────────────────────────
//
// Três regras que o design anterior quebrava:
//
// 1. Só fontes que existem de verdade. O design antigo pedia 'Space Grotesk',
//    'Instrument Serif' e 'JetBrains Mono' — nenhuma instalada em lugar nenhum,
//    e o GitHub bloqueia @import de fonte externa. Resultado: 100% dos leitores
//    viam Arial/Liberation, ou seja, o oposto de premium. Aqui a stack é a UI do
//    sistema (SF / Segoe / Roboto / Liberation), Georgia para display serifado e
//    a mono do sistema — todas presentes de fato, e o layout foi desenhado para
//    as métricas delas.
// 2. Nada de decoração. Sem glow, blur, sombra ou peça gigante flutuando.
//    A peça aparece uma vez, pequena, como marca de identificação.
// 3. Hairline sólida, nunca tracejada; marca fina; respiro generoso.

// Peças em <path> num quadro 100×100 (base assentada em y=96), independentes de
// fonte — glyph Unicode (U+265A-F) vira tofu onde não há fonte de símbolos.
const MODE_PIECES = {
  blitz: `<path fill-rule="evenodd" d="M66 5l-4 17c9 10 16 27 16 58H34c0-8-1-14-4-20-6 3-13 2-16-2-3-3-3-8 0-12 3-5 6-10 10-14 6-6 13-10 21-11 7-1 14 0 21 4zM37.4 39a3.4 3.4 0 1 0-6.8 0 3.4 3.4 0 1 0 6.8 0zM24 82h52c3.9 0 7 3.1 7 7v7H17v-7c0-3.9 3.1-7 7-7z"/>`,
  rapid: `<path d="M18 22a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm64 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM50 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM22 36l8 26h40l8-26-14 14-14-22-14 22zM28 66h44c1.6 0 3 1.3 3 3v5c0 1.6-1.4 3-3 3H28c-1.6 0-3-1.4-3-3v-5c0-1.7 1.4-3 3-3zM26 80h48c4.4 0 8 3.6 8 8v8H18v-8c0-4.4 3.6-8 8-8z"/>`,
  bullet: `<path d="M50 8c-8.8 0-16 7.2-16 16 0 5.2 2.5 9.9 6.4 12.8-2.1 1.2-3.9 2.8-5.3 4.7h29.8c-1.4-1.9-3.2-3.5-5.3-4.7C63.5 33.9 66 29.2 66 24c0-8.8-7.2-16-16-16zM37 46c.6 13.6-2.4 24.5-9 32.7h44c-6.6-8.2-9.6-19.1-9-32.7H37zM24 82h52c3.9 0 7 3.1 7 7v7H17v-7c0-3.9 3.1-7 7-7z"/>`,
  daily: `<path d="M46 4h8v10h10v8H54v12h-8V22H36v-8h10V4zM50 40c-13 0-24 8-24 19 0 6 4 11 10 14l-6 9h40l-6-9c6-3 10-8 10-14 0-11-11-19-24-19zM26 84h48c4.4 0 8 3.6 8 8v4H18v-4c0-4.4 3.6-8 8-8z"/>`,
};
const MODE_LABELS = { blitz: "BLITZ", rapid: "RAPID", bullet: "BULLET", daily: "DAILY" };

// Desenha a peça com altura `h`, centrada em `cx`, assentada na baseline `y`.
function pieceMark(mode, cx, y, h, cls = "acc") {
  const s = h / 100;
  const tx = (cx - 50 * s).toFixed(1);
  const ty = (y - 96 * s).toFixed(1);
  return `<g class="${cls}" transform="translate(${tx},${ty}) scale(${s.toFixed(4)})">${MODE_PIECES[mode]}</g>`;
}

// Stacks só com fontes realmente instaladas nos três SOs.
const FACE_SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;
const FACE_SERIF = `Georgia,'Times New Roman',Times,serif`;
const FACE_MONO = `ui-monospace,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;

// win/draw/loss é uma escala DIVERGENTE (polo positivo ↔ neutro ↔ polo negativo),
// então o meio é cinza por regra. Verde×vermelho foi reprovado no validador
// (ΔE 4.1 em deuteranopia — daltônico não separa vitória de derrota); aqua×vermelho
// passa com ΔE 9.9. A forma (preenchido / meio / vazado) carrega o significado em
// paralelo, então a cor nunca é o único canal.
const DARK_STATUS = { win: "#1baf7a", draw: "#8b8f96", loss: "#d03b3b" };
const LIGHT_STATUS = { win: "#0d8659", draw: "#7c7f85", loss: "#c0332f" };

const STYLES = {
  premium: {
    mode: "dark", surf: "#111317", ink: "#f4f5f7", ink2: "#8d949d", rule: "#22262d",
    acc: "#8ac054", face: FACE_SANS, display: FACE_SANS, trait: "plain",
  },
  editorial: {
    mode: "dark", surf: "#141210", ink: "#f5f1e8", ink2: "#948d80", rule: "#2b2721",
    acc: "#d8a24a", face: FACE_SANS, display: FACE_SERIF, trait: "editorial",
  },
  wood: {
    mode: "dark", surf: "#241811", ink: "#f3e8d5", ink2: "#a5917a", rule: "#3a2a1e",
    acc: "#e7bd6b", face: FACE_SANS, display: FACE_SERIF, trait: "board",
  },
  tech: {
    mode: "dark", surf: "#0a0d0c", ink: "#d6ded8", ink2: "#7d8a83", rule: "#1a221f",
    acc: "#48d1ae", face: FACE_MONO, display: FACE_MONO, trait: "lattice",
  },
  glass: {
    mode: "dark", surf: "#0c1225", ink: "#e9ecf7", ink2: "#8790ab", rule: "#1e2643",
    acc: "#8098ff", face: FACE_SANS, display: FACE_SANS, trait: "panel",
  },
  piece: {
    mode: "dark", surf: "#0d0f13", ink: "#eef1f3", ink2: "#888f98", rule: "#1e2228",
    acc: "#9bd35e", face: FACE_SANS, display: FACE_SANS, trait: "piece",
  },
  light: {
    mode: "light", surf: "#f7f7f4", ink: "#14161a", ink2: "#6b7078", rule: "#e2e2dc",
    acc: "#4a7c2a", face: FACE_SANS, display: FACE_SANS, trait: "plain",
  },
  "light-editorial": {
    mode: "light", surf: "#f8f2e6", ink: "#221d15", ink2: "#7a7164", rule: "#e5dac4",
    acc: "#9a6a1e", face: FACE_SANS, display: FACE_SERIF, trait: "editorial",
  },
  // Estilos legados. Os nomes de arquivo já estão publicados em READMEs de
  // terceiros, então não podem sumir — mas tinham parado de ser gerados e
  // serviam dado congelado no design antigo. Trazidos de volta para o sistema:
  // mesma grade e mesmas marcas, paleta própria de cada um.
  chess: {
    mode: "dark", surf: "#14170f", ink: "#eef2e4", ink2: "#8b937c", rule: "#252a1c",
    acc: "#7fa650", face: FACE_SANS, display: FACE_SANS, trait: "board",
  },
  matrix: {
    mode: "dark", surf: "#050806", ink: "#c8e6d0", ink2: "#6f8a78", rule: "#13201a",
    acc: "#35d67a", face: FACE_MONO, display: FACE_MONO, trait: "lattice",
  },
  midnight: {
    mode: "dark", surf: "#0b1020", ink: "#e4e9f7", ink2: "#7f88a5", rule: "#1a2138",
    acc: "#6d8dff", face: FACE_SANS, display: FACE_SANS, trait: "panel",
  },
  neon: {
    mode: "dark", surf: "#0c0a12", ink: "#f0e9f8", ink2: "#8d84a0", rule: "#201b2c",
    acc: "#c85cf0", face: FACE_SANS, display: FACE_SANS, trait: "plain",
  },
  ocean: {
    mode: "dark", surf: "#071a24", ink: "#e0f0f6", ink2: "#77949f", rule: "#12303d",
    acc: "#38b6d6", face: FACE_SANS, display: FACE_SANS, trait: "panel",
  },
};

function tokens(styleName) {
  const s = STYLES[styleName] || STYLES.premium;
  return { ...s, ...(s.mode === "dark" ? DARK_STATUS : LIGHT_STATUS) };
}

// ─── SVG utilities ──────────────────────────────────────────────────────────

// Texto vindo da API entra em markup: escapar é obrigatório.
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function buildCSS(styleName) {
  const t = tokens(styleName);
  return [
    `svg{font-family:${t.face}}`,
    `text{fill:${t.ink};white-space:pre}`,
    `.bg{fill:${t.surf}}`,
    `.acc{fill:${t.acc}}`,
    `.win{fill:${t.win}}`,
    `.draw{fill:${t.draw}}`,
    `.loss{fill:${t.loss}}`,
    // Rótulo em caixa alta: tracking aberto é o que faz caixa alta funcionar.
    `.lbl{font-size:10px;font-weight:600;letter-spacing:.18em;fill:${t.ink2}}`,
    `.cap{font-size:10.5px;font-weight:500;fill:${t.ink2}}`,
    `.num{font-family:${t.display};font-weight:700;letter-spacing:-.02em}`,
    `.tick{font-size:9px;font-weight:500;fill:${t.ink2};opacity:.75}`,
    `.dl{font-size:10px;font-weight:600}`,
    // Hairline sólida — tracejado é ruído visual (anti-pattern).
    `.rule{stroke:${t.rule};stroke-width:1;fill:none}`,
    `.grid{stroke:${t.rule};stroke-width:1;fill:none;opacity:.7}`,
    `.ln{fill:none;stroke:${t.acc};stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`,
    `.ring{stroke:${t.surf};stroke-width:2}`,
    `.hollow{fill:none;stroke-width:1.5}`,
    `.sq{fill:${t.ink};opacity:.035}`,
  ].join("");
}

function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function gamesLabel(n) {
  return `${fmt(n)} ${n === 1 ? "game" : "games"}`;
}

function chartPoints(history, x0, x1, yTop, yBottom) {
  if (history.length === 0) return [];
  const n = history.length;
  const ratings = history.map((h) => h.rating);
  const mn = Math.min(...ratings);
  const mx = Math.max(...ratings);
  const range = mx - mn || 1;
  const pad = range * 0.12;
  const yMin = mn - pad, yMax = mx + pad, yRange = yMax - yMin;
  return history.map((h, i) => ({
    x: x0 + (n > 1 ? i / (n - 1) : 0.5) * (x1 - x0),
    y: yBottom - ((h.rating - yMin) / yRange) * (yBottom - yTop),
    rating: h.rating,
  }));
}

// Catmull-Rom → cúbica de Bézier. Curva suave sem overshoot, em vez da
// polilinha angulosa anterior.
function smoothPath(pts) {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}L${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function trendOf(history, currentRating) {
  const last = history.slice(-20);
  if (last.length < 2) return null;
  return currentRating - last[0].rating;
}

// Delta desenhado: triângulo em <path>, não glyph de fonte (▲▼ dependem de
// cobertura de fonte e leem como emoji).
function deltaMark(diff, x, y, t) {
  if (diff === null) return `<rect x="${x - 4}" y="${y - 3}" width="8" height="1.5" fill="${t.ink2}"/>`;
  const c = diff > 0 ? t.win : diff < 0 ? t.loss : t.ink2;
  if (diff === 0) return `<rect x="${x - 4}" y="${y - 3}" width="8" height="1.5" fill="${c}"/>`;
  return diff > 0
    ? `<path fill="${c}" d="M${x} ${y - 7}L${x + 4} ${y - 1}H${x - 4}Z"/>`
    : `<path fill="${c}" d="M${x} ${y - 1}L${x + 4} ${y - 7}H${x - 4}Z"/>`;
}

function deltaText(diff) {
  if (diff === null) return "no data";
  return diff > 0 ? `+${diff}` : String(diff);
}

function winPct(wins, losses, draws) {
  const t = wins + losses + draws;
  return t > 0 ? Math.round((wins / t) * 100) : 0;
}

// Rank de resultados — a referência ao xadrez é estrutural (uma fileira do
// tabuleiro), não decorativa, e cada casa é um dado real.
// Forma É o canal primário: cheia = vitória, meia = empate, vazada = derrota.
// A cor só reforça, então funciona em daltonismo e em P&B.
function formGuide(history, x, y, size, gap, max, t) {
  const games = history.slice(-max).filter((g) => g.outcome);
  if (games.length === 0) return "";
  return games
    .map((g, i) => {
      const gx = (x + i * (size + gap)).toFixed(1);
      if (g.outcome === "w") return `<rect x="${gx}" y="${y}" width="${size}" height="${size}" rx="1.5" fill="${t.acc}"/>`;
      if (g.outcome === "d") return `<rect x="${gx}" y="${y}" width="${size}" height="${size}" rx="1.5" fill="${t.acc}" opacity=".34"/>`;
      return `<rect x="${(Number(gx) + 0.6).toFixed(1)}" y="${y + 0.6}" width="${size - 1.2}" height="${size - 1.2}" rx="1.2" fill="none" stroke="${t.ink2}" stroke-width="1.2" opacity=".55"/>`;
    })
    .join("");
}

// Legenda: forma é o canal primário, então ela precisa ser decodificada em
// texto — nem cor nem forma podem carregar significado sozinhas.
function formLegend(x, y, t) {
  const k = (dx, sw) =>
    sw === "hollow"
      ? `<rect x="${x + dx + 0.6}" y="${y - 6.4}" width="6.8" height="6.8" rx="1.2" fill="none" stroke="${t.ink2}" stroke-width="1.2" opacity=".55"/>`
      : `<rect x="${x + dx}" y="${y - 7}" width="8" height="8" rx="1.5" fill="${t.acc}"${sw === "half" ? ` opacity=".34"` : ""}/>`;
  return `${k(0, "solid")}<text class="tick" x="${x + 12}" y="${y}">W</text>${k(28, "half")}<text class="tick" x="${x + 40}" y="${y}">D</text>${k(56, "hollow")}<text class="tick" x="${x + 68}" y="${y}">L</text>`;
}

// Proporção vitória/empate/derrota numa única matiz (o acento), clareando por
// segmento. Antes eram três blocos saturados verde/cinza/vermelho — a marca mais
// barulhenta do card carregando o dado menos importante. Fina e tonal, ela lê
// como "fatia de vitórias", que é a mensagem real.
function wdlBar(wins, draws, losses, x, y, w, h, t) {
  const total = wins + draws + losses;
  if (total === 0) return "";
  const seg = [
    { v: wins, op: 1 },
    { v: draws, op: 0.4 },
    { v: losses, op: 0.15 },
  ].filter((s) => s.v > 0);
  let cx = x;
  return seg
    .map((s, i) => {
      const sw = Math.max(1.5, (s.v / total) * w - (i < seg.length - 1 ? 2 : 0));
      const r = `<rect x="${cx.toFixed(1)}" y="${y}" width="${sw.toFixed(1)}" height="${h}" rx="${(h / 2).toFixed(1)}" fill="${t.acc}" opacity="${s.op}"/>`;
      cx += sw + 2;
      return r;
    })
    .join("");
}

function sparkline(history, x0, x1, yTop, yBottom, cls = "ln") {
  const pts = chartPoints(history.slice(-20), x0, x1, yTop, yBottom);
  if (pts.length < 2) return "";
  const last = pts[pts.length - 1];
  return `<path class="${cls}" style="stroke-width:1.6" d="${smoothPath(pts)}"/><circle class="acc ring" cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2.6"/>`;
}

// Fundo por estilo: a única diferença estrutural entre variantes. O sistema
// (grid, escala tipográfica, marcas) é o mesmo em todas — é isso que faz
// parecer uma família, não 8 templates soltos.
function backdrop(t, w, h) {
  if (t.trait === "board") {
    let sq = "";
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 12; c++)
        if ((r + c) % 2 === 0) sq += `<rect class="sq" x="${c * 26}" y="${h - 78 + r * 26}" width="26" height="26"/>`;
    return sq;
  }
  if (t.trait === "lattice") {
    let g = "";
    for (let i = 1; i < 5; i++) g += `<line class="grid" x1="0" y1="${(h / 5) * i}" x2="${w}" y2="${(h / 5) * i}" opacity=".5"/>`;
    return g;
  }
  // Gradiente em vez de retângulo: a borda reta do painel cortava o card ao meio
  // e lia como emenda, não como camada.
  if (t.trait === "panel")
    return `<defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.ink}" stop-opacity="0"/><stop offset="1" stop-color="${t.ink}" stop-opacity=".05"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gp)"/>`;
  return "";
}

// ─── renderHero ─────────────────────────────────────────────────────────────
// Um número é a história: hero number + delta + barra W/D/L. Sem gráfico grande.

function renderHero(data, mode, styleName) {
  const t = tokens(styleName);
  const css = buildCSS(styleName);
  const label = MODE_LABELS[mode];
  const { rating, best, wins, losses, draws, history } = data;
  const total = wins + losses + draws;
  const wp = winPct(wins, losses, draws);
  const diff = trendOf(history, rating);
  const W = 340, H = 210;
  const r = rating ? fmt(rating) : "—";
  const editorial = t.trait === "editorial";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating ${rating || "unavailable"}, ${wp}% win rate over ${total} games">
<style>${css}</style>
<rect class="bg" width="${W}" height="${H}" rx="16"/>
${backdrop(t, W, H)}
${pieceMark(mode, 33, 41, 20)}
<text class="lbl" x="49" y="38">${label}</text>
<text class="num" x="26" y="${editorial ? 98 : 96}" style="font-size:${editorial ? 60 : 55}px">${r}</text>
${diff !== null
      ? `${deltaMark(diff, 30, 122, t)}<text class="dl" x="42" y="122" fill="${diff > 0 ? t.win : diff < 0 ? t.loss : t.ink2}">${deltaText(diff)}</text><text class="cap" x="${42 + deltaText(diff).length * 6.6 + 8}" y="122">last 20</text>`
      : `<text class="cap" x="26" y="122">no recent games</text>`}
${wdlBar(wins, draws, losses, 26, 134, W - 52, 3, t)}
${sparkline(history, 26, W - 26, 152, 178) || ""}
<line class="rule" x1="26" y1="188" x2="${W - 26}" y2="188"/>
<text class="cap" x="26" y="203">${wp}% win · ${gamesLabel(total)}</text>
<text class="cap" x="${W - 26}" y="203" text-anchor="end">peak ${best ? fmt(best) : "—"}</text>
</svg>`;
}

// ─── renderLine ─────────────────────────────────────────────────────────────
// Mudança ao longo do tempo → linha. Grade hairline, só os extremos rotulados,
// e o rank de resultados abaixo dando o contexto que o rating sozinho não dá.

function renderLine(data, mode, styleName) {
  const t = tokens(styleName);
  const css = buildCSS(styleName);
  const label = MODE_LABELS[mode];
  const { rating, best, wins, losses, draws, history } = data;
  const total = wins + losses + draws;
  const wp = winPct(wins, losses, draws);
  const diff = trendOf(history, rating);
  const W = 470, H = 210;
  const last20 = history.slice(-20);
  const X0 = 60, X1 = W - 26, YT = 84, YB = 148;
  const pts = chartPoints(last20, X0, X1, YT, YB);
  const lastPt = pts[pts.length - 1];
  const ratings = last20.map((h) => h.rating);
  const hi = ratings.length ? Math.max(...ratings) : 0;
  const lo = ratings.length ? Math.min(...ratings) : 0;
  const r = rating ? fmt(rating) : "—";
  const editorial = t.trait === "editorial";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} rating history, currently ${rating || "unavailable"}, ${wp}% win rate over ${total} games">
<style>${css}</style>
<rect class="bg" width="${W}" height="${H}" rx="16"/>
${backdrop(t, W, H)}
${pieceMark(mode, 34, 42, 20)}
<text class="lbl" x="50" y="39">${label}</text>
<text class="cap" x="50" y="55">Rating history</text>
<text class="num" x="${W - 26}" y="48" text-anchor="end" style="font-size:${editorial ? 40 : 36}px">${r}</text>
${diff !== null ? `${deltaMark(diff, W - 26 - String(deltaText(diff)).length * 6 - 12, 68, t)}<text class="dl" x="${W - 26}" y="68" text-anchor="end" fill="${diff > 0 ? t.win : diff < 0 ? t.loss : t.ink2}">${deltaText(diff)}</text>` : ""}
${pts.length > 1 ? `<line class="grid" x1="${X0}" y1="${YT}" x2="${X1}" y2="${YT}"/><line class="grid" x1="${X0}" y1="${YB}" x2="${X1}" y2="${YB}"/>
<text class="tick" x="${X0 - 8}" y="${YT + 3}" text-anchor="end">${fmt(hi)}</text>
<text class="tick" x="${X0 - 8}" y="${YB + 3}" text-anchor="end">${fmt(lo)}</text>
<path class="ln" d="${smoothPath(pts)}"/>
<circle class="acc ring" cx="${lastPt.x.toFixed(1)}" cy="${lastPt.y.toFixed(1)}" r="3.8"/>`
      : `<text class="cap" x="${X0}" y="${(YT + YB) / 2}">Not enough games to chart</text>`}
${formGuide(history, 26, 164, 8.5, 3.4, 20, t)}
${formLegend(W - 106, 172, t)}
<line class="rule" x1="26" y1="186" x2="${W - 26}" y2="186"/>
<text class="cap" x="26" y="202">${wp}% win · ${gamesLabel(total)}</text>
<text class="cap" x="${W - 26}" y="202" text-anchor="end">peak ${best ? fmt(best) : "—"}</text>
</svg>`;
}

// ─── renderSummary ───────────────────────────────────────────────────────────
// Quatro modos lado a lado: mesma escala tipográfica, separados por hairline.
// Comparação é o trabalho do card, então tudo alinha na mesma baseline.

function renderSummary(allData, styleName, username) {
  const t = tokens(styleName);
  const css = buildCSS(styleName);
  const W = 840, H = 200;
  const modes = ["blitz", "rapid", "bullet", "daily"];
  const totalGames = modes.reduce((a, m) => {
    const d = allData[m];
    return a + d.wins + d.losses + d.draws;
  }, 0);
  const colW = (W - 52) / 4;

  const cols = modes
    .map((m, i) => {
      const d = allData[m];
      const x = 26 + i * colW;
      const inner = x + 20;
      const cw = colW - 40;
      const diff = trendOf(d.history, d.rating);
      const wp = winPct(d.wins, d.losses, d.draws);
      const games = d.wins + d.losses + d.draws;
      const divider = i > 0 ? `<line class="rule" x1="${x.toFixed(1)}" y1="64" x2="${x.toFixed(1)}" y2="178"/>` : "";
      const spark = sparkline(d.history, inner, inner + cw, 118, 146);
      return `${divider}
${pieceMark(m, inner + 6, 86, 15)}
<text class="lbl" x="${inner + 20}" y="84">${MODE_LABELS[m]}</text>
<text class="num" x="${inner}" y="${t.trait === "editorial" ? 116 : 114}" style="font-size:34px">${d.rating ? fmt(d.rating) : "—"}</text>
${spark || `<text class="tick" x="${inner}" y="140">no recent games</text>`}
${diff !== null ? `${deltaMark(diff, inner + 5, 168, t)}<text class="dl" x="${inner + 16}" y="168" fill="${diff > 0 ? t.win : diff < 0 ? t.loss : t.ink2}">${deltaText(diff)}</text>` : ""}
<text class="cap" x="${inner + cw}" y="168" text-anchor="end">${games ? `${wp}% · ${fmt(games)}` : "—"}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chess.com stats for ${esc(username)} across blitz, rapid, bullet and daily">
<style>${css}</style>
<rect class="bg" width="${W}" height="${H}" rx="18"/>
${backdrop(t, W, H)}
<text class="lbl" x="26" y="38">CHESS.COM</text>
<text class="cap" x="${26 + 88}" y="38">@${esc(username)}</text>
<text class="cap" x="${W - 26}" y="38" text-anchor="end">${gamesLabel(totalGames)} · updated every 6h</text>
<line class="rule" x1="26" y1="52" x2="${W - 26}" y2="52"/>
${cols}
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

// Falha aqui precisa propagar: engolir o erro gera card sem histórico, que o
// workflow commitaria por cima do bom.
async function fetchGameArchives(username) {
  const response = await fetchWithRetry(`https://api.chess.com/pub/player/${username}/games/archives`);
  return response.json();
}

async function fetchMonthGames(archiveUrl) {
  const response = await fetchWithRetry(archiveUrl);
  return response.json();
}

// Resultados de empate da API do Chess.com; "win" é vitória e todo o resto
// (checkmated, resigned, timeout, abandoned…) é derrota.
const DRAW_RESULTS = new Set([
  "agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient",
]);

function extractRatingHistory(games, username, gameType) {
  const history = [];
  const lowerUsername = username.toLowerCase();
  for (const game of games) {
    if (game.time_class !== gameType) continue;
    const isWhite = game.white.username.toLowerCase() === lowerUsername;
    const player = isWhite ? game.white : game.black;
    if (player.rating) {
      const outcome = player.result === "win" ? "w" : DRAW_RESULTS.has(player.result) ? "d" : "l";
      history.push({ date: new Date(game.end_time * 1000), rating: player.rating, outcome });
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
      // A lista de arquivos só contém meses com partidas: nenhum jogo aqui
      // significa resposta vazia da API, não conta sem jogos.
      if (recentArchives.length && !allGames.length) {
        throw new Error(`Archives listed ${recentArchives.length} month(s) but returned no games`);
      }
    } catch (error) {
      console.error(`ERROR: Failed to fetch game history — ${error.message}`);
      if (cache?.allGames) { allGames = cache.allGames; console.log("  Using cached game history\n"); }
      else throw error;
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
