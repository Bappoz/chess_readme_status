# chess-readme-status

Chess.com stats for your GitHub profile, auto-updated via Actions — no server required.

## Features

- **Free** — GitHub Actions + static SVG, no server
- **Auto-updates** — runs every 6 hours
- **15 styles** — premium, editorial, wood, tech, glass, piece, light, light-editorial, chess, matrix, midnight, neon, ocean, github, github-light
- **13 card types** — summary, line chart, hero card, plus README formats: activity calendar, git log, ticker, chessfetch, code card, last game board, white vs black, openings, medallions, bare type
- **330 SVGs** — all styles × all card types generated automatically

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
chess-medal-{mode}.svg                   # medallion (add -{style} for other styles)
chess-{card}.svg                         # README formats, premium dark
chess-{card}-{style}.svg                 # README formats, other style
```

**`{card}`**: `activity` · `gitlog` · `ticker` · `fetch` · `code` · `last-game` · `colors` · `openings` · `bare`

**`{mode}`**: `blitz` · `rapid` · `bullet` · `daily`

**`{style}`**: `editorial` · `wood` · `tech` · `glass` · `piece` · `light` · `light-editorial` · `chess` · `matrix` · `midnight` · `neon` · `ocean` · `github` · `github-light`

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

### Activity (840×226) — games per day, contribution-graph style

Last 13 weeks, with best streak, busiest day and active days.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-activity.svg)
```

<div align="center">
  <img src="./assets/chess-activity-github.svg" alt="Activity (840×226) — games per day, contribution-graph style" />
</div>

### Git log (600×248) — latest games as commits

Filled node = win, hollow = loss; the diff on the right is the rating change.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-gitlog.svg)
```

<div align="center">
  <img src="./assets/chess-gitlog-github.svg" alt="Git log (600×248) — latest games as commits" />
</div>

### Ticker (840×52) — one-line strip

Rapid, blitz and bullet with trend and sparkline.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-ticker.svg)
```

<div align="center">
  <img src="./assets/chess-ticker-github.svg" alt="Ticker (840×52) — one-line strip" />
</div>

### chessfetch (600×266) — neofetch for chess

Ratings, record, win rate and recent form in a terminal window.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-fetch.svg)
```

<div align="center">
  <img src="./assets/chess-fetch-github.svg" alt="chessfetch (600×266) — neofetch for chess" />
</div>

### Code card (450×252) — stats as a TypeScript object

Uses GitHub's own syntax colours in the `github` styles and the style accent elsewhere.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-code.svg)
```

<div align="center">
  <img src="./assets/chess-code-github.svg" alt="Code card (450×252) — stats as a TypeScript object" />
</div>

### Last game (540×236) — final position on the board

Seen from your side of the board, with the result as the headline.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-last-game.svg)
```

<div align="center">
  <img src="./assets/chess-last-game-github.svg" alt="Last game (540×236) — final position on the board" />
</div>

### White vs Black (540×220) — win rate by colour

The halves stay light and dark in every style.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-colors.svg)
```

<div align="center">
  <img src="./assets/chess-colors-github.svg" alt="White vs Black (540×220) — win rate by colour" />
</div>

### Openings (540×268) — most played opening families

Bar length = games played; the split is win / draw / loss.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-openings.svg)
```

<div align="center">
  <img src="./assets/chess-openings-github.svg" alt="Openings (540×268) — most played opening families" />
</div>

### Medallion (200×214) — one tile per mode

Win / draw / loss ring around the rating. One file per `{mode}`.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-medal-rapid.svg)
```

<div align="center">
  <img src="./assets/chess-medal-rapid-github.svg" alt="Medallion (200×214) — one tile per mode" />
  &nbsp;
  <img src="./assets/chess-medal-blitz-github.svg" alt="Blitz medallion" />
  &nbsp;
  <img src="./assets/chess-medal-bullet-github.svg" alt="Bullet medallion" />
</div>

### Bare (840×118) — type only, no frame

No background: ink follows the reader's light/dark setting via `prefers-color-scheme`; the style only sets accent and font.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-bare.svg)
```

<div align="center">
  <img src="./assets/chess-bare-github.svg" alt="Bare (840×118) — type only, no frame" />
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
