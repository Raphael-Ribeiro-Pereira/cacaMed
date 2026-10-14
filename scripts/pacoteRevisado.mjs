import { readFileSync } from 'node:fs';

// S-05 da auditoria de segurança (docs/seguranca.md): o pacote do navegador só leva o conteúdo do DDX que já
// passou pela revisão clínica. Os bancos completos continuam na Edge Function (copiados de src/utils por
// scripts/sincronizar-supabase.mjs), nos testes e no servidor de desenvolvimento (homologação).
export const BANCOS_DDX = { 'plantaoBanco.js': 'CASOS_PLANTAO', 'erroMedicoBanco.js': 'AUDITORIAS', 'causaEfeitoBanco.js': 'RELACOES' };

export const soRevisados = itens => itens.filter(item => item.revisado === true);

// Os bancos são gerados por scripts/integrar-ddx.mjs: comentários, `export const NOME = ` e um JSON.
export function lerBanco(texto, exporta) {
  const inicio = texto.indexOf(`export const ${exporta} = `);
  if (inicio < 0) throw new Error(`Banco sem "export const ${exporta}".`);
  return JSON.parse(texto.slice(inicio + `export const ${exporta} = `.length).trim().replace(/;$/, ''));
}

export const bancoDoArquivo = arquivo => {
  const nome = Object.keys(BANCOS_DDX).find(n => arquivo.replace(/\\/g, '/').endsWith('/src/utils/' + n));
  return nome && { nome, exporta: BANCOS_DDX[nome] };
};

// Plugin do Vite, só no build: troca cada banco por um módulo com os itens revisados.
export function pacoteRevisado() {
  return {
    name: 'caca-med-pacote-revisado',
    apply: 'build',
    enforce: 'pre',
    load(id) {
      const arquivo = id.split('?')[0];
      const banco = bancoDoArquivo(arquivo);
      if (!banco) return null;
      const itens = soRevisados(lerBanco(readFileSync(arquivo, 'utf8'), banco.exporta));
      return `export const ${banco.exporta} = ${JSON.stringify(itens)};\n`;
    },
  };
}
