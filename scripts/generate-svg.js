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

// Peças num quadro 100×100 (base assentada em y=96), independentes de fonte —
// glyph Unicode (U+265A-F) vira tofu onde não há fonte de símbolos. Cada peça é
// feita de partes separadas por um vão de ~3u: em uma cor só o vão lê como
// entalhe; em `pieceNeo` o contorno fundido por baixo vira a linha interna.
const FOOT = `<path d="M24 82h52a7 7 0 0 1 7 7v7H17v-7a7 7 0 0 1 7-7z"/>`;
const PIECES = {
  p: `<circle cx="50" cy="22" r="13"/><path d="M37 38h26a2.5 2.5 0 0 1 0 5H37a2.5 2.5 0 0 1 0-5z"/><path d="M42 46h16c1 13 5 24 13 33H29c8-9 12-20 13-33z"/>${FOOT}`,
  n: `<path fill-rule="evenodd" d="M54 6L50 19C40 21 31 27 24 36L13 51C10 55 11 60 15 63L20 66C24 68 28 67 31 64L40 56C45 58 50 57 54 54C54 64 46 70 40 79H72C73 56 70 36 62 22L65 7L59 15zM41.2 36a3.2 3.2 0 1 0-6.4 0 3.2 3.2 0 1 0 6.4 0z"/><path d="M70 14C80 30 84 54 83 79H76.5C77 55 74 36 66.5 23z"/>${FOOT}`,
  b: `<circle cx="50" cy="7" r="4.5"/><path fill-rule="evenodd" d="M50 13C60 21 65 30 65 38c0 6-4 10-9 12H44c-5-2-9-6-9-12 0-8 5-17 15-25zM56 22l3 2-8 13-3-2z"/><path d="M38 53h24a2.5 2.5 0 0 1 0 5H38a2.5 2.5 0 0 1 0-5z"/><path d="M42 61h16c1 7 5 13 12 18H30c7-5 11-11 12-18z"/>${FOOT}`,
  r: `<path d="M26 10h11v8h7v-8h12v8h7v-8h11v20H26z"/><path d="M33 33h34c0 16 2 31 6 46H27c4-15 6-30 6-46z"/>${FOOT}`,
  q: `<circle cx="20" cy="22" r="4.5"/><circle cx="35" cy="13" r="4.5"/><circle cx="50" cy="10" r="4.5"/><circle cx="65" cy="13" r="4.5"/><circle cx="80" cy="22" r="4.5"/><path d="M30 62L22 30L31 45L36 21L43 43L50 18L57 43L64 21L69 45L78 30L70 62z"/><path d="M33 65h34a2.5 2.5 0 0 1 0 5H33a2.5 2.5 0 0 1 0-5z"/><path d="M33 73h34l5 6H28z"/>${FOOT}`,
  k: `<path d="M46 3h8v7h8v8h-8v9h-8v-9h-8v-8h8z"/><path d="M28 34c7-2 14-3 22-3s15 1 22 3c4 8 2 20-6 28H34c-8-8-10-20-6-28z"/><path d="M33 65h34a2.5 2.5 0 0 1 0 5H33a2.5 2.5 0 0 1 0-5z"/><path d="M33 73h34l5 6H28z"/>${FOOT}`,
};
const MODE_PIECE = { blitz: "n", rapid: "q", bullet: "p", daily: "k" };
const MODE_LABELS = { blitz: "BLITZ", rapid: "RAPID", bullet: "BULLET", daily: "DAILY" };

// Desenha a peça com altura `h`, centrada em `cx`, assentada na baseline `y`.
function pieceAt(p, cx, y, h, attrs) {
  const s = h / 100;
  return `<g ${attrs} transform="translate(${(cx - 50 * s).toFixed(1)},${(y - 96 * s).toFixed(1)}) scale(${s.toFixed(4)})">${PIECES[p]}</g>`;
}

function pieceMark(mode, cx, y, h, cls = "acc") {
  return pieceAt(MODE_PIECE[mode], cx, y, h, `class="${cls}"`);
}

