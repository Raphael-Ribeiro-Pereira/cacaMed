import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { TEMAS_TREINO } from '../src/utils/treinos.js';

// Etapa 1 do fluxo de conteúdo: cada conceito traz a URL da fonte e um trecho copiado dela.
// O script abre a página e procura o trecho literalmente; trecho ou URL inventados são recusados.
// Só domínios de domínio público, governo ou reuso livre (ver docs/prompts/prompt-vou-m-frases.md).
export const DOMINIOS_PERMITIDOS = ['cdc.gov', 'nih.gov', 'cancer.gov', 'medlineplus.gov', 'gov.br', 'planalto.gov.br'];
// O NCBI (PubMed, PMC, Bookshelf/StatPearls) está em nih.gov, mas o texto é das editoras, não do governo.
const DOMINIOS_EXCLUIDOS = ['ncbi.nlm.nih.gov'];
const noDominio = (hostname, d) => hostname === d || hostname.endsWith(`.${d}`);

export const dominioPermitido = url => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && DOMINIOS_PERMITIDOS.some(d => noDominio(hostname, d)) && !DOMINIOS_EXCLUIDOS.some(d => noDominio(hostname, d));
  } catch {
    return false;
  }
};

// Páginas antigas do governo escrevem acentos como entidades (Aten&ccedil;&atilde;o).
const ENTIDADES = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', sect: '§', ordm: 'º', ordf: 'ª', deg: '°',
  ndash: '-', mdash: '-', lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', laquo: '«', raquo: '»' };
const MARCAS = { acute: '́', grave: '̀', circ: '̂', tilde: '̃', uml: '̈', cedil: '̧' };
const decodificar = texto => texto
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&([a-zA-Z])(acute|grave|circ|tilde|uml|cedil);/g, (_, letra, marca) => (letra + MARCAS[marca]).normalize('NFC'))
  .replace(/&([a-zA-Z]+);/g, (original, nome) => ENTIDADES[nome] ?? original);

// Página e trecho passam pela mesma limpeza: sem tags, sem espaço antes da pontuação, minúsculas.
export function normalizar(texto) {
  return decodificar(String(texto || '')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/ /g, ' ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    .normalize('NFC')
    .replace(/\s+/g, ' ').replace(/\s+([.,;:)])/g, '$1').replace(/\(\s+/g, '(')
    .trim().toLowerCase();
}

// "..." no trecho separa pedaços não contíguos; cada pedaço precisa estar na página.
export const trechosAusentes = (pagina, trecho) => String(trecho || '').split('...').map(p => p.trim().replace(/^\.+|\.+$/g, '').trim())
  .filter(Boolean).filter(p => !pagina.includes(normalizar(p)));

export function validarListaFontes(data) {
  const errors = [];
  if (!data || !Array.isArray(data.fontes) || !data.fontes.length) return ['Esperado objeto com fontes (array não vazio).'];
  for (const [i, f] of data.fontes.entries()) {
    for (const campo of ['conceito', 'url', 'titulo', 'orgao', 'trecho']) if (typeof f?.[campo] !== 'string' || !f[campo].trim()) errors.push(`fontes[${i}].${campo} obrigatório`);
    if (f?.url && !dominioPermitido(f.url)) errors.push(`fontes[${i}]: domínio fora da lista permitida (${f.url}).`);
    if (f?.area !== undefined && !TEMAS_TREINO.includes(f.area)) errors.push(`fontes[${i}]: área "${f.area}" fora da lista (${TEMAS_TREINO.join(', ')}).`);
    const palavras = String(f?.trecho || '').split(/\s+/).filter(Boolean).length;
    if (palavras > 60) errors.push(`fontes[${i}]: trecho com ${palavras} palavras; use até 60.`);
  }
  return errors;
}

async function baixar(url) {
  // O Planalto derruba conexões sem User-Agent; este se identifica como o script.
  const resposta = await fetch(url, { signal: AbortSignal.timeout(60000), redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cacaMed-conferir-fontes/1.0)' } });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

async function main() {
  const caminho = process.argv[2];
  if (!caminho) {
    console.error('Uso: npm run content:fontes -- arquivo-de-fontes.json');
    process.exitCode = 2;
    return;
  }
  const data = JSON.parse(await readFile(resolve(caminho), 'utf8'));
  const erros = validarListaFontes(data);
  for (const erro of erros) console.error(`ERRO: ${erro}`);
  if (erros.length) { process.exitCode = 1; return; }
  const paginas = new Map();
  let falhas = 0;
  for (const f of data.fontes) {
    if (!paginas.has(f.url)) paginas.set(f.url, baixar(f.url).then(normalizar).catch(e => ({ erro: e.message })));
    const pagina = await paginas.get(f.url);
    const problema = pagina.erro ? `página não abriu (${pagina.erro})` : trechosAusentes(pagina, f.trecho).map(p => `trecho ausente: "${p}"`).join('; ');
    if (problema) { falhas++; console.error(`FALHA ${f.conceito}: ${problema}`); } else console.log(`OK    ${f.conceito}`);
  }
  console.log(`${data.fontes.length - falhas} de ${data.fontes.length} fontes conferidas.`);
  if (falhas) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
