import fs from "node:fs";

/**
 * Chess.com Stats SVG Generator
 * Gera graficos SVG com estatisticas do Chess.com
 * Sistema de temas personalizaveis
 */

const CHESS_USERNAME = process.env.CHESS_USERNAME || "bappozl";
const THEME_NAME = process.env.CHESS_THEME || "dark";
const OUTPUT_DIR = "assets";

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
 * Busca estatisticas do jogador no Chess.com
 */
async function fetchChessStats(username) {
  const response = await fetch(
    `https://api.chess.com/pub/player/${username}/stats`,
    {
      headers: { "User-Agent": "ChessReadmeStats/1.0" },
    }
  );
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

/**
 * Busca arquivos de jogos
 */
async function fetchGameArchives(username) {
  const response = await fetch(
    `https://api.chess.com/pub/player/${username}/games/archives`,
    {
      headers: { "User-Agent": "ChessReadmeStats/1.0" },
    }
  );
  if (!response.ok) return { archives: [] };
  return response.json();
}

/**
 * Busca jogos de um mes
 */
async function fetchMonthGames(archiveUrl) {
  const response = await fetch(archiveUrl, {
    headers: { "User-Agent": "ChessReadmeStats/1.0" },
  });
  if (!response.ok) return { games: [] };
  return response.json();
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
  const getMode = (mode) => ({
    rating: data[mode]?.last?.rating || 0,
    best: data[mode]?.best?.rating || 0,
    wins: data[mode]?.record?.win || 0,
    losses: data[mode]?.record?.loss || 0,
    draws: data[mode]?.record?.draw || 0,
  });

  return {
    rapid: getMode("chess_rapid"),
    blitz: getMode("chess_blitz"),
    bullet: getMode("chess_bullet"),
    daily: getMode("chess_daily"),
  };
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

/**
 * Gera o SVG principal com estatisticas
 */
function generateSVG(username, stats, theme) {
  const t = THEMES[theme] || THEMES.dark;

  const rapidWinRate = calculateWinRate(
    stats.rapid.wins,
    stats.rapid.losses,
    stats.rapid.draws
  );
  const blitzWinRate = calculateWinRate(
    stats.blitz.wins,
    stats.blitz.losses,
    stats.blitz.draws
  );
  const bulletWinRate = calculateWinRate(
    stats.bullet.wins,
    stats.bullet.losses,
    stats.bullet.draws
  );
  const dailyWinRate = calculateWinRate(
    stats.daily.wins,
    stats.daily.losses,
    stats.daily.draws
  );

  const totalGames =
    stats.rapid.wins +
    stats.rapid.losses +
    stats.rapid.draws +
    stats.blitz.wins +
    stats.blitz.losses +
    stats.blitz.draws +
    stats.bullet.wins +
    stats.bullet.losses +
    stats.bullet.draws +
    stats.daily.wins +
    stats.daily.losses +
    stats.daily.draws;

  const maxRating = Math.max(
    stats.rapid.best,
    stats.blitz.best,
    stats.bullet.best,
    stats.daily.best
  );

  return `<svg width="480" height="320" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="320" fill="${t.background}" rx="8"/>
  <rect x="1" y="1" width="478" height="318" fill="none" stroke="${
    t.cardBorder
  }" rx="8"/>

  <!-- Header -->
  <text x="24" y="36" fill="${
    t.text
  }" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">
    ${username}
  </text>
  <text x="24" y="54" fill="${
    t.textSecondary
  }" font-size="12" font-family="Segoe UI, Arial, sans-serif">
    Chess.com Stats
  </text>

  <!-- Rapid -->
  <g transform="translate(24, 76)">
    <rect width="200" height="48" fill="${t.backgroundAlt}" rx="6"/>
    <rect width="4" height="48" fill="${t.rapid}" rx="2"/>
    <text x="16" y="18" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">RAPID</text>
    <text x="16" y="36" fill="${
      t.text
    }" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${
    stats.rapid.rating || "-"
  }</text>
    <text x="188" y="36" fill="${
      t.textMuted
    }" font-size="12" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">${rapidWinRate}%</text>
  </g>

  <!-- Blitz -->
  <g transform="translate(24, 132)">
    <rect width="200" height="48" fill="${t.backgroundAlt}" rx="6"/>
    <rect width="4" height="48" fill="${t.blitz}" rx="2"/>
    <text x="16" y="18" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">BLITZ</text>
    <text x="16" y="36" fill="${
      t.text
    }" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${
    stats.blitz.rating || "-"
  }</text>
    <text x="188" y="36" fill="${
      t.textMuted
    }" font-size="12" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">${blitzWinRate}%</text>
  </g>

  <!-- Bullet -->
  <g transform="translate(24, 188)">
    <rect width="200" height="48" fill="${t.backgroundAlt}" rx="6"/>
    <rect width="4" height="48" fill="${t.bullet}" rx="2"/>
    <text x="16" y="18" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">BULLET</text>
    <text x="16" y="36" fill="${
      t.text
    }" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${
    stats.bullet.rating || "-"
  }</text>
    <text x="188" y="36" fill="${
      t.textMuted
    }" font-size="12" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">${bulletWinRate}%</text>
  </g>

  <!-- Daily -->
  <g transform="translate(24, 244)">
    <rect width="200" height="48" fill="${t.backgroundAlt}" rx="6"/>
    <rect width="4" height="48" fill="${t.daily}" rx="2"/>
    <text x="16" y="18" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">DAILY</text>
    <text x="16" y="36" fill="${
      t.text
    }" font-size="18" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${
    stats.daily.rating || "-"
  }</text>
    <text x="188" y="36" fill="${
      t.textMuted
    }" font-size="12" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">${dailyWinRate}%</text>
  </g>

  <!-- Stats Panel -->
  <g transform="translate(248, 76)">
    <rect width="208" height="216" fill="${t.backgroundAlt}" rx="6"/>
    
    <text x="16" y="24" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">TOTAL GAMES</text>
    <text x="16" y="48" fill="${
      t.text
    }" font-size="24" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${totalGames.toLocaleString()}</text>
    
    <line x1="16" y1="64" x2="192" y2="64" stroke="${t.cardBorder}"/>
    
    <text x="16" y="88" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">PEAK RATING</text>
    <text x="16" y="112" fill="${
      t.accent
    }" font-size="24" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${maxRating}</text>
    
    <line x1="16" y1="128" x2="192" y2="128" stroke="${t.cardBorder}"/>
    
    <text x="16" y="152" fill="${
      t.textSecondary
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">BEST RATINGS</text>
    <text x="16" y="172" fill="${
      t.textMuted
    }" font-size="11" font-family="Segoe UI, Arial, sans-serif">
      <tspan fill="${t.rapid}">R</tspan> ${stats.rapid.best}
      <tspan fill="${t.blitz}">B</tspan> ${stats.blitz.best}
      <tspan fill="${t.bullet}">Bu</tspan> ${stats.bullet.best}
    </text>
    
    <text x="16" y="200" fill="${
      t.textMuted
    }" font-size="10" font-family="Segoe UI, Arial, sans-serif">
      Updated ${formatDate()}
    </text>
  </g>
</svg>`;
}

/**
 * Gera grafico de linha
 */
function generateLineChart(username, gameType, history, currentRating, theme) {
  const t = THEMES[theme] || THEMES.dark;
  const modeColors = {
    rapid: t.rapid,
    blitz: t.blitz,
    bullet: t.bullet,
    daily: t.daily,
  };
  const modeNames = {
    rapid: "Rapid",
    blitz: "Blitz",
    bullet: "Bullet",
    daily: "Daily",
  };

  const color = modeColors[gameType] || t.accent;
  const modeName = modeNames[gameType] || gameType;

  if (history.length === 0) {
    return generateNoDataSVG(username, modeName, color, theme);
  }

  // Ultimos 15 jogos para manter grafico focado em performance recente
  const dataPoints = history.slice(-15);
  const ratings = dataPoints.map((d) => d.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const range = maxRating - minRating || 100;
  const yMin = Math.max(0, minRating - range * 0.1);
  const yMax = maxRating + range * 0.1;

  const width = 480;
  const height = 240;
  const padding = { top: 48, right: 24, bottom: 40, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = dataPoints
    .map((p, i) => {
      const x = padding.left + (i / (dataPoints.length - 1 || 1)) * chartW;
      const y =
        padding.top + chartH - ((p.rating - yMin) / (yMax - yMin)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding.left},${padding.top + chartH} ${points} ${
    padding.left + chartW
  },${padding.top + chartH}`;

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (chartH / 4) * i;
    const rating = Math.round(yMax - ((yMax - yMin) / 4) * i);
    return { y, rating };
  });

  const change =
    dataPoints[dataPoints.length - 1].rating - dataPoints[0].rating;
  const changeSign = change >= 0 ? "+" : "";

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${t.background}" rx="8"/>
  <rect x="1" y="1" width="${width - 2}" height="${
    height - 2
  }" fill="none" stroke="${t.cardBorder}" rx="8"/>

  <!-- Header -->
  <text x="24" y="28" fill="${
    t.text
  }" font-size="14" font-weight="600" font-family="Segoe UI, Arial, sans-serif">
    ${modeName} Rating
  </text>
  <text x="${
    width - 24
  }" y="28" fill="${color}" font-size="14" font-weight="600" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">
    ${currentRating} (${changeSign}${change})
  </text>

  <!-- Grid -->
  ${gridLines
    .map(
      (l) => `
  <line x1="${padding.left}" y1="${l.y}" x2="${padding.left + chartW}" y2="${
        l.y
      }" stroke="${t.gridLine}" stroke-width="1"/>
  <text x="${padding.left - 8}" y="${l.y + 4}" fill="${
        t.textMuted
      }" font-size="10" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">${
        l.rating
      }</text>
  `
    )
    .join("")}

  <!-- Area -->
  <polygon points="${areaPoints}" fill="${color}" opacity="0.15"/>

  <!-- Line -->
  <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Points -->
  ${dataPoints
    .map((p, i) => {
      const x = padding.left + (i / (dataPoints.length - 1 || 1)) * chartW;
      const y =
        padding.top + chartH - ((p.rating - yMin) / (yMax - yMin)) * chartH;
      return `<circle cx="${x}" cy="${y}" r="3" fill="${t.background}" stroke="${color}" stroke-width="2"/>`;
    })
    .join("\n  ")}

  <!-- Footer -->
  <text x="24" y="${height - 12}" fill="${
    t.textMuted
  }" font-size="10" font-family="Segoe UI, Arial, sans-serif">
    @${username}
  </text>
  <text x="${width - 24}" y="${height - 12}" fill="${
    t.textMuted
  }" font-size="10" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">
    Last ${dataPoints.length} games
  </text>
</svg>`;
}

/**
 * Gera SVG quando nao ha dados
 */
function generateNoDataSVG(username, modeName, color, theme) {
  const t = THEMES[theme] || THEMES.dark;

  return `<svg width="480" height="240" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="240" fill="${t.background}" rx="8"/>
  <rect x="1" y="1" width="478" height="238" fill="none" stroke="${t.cardBorder}" rx="8"/>

  <text x="240" y="100" fill="${t.text}" font-size="16" font-weight="600" font-family="Segoe UI, Arial, sans-serif" text-anchor="middle">
    No ${modeName} Data
  </text>
  <text x="240" y="124" fill="${t.textSecondary}" font-size="12" font-family="Segoe UI, Arial, sans-serif" text-anchor="middle">
    @${username} has not played ${modeName} games yet
  </text>
  <text x="240" y="148" fill="${t.textMuted}" font-size="11" font-family="Segoe UI, Arial, sans-serif" text-anchor="middle">
    Play some games to see your rating history
  </text>
</svg>`;
}

/**
 * Funcao principal
 */
async function main() {
  console.log("Chess.com Stats Generator\n");
  console.log(`User: ${CHESS_USERNAME}`);
  console.log("");

  // Criar diretorio se nao existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Buscar estatisticas
  console.log("Fetching stats...");
  const rawStats = await fetchChessStats(CHESS_USERNAME);
  const stats = extractStats(rawStats);

  console.log(`  Rapid:  ${stats.rapid.rating}`);
  console.log(`  Blitz:  ${stats.blitz.rating}`);
  console.log(`  Bullet: ${stats.bullet.rating}`);
  console.log(`  Daily:  ${stats.daily.rating}`);
  console.log("");

  // Buscar historico de jogos
  console.log("Fetching game history...");
  const archives = await fetchGameArchives(CHESS_USERNAME);
  const recentArchives = archives.archives?.slice(-3) || [];

  let allGames = [];
  for (const archiveUrl of recentArchives) {
    const monthData = await fetchMonthGames(archiveUrl);
    allGames = allGames.concat(monthData.games || []);
  }
  console.log(`  Found ${allGames.length} games\n`);

  // Extrair historico de cada modo uma vez
  const modes = ["rapid", "blitz", "bullet", "daily"];
  const histories = {};
  for (const mode of modes) {
    histories[mode] = extractRatingHistory(allGames, CHESS_USERNAME, mode);
  }

  // Gerar SVGs para TODOS os temas
  const themeNames = Object.keys(THEMES);
  console.log(`Generating ${themeNames.length} themes...\n`);

  for (const themeName of themeNames) {
    // SVG principal com tema
    const suffix = themeName === "dark" ? "" : `-${themeName}`;

    const mainSVG = generateSVG(CHESS_USERNAME, stats, themeName);
    fs.writeFileSync(`${OUTPUT_DIR}/chess-stats${suffix}.svg`, mainSVG);

    // Graficos de linha para cada modo
    for (const mode of modes) {
      const svg = generateLineChart(
        CHESS_USERNAME,
        mode,
        histories[mode],
        stats[mode].rating,
        themeName
      );
      fs.writeFileSync(`${OUTPUT_DIR}/chess-stats-${mode}${suffix}.svg`, svg);
    }

    console.log(`  Generated: ${themeName} theme (5 files)`);
  }

  console.log(`\nDone! Generated ${themeNames.length * 5} SVG files.`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