// Peça em duas tintas (corpo + contorno), para tabuleiro e peças grandes.
function pieceNeo(p, cx, y, h, fill, line) {
  const s = h / 100;
  return `<g transform="translate(${(cx - 50 * s).toFixed(1)},${(y - 96 * s).toFixed(1)}) scale(${s.toFixed(4)})"><g fill="${line}" stroke="${line}" stroke-width="6" stroke-linejoin="round">${PIECES[p]}</g><g fill="${fill}">${PIECES[p]}</g></g>`;
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
  // Superfície e tinta do Primer: o card some no fundo do README e só a borda
  // (`edge`) o delimita. `syntax` é o realce de código do próprio GitHub.
  github: {
    mode: "dark", surf: "#0d1117", ink: "#e6edf3", ink2: "#8b949e", rule: "#30363d", edge: "#30363d",
    acc: "#81b64c", face: FACE_SANS, display: FACE_SANS, trait: "plain",
    syntax: { kw: "#ff7b72", str: "#a5d6ff", num: "#79c0ff", prop: "#7ee787", typ: "#ffa657" },
  },
  "github-light": {
    mode: "light", surf: "#ffffff", ink: "#1f2328", ink2: "#656d76", rule: "#d0d7de", edge: "#d0d7de",
    acc: "#3d7a1c", face: FACE_SANS, display: FACE_SANS, trait: "plain",
    syntax: { kw: "#cf222e", str: "#0a3069", num: "#0550ae", prop: "#116329", typ: "#953800" },
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
    // Traço de 2px centrado na borda: o viewport corta a metade de fora, sobra 1px.
    `.bg{fill:${t.surf}${t.edge ? `;stroke:${t.edge};stroke-width:2` : ""}}`,
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

// ─── Formatos de README ─────────────────────────────────────────────────────
// Cards cuja forma vem do GitHub (calendário, git log), do terminal (fetch,
// editor) ou do próprio jogo (tabuleiro, cores, aberturas). Usam os mesmos
// tokens e classes do sistema; o que muda é o que cada um conta.

const LIVE_MODES = ["rapid", "blitz", "bullet"];
const OPENING_STOPS = new Set(["Defense", "Game", "Opening", "Gambit", "Attack", "System"]);
const HOW = { checkmated: "by checkmate", resigned: "by resignation", timeout: "on time", abandoned: "by abandonment" };

function mix(a, b, p) {
  const ch = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * p).toString(16).padStart(2, "0")).join("");
}

// `style` inline porque `text{fill}` do CSS do card vence atributo de apresentação.
function txt(x, y, s, o = {}) {
  const st = [
    o.f && `fill:${o.f}`, o.s && `font-size:${o.s}px`, o.w && `font-weight:${o.w}`,
    o.ff && `font-family:${o.ff}`, o.ls && `letter-spacing:${o.ls}`,
  ].filter(Boolean).join(";");
  return `<text${o.cls ? ` class="${o.cls}"` : ""} x="${x}" y="${y}"${o.a ? ` text-anchor="${o.a}"` : ""}${st ? ` style="${st}"` : ""}>${s}</text>`;
}

function card(W, H, styleName, label, body) {
  const t = tokens(styleName);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">
<style>${buildCSS(styleName)}</style>
<rect class="bg" width="${W}" height="${H}" rx="16"/>
${backdrop(t, W, H)}
${body}
</svg>`;
}

function hline(x1, y1, x2, y2) {
  return `<line class="rule" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}

function deltaTag(diff, x, y, t, o = {}) {
  if (diff === null) return "";
  const c = diff > 0 ? t.win : diff < 0 ? t.loss : t.ink2;
  return deltaMark(diff, x, y, t) + txt(x + 8, y, deltaText(diff), { cls: "dl", f: c, ...o });
}

// Aqui W/D/L é o próprio conteúdo (não um detalhe do card), então usa a escala
// divergente validada, com vão de 2px entre segmentos.
function wdlStatus(w, d, l, x, y, width, h, t) {
  const n = w + d + l;
  if (!n) return "";
  const parts = [[w, t.win], [d, t.draw], [l, t.loss]].filter((p) => p[0] > 0);
  const avail = width - 2 * (parts.length - 1);
  let cx = x;
  return parts.map(([v, c]) => {
    const pw = Math.max(1.5, (avail * v) / n);
    const r = `<rect x="${cx.toFixed(1)}" y="${y}" width="${pw.toFixed(1)}" height="${h}" rx="${Math.min(h / 2, 2)}" fill="${c}"/>`;
    cx += pw + 2;
    return r;
  }).join("");
}

// Mesma regra do formGuide: forma carrega o resultado, cor reforça.
function resultMark(outcome, x, y, sz, t) {
  const rx = sz * 0.25;
  if (outcome === "w") return `<rect x="${x.toFixed(1)}" y="${y}" width="${sz}" height="${sz}" rx="${rx}" fill="${t.win}"/>`;
  if (outcome === "d") return `<rect x="${x.toFixed(1)}" y="${(y + sz * 0.3).toFixed(1)}" width="${sz}" height="${(sz * 0.4).toFixed(1)}" rx="1" fill="${t.draw}"/>`;
  return `<rect x="${(x + 0.75).toFixed(1)}" y="${y + 0.75}" width="${sz - 1.5}" height="${sz - 1.5}" rx="${rx}" fill="none" stroke="${t.loss}" stroke-width="1.5"/>`;
}

function openingFamily(url) {
  if (!url) return "Unknown opening";
  const w = String(url).split("/").pop().split("-");
  let i = w.findIndex((x) => OPENING_STOPS.has(x));
  if (i < 0) i = Math.min(1, w.length - 1);
  return w.slice(0, i + 1).join(" ").replace(/^Kings /, "King's ").replace(/^Queens /, "Queen's ");
}

