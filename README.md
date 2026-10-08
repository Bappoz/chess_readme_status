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

### Light — `#4a7c2a`

<img src="./assets/chess-stats-light.svg" alt="Light summary" />

### Light Editorial — `#9a6a1e`

<img src="./assets/chess-stats-light-editorial.svg" alt="Light editorial summary" />

### Chess — `#7fa650`

<img src="./assets/chess-stats-chess.svg" alt="Chess summary" />

### Matrix — `#35d67a`

<img src="./assets/chess-stats-matrix.svg" alt="Matrix summary" />

### Midnight — `#6d8dff`

<img src="./assets/chess-stats-midnight.svg" alt="Midnight summary" />

### Neon — `#c85cf0`

<img src="./assets/chess-stats-neon.svg" alt="Neon summary" />

### Ocean — `#38b6d6`

<img src="./assets/chess-stats-ocean.svg" alt="Ocean summary" />

### GitHub — `#81b64c`

<img src="./assets/chess-stats-github.svg" alt="GitHub summary" />

### GitHub Light — `#3d7a1c`

<img src="./assets/chess-stats-github-light.svg" alt="GitHub Light summary" />

---

## Card types

### Summary (840×200) — all 4 modes in one strip

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats.svg)
```

<details>
<summary>Summary in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-stats.svg" alt="Summary, premium" />

**`editorial`**

<img src="./assets/chess-stats-editorial.svg" alt="Summary, editorial" />

**`wood`**

<img src="./assets/chess-stats-wood.svg" alt="Summary, wood" />

**`tech`**

<img src="./assets/chess-stats-tech.svg" alt="Summary, tech" />

**`glass`**

<img src="./assets/chess-stats-glass.svg" alt="Summary, glass" />

**`piece`**

<img src="./assets/chess-stats-piece.svg" alt="Summary, piece" />

**`light`**

<img src="./assets/chess-stats-light.svg" alt="Summary, light" />

**`light-editorial`**

<img src="./assets/chess-stats-light-editorial.svg" alt="Summary, light-editorial" />

**`chess`**

<img src="./assets/chess-stats-chess.svg" alt="Summary, chess" />

**`matrix`**

<img src="./assets/chess-stats-matrix.svg" alt="Summary, matrix" />

**`midnight`**

<img src="./assets/chess-stats-midnight.svg" alt="Summary, midnight" />

**`neon`**

<img src="./assets/chess-stats-neon.svg" alt="Summary, neon" />

**`ocean`**

<img src="./assets/chess-stats-ocean.svg" alt="Summary, ocean" />

**`github`**

<img src="./assets/chess-stats-github.svg" alt="Summary, github" />

**`github-light`**

<img src="./assets/chess-stats-github-light.svg" alt="Summary, github-light" />

</details>

### Line chart (470×210) — rating history per mode

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-stats-blitz.svg)
```

<div align="center">
  <img src="./assets/chess-stats-blitz.svg" alt="Blitz line" width="45%" />
  &nbsp;&nbsp;
  <img src="./assets/chess-stats-rapid.svg" alt="Rapid line" width="45%" />
</div>

<details>
<summary>Line chart in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-stats-blitz.svg" alt="Line chart, premium" />

**`editorial`**

<img src="./assets/chess-stats-blitz-editorial.svg" alt="Line chart, editorial" />

**`wood`**

<img src="./assets/chess-stats-blitz-wood.svg" alt="Line chart, wood" />

**`tech`**

<img src="./assets/chess-stats-blitz-tech.svg" alt="Line chart, tech" />

**`glass`**

<img src="./assets/chess-stats-blitz-glass.svg" alt="Line chart, glass" />

**`piece`**

<img src="./assets/chess-stats-blitz-piece.svg" alt="Line chart, piece" />

**`light`**

<img src="./assets/chess-stats-blitz-light.svg" alt="Line chart, light" />

**`light-editorial`**

<img src="./assets/chess-stats-blitz-light-editorial.svg" alt="Line chart, light-editorial" />

**`chess`**

<img src="./assets/chess-stats-blitz-chess.svg" alt="Line chart, chess" />

**`matrix`**

