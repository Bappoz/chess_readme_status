import fs from "node:fs";
import path from "node:path";

/**
 * Chess.com Stats SVG Generator
 * Gera graficos SVG com estatisticas do Chess.com
 * Sistema de temas personalizaveis
 */

const CHESS_USERNAME = process.env.CHESS_USERNAME || "bappozl";
const THEME_NAME = process.env.CHESS_THEME || "dark";
const OUTPUT_DIR = "assets";
const CACHE_FILE = path.join(OUTPUT_DIR, ".cache.json");
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Sistema de Temas
 * Cada tema define cores para todos os elementos do SVG
 */
const THEMES = {
  // Tema escuro elegante (padrao)
  dark: {
    name: "Dark",
    background: "#0d1117",
    backgroundAlt: "#161b22",
    card: "#21262d",
    cardBorder: "#30363d",
    text: "#e6edf3",
    textSecondary: "#8b949e",
    textMuted: "#6e7681",
    accent: "#58a6ff",
    rapid: "#f0883e",
    blitz: "#da3633",
    bullet: "#3fb950",
    daily: "#a371f7",
    success: "#3fb950",
    gridLine: "#30363d",
  },

  // Tema claro minimalista
  light: {
    name: "Light",
    background: "#ffffff",
    backgroundAlt: "#f6f8fa",
    card: "#ffffff",
    cardBorder: "#d0d7de",
    text: "#1f2328",
    textSecondary: "#656d76",
    textMuted: "#8c959f",
    accent: "#0969da",
    rapid: "#bf5700",
    blitz: "#cf222e",
    bullet: "#1a7f37",
    daily: "#8250df",
    success: "#1a7f37",
    gridLine: "#d0d7de",
  },

  // Tema preto total
  midnight: {
    name: "Midnight",
    background: "#000000",
    backgroundAlt: "#0a0a0a",
    card: "#111111",
    cardBorder: "#222222",
    text: "#ffffff",
    textSecondary: "#a0a0a0",
    textMuted: "#666666",
    accent: "#ffffff",
    rapid: "#ffa500",
    blitz: "#ff4444",
    bullet: "#44ff44",
    daily: "#aa88ff",
    success: "#44ff44",
    gridLine: "#222222",
  },

  // Tema xadrez classico
  chess: {
    name: "Chess Classic",
    background: "#312e2b",
    backgroundAlt: "#272522",
    card: "#3d3a36",
    cardBorder: "#b58863",
    text: "#f0d9b5",
    textSecondary: "#b58863",
    textMuted: "#8b7355",
    accent: "#769656",
    rapid: "#f0d9b5",
    blitz: "#b58863",
    bullet: "#769656",
    daily: "#8b7355",
    success: "#769656",
    gridLine: "#4a4642",
  },

  // Tema madeira
  wood: {
    name: "Wood",
    background: "#3e2723",
    backgroundAlt: "#4e342e",
    card: "#5d4037",
    cardBorder: "#6d4c41",
    text: "#efebe9",
    textSecondary: "#bcaaa4",
    textMuted: "#8d6e63",
    accent: "#d7ccc8",
    rapid: "#ffab91",
    blitz: "#ff8a65",
    bullet: "#a5d6a7",
    daily: "#ce93d8",
    success: "#a5d6a7",
    gridLine: "#6d4c41",
  },

  // Tema futuristico
  neon: {
    name: "Neon",
    background: "#0a0a1a",
    backgroundAlt: "#12122a",
    card: "#1a1a2e",
    cardBorder: "#00ffff33",
    text: "#00ffff",
    textSecondary: "#00cccc",
    textMuted: "#008888",
    accent: "#ff00ff",
    rapid: "#ffff00",
    blitz: "#ff0066",
    bullet: "#00ff66",
    daily: "#cc66ff",
    success: "#00ff66",
    gridLine: "#00ffff22",
  },

  // Tema verde matrix
  matrix: {
    name: "Matrix",
    background: "#000000",
    backgroundAlt: "#001100",
    card: "#002200",
    cardBorder: "#004400",
    text: "#00ff00",
    textSecondary: "#00cc00",
    textMuted: "#008800",
    accent: "#00ff00",
    rapid: "#88ff88",
    blitz: "#00ff00",
    bullet: "#44ff44",
    daily: "#22cc22",
    success: "#00ff00",
    gridLine: "#003300",
  },

  // Tema oceano
  ocean: {
    name: "Ocean",
    background: "#0c2d48",
    backgroundAlt: "#145374",
    card: "#1a5276",
    cardBorder: "#2471a3",
    text: "#ecf0f1",
    textSecondary: "#bdc3c7",
    textMuted: "#85929e",
    accent: "#5dade2",
    rapid: "#f39c12",
    blitz: "#e74c3c",
    bullet: "#2ecc71",
    daily: "#9b59b6",
    success: "#2ecc71",
    gridLine: "#2471a3",
  },
};

