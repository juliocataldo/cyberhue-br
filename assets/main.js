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
  if (reduceMotion) {
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

  form.addEventListener('submit', async (e) => {
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

  console.log('%cCYBERHUE BR', 'color:#7cff3a;font:700 24px monospace');
  console.log('%cprocurando a flag no console? quase. olha o HTML.', 'color:#ffd60a;font:14px monospace');
})();
