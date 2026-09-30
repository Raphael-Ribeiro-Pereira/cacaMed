import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { parse } from 'dotenv';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const modules = [
  'shared/operarTreinoSupabase.js', 'utils/treinos.js', 'utils/economia.js',
  'utils/missoes.js', 'utils/bancoTreinos.js', 'utils/revisaoInteligente.js', 'shared/operarRevisaoSupabase.js',
  'shared/operarJogosSupabase.js', 'shared/executarPedidoSupabase.js',
  'shared/apiSupabase.js', 'shared/migrarSenhaSupabase.js',
  'utils/plantao.js', 'utils/erroMedico.js', 'utils/causaEfeito.js', 'utils/importarBancoCSV.js',
];
for (const module of modules) {
  const destination = new URL(`supabase/functions/cacamed-api/${module}`, root);
  await mkdir(fileURLToPath(new URL('./', destination)), { recursive: true });
  await copyFile(new URL(`src/${module}`, root), destination);
}
console.log('Motor JavaScript da API Supabase sincronizado com as regras atuais.');
// Chave WEB pública já usada pelo frontend; nunca copia outros valores do .env.
const config = parse(await readFile(new URL('.env', root), 'utf8'));
if (!config.VITE_FIREBASE_API_KEY) throw new Error('Chave pública Firebase ausente para a migração de senha.');
await writeFile(new URL('supabase/functions/cacamed-api/firebasePublic.js', root),
  `// Identificador público do projeto Firebase, não é uma chave Admin.\nexport const FIREBASE_WEB_API_KEY = ${JSON.stringify(config.VITE_FIREBASE_API_KEY)};\n`);
