'use strict';

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ano no rodapé
  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Terminal digitando
  const typed = document.getElementById('typed');
  const lines = [
    './capture --flag --team cyberhue',
    'nmap -sV ctf.local',
    'python3 exploit.py',
    'cat flag.txt',
  ];
  if (!typed) {
    // páginas internas não têm o terminal
  } else if (reduceMotion) {
    typed.textContent = lines[0];
  } else {
    let li = 0, ci = 0, deleting = false;
    (function tick() {
      const line = lines[li];
      typed.textContent = line.slice(0, ci);
      if (!deleting && ci < line.length) { ci++; return setTimeout(tick, 70); }
      if (!deleting) { deleting = true; return setTimeout(tick, 1600); }
      if (ci > 0) { ci--; return setTimeout(tick, 30); }
      deleting = false; li = (li + 1) % lines.length;
      setTimeout(tick, 300);
    })();
  }

  // Chuva binária de fundo
  const canvas = document.getElementById('rain');
  if (!reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const size = 16;
    let cols = 0, drops = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / size);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);
    const palette = ['#7cff3a', '#c6ff1a', '#1fa2ff', '#ffd60a'];
    setInterval(() => {
      ctx.fillStyle = 'rgba(6, 18, 15, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + 'px JetBrains Mono, monospace';
      for (let i = 0; i < cols; i++) {
        ctx.fillStyle = palette[i % 7 === 0 ? (i % 4) : 0];
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * size, drops[i] * size);
        if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 60);
  }

  // Desafio de entrada: compara SHA-256 da flag (a flag em claro não fica no JS)
  const FLAG_SHA256 = 'd33e3f527b706bcb08b1c40969159f7d52326467f93e7ed2ee682c90b5a1a505';
  const form = document.getElementById('flag-form');
  const input = document.getElementById('flag');
  const out = document.getElementById('flag-result');

  async function sha256Hex(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  }

  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value.trim().slice(0, 64);
    out.className = '';
    if (!value) { out.textContent = '> digite uma flag'; return; }
    if (!window.crypto || !crypto.subtle) {
      out.textContent = '> seu navegador não suporta Web Crypto neste contexto';
      return;
    }
    const ok = (await sha256Hex(value)) === FLAG_SHA256;
    out.className = ok ? 'ok' : 'err';
    out.textContent = ok
      ? '> flag correta. bem-vinda(o) ao bando, capivara. agora vai lá em #entrar 🏴'
      : '> flag incorreta. tenta de novo.';
  });

  // Agenda de CTFs: lê data/ctfs.json (gerado pelo GitHub Action a partir do CTFtime).
  // Dado de terceiro = input hostil: só textContent, nunca innerHTML; links só https.
  const list = document.getElementById('ctf-list');
  const status = document.getElementById('ctf-status');
  if (list && status) {
    const tz = 'America/Sao_Paulo';
    const fmtDay = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: 'short' });
    const fmtFull = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const state = { format: 'all', open: false, online: false };
    let events = [];
    let generatedAt = null;
    let expanded = false;
    const PAGE = 8;
    const more = document.getElementById('ctf-more');
    more.addEventListener('click', () => { expanded = true; render(); });

    const safeUrl = (v) => {
      try { const u = new URL(v); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
    };
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };
    const link = (href, text) => {
      const a = el('a', null, text);
      a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      return a;
    };
    const duration = (ms) => {
      const h = Math.round(ms / 3600000);
      return h >= 48 ? Math.round(h / 24) + ' dias' : h + 'h';
    };

    function render() {
      const now = Date.now();
      const shown = events.filter((e) =>
        Date.parse(e.finish) > now &&
        (state.format === 'all' || e.format === state.format) &&
        (!state.open || e.restrictions === 'Open') &&
        (!state.online || !e.onsite));

      list.replaceChildren();
      more.hidden = expanded || shown.length <= PAGE;
      for (const e of expanded ? shown : shown.slice(0, PAGE)) {
        const start = new Date(e.start), finish = new Date(e.finish);
        const li = el('li', 'ctf');
        const date = el('div', 'ctf-date');
        const parts = Object.fromEntries(fmtDay.formatToParts(start).map((p) => [p.type, p.value]));
        date.append(el('b', null, parts.day + ' ' + String(parts.month).replace('.', '')),el('span', null, duration(finish - start)));

        const body = el('div', 'ctf-body');
        const title = el('h3', null, e.title);
        if (start <= now) title.append(' ', el('span', 'live', 'rolando agora'));
        const meta = el('p', 'ctf-meta');
        meta.textContent = [
          fmtFull.format(start) + ' → ' + fmtFull.format(finish),
          e.format,
          e.onsite ? 'presencial' + (e.location ? ' · ' + e.location : '') : 'online',
          e.restrictions === 'Open' ? 'aberto' : e.restrictions === 'Outro' ? null : String(e.restrictions).toLowerCase(),
          e.weight > 0 ? 'peso ' + e.weight : 'sem peso',
        ].filter(Boolean).join(' · ');
        const links = el('p', 'ctf-links');
        const site = safeUrl(e.url);
        const ctftime = safeUrl(e.ctftime_url);
        if (site) links.append(link(site, 'site ↗'));
        if (ctftime) links.append(link(ctftime, 'ctftime ↗'));

        body.append(title, meta, links);
        li.append(date, body);
        list.append(li);
      }
      status.textContent = shown.length
        ? shown.length + ' evento(s)'
        : 'nenhum CTF com esses filtros nos próximos 60 dias.';
      if (generatedAt) status.textContent += ' · atualizado em ' + fmtFull.format(generatedAt);
    }

    document.querySelectorAll('.chip[data-format]').forEach((b) => {
      b.addEventListener('click', () => {
        state.format = b.dataset.format;
        document.querySelectorAll('.chip[data-format]').forEach((x) =>
          x.setAttribute('aria-pressed', String(x === b)));
        render();
      });
    });
    document.getElementById('f-open').addEventListener('change', (e) => { state.open = e.target.checked; render(); });
    document.getElementById('f-online').addEventListener('change', (e) => { state.online = e.target.checked; render(); });

    fetch('/data/ctfs.json', { cache: 'no-cache', credentials: 'omit' })
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then((data) => {
        events = Array.isArray(data.events) ? data.events.filter((e) =>
          e && typeof e.title === 'string' && !isNaN(Date.parse(e.start)) && !isNaN(Date.parse(e.finish))) : [];
        const gen = Date.parse(data.generated_at);
        generatedAt = isNaN(gen) ? null : new Date(gen);
        render();
      })
      .catch(() => {
        status.replaceChildren('não deu para carregar a agenda agora. veja no ',
          link('https://ctftime.org/event/list/upcoming', 'CTFtime ↗'), '.');
      });
  }

  console.log('%cCYBERHUE BR', 'color:#7cff3a;font:700 24px monospace');
  console.log('%cprocurando a flag no console? quase. olha o HTML.', 'color:#ffd60a;font:14px monospace');
})();