// Uma linha por partida de xadrez padrão, em ordem cronológica. Variantes
// (chess960 etc.) ficam fora: têm rating próprio e quebrariam o delta por modo.
function digestGames(games, username) {
  const me = username.toLowerCase();
  const last = {};
  return games
    .filter((g) => g.rules === "chess" && g.white?.username && g.black?.username && g.end_time)
    .sort((a, b) => a.end_time - b.end_time)
    .map((g) => {
      const isWhite = g.white.username.toLowerCase() === me;
      const p = isWhite ? g.white : g.black;
      const o = isWhite ? g.black : g.white;
      const outcome = p.result === "win" ? "w" : DRAW_RESULTS.has(p.result) ? "d" : "l";
      const delta = p.rating && last[g.time_class] != null ? p.rating - last[g.time_class] : null;
      if (p.rating) last[g.time_class] = p.rating;
      return {
        t: g.end_time, mode: g.time_class, color: isWhite ? "w" : "b", outcome,
        how: outcome === "w" ? o.result : p.result, rating: p.rating || 0, delta,
        opp: o.username, oppRating: o.rating || 0, opening: openingFamily(g.eco), fen: g.fen || "",
      };
    });
}

function tally(games) {
  const o = { w: 0, d: 0, l: 0 };
  for (const g of games) o[g.outcome]++;
  o.n = o.w + o.d + o.l;
  o.wp = o.n ? Math.round((o.w / o.n) * 100) : 0;
  return o;
}

function totals(data) {
  const o = { w: 0, d: 0, l: 0 };
  for (const m of Object.keys(data)) { o.w += data[m].wins; o.d += data[m].draws; o.l += data[m].losses; }
  o.n = o.w + o.d + o.l;
  o.wp = o.n ? Math.round((o.w / o.n) * 100) : 0;
  return o;
}

function clip(s, max) {
  return s.length > max ? s.slice(0, Math.max(1, max - 1)) + "…" : s;
}

// ─── renderActivity ─────────────────────────────────────────────────────────
// O calendário de contribuições do GitHub, contando partidas por dia. 13
// semanas: é a janela que os 4 meses de arquivo buscados cobrem — coluna além
// do que foi buscado apareceria vazia sem ser verdade.

function renderActivity(ctx, styleName) {
  const t = tokens(styleName);
  const W = 840, H = 226, COLS = 13, x0 = 292, y0 = 56, c = 15, p = 19;
  const day = (s) => Math.floor(s / 86400);
  const today = day(ctx.now / 1000);
  const start = today - ((today + 4) % 7) - (COLS - 1) * 7; // domingo da 1ª coluna
  const games = ctx.games.filter((g) => day(g.t) >= start);
  const perDay = new Map();
  for (const g of games) perDay.set(day(g.t), (perDay.get(day(g.t)) || 0) + 1);
  // Sequencial numa matiz só: do vazio (quase superfície) ao acento cheio.
  const ramp = [mix(t.surf, t.ink, 0.07), ...[0.3, 0.5, 0.75, 1].map((k) => mix(t.surf, t.acc, k))];
  const lvl = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let cells = "", months = "";
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < 7; row++) {
      const d = start + col * 7 + row;
      if (d > today) continue;
      const date = new Date(d * 864e5);
      if (date.getUTCDate() === 1) months += txt(x0 + col * p, 44, MON[date.getUTCMonth()], { cls: "tick" });
      cells += `<rect x="${x0 + col * p}" y="${y0 + row * p}" width="${c}" height="${c}" rx="3" fill="${ramp[lvl(perDay.get(d) || 0)]}"/>`;
    }
  }
  const weekdays = [[1, "Mon"], [3, "Wed"], [5, "Fri"]].map(([r, s]) => txt(x0 - 9, y0 + r * p + 11, s, { cls: "tick", a: "end" })).join("");
  const lx = x0 + COLS * p - 4 - 5 * 16 - 30;
  const legend = txt(lx - 6, 209, "Less", { cls: "tick", a: "end" }) +
    ramp.map((f, i) => `<rect x="${lx + i * 16}" y="200" width="11" height="11" rx="2.5" fill="${f}"/>`).join("") +
    txt(lx + 5 * 16 + 2, 209, "More", { cls: "tick" });

  let best = 0, run = 0;
  for (const g of games) { run = g.outcome === "w" ? run + 1 : 0; best = Math.max(best, run); }
  const rec = tally(games);
  const busiest = perDay.size ? Math.max(...perDay.values()) : 0;
  const side = [["BEST STREAK", `${best} ${best === 1 ? "win" : "wins"}`], ["BUSIEST DAY", gamesLabel(busiest)], ["ACTIVE DAYS", `${perDay.size} of ${today - start + 1}`]]
    .map(([k, v], i) => txt(622, 70 + i * 50, k, { cls: "lbl" }) + txt(622, 92 + i * 50, v, { s: 18, w: 600 })).join("");

  return card(W, H, styleName, `Chess.com activity for ${ctx.user}: ${gamesLabel(games.length)} in the last ${COLS} weeks`,
    `${pieceAt("n", 35, 41, 17, 'class="acc"')}
${txt(50, 38, "CHESS.COM", { cls: "lbl" })}${txt(28, 58, "@" + esc(ctx.user), { cls: "cap" })}
${txt(28, 122, fmt(games.length), { cls: "num", s: 50 })}
${txt(28, 142, `${games.length === 1 ? "game" : "games"} in ${COLS} weeks`, { cls: "cap" })}
${wdlBar(rec.w, rec.d, rec.l, 28, 160, 196, 3, t)}
${txt(28, 182, `${rec.w} W · ${rec.d} D · ${rec.l} L`, { cls: "cap" })}
${months}${weekdays}${cells}${legend}
${hline(596, 40, 596, 196)}
${side}`);
}

