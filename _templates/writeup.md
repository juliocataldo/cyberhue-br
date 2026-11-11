---
# Copie este arquivo para _writeups/<evento>-<desafio>.md (minúsculas, sem acento, com hífens).
# Ex.: _writeups/picoctf-2026-cookie-monster.md  →  /writeups/picoctf-2026-cookie-monster/
title: "Nome do desafio"
date: 2026-01-31            # data de publicação (AAAA-MM-DD)
author: "seu-handle"        # apelido/handle, não precisa ser nome real
event: "Nome do CTF ou plataforma"
category: web               # web | pwn | crypto | forensics | reversing | osint | mobile | misc
difficulty: fácil           # fácil | média | difícil
summary: "Uma frase dizendo o que o desafio ensina, sem spoiler da flag."
---

## O desafio

Enunciado (resumido ou citado), arquivos fornecidos e o que se esperava encontrar.

## Reconhecimento

O que você olhou primeiro e por quê. Comandos, ferramentas, primeiras hipóteses.

```bash
# comandos que você rodou
```

## O que não funcionou

Becos sem saída valem ouro para quem está aprendendo. Conte o que tentou e por que não deu.

## Solução

Passo a passo do que funcionou, explicando o raciocínio, não só o comando.

## Flag

`CyberHue{...}` — se o evento permitir publicar. Em wargames (OverTheWire, picoGym etc.), **não publique senhas nem flags**: descreva o caminho.

## O que aprendemos

- Conceito ou técnica nova
- Ferramenta que valeu a pena
- O que faria diferente

## Referências

- Links que ajudaram

<!--
Checklist antes de abrir o PR:
[ ] O CTF já terminou e as regras do evento permitem writeup.
[ ] Nenhuma senha, token, credencial ou dado pessoal real (seu ou de terceiros).
[ ] Nenhum IP/host de infraestrutura que não seja do próprio desafio.
[ ] Payload com {{ ou {% (ex.: SSTI)? Envolva o bloco em {% raw %} ... {% endraw %},
    senão o Jekyll tenta interpretar.
[ ] Imagens em assets/writeups/<nome-do-writeup>/ (sem metadados: remova EXIF).
-->