<img src="./assets/chess-stats-blitz-matrix.svg" alt="Line chart, matrix" />

**`midnight`**

<img src="./assets/chess-stats-blitz-midnight.svg" alt="Line chart, midnight" />

**`neon`**

<img src="./assets/chess-stats-blitz-neon.svg" alt="Line chart, neon" />

**`ocean`**

<img src="./assets/chess-stats-blitz-ocean.svg" alt="Line chart, ocean" />

**`github`**

<img src="./assets/chess-stats-blitz-github.svg" alt="Line chart, github" />

**`github-light`**

<img src="./assets/chess-stats-blitz-github-light.svg" alt="Line chart, github-light" />

</details>

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

<details>
<summary>Hero card in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-stats-blitz-hero.svg" alt="Hero card, premium" />

**`editorial`**

<img src="./assets/chess-stats-blitz-hero-editorial.svg" alt="Hero card, editorial" />

**`wood`**

<img src="./assets/chess-stats-blitz-hero-wood.svg" alt="Hero card, wood" />

**`tech`**

<img src="./assets/chess-stats-blitz-hero-tech.svg" alt="Hero card, tech" />

**`glass`**

<img src="./assets/chess-stats-blitz-hero-glass.svg" alt="Hero card, glass" />

**`piece`**

<img src="./assets/chess-stats-blitz-hero-piece.svg" alt="Hero card, piece" />

**`light`**

<img src="./assets/chess-stats-blitz-hero-light.svg" alt="Hero card, light" />

**`light-editorial`**

<img src="./assets/chess-stats-blitz-hero-light-editorial.svg" alt="Hero card, light-editorial" />

**`chess`**

<img src="./assets/chess-stats-blitz-hero-chess.svg" alt="Hero card, chess" />

**`matrix`**

<img src="./assets/chess-stats-blitz-hero-matrix.svg" alt="Hero card, matrix" />

**`midnight`**

<img src="./assets/chess-stats-blitz-hero-midnight.svg" alt="Hero card, midnight" />

**`neon`**

<img src="./assets/chess-stats-blitz-hero-neon.svg" alt="Hero card, neon" />

**`ocean`**

<img src="./assets/chess-stats-blitz-hero-ocean.svg" alt="Hero card, ocean" />

**`github`**

<img src="./assets/chess-stats-blitz-hero-github.svg" alt="Hero card, github" />

**`github-light`**

<img src="./assets/chess-stats-blitz-hero-github-light.svg" alt="Hero card, github-light" />

</details>

### Activity (840×226) — games per day, contribution-graph style

Last 13 weeks, with best streak, busiest day and active days.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-activity.svg)
```

<div align="center">
  <img src="./assets/chess-activity-github.svg" alt="Activity (840×226) — games per day, contribution-graph style" />
</div>

<details>
<summary>Activity in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-activity.svg" alt="Activity, premium" />

**`editorial`**

<img src="./assets/chess-activity-editorial.svg" alt="Activity, editorial" />

**`wood`**

<img src="./assets/chess-activity-wood.svg" alt="Activity, wood" />

**`tech`**

<img src="./assets/chess-activity-tech.svg" alt="Activity, tech" />

**`glass`**

<img src="./assets/chess-activity-glass.svg" alt="Activity, glass" />

**`piece`**

<img src="./assets/chess-activity-piece.svg" alt="Activity, piece" />

**`light`**

<img src="./assets/chess-activity-light.svg" alt="Activity, light" />

**`light-editorial`**

<img src="./assets/chess-activity-light-editorial.svg" alt="Activity, light-editorial" />

**`chess`**

<img src="./assets/chess-activity-chess.svg" alt="Activity, chess" />

**`matrix`**

<img src="./assets/chess-activity-matrix.svg" alt="Activity, matrix" />

**`midnight`**

<img src="./assets/chess-activity-midnight.svg" alt="Activity, midnight" />

**`neon`**

<img src="./assets/chess-activity-neon.svg" alt="Activity, neon" />

**`ocean`**

<img src="./assets/chess-activity-ocean.svg" alt="Activity, ocean" />

**`github`**

<img src="./assets/chess-activity-github.svg" alt="Activity, github" />

**`github-light`**

<img src="./assets/chess-activity-github-light.svg" alt="Activity, github-light" />

</details>

### Git log (600×248) — latest games as commits

Filled node = win, hollow = loss; the diff on the right is the rating change.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-gitlog.svg)
```

