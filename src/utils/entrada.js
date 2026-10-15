import { hash, usernameValido } from './cracha.js';
import { fotoDoPerfil } from './fotosCracha.js';
import { MATERIAS_CADASTRO } from './curso.js';

// Regras das telas de entrada: e-mail, sugestões de username e as escolhas que vêm do cadastro. As matérias moram em curso.js.
export { MATERIAS_CADASTRO };
const semAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const slug = s => semAcento(s).toLowerCase().replace(/[^a-z0-9]/g, '');
export const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());
export const primeiroNome = nome => slug(String(nome || '').trim().split(/\s+/)[0]);

// Até três usernames válidos a partir do nome: nome.sobrenome, nome.iniciais, inicial+sobrenome e nome com número.
export function sugestoes(nome) {
  const partes = String(nome || '').trim().split(/\s+/).map(slug).filter(Boolean);
  if (!partes.length) return [];
  const [a, ...resto] = partes;
  const z = resto[resto.length - 1];
  const opcoes = [z && `${a}.${z}`, resto.length > 1 && `${a}.${resto.map(x => x[0]).join('')}`, z && `${a[0]}${z}`, `${a}${(hash(nome) % 90) + 10}`];
  return [...new Set(opcoes.filter(Boolean))].filter(usernameValido).slice(0, 3);
}

// Foto padrão do crachá para quem ainda não escolheu.
export const fotoPadrao = titulo => fotoDoPerfil({ titulo });

// Título, matéria e foto escolhidos no cadastro por e-mail viajam nos metadados da conta até o
// Cadastro 2.0, que abre depois da confirmação (às vezes em outro aparelho). Os metadados podem
// ser editados pelo próprio jogador, então só valores conhecidos passam; o resto fica em branco.
export function escolhasDoCadastro(meta) {
  const titulo = ['Doutor', 'Doutora'].includes(meta?.titulo) ? meta.titulo : '';
  const materia = MATERIAS_CADASTRO.some(([v]) => v === meta?.materia) ? meta.materia : '';
  const foto = Number.isInteger(meta?.foto) && fotoDoPerfil({ foto: meta.foto }) === meta.foto ? meta.foto : null;
  return { titulo, materia, foto };
}
