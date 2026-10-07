import { useEffect, useState } from 'react';

// Utilidades das telas portadas do protótipo de movimento (Ranking, Coroas, Estatísticas, Crachá e Batalha).
export const animar = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fmt = valor => Math.round(Number(valor) || 0).toLocaleString('pt-BR');
export const iniciais = nome => String(nome || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';

// Web a partir de 960 px: colunas, hover e teclado físico; abaixo disso, layout de celular.
export function useLargo() {
  const consulta = '(min-width: 960px)';
  const [largo, setLargo] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const mudar = () => setLargo(m.matches);
    m.addEventListener('change', mudar);
    return () => m.removeEventListener('change', mudar);
  }, []);
  return largo;
}

// Previsão de espera dos botões de carregamento: média móvel das respostas da API nesta sessão, com 15% de folga.
let mediaLatencia = 0;
export const registrarLatencia = ms => { mediaLatencia = mediaLatencia ? mediaLatencia * 0.6 + ms * 0.4 : ms; };
export const latenciaPrevista = () => Math.round((mediaLatencia || 2500) * 1.15);

// Lê e grava no aparelho sem quebrar quando o armazenamento estiver bloqueado.
export const lerLocal = chave => { try { return JSON.parse(localStorage.getItem(chave) || 'null'); } catch { return null; } };
export const gravarLocal = (chave, valor) => { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* armazenamento indisponível */ } };

