import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const modules = [
  'shared/operarTreinoSupabase.js', 'utils/treinos.js', 'utils/economia.js',
  'utils/missoes.js', 'utils/bancoTreinos.js', 'utils/revisaoInteligente.js', 'shared/operarRevisaoSupabase.js',
  'shared/operarJogosSupabase.js', 'shared/executarPedidoSupabase.js',
  'shared/apiSupabase.js', 'shared/migrarSenhaSupabase.js',
  'utils/plantao.js', 'utils/erroMedico.js', 'utils/causaEfeito.js', 'utils/importarBancoCSV.js',
  'utils/batalha.js', 'utils/batalhaConteudo.js', 'utils/batalhaRevisao.js', 'utils/coroas.js', 'utils/estatisticasPainel.js',
  'utils/pacienteDdxNota.js', 'utils/pacienteDdxGabarito.js',
];
for (const module of modules) {
  const destination = new URL(`supabase/functions/cacamed-api/${module}`, root);
  await mkdir(fileURLToPath(new URL('./', destination)), { recursive: true });
  await copyFile(new URL(`src/${module}`, root), destination);
}
console.log('Motor JavaScript da API Supabase sincronizado com as regras atuais.');
