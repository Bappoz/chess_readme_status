# chess-readme-status — SVGs de stats do Chess.com para README (GitHub Actions, sem servidor)

## Stack
Node (script único) · `node-fetch` · GitHub Actions a cada 6h commitando os SVGs gerados em `assets/`.

## Comandos
```bash
npm run generate     # node scripts/generate-svg.js  (== npm test)
```

## Arquitetura
`scripts/generate-svg.js` busca a API pública do Chess.com e gera **117 SVGs**: 13 estilos (`premium, editorial, wood, tech, glass, piece, light, light-editorial, chess, matrix, midnight, neon, ocean`) × 9 arquivos (summary com os 4 modos + line chart e hero por modo). Saída versionada em `assets/` — é o que os READMEs consomem por URL raw.

Design system "Rank" no topo do script: tokens por estilo (`STYLES`) + primitivas compartilhadas (`formGuide`, `wdlBar`, `sparkline`, `smoothPath`, `deltaMark`). Um layout por tipo de card para todos os estilos — variante muda paleta e `trait` de fundo, nunca o layout. **Só declarar fonte que existe de fato** (`FACE_SANS/SERIF/MONO`): o GitHub bloqueia fonte externa, então fonte inventada vira Arial no leitor. Cor de dado é validada com o script `dataviz` antes de entrar, não no olho.

## Convenções (não-negociáveis)
- **SVG estático e autocontido**: sem JS, sem fonte externa, sem `<image>` remoto (GitHub sanitiza) — texto com fonte genérica e fallback.
- Nome de arquivo em `assets/` é contrato público: renomear quebra README de terceiros. Adicione, não renomeie.
- Estilo novo entra para os 3 tipos de card, mantendo a matriz completa; escape de texto vindo da API (nome de usuário) obrigatório.
- Falha da API não pode gerar SVG corrompido: aborte com exit code ≠ 0 e deixe o commit anterior de pé.
- Sem chave/token: a API do Chess.com é pública — não introduzir segredo no workflow.
- Commit automático usa `[skip ci]` — preserve isso para não entrar em loop de Actions.
