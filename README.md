# chess-readme-status

Chess.com stats for your GitHub profile, auto-updated via Actions — no server required.

<div align="center">
  <img src="./assets/chess-stats.svg" alt="Chess Stats" />
</div>

## Features

- **Free** — uses only GitHub Actions and static SVG files
- **Auto-updates** — runs every 6 hours
- **8 themes** — generated automatically, pick by URL
- **Main card** — horizontal progress bars scaled to 2000, peak rating marker per mode, win rate
- **Line charts** — smooth Catmull-Rom curves, gradient fill, animated pulse on latest game

## Quick Start

### 1. Fork this repository

Click **Fork** at the top of this page.

### 2. Set your username

**Settings** > **Secrets and variables** > **Actions** > **Variables**

| Name | Value |
|---|---|
| `CHESS_USERNAME` | your Chess.com username |

### 3. Run the workflow

**Actions** > **Update Chess.com Stats** > **Run workflow**

### 4. Add to your profile README

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

---

## Themes

All 8 themes generate automatically. Reference by URL suffix.

### Dark (default)

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

<img src="./assets/chess-stats.svg" alt="Dark" />

### Midnight

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-midnight.svg)
```

<img src="./assets/chess-stats-midnight.svg" alt="Midnight" />

### Light

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-light.svg)
```

<img src="./assets/chess-stats-light.svg" alt="Light" />

### Neon

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-neon.svg)
```

<img src="./assets/chess-stats-neon.svg" alt="Neon" />

### Ocean

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-ocean.svg)
```

<img src="./assets/chess-stats-ocean.svg" alt="Ocean" />

### Chess Classic

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-chess.svg)
```

<img src="./assets/chess-stats-chess.svg" alt="Chess Classic" />

### Wood

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-wood.svg)
```

<img src="./assets/chess-stats-wood.svg" alt="Wood" />

### Matrix

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-matrix.svg)
```

<img src="./assets/chess-stats-matrix.svg" alt="Matrix" />

---

## Line Charts

Rating history per game mode, last 20 games, with smooth curves and animated latest point.

### URL pattern

```
chess-stats-{mode}.svg             # dark (default)
chess-stats-{mode}-{theme}.svg     # other themes
```

`{mode}`: `rapid` · `blitz` · `bullet` · `daily`

### Example — two charts side by side

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-rapid-midnight.svg" alt="Rapid" width="45%" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz-midnight.svg" alt="Blitz" width="45%" />
</div>
```

<div align="center">
  <img src="./assets/chess-stats-rapid.svg" alt="Rapid" width="45%" />
  &nbsp;&nbsp;
  <img src="./assets/chess-stats-blitz.svg" alt="Blitz" width="45%" />
</div>

---

## All generated files

| File | Description |
|---|---|
| `chess-stats.svg` | Main card — dark |
| `chess-stats-{theme}.svg` | Main card — other themes |
| `chess-stats-{mode}.svg` | Line chart — dark |
| `chess-stats-{mode}-{theme}.svg` | Line chart — other themes |

**Themes:** `light` · `midnight` · `chess` · `wood` · `neon` · `matrix` · `ocean`

---

## Usage examples

### Centered single card

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg" alt="Chess Stats" />
</div>
```

### Card + chart stacked

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-midnight.svg" alt="Chess Stats" />
  <br/>
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-rapid-midnight.svg" alt="Rapid Rating" />
</div>
```

### Clickable (links to Chess.com profile)

```html
<a href="https://www.chess.com/member/YOUR_CHESS_USERNAME">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg" alt="Chess Stats" />
</a>
```

Replace `YOUR_USERNAME` with your GitHub username and `YOUR_CHESS_USERNAME` with your Chess.com username.

---

## Local development

```bash
git clone https://github.com/your-username/chess_readme_status.git
cd chess_readme_status
npm install
CHESS_USERNAME=your_username npm run generate
```

**Windows:**
```powershell
$env:CHESS_USERNAME="your_username"
npm run generate
```

## License

MIT — see [LICENSE](LICENSE)