// ─── renderGitlog ───────────────────────────────────────────────────────────
// As últimas partidas como commits: nó cheio = vitória, vazado = derrota, e o
// "diff" à direita é o rating ganho ou perdido.

function renderGitlog(ctx, styleName) {
  const t = tokens(styleName);
  const W = 600, N = 7, gx = 35;
  const rows = ctx.games.slice(-N).reverse();
  const H = 72 + Math.max(0, rows.length - 1) * 25 + 26;
  const mono = t.face === FACE_MONO;
  const max = Math.floor((W - 60 - 174) / (mono ? 7.3 : 6.3));
  let body = txt(24, 34, `<tspan style="fill:${t.acc};font-weight:700">$</tspan> git log --oneline --graph chess/${esc(ctx.user)}`, { s: 12, w: 500, f: t.ink2, ff: FACE_MONO }) +
    hline(0, 48, W, 48);
  if (!rows.length) return card(W, H, styleName, `No recent games for ${ctx.user}`, body + txt(24, 76, "no games in the fetched archives", { cls: "cap" }));
  body += `<line x1="${gx}" y1="68" x2="${gx}" y2="${68 + (rows.length - 1) * 25}" stroke="${t.rule}" stroke-width="2"/>`;
  rows.forEach((g, i) => {
    const y = 72 + i * 25, cy = y - 4;
    body += g.outcome === "l"
      ? `<circle cx="${gx}" cy="${cy}" r="4.5" fill="${t.surf}" stroke="${t.loss}" stroke-width="2"/>`
      : `<circle cx="${gx}" cy="${cy}" r="5" fill="${g.outcome === "w" ? t.win : t.draw}" stroke="${t.surf}" stroke-width="2"/>`;
    body += txt(54, y, g.t.toString(16).slice(-7), { s: 11.5, w: 500, f: t.acc, ff: FACE_MONO });
    body += `<rect x="114.5" y="${y - 12.5}" width="48" height="17" rx="8.5" fill="none" stroke="${t.rule}"/>` +
      txt(138.5, y - 0.5, esc(clip(g.mode, 6)), { s: 9.5, w: 600, f: t.ink2, ff: FACE_MONO, a: "middle" });
    const head = `${g.outcome === "w" ? "beat" : g.outcome === "d" ? "drew" : "lost to"} ${clip(g.opp, 16)}`;
    const tail = clip(` (${g.oppRating}) · ${g.opening}`, Math.max(8, max - head.length));
    body += txt(174, y, `<tspan style="font-weight:600">${esc(head)}</tspan><tspan style="fill:${t.ink2}">${esc(tail)}</tspan>`, { s: 12, w: 400 });
    if (g.delta !== null) body += txt(W - 24, y, deltaText(g.delta), { s: 11.5, w: 600, f: g.delta > 0 ? t.win : g.delta < 0 ? t.loss : t.ink2, ff: FACE_MONO, a: "end" });
  });
  return card(W, H, styleName, `Last ${rows.length} Chess.com games of ${ctx.user}`, body);
}

// ─── renderTicker ───────────────────────────────────────────────────────────
// Uma linha de altura: os três modos ao vivo, tendência e sparkline.

function renderTicker(ctx, styleName) {
  const t = tokens(styleName);
  const W = 840, H = 52;
  let body = pieceAt("k", 31, 34, 16, 'class="acc"') + txt(46, 30.5, "@" + esc(clip(ctx.user, 12)), { s: 12, w: 600 });
  LIVE_MODES.forEach((m, i) => {
    const s = 150 + i * 226, d = ctx.data[m];
    body += hline(s - 16, 14, s - 16, 38) + pieceMark(m, s + 7, 33, 14) + txt(s + 21, 30, MODE_LABELS[m], { cls: "lbl" }) +
      txt(s + 82, 31.5, d.rating ? fmt(d.rating) : "—", { cls: "num", s: 16 }) +
      deltaTag(trendOf(d.history, d.rating), s + 132, 30.5, t) +
      sparkline(d.history, s + 166, s + 202, 19, 34);
  });
  return card(W, H, styleName, `Chess.com ratings of ${ctx.user}`, body);
}

// ─── renderFetch ────────────────────────────────────────────────────────────
// neofetch de xadrez: a peça no lugar do logo ASCII, chave/valor em mono.

