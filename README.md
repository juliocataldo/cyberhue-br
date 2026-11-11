# CyberHue BR

Time brasileiro de CTF. Capivaras que capturam flags. 🏴

Site: https://www.cyberhue-br.dev (GitHub Pages, branch `main`, raiz, domínio customizado via `CNAME`).

## Estrutura

```
index.html        página principal
agenda/index.html   /agenda/  — próximos CTFs (CTFtime)
treinar/index.html  /treinar/ — plataformas recomendadas para treinar
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
