import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BANCOS_DDX, bancoDoArquivo, lerBanco, pacoteRevisado, soRevisados } from '../../scripts/pacoteRevisado.mjs';
import { CASOS_PLANTAO } from './plantaoBanco.js';
import { AUDITORIAS } from './erroMedicoBanco.js';
import { RELACOES } from './causaEfeitoBanco.js';

const COMPLETOS = { CASOS_PLANTAO, AUDITORIAS, RELACOES };
const caminho = nome => fileURLToPath(new URL(`./${nome}`, import.meta.url));

test('S-05: o leitor dos bancos devolve o mesmo conteúdo que o módulo', () => {
  for (const [nome, exporta] of Object.entries(BANCOS_DDX)) {
    assert.deepEqual(lerBanco(readFileSync(caminho(nome), 'utf8'), exporta), COMPLETOS[exporta], nome);
  }
});

test('S-05: no build, o pacote do navegador só recebe os itens revisados', () => {
  const plugin = pacoteRevisado();
  assert.equal(plugin.apply, 'build');
  for (const [nome, exporta] of Object.entries(BANCOS_DDX)) {
    const codigo = plugin.load(caminho(nome));
    const itens = lerBanco(codigo, exporta);
    assert.deepEqual(itens, soRevisados(COMPLETOS[exporta]), nome);
    assert.ok(itens.every(item => item.revisado === true), nome);
    for (const item of COMPLETOS[exporta].filter(i => !i.revisado)) assert.ok(!codigo.includes(`"${item.id}"`), `${item.id} vazou`);
  }
  assert.equal(plugin.load(caminho('plantao.js')), null);
  assert.equal(plugin.load(caminho('plantaoBanco.js') + '?import'), plugin.load(caminho('plantaoBanco.js')));
});

test('S-05: reconhece o banco também em caminho do Windows', () => {
  assert.deepEqual(bancoDoArquivo('C:\\cacaMed\\src\\utils\\erroMedicoBanco.js'), { nome: 'erroMedicoBanco.js', exporta: 'AUDITORIAS' });
  assert.equal(bancoDoArquivo('/x/src/utils/outro.js'), undefined);
});
