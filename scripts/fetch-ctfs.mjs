// Busca os próximos CTFs na API pública do CTFtime e gera data/ctfs.json.
// Roda no GitHub Actions (cron). Sem dependências: Node 20+ com fetch nativo.
//
// Segurança:
// - Todo dado vindo do CTFtime é tratado como input hostil: whitelist de campos,
//   tipos validados, strings truncadas e sem caracteres de controle, URLs só https.
// - Fail secure: se a API falhar ou responder lixo, o script sai com erro e o
//   JSON anterior continua publicado (nada é sobrescrito com dado parcial).

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'data', 'ctfs.json');

const DAYS_AHEAD = 60;
const MAX_EVENTS = 100;
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 2_000_000;

const FORMATS = new Set(['Jeopardy', 'Attack-Defense', 'Hack quest']);
const RESTRICTIONS = new Set(['Open', 'Academic', 'Prequalified', 'High-school', 'Invited']);

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanUrl(value) {
  if (typeof value !== 'string' || value.length > 300) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' || u.username || u.password) return null;
    return u.href;
  } catch {
    return null;
  }
}

function cleanDate(value) {
  if (typeof value !== 'string') return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function sanitize(ev) {
  if (!ev || typeof ev !== 'object') return null;
  const id = Number(ev.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const title = cleanText(ev.title, 120);
  const start = cleanDate(ev.start);
  const finish = cleanDate(ev.finish);
  if (!title || !start || !finish || finish < start) return null;

  const weight = Number(ev.weight);
  return {
    id,
    title,
    start,
    finish,
    format: FORMATS.has(ev.format) ? ev.format : 'Outro',
    restrictions: RESTRICTIONS.has(ev.restrictions) ? ev.restrictions : 'Outro',
    onsite: ev.onsite === true,
    location: ev.onsite === true ? cleanText(ev.location, 80) : '',
    weight: Number.isFinite(weight) && weight >= 0 && weight <= 100 ? Math.round(weight * 100) / 100 : 0,
    url: cleanUrl(ev.url),
    // Link do CTFtime é montado por nós a partir do id, nunca copiado da resposta.
    ctftime_url: `https://ctftime.org/event/${id}/`,
  };
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const finish = now + DAYS_AHEAD * 86400;
  const api = `https://ctftime.org/api/v1/events/?limit=${MAX_EVENTS}&start=${now}&finish=${finish}`;

  const res = await fetch(api, {
    headers: {
      'User-Agent': 'cyberhue-br-site/1.0 (+https://www.cyberhue-br.dev)',
      Accept: 'application/json',
    },
    redirect: 'error',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`CTFtime respondeu HTTP ${res.status}`);

  const body = await res.text();
  if (body.length > MAX_BYTES) throw new Error('resposta grande demais');

  const raw = JSON.parse(body);
  if (!Array.isArray(raw)) throw new Error('resposta não é uma lista');

  const events = raw
    .map(sanitize)
    .filter(Boolean)
    .sort((a, b) => a.start.localeCompare(b.start));

  // Evita commit vazio por instabilidade da API: lista vazia mantém o arquivo atual.
  if (events.length === 0) throw new Error('nenhum evento válido retornado');

  const json = JSON.stringify(
    { source: 'https://ctftime.org', generated_at: new Date().toISOString(), events },
    null,
    2,
  ) + '\n';

  // Só reescreve se a lista de eventos mudou (generated_at sozinho não gera commit).
  try {
    const prev = JSON.parse(await readFile(OUT, 'utf8'));
    if (JSON.stringify(prev.events) === JSON.stringify(events)) {
      console.log(`sem mudanças (${events.length} eventos)`);
      return;
    }
  } catch { /* primeiro run ou arquivo inválido: segue e escreve */ }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, json, 'utf8');
  console.log(`ok: ${events.length} eventos em data/ctfs.json`);
}

main().catch((err) => {
  console.error(`falhou: ${err.message}`);
  process.exit(1);
});