function renderFetch(ctx, styleName) {
  const t = tokens(styleName);
  const W = 600, H = 266, kx = 178, vx = 258, M = FACE_MONO;
  const all = totals(ctx.data);
  const key = (y, s) => txt(kx, y, s, { s: 12.5, w: 700, f: t.acc, ff: M });
  const val = (y, s) => txt(vx, y, s, { s: 12.5, w: 500, ff: M });
  let body = `<path d="M0 34V16a16 16 0 0 1 16-16h${W - 32}a16 16 0 0 1 16 16v18z" fill="${mix(t.surf, t.ink, 0.05)}"/>` + hline(0, 34, W, 34) +
    [22, 40, 58].map((x) => `<circle cx="${x}" cy="17" r="5" fill="${mix(t.surf, t.ink, 0.18)}"/>`).join("") +
    txt(W / 2, 21, `${esc(ctx.user)} — chessfetch`, { s: 11, w: 500, f: t.ink2, ff: M, a: "middle" }) +
    txt(24, 62, `<tspan style="fill:${t.acc};font-weight:700">$</tspan> chessfetch`, { s: 12, w: 500, ff: M }) +
    pieceAt("n", 92, 222, 132, 'class="acc"') +
    txt(kx, 90, `<tspan style="fill:${t.acc};font-weight:700">${esc(ctx.user)}</tspan><tspan style="fill:${t.ink2}">@</tspan><tspan style="fill:${t.acc};font-weight:700">chess.com</tspan>`, { s: 12.5, w: 500, ff: M }) +
    `<line x1="${kx}" y1="100" x2="${kx + 138}" y2="100" stroke="${t.ink2}" stroke-width="1" stroke-dasharray="4 3"/>`;
  LIVE_MODES.forEach((m, i) => {
    const y = 122 + i * 20, d = ctx.data[m];
    body += key(y, m) + txt(vx + 30, y, d.rating || "—", { s: 12.5, w: 600, ff: M, a: "end" }) +
      deltaTag(trendOf(d.history, d.rating), vx + 48, y, t, { s: 11.5, ff: M }) +
      txt(vx + 104, y, `peak ${d.best || "—"}`, { s: 12.5, w: 400, f: t.ink2, ff: M });
  });
  body += key(182, "record") + val(182, `${all.w}W ${all.d}D ${all.l}L`) +
    key(202, "winrate") + val(202, `${all.wp}% of ${gamesLabel(all.n)}`) +
    key(222, "form") + (ctx.games.slice(-14).map((g, i) => resultMark(g.outcome, vx + i * 14, 212, 10, t)).join("") || val(222, "no recent games")) +
    [t.acc, t.win, t.draw, t.loss, t.ink, t.ink2].map((c, i) => `<rect x="${kx + i * 24}" y="236" width="24" height="11" fill="${c}"/>`).join("");
  return card(W, H, styleName, `Chess.com summary for ${ctx.user}: ${all.wp}% wins over ${gamesLabel(all.n)}`, body);
}

// ─── renderCode ─────────────────────────────────────────────────────────────
// Os stats como objeto TypeScript numa aba de editor. Sem `syntax` no estilo, o
// realce é derivado do acento para não trazer uma segunda paleta ao card.

