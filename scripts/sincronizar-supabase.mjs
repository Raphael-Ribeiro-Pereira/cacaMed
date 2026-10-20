import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const modules = [
  'shared/operarTreinoSupabase.js', 'utils/treinos.js', 'utils/economia.js',
  'utils/missoes.js', 'utils/bancoTreinos.js', 'utils/revisaoInteligente.js', 'utils/revisaoSemanal.js', 'shared/operarRevisaoSupabase.js', 'shared/explicacaoRevisao.js', 'shared/operarFilaSupabase.js',
  'shared/operarJogosSupabase.js', 'shared/executarPedidoSupabase.js',
  'shared/apiSupabase.js', 'shared/migrarSenhaSupabase.js', 'shared/limitador.js',
  'utils/plantao.js', 'utils/plantaoBanco.js', 'utils/erroMedico.js', 'utils/erroMedicoBanco.js', 'utils/causaEfeito.js', 'utils/causaEfeitoBanco.js', 'utils/importarBancoCSV.js',
  'utils/batalha.js', 'utils/batalhaConteudo.js', 'utils/batalhaRevisao.js', 'utils/erroMedicoRevisao.js', 'utils/coroas.js', 'utils/estatisticasPainel.js', 'utils/curso.js', 'utils/memoriaPalavras.js', 'utils/motorTabuleiro.js',
];
for (const module of modules) {
  const destination = new URL(`supabase/functions/cacamed-api/${module}`, root);
  await mkdir(fileURLToPath(new URL('./', destination)), { recursive: true });
  // No Windows, o antivírus ou o editor às vezes seguram o arquivo por um instante (UNKNOWN/EBUSY): tenta de novo.
  for (let tentativa = 1; ; tentativa++) {
    try { await copyFile(new URL(`src/${module}`, root), destination); break; }
    catch (erro) { if (tentativa >= 5) throw erro; await new Promise(r => setTimeout(r, 300 * tentativa)); }
  }
}
console.log('Motor JavaScript da API Supabase sincronizado com as regras atuais.');
