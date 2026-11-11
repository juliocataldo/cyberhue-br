---
title: "Bandit níveis 0 a 3: SSH e nomes de arquivo traiçoeiros"
date: 2026-11-11
author: "CyberHue BR"
event: "OverTheWire · Bandit"
category: misc
difficulty: fácil
summary: "Primeiros passos no wargame Bandit: conectar por SSH e ler arquivos com nomes que confundem o shell — hífen, espaços e arquivos ocultos."
---

O [Bandit](https://overthewire.org/wargames/bandit/) é o wargame que mais recomendamos para quem está começando: cada nível é uma máquina Linux onde a senha do próximo nível está escondida de algum jeito. Aqui cobrimos os quatro primeiros, que ensinam o básico do terminal.

> **Sem spoiler de senha.** As senhas do Bandit são trocadas de tempos em tempos e a graça é chegar nelas sozinho. Este writeup mostra o *caminho*, não o resultado. Os nomes de arquivo também podem mudar entre versões do jogo, então leia o enunciado de cada nível.

## Nível 0: entrando por SSH

O enunciado dá o host, a porta e o usuário. O detalhe que mais trava iniciante é a **porta**: não é a 22 padrão.

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
```

A senha do `bandit0` está no próprio enunciado. Lá dentro, `ls` mostra um arquivo `readme`, e `cat readme` revela a senha do nível 1. Saia com `exit` e conecte de novo como `bandit1`.

**Aprendizado:** `ssh usuario@host -p PORTA`. Guarde as senhas num arquivo local seu, fora da máquina do jogo.

## Nível 1: o arquivo chamado `-`

O arquivo com a senha se chama literalmente `-`. Tentar `cat -` faz o `cat` ficar parado esperando você digitar: para muitos programas, `-` significa "leia da entrada padrão (stdin)".

A saída é deixar claro que é um **caminho**, não uma opção:

```bash
cat ./-
```

`cat < -` também funciona: aí é o shell que abre o arquivo e entrega o conteúdo para o `cat`.

**Aprendizado:** argumentos que começam com `-` são lidos como opções. Prefixar com `./` resolve.

## Nível 2: espaços (e hífens) no nome

Agora o nome do arquivo tem espaços. Sem aspas, o shell quebra o nome em várias palavras e o `cat` procura vários arquivos que não existem.

```bash
cat "nome do arquivo com espaços"
cat nome\ do\ arquivo\ com\ espaços
```

Se o nome também começar com `-`, junte as duas técnicas, com `./` antes das aspas, ou use `--` para avisar que acabaram as opções:

```bash
cat -- "--nome com espaços--"
```

**Dica:** digite as primeiras letras e aperte **Tab**. O autocomplete escapa o nome para você.

## Nível 3: arquivo oculto

A senha está dentro do diretório `inhere`, mas `ls inhere` parece não mostrar nada. No Linux, arquivos que começam com `.` são **ocultos** e o `ls` não lista por padrão.

```bash
ls -la inhere
```

O `-a` mostra tudo, incluindo os ocultos (e as entradas `.` e `..`). Com o nome em mãos, use `cat` com aspas ou Tab, como no nível anterior.

**Aprendizado:** `ls -la` deve virar reflexo em qualquer recon de diretório.

## O que levar daqui

- Leia o enunciado inteiro: a porta, o usuário e as dicas de comando estão lá.
- O shell interpreta `-`, espaços e `.` de forma especial. Entender *quem* interpreta cada caractere (o shell ou o programa) resolve metade dos problemas.
- `man <comando>` é seu melhor amigo. O próprio Bandit sugere quais comandos estudar em cada nível.

Próximo passo: continue até o nível 10 e depois venha jogar um CTF com a gente. A [agenda](/agenda/) tem os próximos.