function renderCode(ctx, styleName) {
  const t = tokens(styleName);
  const W = 450, H = 252, M = FACE_MONO;
  const sx = t.syntax || { kw: t.ink2, str: mix(t.acc, t.ink, 0.55), num: t.ink, prop: t.acc, typ: mix(t.acc, t.ink, 0.3) };
  const span = (c, s) => `<tspan style="fill:${c}">${s}</tspan>`;
  const str = (s) => span(sx.str, `"${esc(s)}"`);
  const all = totals(ctx.data);
  const fam = new Map();
  for (const g of ctx.games) fam.set(g.opening, (fam.get(g.opening) || 0) + 1);
  const top = [...fam.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const row = (m) => {
    const d = ctx.data[m], r = String(d.rating || 0);
    return `  ${span(sx.prop, m)}:${" ".repeat(7 - m.length)}{ ${span(sx.prop, "elo")}: ${span(sx.num, r)},${" ".repeat(Math.max(1, 5 - r.length))}${span(sx.prop, "peak")}: ${span(sx.num, d.best || 0)} },`;
  };
  const lines = [
    `${span(sx.kw, "export const")} chess: ${span(sx.typ, "Player")} = {`,
    `  ${span(sx.prop, "handle")}: ${str(clip(ctx.user, 24))},`,
    ...LIVE_MODES.map(row),
    `  ${span(sx.prop, "record")}: ${str(`${all.w}W ${all.d}D ${all.l}L`)},`,
    `  ${span(sx.prop, "opening")}: ${str(clip(top, 28))},`,
    `};`,
  ];
  const bar = mix(t.surf, t.ink, 0.05);
  let body = `<path d="M0 34V16a16 16 0 0 1 16-16h${W - 32}a16 16 0 0 1 16 16v18z" fill="${bar}"/>` + hline(0, 34, W, 34) +
    `<path d="M16 34.5V12a4 4 0 0 1 4-4h92a4 4 0 0 1 4 4v22.5" fill="${t.surf}" stroke="${t.rule}"/>` +
    pieceAt("n", 32, 27, 13, 'class="acc"') + txt(44, 25, "chess.ts", { s: 11.5, w: 500, ff: M });
  lines.forEach((l, i) => {
    const y = 62 + i * 21;
    body += txt(34, y, i + 1, { s: 11.5, w: 400, f: t.ink2, ff: M, a: "end" }) + txt(50, y, l, { s: 12.5, w: 400, ff: M });
  });
  body += `<path d="M0 ${H - 24}H${W}V${H - 16}a16 16 0 0 1 -16 16H16a16 16 0 0 1 -16-16z" fill="${bar}"/>` + hline(0, H - 24, W, H - 24) +
    txt(18, H - 8.5, "TypeScript", { s: 10.5, w: 500, f: t.ink2, ff: M }) +
    txt(W - 18, H - 8.5, `${gamesLabel(all.n)} · synced every 6h`, { s: 10.5, w: 500, f: t.ink2, ff: M, a: "end" });
  return card(W, H, styleName, `Chess.com stats of ${ctx.user} as a TypeScript object`, body);
}

// ─── renderLastGame ─────────────────────────────────────────────────────────
// Tabuleiro com a posição final da partida mais recente, visto do lado do
// jogador, com o desfecho em manchete.

function renderLastGame(ctx, styleName) {
  const t = tokens(styleName);
  const W = 540, H = 236, c = 23.5, bx = 24, by = 24, x = 240;
  const g = ctx.games[ctx.games.length - 1];
  const dark = t.mode === "dark";
  const sqL = mix(t.surf, t.ink, dark ? 0.16 : 0.03), sqD = mix(t.surf, t.ink, dark ? 0.06 : 0.14);
  const white = { fill: mix(t.ink, "#ffffff", dark ? 0.5 : 1), line: dark ? mix(t.surf, "#000000", 0.4) : t.ink };
  const black = { fill: dark ? mix(t.surf, t.ink, 0.1) : mix(t.ink, t.surf, 0.3), line: dark ? t.ink2 : t.ink };
  let sq = "", pcs = "";
  for (let r = 0; r < 8; r++)
    for (let k = 0; k < 8; k++)
      sq += `<rect x="${(bx + k * c).toFixed(1)}" y="${(by + r * c).toFixed(1)}" width="${c}" height="${c}" fill="${(r + k) % 2 ? sqD : sqL}"/>`;
  const flip = g?.color === "b";
  (g?.fen || "").split(" ")[0].split("/").slice(0, 8).forEach((rank, r) => {
    let col = 0;
    for (const ch of rank) {
      if (/\d/.test(ch)) { col += Number(ch); continue; }
      const p = ch.toLowerCase();
      if (PIECES[p] && col < 8) {
        const dr = flip ? 7 - r : r, dc = flip ? 7 - col : col;
        const ink = ch === p ? black : white;
        pcs += pieceNeo(p, bx + dc * c + c / 2, by + dr * c + c - 2.6, c * 0.82, ink.fill, ink.line);
      }
      col++;
    }
  });
  let body = `<clipPath id="bd"><rect x="${bx}" y="${by}" width="${c * 8}" height="${c * 8}" rx="5"/></clipPath><g clip-path="url(#bd)">${sq}</g>${pcs}` +
    `<rect x="${bx}" y="${by}" width="${c * 8}" height="${c * 8}" rx="5" fill="none" stroke="${t.rule}"/>` + txt(x, 42, "LAST GAME", { cls: "lbl" });
  if (!g) return card(W, H, styleName, `No recent games for ${ctx.user}`, body + txt(x, 76, "No games yet", { cls: "num", s: 23 }));
  const head = g.outcome === "w" ? `Won ${HOW[g.how] || ""}`.trim() : g.outcome === "l" ? `Lost ${HOW[g.how] || ""}`.trim() : "Draw";
  const fen = g.fen.split(" ");
  const moves = Number(fen[5]) ? Number(fen[5]) - (fen[1] === "w" ? 1 : 0) : null;
  body += txt(W - 24, 42, new Date(g.t * 1000).toISOString().slice(0, 10), { cls: "cap", a: "end" }) +
    txt(x, 76, head, { cls: "num", s: 23 }) +
    txt(x, 97, `vs ${esc(clip(g.opp, 16))} (${g.oppRating}) · playing ${g.color === "w" ? "White" : "Black"}`, { cls: "cap" }) +
    hline(x, 114, W - 24, 114);
  [["Opening", clip(g.opening, 28)], ["Moves", moves ?? "—"], ["Mode", g.mode]].forEach(([k, v], i) => {
    body += txt(x, 136 + i * 20, k, { cls: "cap" }) + txt(x + 70, 136 + i * 20, esc(v), { s: 11.5, w: 600 });
  });
  body += hline(x, 188, W - 24, 188) + (MODE_PIECE[g.mode] ? pieceMark(g.mode, x + 8, 211, 15) : "") +
    txt(x + 24, 211, g.rating || "—", { cls: "num", s: 19 }) +
    deltaTag(g.delta, x + 24 + String(g.rating).length * 11.5 + 12, 210, t, { s: 11 }) +
    (ctx.data[g.mode]?.best ? txt(W - 24, 210, `peak ${fmt(ctx.data[g.mode].best)}`, { cls: "cap", a: "end" }) : "");
  return card(W, H, styleName, `Last Chess.com game of ${ctx.user}: ${head} against ${g.opp}`, body);
}

// ─── renderColors ───────────────────────────────────────────────────────────
// Brancas × Pretas. As metades são clara e escura em todo estilo porque aqui a
// cor é o conteúdo; o estilo entra só na fonte e na borda.

function renderColors(ctx, styleName) {
  const t = tokens(styleName);
  const W = 540, H = 220;
  const w = tally(ctx.games.filter((g) => g.color === "w")), b = tally(ctx.games.filter((g) => g.color === "b"));
  const L = { bg: "#e7ebef", ink: "#1f2328", ink2: "#59636e" }, D = { bg: "#0d1117", ink: "#e6edf3", ink2: "#8b949e" };
  const half = (s, P, x, a, label) =>
    txt(x, 40, label, { cls: "lbl", f: P.ink2, a }) + txt(x, 104, s.n ? `${s.wp}%` : "—", { cls: "num", s: 50, f: P.ink, a }) +
    txt(x, 126, "win rate", { cls: "cap", f: P.ink2, a }) +
    txt(x, 196, s.n ? `${s.w} W · ${s.d} D · ${s.l} L` : "no games", { cls: "cap", f: P.ink2, a });
  const body = `<clipPath id="sp"><rect width="${W}" height="${H}" rx="16"/></clipPath>` +
    `<g clip-path="url(#sp)"><rect width="${W / 2}" height="${H}" fill="${L.bg}"/><rect x="${W / 2}" width="${W / 2}" height="${H}" fill="${D.bg}"/></g>` +
    pieceNeo("k", 212, 180, 126, "#ffffff", L.ink) + pieceNeo("k", 328, 180, 126, "#21262d", "#8b949e") +
    half(w, L, 26, "", "AS WHITE") + half(b, D, W - 26, "end", "AS BLACK") +
    `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.rule}"/>`;
  return card(W, H, styleName, `${ctx.user} wins ${w.wp}% as White and ${b.wp}% as Black`, body);
}

// ─── renderOpenings ─────────────────────────────────────────────────────────
// Comprimento = partidas na abertura; divisão interna = vitória/empate/derrota.

function renderOpenings(ctx, styleName) {
  const t = tokens(styleName);
  const W = 540, H = 268, bw = W - 52;
  const fam = new Map();
  for (const g of ctx.games) {
    const o = fam.get(g.opening) || { name: g.opening, w: 0, d: 0, l: 0, n: 0 };
    o[g.outcome]++; o.n++;
    fam.set(g.opening, o);
  }
  const top = [...fam.values()].sort((a, b) => b.n - a.n).slice(0, 5);
  let body = pieceAt("b", 35, 41, 17, 'class="acc"') + txt(50, 38, "OPENING REPERTOIRE", { cls: "lbl" }) +
    txt(W - 26, 38, `last ${gamesLabel(ctx.games.length)}`, { cls: "cap", a: "end" }) + hline(26, 52, W - 26, 52);
  if (!top.length) body += txt(26, 80, "no games in the fetched archives", { cls: "cap" });
  top.forEach((o, i) => {
    const y = 76 + i * 34;
    body += txt(26, y, esc(clip(o.name, 30)), { s: 12.5, w: 600 }) +
      txt(W - 26, y, `${gamesLabel(o.n)} · ${Math.round((o.w / o.n) * 100)}% win`, { cls: "cap", a: "end" }) +
      wdlStatus(o.w, o.d, o.l, 26, y + 8, Math.max(12, (bw * o.n) / top[0].n), 6, t);
  });
  body += [["win", t.win], ["draw", t.draw], ["loss", t.loss]].map(([s, c], i) =>
    `<rect x="${26 + i * 62}" y="${H - 24}" width="9" height="9" rx="2" fill="${c}"/>` + txt(40 + i * 62, H - 16, s, { cls: "cap" })).join("");
  return card(W, H, styleName, `Most played openings of ${ctx.user}`, body);
}

// ─── renderMedal ────────────────────────────────────────────────────────────
// Azulejo por modo: anel W/D/L em volta do rating.

function renderMedal(ctx, mode, styleName) {
  const t = tokens(styleName);
  const W = 200, H = 214, cx = 100, cy = 98, r = 66, C = 2 * Math.PI * r, gap = 3;
  const d = ctx.data[mode], n = d.wins + d.draws + d.losses;
  let ring = n ? "" : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.rule}" stroke-width="6"/>`, off = 0;
  if (n) for (const [v, c] of [[d.wins, t.win], [d.draws, t.draw], [d.losses, t.loss]]) {
    const len = (C * v) / n;
    if (len > gap) ring += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="${(len - gap).toFixed(1)} ${(C - len + gap).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off += len;
  }
  return card(W, H, styleName, `${MODE_LABELS[mode]} rating ${d.rating || "unavailable"}, ${winPct(d.wins, d.losses, d.draws)}% win rate over ${gamesLabel(n)}`,
    ring + pieceMark(mode, cx, 74, 20) +
    txt(cx, 112, d.rating ? fmt(d.rating) : "—", { cls: "num", s: 34, a: "middle" }) +
    txt(cx + 1, 132, MODE_LABELS[mode], { cls: "lbl", a: "middle" }) +
    txt(cx, 196, n ? `${winPct(d.wins, d.losses, d.draws)}% win · ${gamesLabel(n)}` : "no games", { cls: "cap", a: "middle" }));
}