<div align="center">
  <img src="./assets/chess-gitlog-github.svg" alt="Git log (600×248) — latest games as commits" />
</div>

<details>
<summary>Git log in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-gitlog.svg" alt="Git log, premium" />

**`editorial`**

<img src="./assets/chess-gitlog-editorial.svg" alt="Git log, editorial" />

**`wood`**

<img src="./assets/chess-gitlog-wood.svg" alt="Git log, wood" />

**`tech`**

<img src="./assets/chess-gitlog-tech.svg" alt="Git log, tech" />

**`glass`**

<img src="./assets/chess-gitlog-glass.svg" alt="Git log, glass" />

**`piece`**

<img src="./assets/chess-gitlog-piece.svg" alt="Git log, piece" />

**`light`**

<img src="./assets/chess-gitlog-light.svg" alt="Git log, light" />

**`light-editorial`**

<img src="./assets/chess-gitlog-light-editorial.svg" alt="Git log, light-editorial" />

**`chess`**

<img src="./assets/chess-gitlog-chess.svg" alt="Git log, chess" />

**`matrix`**

<img src="./assets/chess-gitlog-matrix.svg" alt="Git log, matrix" />

**`midnight`**

<img src="./assets/chess-gitlog-midnight.svg" alt="Git log, midnight" />

**`neon`**

<img src="./assets/chess-gitlog-neon.svg" alt="Git log, neon" />

**`ocean`**

<img src="./assets/chess-gitlog-ocean.svg" alt="Git log, ocean" />

**`github`**

<img src="./assets/chess-gitlog-github.svg" alt="Git log, github" />

**`github-light`**

<img src="./assets/chess-gitlog-github-light.svg" alt="Git log, github-light" />

</details>

### Ticker (840×52) — one-line strip

Rapid, blitz and bullet with trend and sparkline.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-ticker.svg)
```

<div align="center">
  <img src="./assets/chess-ticker-github.svg" alt="Ticker (840×52) — one-line strip" />
</div>

<details>
<summary>Ticker in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-ticker.svg" alt="Ticker, premium" />

**`editorial`**

<img src="./assets/chess-ticker-editorial.svg" alt="Ticker, editorial" />

**`wood`**

<img src="./assets/chess-ticker-wood.svg" alt="Ticker, wood" />

**`tech`**

<img src="./assets/chess-ticker-tech.svg" alt="Ticker, tech" />

**`glass`**

<img src="./assets/chess-ticker-glass.svg" alt="Ticker, glass" />

**`piece`**

<img src="./assets/chess-ticker-piece.svg" alt="Ticker, piece" />

**`light`**

<img src="./assets/chess-ticker-light.svg" alt="Ticker, light" />

**`light-editorial`**

<img src="./assets/chess-ticker-light-editorial.svg" alt="Ticker, light-editorial" />

**`chess`**

<img src="./assets/chess-ticker-chess.svg" alt="Ticker, chess" />

**`matrix`**

<img src="./assets/chess-ticker-matrix.svg" alt="Ticker, matrix" />

**`midnight`**

<img src="./assets/chess-ticker-midnight.svg" alt="Ticker, midnight" />

**`neon`**

<img src="./assets/chess-ticker-neon.svg" alt="Ticker, neon" />

**`ocean`**

<img src="./assets/chess-ticker-ocean.svg" alt="Ticker, ocean" />

**`github`**

<img src="./assets/chess-ticker-github.svg" alt="Ticker, github" />

**`github-light`**

<img src="./assets/chess-ticker-github-light.svg" alt="Ticker, github-light" />

</details>

### chessfetch (600×266) — neofetch for chess

Ratings, record, win rate and recent form in a terminal window.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-fetch.svg)
```

<div align="center">
  <img src="./assets/chess-fetch-github.svg" alt="chessfetch (600×266) — neofetch for chess" />
</div>

