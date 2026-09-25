import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

export async function consumirTicketDDX(uid, entradaId) {
  if (!uid || !entradaId) throw new Error('Entrada DDX inválida.');
  return runTransaction(db, async transaction => {
    const ref = doc(db, 'usuarios', uid);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Perfil não encontrado.');
    const dados = snapshot.data();
    const saldo = Number(dados.tickets) || 0;
    if (saldo < 1) throw new Error('Tickets insuficientes.');
    const entradas = Array.isArray(dados.entradasDDX) ? dados.entradasDDX : [];
    if (entradas.some(entrada => entrada.id === entradaId)) throw new Error('Entrada DDX duplicada.');
    transaction.update(ref, {
      tickets: saldo - 1,
      entradasDDX: [...entradas, { id: entradaId, status: 'consumido' }].slice(-100)
    });
    return saldo - 1;
  });
}

export async function reembolsarTicketDDX(uid, entradaId) {
  if (!uid || !entradaId) throw new Error('Entrada DDX inválida.');
  return runTransaction(db, async transaction => {
    const ref = doc(db, 'usuarios', uid);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('Perfil não encontrado.');
    const dados = snapshot.data();
    const entradas = Array.isArray(dados.entradasDDX) ? dados.entradasDDX : [];
    const entrada = entradas.find(item => item.id === entradaId);
    if (!entrada) throw new Error('Cobrança DDX não encontrada para reembolso.');
    const saldo = Number(dados.tickets) || 0;
    if (entrada.status === 'reembolsado') return saldo;
    transaction.update(ref, {
      tickets: saldo + 1,
      entradasDDX: entradas.map(item => item.id === entradaId ? { ...item, status: 'reembolsado' } : item)
    });
    return saldo + 1;
  });
}