// ─── renderBare ─────────────────────────────────────────────────────────────
// Sem moldura nem fundo: o card assenta direto no README, então tinta e fio
// seguem o tema do leitor via prefers-color-scheme (valores do Primer). O
// estilo contribui só com acento e fonte.

function renderBare(ctx, styleName) {
  const t = tokens(styleName);
  const W = 840, H = 118, cw = 250;
  const css = `svg{font-family:${t.face}}text{white-space:pre}.i{fill:#1f2328}.m{fill:#656d76}.r{fill:#d0d7de}.a{fill:${t.acc}}.w{fill:${LIGHT_STATUS.win}}.l{fill:${LIGHT_STATUS.loss}}` +
    `.n{font-family:${t.display};font-size:62px;font-weight:300;letter-spacing:-.03em}.k{font-size:10px;font-weight:600;letter-spacing:.18em}.c{font-size:10.5px;font-weight:500}.d{font-size:10px;font-weight:600}` +
    `@media(prefers-color-scheme:dark){.i{fill:#e6edf3}.m{fill:#8b949e}.r{fill:#30363d}.w{fill:${DARK_STATUS.win}}.l{fill:${DARK_STATUS.loss}}}`;
  const cols = LIVE_MODES.map((m, i) => {
    const x = 2 + i * 286, d = ctx.data[m], wp = winPct(d.wins, d.losses, d.draws);
    const diff = trendOf(d.history, d.rating), dx = x + 21 + MODE_LABELS[m].length * 8.6 + 12;
    const cls = diff > 0 ? "w" : diff < 0 ? "l" : "m";
    const delta = diff === null || diff === 0 ? "" :
      `<path class="${cls}" d="${diff > 0 ? `M${dx} 81l4 6h-8z` : `M${dx} 87l4-6h-8z`}"/><text class="d ${cls}" x="${dx + 8}" y="88">${deltaText(diff)}</text>`;
    return `<text class="n i" x="${x - 3}" y="60">${d.rating ? fmt(d.rating) : "—"}</text>
${pieceMark(m, x + 7, 91, 14, "a")}<text class="k m" x="${x + 21}" y="88">${MODE_LABELS[m]}</text>${delta}
<text class="c m" x="${x + cw}" y="88" text-anchor="end">${wp}% win</text>
<rect class="r" x="${x}" y="102" width="${cw}" height="2" rx="1"/><rect class="a" x="${x}" y="102" width="${((cw * wp) / 100).toFixed(1)}" height="2" rx="1"/>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chess.com ratings of ${esc(ctx.user)}">
<style>${css}</style>
${cols}
</svg>`;
}

// Nome de arquivo → renderer. Prefixo próprio (`chess-<card>`) para não colidir
// com `chess-stats-<estilo>`.
const README_CARDS = {
  activity: renderActivity,
  gitlog: renderGitlog,
  ticker: renderTicker,
  fetch: renderFetch,
  code: renderCode,
  "last-game": renderLastGame,
  colors: renderColors,
  openings: renderOpenings,
  bare: renderBare,
};

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
      const recentArchives = (archives.archives || []).slice(-4);
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

  const ctx = { user: CHESS_USERNAME, data: allData, games: digestGames(allGames, CHESS_USERNAME), now: Date.now() };
  const perStyle = modes.length * 3 + 1 + Object.keys(README_CARDS).length;

  // Generate SVGs for all styles × all card types
  const styleNames = Object.keys(STYLES);
  console.log(`Generating SVGs for ${styleNames.length} styles × ${perStyle} cards...\n`);

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
        fs.writeFileSync(`${OUTPUT_DIR}/chess-medal-${mode}${suffix}.svg`, renderMedal(ctx, mode, styleName));
        count += 3;
      }
      for (const [name, render] of Object.entries(README_CARDS)) {
        fs.writeFileSync(`${OUTPUT_DIR}/chess-${name}${suffix}.svg`, render(ctx, styleName));
        count++;
      }
      console.log(`  ✓ ${styleName} (${perStyle} files)`);
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
