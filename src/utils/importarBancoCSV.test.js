import test from 'node:test';
import assert from 'node:assert/strict';
import { importarBancoCSV, lerLinhasCSV } from './importarBancoCSV.js';

test('CSV aceita vírgulas, aspas escapadas e quebras de linha dentro de dica', () => {
  const csv = '\uFEFFPalavra,Matéria,Submatéria,Dificuldade,Dica\r\n"TÁLUS",Anatomia,Ossos,2,"Osso do ""tornozelo"",\nentre outros"\r\nCÓCCIX,Anatomia,Ossos,0,"Fim da coluna"';
  const banco = importarBancoCSV(csv);
  assert.equal(banco['ANATOMIA-OSSOS'][0].palavra, 'TALUS');
  assert.equal(banco['ANATOMIA-OSSOS'][0].dicaBasica, 'Osso do "tornozelo",\nentre outros');
  assert.equal(banco['ANATOMIA-OSSOS'][1].palavra, 'COCCIX');
  assert.equal(banco['ANATOMIA-OSSOS'][1].numero, 2);
});

test('ignora linhas sem palavra válida e rejeita CSV incompleto', () => {
  const banco = importarBancoCSV('Palavra,Matéria,Submatéria,Dificuldade,Dica\n,Anatomia,Ossos,0,\nAtlas,Anatomia,   ,x,Primeira vértebra');
  assert.equal(banco['ANATOMIA-GERAL'][0].palavra, 'ATLAS');
  assert.equal(banco['ANATOMIA-GERAL'][0].dificuldade, 0);
  assert.throws(() => lerLinhasCSV('a,b\n"incompleto'), /aspas sem fechamento/);
});
