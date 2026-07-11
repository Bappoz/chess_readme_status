# chess-readme-status

Chess.com stats for your GitHub profile, auto-updated via Actions — no server required.

<div align="center">
  <img src="./assets/chess-stats.svg" alt="Chess Stats" />
</div>

## Features

- **Free** — GitHub Actions + static SVG, no server
- **Auto-updates** — runs every 6 hours
- **8 styles** — premium, editorial, wood, tech, glass, piece, light, light-editorial
- **3 card types** — summary (all 4 modes), line chart, hero card
- **72 SVGs** — all styles × all card types generated automatically

## Quick Start

### 1. Fork this repository

### 2. Set your username

**Settings → Secrets and variables → Actions → Variables**

| Name | Value |
|---|---|
| `CHESS_USERNAME` | your Chess.com username |

### 3. Run the workflow

**Actions → Update Chess.com Stats → Run workflow**

### 4. Add to your README

```markdown
![Chess Stats](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

---

## URL pattern

```
chess-stats.svg                          # summary, premium dark (default)
chess-stats-{style}.svg                  # summary, other style
chess-stats-{mode}.svg                   # line chart, premium dark
chess-stats-{mode}-{style}.svg           # line chart, other style
chess-stats-{mode}-hero.svg              # hero card, premium dark
chess-stats-{mode}-hero-{style}.svg      # hero card, other style
```

**`{mode}`**: `blitz` · `rapid` · `bullet` · `daily`

**`{style}`**: `editorial` · `wood` · `tech` · `glass` · `piece` · `light` · `light-editorial`

_(omit style for the default `premium` dark)_

---

## Styles

### Premium (default) — `#8ac054`

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

<img src="./assets/chess-stats.svg" alt="Premium summary" />

### Editorial — `#d8a24a`

<img src="./assets/chess-stats-editorial.svg" alt="Editorial summary" />

### Tech/Data — `#48d1ae`

<img src="./assets/chess-stats-tech.svg" alt="Tech summary" />

### Glass Depth — `#8098ff`

<img src="./assets/chess-stats-glass.svg" alt="Glass summary" />

### Classic Wood — `#e7bd6b`

<img src="./assets/chess-stats-wood.svg" alt="Wood summary" />

### Piece Hero — `#9bd35e`

<img src="./assets/chess-stats-piece.svg" alt="Piece summary" />

### Light — `#5f8f37`

<img src="./assets/chess-stats-light.svg" alt="Light summary" />

### Light Editorial — `#a9762a`

<img src="./assets/chess-stats-light-editorial.svg" alt="Light editorial summary" />

---

## Card types

### Summary (840×200) — all 4 modes in one strip

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

### Line chart (470×210) — rating history per mode

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz.svg)
```

<div align="center">
  <img src="./assets/chess-stats-blitz.svg" alt="Blitz line" width="45%" />
  &nbsp;&nbsp;
  <img src="./assets/chess-stats-rapid.svg" alt="Rapid line" width="45%" />
</div>

### Hero card (340×210) — single mode with piece

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz-hero.svg)
```

<div align="center">
  <img src="./assets/chess-stats-blitz-hero.svg" alt="Blitz hero" />
  &nbsp;
  <img src="./assets/chess-stats-rapid-hero.svg" alt="Rapid hero" />
  &nbsp;
  <img src="./assets/chess-stats-bullet-hero.svg" alt="Bullet hero" />
</div>

---

## Usage examples

### Summary + two line charts

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg" alt="Chess Stats" />
  <br/>
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz.svg" alt="Blitz" width="45%" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-rapid.svg" alt="Rapid" width="45%" />
</div>
```

### Hero cards side by side (glass style)

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz-hero-glass.svg" />
  &nbsp;
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-rapid-hero-glass.svg" />
</div>
```

### Clickable card

```html
<a href="https://www.chess.com/member/YOUR_CHESS_USERNAME">
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg" />
</a>
```

---

## Updates

Stats are fetched from the Chess.com public API and regenerated **every 6 hours** via GitHub Actions (`cron: "0 */6 * * *"`). You can also trigger manually via **Actions → Run workflow**.

---

## Local development

```bash
git clone https://github.com/your-username/chess_readme_status.git
cd chess_readme_status
npm install
CHESS_USERNAME=your_username /usr/bin/node scripts/generate-svg.js
```

---

## License

MIT — see [LICENSE](LICENSE)