<details>
<summary>chessfetch in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-fetch.svg" alt="chessfetch, premium" />

**`editorial`**

<img src="./assets/chess-fetch-editorial.svg" alt="chessfetch, editorial" />

**`wood`**

<img src="./assets/chess-fetch-wood.svg" alt="chessfetch, wood" />

**`tech`**

<img src="./assets/chess-fetch-tech.svg" alt="chessfetch, tech" />

**`glass`**

<img src="./assets/chess-fetch-glass.svg" alt="chessfetch, glass" />

**`piece`**

<img src="./assets/chess-fetch-piece.svg" alt="chessfetch, piece" />

**`light`**

<img src="./assets/chess-fetch-light.svg" alt="chessfetch, light" />

**`light-editorial`**

<img src="./assets/chess-fetch-light-editorial.svg" alt="chessfetch, light-editorial" />

**`chess`**

<img src="./assets/chess-fetch-chess.svg" alt="chessfetch, chess" />

**`matrix`**

<img src="./assets/chess-fetch-matrix.svg" alt="chessfetch, matrix" />

**`midnight`**

<img src="./assets/chess-fetch-midnight.svg" alt="chessfetch, midnight" />

**`neon`**

<img src="./assets/chess-fetch-neon.svg" alt="chessfetch, neon" />

**`ocean`**

<img src="./assets/chess-fetch-ocean.svg" alt="chessfetch, ocean" />

**`github`**

<img src="./assets/chess-fetch-github.svg" alt="chessfetch, github" />

**`github-light`**

<img src="./assets/chess-fetch-github-light.svg" alt="chessfetch, github-light" />

</details>

### Code card (450×252) — stats as a TypeScript object

Uses GitHub's own syntax colours in the `github` styles and the style accent elsewhere.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-code.svg)
```

<div align="center">
  <img src="./assets/chess-code-github.svg" alt="Code card (450×252) — stats as a TypeScript object" />
</div>

<details>
<summary>Code card in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-code.svg" alt="Code card, premium" />

**`editorial`**

<img src="./assets/chess-code-editorial.svg" alt="Code card, editorial" />

**`wood`**

<img src="./assets/chess-code-wood.svg" alt="Code card, wood" />

**`tech`**

<img src="./assets/chess-code-tech.svg" alt="Code card, tech" />

**`glass`**

<img src="./assets/chess-code-glass.svg" alt="Code card, glass" />

**`piece`**

<img src="./assets/chess-code-piece.svg" alt="Code card, piece" />

**`light`**

<img src="./assets/chess-code-light.svg" alt="Code card, light" />

**`light-editorial`**

<img src="./assets/chess-code-light-editorial.svg" alt="Code card, light-editorial" />

**`chess`**

<img src="./assets/chess-code-chess.svg" alt="Code card, chess" />

**`matrix`**

<img src="./assets/chess-code-matrix.svg" alt="Code card, matrix" />

**`midnight`**

<img src="./assets/chess-code-midnight.svg" alt="Code card, midnight" />

**`neon`**

<img src="./assets/chess-code-neon.svg" alt="Code card, neon" />

**`ocean`**

<img src="./assets/chess-code-ocean.svg" alt="Code card, ocean" />

**`github`**

<img src="./assets/chess-code-github.svg" alt="Code card, github" />

**`github-light`**

<img src="./assets/chess-code-github-light.svg" alt="Code card, github-light" />

</details>

### Last game (540×236) — final position on the board

Seen from your side of the board, with the result as the headline.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-last-game.svg)
```

<div align="center">
  <img src="./assets/chess-last-game-github.svg" alt="Last game (540×236) — final position on the board" />
</div>

<details>
<summary>Last game in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-last-game.svg" alt="Last game, premium" />

**`editorial`**

<img src="./assets/chess-last-game-editorial.svg" alt="Last game, editorial" />

**`wood`**

<img src="./assets/chess-last-game-wood.svg" alt="Last game, wood" />

**`tech`**

<img src="./assets/chess-last-game-tech.svg" alt="Last game, tech" />

**`glass`**

<img src="./assets/chess-last-game-glass.svg" alt="Last game, glass" />

**`piece`**

