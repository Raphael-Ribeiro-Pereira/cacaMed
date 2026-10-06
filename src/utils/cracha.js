import { useEffect, useState } from 'react';

// Regras do crachá compartilhadas pelo Crachá (PerfilUsuario), pelo cadastro e pelo menu.
export const usernameValido = u => /^[a-z0-9._]{3,20}$/.test(u);
export const MATERIA_CADASTRO = { anatomia: 'ANATOMIA', neurologia: 'NEUROLOGIA', farmaco: 'FARMACOLOGIA', micro: 'MICROBIOLOGIA', clinica: 'CLÍNICA GERAL', patologia: 'PATOLOGIA' };
export const hash = s => [...String(s)].reduce((h, c) => (h * 131 + c.charCodeAt(0)) >>> 0, 7);
export const matriculaDe = uid => { let h = hash(uid), t = ''; for (let i = 0; i < 8; i++) { h = (h * 1103515245 + 12345) >>> 0; t += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(h >>> 16) % 32]; } return `CM-${t}`; };
export const desdeDe = data => (data ? new Date(data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '—');
export const tratamento = titulo => (String(titulo || '').toLowerCase().includes('doutora') ? 'Dra.' : 'Dr.');

// Especialização: a matéria com mais XP por tema; recém-cadastrado usa a matéria escolhida no cadastro.
export function especialidade(p) {
  const [chave, xp] = Object.entries(p?.xpTopicos || {}).sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))[0] || [];
  if (chave && Number(xp) > 0) return [chave.split('-')[0], Number(xp)];
  return [MATERIA_CADASTRO[p?.materiaPreferida] || 'CLÍNICA GERAL', 0];
}

// Username: regra local na hora e confirmação no servidor depois de 450 ms sem digitar.
export function useDisponibilidade(username, ativo, conferir) {
  const [resposta, setResposta] = useState({ username: null });
  const valido = usernameValido(username);
  useEffect(() => {
    if (!ativo || !valido || !conferir) return undefined;
    let vivo = true;
    const t = setTimeout(() => conferir(username).then(r => { if (vivo) setResposta({ username, ok: r.disponivel }); })
      .catch(() => { if (vivo) setResposta({ username, erro: true }); }), 450);
    return () => { vivo = false; clearTimeout(t); };
  }, [username, ativo, valido, conferir]);
  if (!ativo || !username) return 'idle';
  if (!valido) return 'invalid';
  if (!conferir) return 'ok';
  if (resposta.username !== username) return 'checking';
  return resposta.erro ? 'falha' : resposta.ok ? 'ok' : 'taken';
}
