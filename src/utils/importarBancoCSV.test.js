import test from 'node:test';
import assert from 'node:assert/strict';
import { bancoPublico, importarBancoCSV, lerLinhasCSV, montarBanco } from './importarBancoCSV.js';

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

test('remove resposta repetida no mesmo tópico e preserva a primeira dica', () => {
  const csv = 'Palavra,Matéria,Submatéria,Dificuldade,Dica\n'
    + 'Isquemia,Patologia,Doenças,4,Primeira dica\n'
    + 'ISQUEMIA,Patologia,Doenças,4,Dica repetida\n'
    + 'Isquêmia,Patologia,Doenças,4,Outra repetição\n'
    + 'Isquemia,Patologia,Exames,4,Outro tópico\n'
    + 'Bócio,Patologia,Doenças,1,Segunda palavra';
  const banco = importarBancoCSV(csv);
  assert.deepEqual(banco['PATOLOGIA-DOENCAS'].map(item => item.palavra), ['ISQUEMIA', 'BOCIO']);
  assert.equal(banco['PATOLOGIA-DOENCAS'][0].dicaBasica, 'Primeira dica');
  assert.equal(banco['PATOLOGIA-DOENCAS'][1].numero, 3);
  assert.equal(banco['PATOLOGIA-EXAMES'][0].palavra, 'ISQUEMIA');
});

const QUEBRA = String.fromCharCode(10);
test('planilhas de dicas: colunas pelo nome, sem nível mínimo, e uma dica por planilha em cada palavra', () => {
  const principal = ['Palavra,Area,Subárea,nivelMinimo,Descrição', 'Fêmur,Anatomia,Ossos,3,Osso da coxa', 'Tíbia,Anatomia,Ossos,1,Osso da perna'].join(QUEBRA);
  const segunda = ['Descrição,Palavra,Área,Subárea', 'Maior osso do corpo,FEMUR,Anatomia,Ossos', 'Vai do joelho ao quadril,Fêmur,Anatomia,Ossos', 'Segura o crânio,Atlas,Anatomia,Ossos'].join(QUEBRA);
  const banco = montarBanco([principal, segunda]);
  const [femur, tibia, atlas] = banco['ANATOMIA-OSSOS'];
  assert.deepEqual(femur.dicas, ['Osso da coxa', 'Maior osso do corpo']);
  assert.equal(femur.dificuldade, 3);
  assert.deepEqual(tibia.dicas, ['Osso da perna', '']);
  assert.deepEqual([atlas.palavra, atlas.dicaBasica, atlas.dificuldade, atlas.dicas], ['ATLAS', 'Segura o crânio', 0, ['', 'Segura o crânio']]);
  assert.equal('dicas' in bancoPublico(banco)['ANATOMIA-OSSOS'][0], false);
  assert.equal('dicas' in importarBancoCSV(principal)['ANATOMIA-OSSOS'][0], false);
});
