// Retratos do crachá (arte original em SVG); o índice escolhido fica em perfil.foto.
export const FOTOS = [
  { id: 'r1', nome: 'Clássico', pele: '#f1c7a3', cabelo: 'curto', corCabelo: '#5a3a24', pijama: '#19c3a8', fundo: ['#2a6f86', '#0f2436'] },
  { id: 'r2', nome: 'Cachos', pele: '#8d5a3b', cabelo: 'ondulado', corCabelo: '#1c1720', pijama: '#8b5cf6', oculos: true, fundo: ['#5b3fa8', '#1a1433'] },
  { id: 'r3', nome: 'Longo', pele: '#e3ae86', cabelo: 'longo', corCabelo: '#221a1f', pijama: '#e0527a', fundo: ['#8a3a5c', '#241222'] },
  { id: 'r4', nome: 'Coque', pele: '#f6d5bd', cabelo: 'coque', corCabelo: '#c98f45', pijama: '#4f7cf0', fundo: ['#2f5bb0', '#101a33'] },
  { id: 'r5', nome: 'Raspado', pele: '#6e4630', cabelo: 'raspado', corCabelo: '#17131a', pijama: '#19c3a8', oculos: true, fundo: ['#1f7a6a', '#0b2420'] },
  { id: 'r6', nome: 'Centro cirúrgico', pele: '#c68a62', cabelo: 'touca', corCabelo: '#2b2130', pijama: '#3f8fd8', fundo: ['#2d6aa0', '#0e1d30'] },
];
// Sem foto escolhida, vale o título do cadastro: Doutora começa com o retrato de cabelo longo.
export const fotoDoPerfil = perfil => Number.isInteger(perfil?.foto) && FOTOS[perfil.foto] ? perfil.foto
  : String(perfil?.titulo || '').toLowerCase().includes('doutora') ? 2 : 0;
