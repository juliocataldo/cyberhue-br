# CyberHue BR

Time brasileiro de CTF. Capivaras que capturam flags. 🏴

Site: https://www.cyberhue-br.dev (GitHub Pages, branch `main`, raiz, domínio customizado via `CNAME`).

## Estrutura

```
index.html        página principal
agenda/index.html   /agenda/  — próximos CTFs (CTFtime)
treinar/index.html  /treinar/ — trilha do zero ao primeiro CTF + plataformas
writeups/index.html /writeups/ — lista de writeups (Jekyll)
_writeups/*.md      um arquivo Markdown por writeup → /writeups/<nome>/
_layouts/writeup.html  layout das páginas de writeup
_templates/writeup.md  template para novos writeups (não é publicado)
_config.yml         configuração do Jekyll do GitHub Pages
assets/logo.jpg   logo do time
assets/style.css  estilos
assets/main.js    terminal animado, fundo binário, agenda de CTFs e checador do desafio
data/ctfs.json    próximos CTFs (gerado automaticamente, não editar à mão)
scripts/fetch-ctfs.mjs          busca e sanitiza eventos da API do CTFtime
.github/workflows/ctfs.yml      roda o script todo dia e commita se mudou
```

## Agenda de CTFs

A API do CTFtime não libera CORS, então o navegador não a chama direto. Um GitHub Action diário roda `scripts/fetch-ctfs.mjs`, que valida e sanitiza os eventos dos próximos 60 dias e grava `data/ctfs.json`. O site lê esse JSON da mesma origem (CSP `connect-src 'self'`). Se a API falhar, o JSON anterior continua no ar.

Rodar manualmente: `node scripts/fetch-ctfs.mjs` (Node 20+, sem dependências) ou *Actions → Atualizar agenda de CTFs → Run workflow*.

## Publicar no GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → Branch `main` / `/ (root)`.

## Desafio de entrada

Tem uma flag escondida na página. O checador compara apenas o SHA-256, a flag em claro não fica no JavaScript.

## Ética

Só atacamos alvos autorizados: plataformas de CTF, laboratórios próprios e programas de bug bounty.

## Writeups

1. Copie `_templates/writeup.md` para `_writeups/<evento>-<desafio>.md` e preencha o front matter.
2. Abra um pull request. O GitHub Pages gera `/writeups/<evento>-<desafio>/` sozinho (Jekyll), e a lista em `/writeups/` se atualiza.
3. Regras: só CTF que já terminou e permite writeup; nada de senhas, tokens ou dados pessoais; em wargames, descreva o caminho sem publicar senhas.

Testar o build localmente (Docker, mesma imagem do GitHub Pages):

```bash
docker run --rm -v "$PWD:/github/workspace/src:ro" -v "$PWD/_site:/github/workspace/_site" \
  -e GITHUB_WORKSPACE=/github/workspace -e INPUT_SOURCE=src -e INPUT_DESTINATION=_site \
  -e INPUT_FUTURE=false -e INPUT_VERBOSE=false -e INPUT_BUILD_REVISION=local \
  ghcr.io/actions/jekyll-build-pages:v1.0.13
python -m http.server -d _site 8000
```