/**
 * Carrega cache de dados anteriores
 */
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const cacheAge = Date.now() - cacheData.timestamp;

      if (cacheAge < CACHE_MAX_AGE) {
        console.log(
          `  Loaded cache (${Math.round(cacheAge / (1000 * 60 * 60))}h old)`,
        );
        return cacheData;
      } else {
        console.log(
          `  Cache too old (${Math.round(cacheAge / (1000 * 60 * 60))}h), ignoring`,
        );
      }
    }
  } catch (error) {
    console.warn(`  Failed to load cache: ${error.message}`);
  }
  return null;
}

/**
 * Salva cache com timestamp
 */
function saveCache(data) {
  try {
    const cacheData = {
      timestamp: Date.now(),
      username: CHESS_USERNAME,
      ...data,
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(`  Cache saved successfully`);
  } catch (error) {
    console.warn(`  Failed to save cache: ${error.message}`);
  }
}

/**
 * Aguarda um tempo com delay exponencial
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch com retry automatico e exponential backoff
 */
async function fetchWithRetry(url, options = {}, maxRetries = 5) {
  const baseDelay = 1000; // 1 segundo

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `  Fetching: ${url.split("/").slice(-2).join("/")}${attempt > 0 ? ` (retry ${attempt}/${maxRetries})` : ""}`,
      );

      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "ChessReadmeStats/1.0",
          ...options.headers,
        },
      });

      // Rate limit detectado
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : baseDelay * Math.pow(2, attempt);

        console.log(
          `  Rate limited! Waiting ${Math.round(waitTime / 1000)}s...`,
        );
        await sleep(waitTime);
        continue;
      }

      // Erro do servidor (5xx) - tentar novamente
      if (response.status >= 500 && response.status < 600) {
        if (attempt < maxRetries) {
          const waitTime = baseDelay * Math.pow(2, attempt);
          console.log(
            `  Server error ${response.status}. Retrying in ${Math.round(waitTime / 1000)}s...`,
          );
          await sleep(waitTime);
          continue;
        }
      }

      // Erro de cliente (4xx) - nao tentar novamente (exceto 429)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `Client error: ${response.status} ${response.statusText}`,
        );
      }

      // Sucesso
      if (response.ok) {
        return response;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      // Erro de rede ou outro erro
      if (attempt < maxRetries) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(
          `  Network error: ${error.message}. Retrying in ${Math.round(waitTime / 1000)}s...`,
        );
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Busca estatisticas do jogador no Chess.com
 */
async function fetchChessStats(username) {
  try {
    const response = await fetchWithRetry(
      `https://api.chess.com/pub/player/${username}/stats`,
    );
    return await response.json();
  } catch (error) {
    console.error(`  Failed to fetch stats: ${error.message}`);
    throw new Error(`Cannot fetch player stats: ${error.message}`);
  }
}

/**
 * Busca arquivos de jogos
 */
async function fetchGameArchives(username) {
  try {
    const response = await fetchWithRetry(
      `https://api.chess.com/pub/player/${username}/games/archives`,
    );
    return await response.json();
  } catch (error) {
    console.error(`  Failed to fetch archives: ${error.message}`);
    return { archives: [] };
  }
}

/**
 * Busca jogos de um mes
 */
async function fetchMonthGames(archiveUrl) {
  try {
    const response = await fetchWithRetry(archiveUrl);
    return await response.json();
  } catch (error) {
    console.error(`  Failed to fetch month games: ${error.message}`);
    return { games: [] };
  }
}

/**
 * Extrai historico de ratings
 */
function extractRatingHistory(games, username, gameType) {
  const history = [];
  const lowerUsername = username.toLowerCase();

  for (const game of games) {
    if (game.time_class !== gameType) continue;

    const date = new Date(game.end_time * 1000);
    const isWhite = game.white.username.toLowerCase() === lowerUsername;
    const player = isWhite ? game.white : game.black;

    if (player.rating) {
      history.push({ date, rating: player.rating });
    }
  }

  return history.sort((a, b) => a.date - b.date);
}

/**
 * Extrai dados das estatisticas
 */
function extractStats(data) {
  if (!data) {
    console.warn("  Warning: No stats data received");
    return {
      rapid: { rating: 0, best: 0, wins: 0, losses: 0, draws: 0 },
      blitz: { rating: 0, best: 0, wins: 0, losses: 0, draws: 0 },
      bullet: { rating: 0, best: 0, wins: 0, losses: 0, draws: 0 },
      daily: { rating: 0, best: 0, wins: 0, losses: 0, draws: 0 },
    };
  }

  const getMode = (mode) => {
    const modeData = data[mode];
    if (!modeData) {
      console.warn(`  Warning: No data for mode ${mode}`);
    }
    return {
      rating: modeData?.last?.rating || 0,
      best: modeData?.best?.rating || 0,
      wins: modeData?.record?.win || 0,
      losses: modeData?.record?.loss || 0,
      draws: modeData?.record?.draw || 0,
    };
  };

  const stats = {
    rapid: getMode("chess_rapid"),
    blitz: getMode("chess_blitz"),
    bullet: getMode("chess_bullet"),
    daily: getMode("chess_daily"),
  };

  // Validar que pelo menos um modo tem dados
  const hasAnyData = Object.values(stats).some(
    (mode) => mode.rating > 0 || mode.best > 0,
  );

  if (!hasAnyData) {
    console.warn("  Warning: No rating data found in any game mode");
  }

  return stats;
}

/**
 * Formata data
 */
function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calcula win rate
 */
function calculateWinRate(wins, losses, draws) {
  const total = wins + losses + draws;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

function catmullRomPath(points) {
  if (points.length < 2) {
    return points.length === 1 ? `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}` : '';
  }
  const d = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
  }
  return d.join(' ');
}

/**
 * Gera o SVG principal com estatisticas
 */
function generateSVG(username, stats, theme) {
  const t = THEMES[theme] || THEMES.dark;

  const modes = [
    { label: 'RAPID',  color: t.rapid,  rating: stats.rapid.rating,  best: stats.rapid.best,  wr: calculateWinRate(stats.rapid.wins,  stats.rapid.losses,  stats.rapid.draws)  },
    { label: 'BLITZ',  color: t.blitz,  rating: stats.blitz.rating,  best: stats.blitz.best,  wr: calculateWinRate(stats.blitz.wins,  stats.blitz.losses,  stats.blitz.draws)  },
    { label: 'BULLET', color: t.bullet, rating: stats.bullet.rating, best: stats.bullet.best, wr: calculateWinRate(stats.bullet.wins, stats.bullet.losses, stats.bullet.draws) },
    { label: 'DAILY',  color: t.daily,  rating: stats.daily.rating,  best: stats.daily.best,  wr: calculateWinRate(stats.daily.wins,  stats.daily.losses,  stats.daily.draws)  },
  ];

  const totalGames = [stats.rapid, stats.blitz, stats.bullet, stats.daily]
    .reduce((s, m) => s + m.wins + m.losses + m.draws, 0);
  const peakRating = Math.max(stats.rapid.best, stats.blitz.best, stats.bullet.best, stats.daily.best);

  const SCALE = 2000;
  const BAR_X = 24;
  const BAR_W = 432;
  const BAR_H = 3;

  const rows = modes.map((m, i) => {
    const y = 88 + i * 52;
    const fw = Math.max(0, Math.min(BAR_W, (m.rating / SCALE) * BAR_W));
    const bw = Math.max(0, Math.min(BAR_W, (m.best / SCALE) * BAR_W));
    return `
  <text x="24" y="${y}" fill="${m.color}" font-size="10" font-weight="500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" letter-spacing="1.5">${m.label}</text>
  <text x="456" y="${y}" fill="${t.text}" font-size="16" font-weight="600" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">${m.rating || '—'}</text>
  <rect x="${BAR_X}" y="${y + 9}" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${t.gridLine}"/>
  ${fw > 0 ? `<rect x="${BAR_X}" y="${y + 9}" width="${fw.toFixed(1)}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${m.color}" opacity="0.85"/>` : ''}
  ${bw > fw ? `<rect x="${(bw - 1).toFixed(1)}" y="${y + 8}" width="2" height="${BAR_H + 2}" rx="1" fill="${t.textMuted}" opacity="0.45"/>` : ''}
  <text x="456" y="${y + 26}" fill="${t.textMuted}" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">${m.wr}% wins</text>`;
  }).join('');

  return `<svg width="480" height="310" viewBox="0 0 480 310" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="310" fill="${t.background}" rx="10"/>
  <rect x="1" y="1" width="478" height="308" fill="none" stroke="${t.cardBorder}" rx="10" stroke-opacity="0.5"/>
  <text x="24" y="36" fill="${t.text}" font-size="15" font-weight="500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${username}</text>
  <text x="456" y="36" fill="${t.accent}" font-size="11" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end" opacity="0.6">chess.com</text>
  <text x="24" y="54" fill="${t.textMuted}" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${formatDate()}</text>
  <line x1="24" y1="64" x2="456" y2="64" stroke="${t.gridLine}" stroke-width="1"/>
  ${rows}
  <line x1="24" y1="284" x2="456" y2="284" stroke="${t.gridLine}" stroke-width="1"/>
  <text x="24" y="302" fill="${t.textMuted}" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${totalGames.toLocaleString()} games</text>
  <text x="456" y="302" fill="${t.textMuted}" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">Peak <tspan fill="${t.accent}" font-weight="600">${peakRating}</tspan></text>
</svg>`;
}

/**
 * Gera grafico de linha com curva suave
 */
function generateLineChart(username, gameType, history, currentRating, theme) {
  const t = THEMES[theme] || THEMES.dark;
  const modeColors = { rapid: t.rapid, blitz: t.blitz, bullet: t.bullet, daily: t.daily };
  const modeNames = { rapid: 'Rapid', blitz: 'Blitz', bullet: 'Bullet', daily: 'Daily' };
  const color = modeColors[gameType] || t.accent;
  const modeName = modeNames[gameType] || gameType;

  if (history.length === 0) return generateNoDataSVG(username, modeName, color, theme);

  const dataPoints = history.slice(-20);
  const ratings = dataPoints.map(d => d.rating);
  const minR = Math.min(...ratings);
  const maxR = Math.max(...ratings);
  const range = maxR - minR || 50;

  const W = 480, H = 200;
  const pad = { top: 48, right: 24, bottom: 28, left: 52 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const yMin = minR - range * 0.15;
  const yMax = maxR + range * 0.15;

  const pts = dataPoints.map((p, i) => ({
    x: pad.left + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * cW : cW / 2),
    y: pad.top + cH - ((p.rating - yMin) / (yMax - yMin)) * cH,
  }));

  const linePath = catmullRomPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${linePath} L ${last.x.toFixed(2)},${(pad.top + cH).toFixed(2)} L ${first.x.toFixed(2)},${(pad.top + cH).toFixed(2)} Z`;

  const change = dataPoints[dataPoints.length - 1].rating - dataPoints[0].rating;
  const changeStr = (change >= 0 ? '+' : '') + change;
  const changeColor = change >= 0 ? t.success : t.blitz;

  const grid = [0, 1 / 3, 2 / 3, 1].map(f => ({
    y: pad.top + cH * f,
    r: Math.round(yMax - (yMax - yMin) * f),
  }));

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="cc"><rect x="${pad.left}" y="${pad.top}" width="${cW}" height="${cH}"/></clipPath>
  </defs>
  <style>@keyframes p{0%,100%{r:4;opacity:.5}50%{r:9;opacity:0}}.pr{animation:p 2.5s ease-in-out infinite}</style>
  <rect width="${W}" height="${H}" fill="${t.background}" rx="10"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${t.cardBorder}" rx="10" stroke-opacity="0.5"/>
  <text x="24" y="22" fill="${t.textSecondary}" font-size="10" font-weight="500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" letter-spacing="1.5">${modeName.toUpperCase()} RATING</text>
  <text x="${W - 24}" y="22" fill="${t.text}" font-size="18" font-weight="600" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">${currentRating}</text>
  <text x="${W - 24}" y="38" fill="${changeColor}" font-size="11" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">${changeStr}</text>
  ${grid.map(l => `
  <line x1="${pad.left}" y1="${l.y.toFixed(1)}" x2="${pad.left + cW}" y2="${l.y.toFixed(1)}" stroke="${t.gridLine}" stroke-width="1" stroke-dasharray="3,6"/>
  <text x="${pad.left - 8}" y="${(l.y + 3.5).toFixed(1)}" fill="${t.textMuted}" font-size="9" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">${l.r}</text>`).join('')}
  <path d="${areaPath}" fill="url(#ag)" clip-path="url(#cc)"/>
  <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#cc)"/>
  <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="4" fill="none" stroke="${color}" stroke-width="1" class="pr"/>
  <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="2.5" fill="${t.background}" stroke="${color}" stroke-width="1.5"/>
  <text x="24" y="${H - 8}" fill="${t.textMuted}" font-size="9" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">@${username}</text>
  <text x="${W - 24}" y="${H - 8}" fill="${t.textMuted}" font-size="9" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="end">last ${dataPoints.length} games</text>
</svg>`;
}

/**
 * Gera SVG quando nao ha dados
 */
function generateNoDataSVG(username, modeName, color, theme) {
  const t = THEMES[theme] || THEMES.dark;
  return `<svg width="480" height="200" viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="200" fill="${t.background}" rx="10"/>
  <rect x="1" y="1" width="478" height="198" fill="none" stroke="${t.cardBorder}" rx="10" stroke-opacity="0.5"/>
  <text x="240" y="88" fill="${t.textMuted}" font-size="10" font-weight="500" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="middle" letter-spacing="1.5">${modeName.toUpperCase()}</text>
  <text x="240" y="110" fill="${t.text}" font-size="14" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="middle">No rating data yet</text>
  <text x="240" y="130" fill="${t.textMuted}" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" text-anchor="middle">Play games to see your history</text>
</svg>`;
}

/**
 * Funcao principal
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Chess.com Stats Generator");
  console.log("=".repeat(60));
  console.log(`User: ${CHESS_USERNAME}`);
  console.log(`Theme: ${THEME_NAME}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log("");

  // Validar username
  if (!CHESS_USERNAME || CHESS_USERNAME.trim() === "") {
    throw new Error(
      "CHESS_USERNAME is required. Set it as an environment variable.",
    );
  }

  // Criar diretorio se nao existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("Creating output directory...");
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Carregar cache como backup
  console.log("Loading cache...");
  const cache = loadCache();
  console.log("");

  let stats;
  let rawStats;
  let allGames = [];
  let usedCache = false;

  // Buscar estatisticas com tratamento de erro robusto
  try {
    console.log("Fetching player stats...");
    rawStats = await fetchChessStats(CHESS_USERNAME);
    stats = extractStats(rawStats);

    console.log("  Current ratings:");
    console.log(
      `    Rapid:  ${stats.rapid.rating} (best: ${stats.rapid.best})`,
    );
    console.log(
      `    Blitz:  ${stats.blitz.rating} (best: ${stats.blitz.best})`,
    );
    console.log(
      `    Bullet: ${stats.bullet.rating} (best: ${stats.bullet.best})`,
    );
    console.log(
      `    Daily:  ${stats.daily.rating} (best: ${stats.daily.best})`,
    );
    console.log("");
  } catch (error) {
    console.error("ERROR: Failed to fetch player stats");
    console.error(`  ${error.message}`);

    // Tentar usar cache como fallback
    if (cache && cache.stats) {
      console.log("  Using cached stats as fallback");
      stats = cache.stats;
      usedCache = true;
      console.log("");
    } else {
      console.error("  No cache available, cannot continue");
      throw error;
    }
  }

  // Buscar historico de jogos
  if (!usedCache) {
    try {
      console.log("Fetching game history...");
      const archives = await fetchGameArchives(CHESS_USERNAME);

      if (!archives.archives || archives.archives.length === 0) {
        console.warn("  Warning: No game archives found");
      } else {
        const recentArchives = archives.archives.slice(-3);
        console.log(
          `  Found ${archives.archives.length} archive months, fetching last 3...`,
        );

        for (const archiveUrl of recentArchives) {
          const monthData = await fetchMonthGames(archiveUrl);
          const gamesInMonth = monthData.games?.length || 0;
          if (gamesInMonth > 0) {
            allGames = allGames.concat(monthData.games);
          }
        }
        console.log(`  Total games loaded: ${allGames.length}`);
      }
      console.log("");
    } catch (error) {
      console.error("ERROR: Failed to fetch game history");
      console.error(`  ${error.message}`);

      if (cache && cache.allGames) {
        console.log("  Using cached game history as fallback");
        allGames = cache.allGames;
      } else {
        console.log(
          "  Continuing without game history (charts will show only current ratings)",
        );
      }
      console.log("");
    }
  } else if (cache && cache.allGames) {
    // Se usamos cache para stats, usar cache para games tambem
    allGames = cache.allGames;
  }

  // Extrair historico de cada modo
  const modes = ["rapid", "blitz", "bullet", "daily"];
  const histories = {};

  console.log("Processing rating history...");
  for (const mode of modes) {
    try {
      histories[mode] = extractRatingHistory(allGames, CHESS_USERNAME, mode);
      console.log(`  ${mode}: ${histories[mode].length} data points`);
    } catch (error) {
      console.error(`  Error processing ${mode} history: ${error.message}`);
      histories[mode] = [];
    }
  }
  console.log("");

  // Salvar cache com os dados atualizados (se nao usamos cache)
  if (!usedCache) {
    console.log("Saving cache...");
    saveCache({ stats, allGames });
    console.log("");
  }

  // Gerar SVGs para TODOS os temas
  const themeNames = Object.keys(THEMES);
  console.log(`Generating SVG files for ${themeNames.length} themes...\n`);

  let generatedCount = 0;
  let errorCount = 0;

  for (const themeName of themeNames) {
    try {
      // SVG principal com tema
      const suffix = themeName === "dark" ? "" : `-${themeName}`;

      const mainSVG = generateSVG(CHESS_USERNAME, stats, themeName);
      fs.writeFileSync(`${OUTPUT_DIR}/chess-stats${suffix}.svg`, mainSVG);
      generatedCount++;

      // Graficos de linha para cada modo
      for (const mode of modes) {
        const svg = generateLineChart(
          CHESS_USERNAME,
          mode,
          histories[mode],
          stats[mode].rating,
          themeName,
        );
        fs.writeFileSync(`${OUTPUT_DIR}/chess-stats-${mode}${suffix}.svg`, svg);
        generatedCount++;
      }

      console.log(`  ✓ ${themeName} theme (5 files)`);
    } catch (error) {
      console.error(`  ✗ ${themeName} theme failed: ${error.message}`);
      errorCount++;
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log(`SUCCESS: Generated ${generatedCount} SVG files`);
  if (errorCount > 0) {
    console.log(`WARNING: ${errorCount} theme(s) failed`);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("");
  console.error("=".repeat(60));
  console.error("FATAL ERROR:");
  console.error(`  ${err.message}`);
  if (err.stack) {
    console.error("");
    console.error("Stack trace:");
    console.error(err.stack);
  }
  console.error("=".repeat(60));
  process.exit(1);
});