<img src="./assets/chess-last-game-piece.svg" alt="Last game, piece" />

**`light`**

<img src="./assets/chess-last-game-light.svg" alt="Last game, light" />

**`light-editorial`**

<img src="./assets/chess-last-game-light-editorial.svg" alt="Last game, light-editorial" />

**`chess`**

<img src="./assets/chess-last-game-chess.svg" alt="Last game, chess" />

**`matrix`**

<img src="./assets/chess-last-game-matrix.svg" alt="Last game, matrix" />

**`midnight`**

<img src="./assets/chess-last-game-midnight.svg" alt="Last game, midnight" />

**`neon`**

<img src="./assets/chess-last-game-neon.svg" alt="Last game, neon" />

**`ocean`**

<img src="./assets/chess-last-game-ocean.svg" alt="Last game, ocean" />

**`github`**

<img src="./assets/chess-last-game-github.svg" alt="Last game, github" />

**`github-light`**

<img src="./assets/chess-last-game-github-light.svg" alt="Last game, github-light" />

</details>

### White vs Black (540×220) — win rate by colour

The halves stay light and dark in every style.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-colors.svg)
```

<div align="center">
  <img src="./assets/chess-colors-github.svg" alt="White vs Black (540×220) — win rate by colour" />
</div>

<details>
<summary>White vs Black in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-colors.svg" alt="White vs Black, premium" />

**`editorial`**

<img src="./assets/chess-colors-editorial.svg" alt="White vs Black, editorial" />

**`wood`**

<img src="./assets/chess-colors-wood.svg" alt="White vs Black, wood" />

**`tech`**

<img src="./assets/chess-colors-tech.svg" alt="White vs Black, tech" />

**`glass`**

<img src="./assets/chess-colors-glass.svg" alt="White vs Black, glass" />

**`piece`**

<img src="./assets/chess-colors-piece.svg" alt="White vs Black, piece" />

**`light`**

<img src="./assets/chess-colors-light.svg" alt="White vs Black, light" />

**`light-editorial`**

<img src="./assets/chess-colors-light-editorial.svg" alt="White vs Black, light-editorial" />

**`chess`**

<img src="./assets/chess-colors-chess.svg" alt="White vs Black, chess" />

**`matrix`**

<img src="./assets/chess-colors-matrix.svg" alt="White vs Black, matrix" />

**`midnight`**

<img src="./assets/chess-colors-midnight.svg" alt="White vs Black, midnight" />

**`neon`**

<img src="./assets/chess-colors-neon.svg" alt="White vs Black, neon" />

**`ocean`**

<img src="./assets/chess-colors-ocean.svg" alt="White vs Black, ocean" />

**`github`**

<img src="./assets/chess-colors-github.svg" alt="White vs Black, github" />

**`github-light`**

<img src="./assets/chess-colors-github-light.svg" alt="White vs Black, github-light" />

</details>

### Openings (540×268) — most played opening families

Bar length = games played; the split is win / draw / loss.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-openings.svg)
```

<div align="center">
  <img src="./assets/chess-openings-github.svg" alt="Openings (540×268) — most played opening families" />
</div>

<details>
<summary>Openings in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-openings.svg" alt="Openings, premium" />

**`editorial`**

<img src="./assets/chess-openings-editorial.svg" alt="Openings, editorial" />

**`wood`**

<img src="./assets/chess-openings-wood.svg" alt="Openings, wood" />

**`tech`**

<img src="./assets/chess-openings-tech.svg" alt="Openings, tech" />

**`glass`**

<img src="./assets/chess-openings-glass.svg" alt="Openings, glass" />

**`piece`**

<img src="./assets/chess-openings-piece.svg" alt="Openings, piece" />

**`light`**

<img src="./assets/chess-openings-light.svg" alt="Openings, light" />

**`light-editorial`**

<img src="./assets/chess-openings-light-editorial.svg" alt="Openings, light-editorial" />

**`chess`**

<img src="./assets/chess-openings-chess.svg" alt="Openings, chess" />

**`matrix`**

<img src="./assets/chess-openings-matrix.svg" alt="Openings, matrix" />

**`midnight`**

<img src="./assets/chess-openings-midnight.svg" alt="Openings, midnight" />

**`neon`**

<img src="./assets/chess-openings-neon.svg" alt="Openings, neon" />

**`ocean`**

<img src="./assets/chess-openings-ocean.svg" alt="Openings, ocean" />

**`github`**

<img src="./assets/chess-openings-github.svg" alt="Openings, github" />

**`github-light`**

<img src="./assets/chess-openings-github-light.svg" alt="Openings, github-light" />

</details>

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

<details>
<summary>Medallion in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-medal-rapid.svg" alt="Medallion, premium" />

**`editorial`**

<img src="./assets/chess-medal-rapid-editorial.svg" alt="Medallion, editorial" />

**`wood`**

<img src="./assets/chess-medal-rapid-wood.svg" alt="Medallion, wood" />

**`tech`**

<img src="./assets/chess-medal-rapid-tech.svg" alt="Medallion, tech" />

**`glass`**

<img src="./assets/chess-medal-rapid-glass.svg" alt="Medallion, glass" />

**`piece`**

<img src="./assets/chess-medal-rapid-piece.svg" alt="Medallion, piece" />

**`light`**

<img src="./assets/chess-medal-rapid-light.svg" alt="Medallion, light" />

**`light-editorial`**

<img src="./assets/chess-medal-rapid-light-editorial.svg" alt="Medallion, light-editorial" />

**`chess`**

<img src="./assets/chess-medal-rapid-chess.svg" alt="Medallion, chess" />

**`matrix`**

<img src="./assets/chess-medal-rapid-matrix.svg" alt="Medallion, matrix" />

**`midnight`**

<img src="./assets/chess-medal-rapid-midnight.svg" alt="Medallion, midnight" />

**`neon`**

<img src="./assets/chess-medal-rapid-neon.svg" alt="Medallion, neon" />

**`ocean`**

<img src="./assets/chess-medal-rapid-ocean.svg" alt="Medallion, ocean" />

**`github`**

<img src="./assets/chess-medal-rapid-github.svg" alt="Medallion, github" />

**`github-light`**

<img src="./assets/chess-medal-rapid-github-light.svg" alt="Medallion, github-light" />

</details>

### Bare (840×118) — type only, no frame

No background: ink follows the reader's light/dark setting via `prefers-color-scheme`; the style only sets accent and font.

```markdown
![](https://raw.githubusercontent.com/YOUR_USERNAME/chess_readme_status/main/assets/chess-bare.svg)
```

<div align="center">
  <img src="./assets/chess-bare-github.svg" alt="Bare (840×118) — type only, no frame" />
</div>

<details>
<summary>Bare in all 15 styles</summary>

**`premium`**

<img src="./assets/chess-bare.svg" alt="Bare, premium" />

**`editorial`**

<img src="./assets/chess-bare-editorial.svg" alt="Bare, editorial" />

**`wood`**

<img src="./assets/chess-bare-wood.svg" alt="Bare, wood" />

**`tech`**

<img src="./assets/chess-bare-tech.svg" alt="Bare, tech" />

**`glass`**

<img src="./assets/chess-bare-glass.svg" alt="Bare, glass" />

**`piece`**

<img src="./assets/chess-bare-piece.svg" alt="Bare, piece" />

**`light`**

<img src="./assets/chess-bare-light.svg" alt="Bare, light" />

**`light-editorial`**

<img src="./assets/chess-bare-light-editorial.svg" alt="Bare, light-editorial" />

**`chess`**

<img src="./assets/chess-bare-chess.svg" alt="Bare, chess" />

**`matrix`**

<img src="./assets/chess-bare-matrix.svg" alt="Bare, matrix" />

**`midnight`**

<img src="./assets/chess-bare-midnight.svg" alt="Bare, midnight" />

**`neon`**

<img src="./assets/chess-bare-neon.svg" alt="Bare, neon" />

**`ocean`**

<img src="./assets/chess-bare-ocean.svg" alt="Bare, ocean" />

**`github`**

<img src="./assets/chess-bare-github.svg" alt="Bare, github" />

**`github-light`**

<img src="./assets/chess-bare-github-light.svg" alt="Bare, github-light" />

</details>

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
