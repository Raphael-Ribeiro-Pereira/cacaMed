import { useId, useState } from 'react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { nivelPorXP } from '../utils/economia';
import { lerMissoes } from '../utils/missoes';
import { MAXIMO_RELOGIO_ADMIN } from '../utils/revisaoInteligente';

// Ferramentas de admin (docs/plano-admin-e-prototipos.md): atalhos para testar sem esperar, gravados no perfil real.
// `servicoPerfil` é a API de verdade; a homologação troca pelo motor local com dados fictícios.
const CAMPO = 'block w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-2 text-white';
const APLICAR = 'shrink-0 rounded-xl bg-[#00f5d4] px-4 py-2.5 text-sm font-extrabold text-[#00382f] disabled:opacity-50';
const BOTAO = 'block w-full rounded-lg border border-cyan-500/20 bg-[#0B1120] px-3 py-2 text-left text-sm text-white hover:border-cyan-400 disabled:opacity-50';

function Grupo({ titulo, aberto = false, children }) {
  return <details open={aberto} className="mb-2"><summary className="cursor-pointer py-1 text-sm font-bold text-cyan-400">{titulo}</summary>
    <div className="mt-1 grid gap-2">{children}</div></details>;
}

// Um número e "Aplicar": XP global, nível global, tickets.
function FormValor({ rotulo, minimo, maximo, ocupado, aoAplicar }) {
  const [valor, setValor] = useState('');
  return <form className="flex items-end gap-2" onSubmit={evento => { evento.preventDefault(); aoAplicar(Number(valor)); }}>
    <label className="flex-1 text-sm">{rotulo}<input type="number" min={minimo} max={maximo} required value={valor} onChange={evento => setValor(evento.target.value)} className={CAMPO} /></label>
    <button className={APLICAR} disabled={ocupado}>Aplicar</button>
  </form>;
}

export default function FerramentasAdmin({ usuario, dadosUsuario, setDadosUsuario, servicoPerfil = chamarPerfilPlanilha, topicos = [] }) {
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [chaveXP, setChaveXP] = useState('');
  const [nivelTopico, setNivelTopico] = useState('');
  const [confirmarReset, setConfirmarReset] = useState(false);
  const idTopicos = useId();
  if (dadosUsuario?.role !== 'admin') return null;

  // `sucesso` pode ler o perfil salvo: o primeiro pedido do dia também paga o login, e o número muda.
  const executar = async (operacao, extra = {}, sucesso = 'Alteração salva.') => {
    setOcupado(true);
    setMensagem('');
    try {
      const perfil = await servicoPerfil(usuario, 'admin', { operacao, ...extra });
      setDadosUsuario(perfil);
      setMensagem(typeof sucesso === 'function' ? sucesso(perfil) : sucesso);
    } catch (erro) {
      setMensagem(erro.message || 'Não foi possível salvar.');
    } finally {
      setOcupado(false);
    }
  };

  const nivel = nivelPorXP(dadosUsuario.pontuacaoTotal);
  const missoes = lerMissoes(dadosUsuario).filter(m => m.id !== 'login');
  const ofensiva = Number(dadosUsuario.ofensiva?.dias) || 1;
  const relogio = Number(dadosUsuario.revisao?.relogioAdminDias) || 0;
  const adiantar = dias => executar('relogioRevisao', { valor: Math.min(MAXIMO_RELOGIO_ADMIN, relogio + dias) }, `Relógio da Revisão: +${Math.min(MAXIMO_RELOGIO_ADMIN, relogio + dias)} dias.`);

  return <section aria-label="Alterações de progresso">
    <p className="text-slate-300 text-xs mb-3">As alterações abaixo são salvas nos dados reais.</p>
    <Grupo titulo="Nível e XP" aberto>
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('subirNivel', {}, p => `Nível ${nivelPorXP(p.pontuacaoTotal)}, com o prêmio do nível. Saldo: ${p.tickets} tickets.`)}>Subir 1 nível (nível {nivel} → {nivel + 1}, com o prêmio de tickets)</button>
      <FormValor rotulo="Definir XP global" minimo={0} maximo={1000000000} ocupado={ocupado} aoAplicar={valor => executar('setXP', { valor })} />
      <FormValor rotulo="Definir nível global" minimo={1} maximo={1000} ocupado={ocupado} aoAplicar={valor => executar('setNivelGlobal', { valor })} />
      <form className="grid gap-2" onSubmit={evento => { evento.preventDefault(); executar('setNivelCruzadinha', { chaveXP, valor: Number(nivelTopico) }, `${chaveXP} no nível ${nivelTopico}.`); }}>
        <label className="text-sm">Tópico da cruzadinha<input list={idTopicos} required value={chaveXP} onChange={evento => setChaveXP(evento.target.value.toUpperCase())} placeholder="ANATOMIA-SISTEMA ESQUELETICO" className={CAMPO} /></label>
        <datalist id={idTopicos}>{topicos.map(t => <option key={t} value={t} />)}</datalist>
        <div className="flex items-end gap-2">
          <label className="flex-1 text-sm">Nível do tópico<input type="number" min={0} max={100} required value={nivelTopico} onChange={evento => setNivelTopico(evento.target.value)} className={CAMPO} /></label>
          <button className={APLICAR} disabled={ocupado}>Aplicar</button>
        </div>
      </form>
    </Grupo>
    <Grupo titulo={`Tickets (saldo: ${Number(dadosUsuario.tickets) || 0})`}>
      <FormValor rotulo="Definir tickets (0 a 100)" minimo={0} maximo={100} ocupado={ocupado} aoAplicar={valor => executar('setTickets', { valor })} />
    </Grupo>
    <Grupo titulo="Missões do dia">
      {missoes.map(m => <button key={m.id} type="button" className={BOTAO} disabled={ocupado || m.concluida} onClick={() => executar('completarMissao', { missaoId: m.id }, `Missão "${m.titulo}" concluída.`)}>
        {m.concluida ? '✓ ' : 'Completar: '}{m.titulo} <span className="text-slate-400">· nível {m.nivel} · +{m.recompensaXP} XP</span></button>)}
      <div className="grid grid-cols-3 gap-1.5">
        {[[0, 'Sortear de novo'], [4, 'Sortear com nível 4'], [5, 'Sortear com nível 5']].map(([valor, rotulo]) =>
          <button key={valor} type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('sortearMissoes', { valor }, 'Missões sorteadas de novo.')}>{rotulo}</button>)}
      </div>
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('avancarDia', { valor: 1 }, p => `Dia seguinte: ofensiva de ${p.ofensiva.dias} dias, login pago e missões novas.`)}>Simular o dia seguinte (ofensiva {ofensiva} → {ofensiva + 1}, login e missões novas)</button>
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('avancarDia', { valor: 2 }, 'Dois dias sem entrar: a ofensiva voltou a 1.')}>Simular 2 dias sem entrar (ofensiva volta a 1)</button>
    </Grupo>
    <Grupo titulo={`Revisão (relógio: ${relogio ? `+${relogio} dias` : 'real'})`}>
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('semearRevisao', {}, 'Seis erros fictícios criados. Abra a Revisão.')}>Criar 6 erros fictícios (3 do Quiz, 2 do V ou M, 1 do Erro médico)</button>
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 3, 7].map(dias => <button key={dias} type="button" className={BOTAO} disabled={ocupado || relogio >= MAXIMO_RELOGIO_ADMIN} onClick={() => adiantar(dias)}>+{dias} dia{dias > 1 ? 's' : ''}</button>)}
        <button type="button" className={BOTAO} disabled={ocupado || !relogio} onClick={() => executar('relogioRevisao', { valor: 0 }, 'Relógio da Revisão de volta ao real.')}>Real</button>
      </div>
      <p className="text-xs text-slate-400">O relógio adiantado vale só para a Revisão do admin. As respostas dadas com ele ficam com a data adiantada.</p>
    </Grupo>
    <Grupo titulo="Casos (DDX)">
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => executar('liberarCasos', {}, 'Casos liberados: voltam a pagar XP.')}>Liberar casos concluídos (DDX, Erro médico e Causa e efeito voltam a pagar XP)</button>
      <p className="text-xs text-slate-400">Casos ainda em revisão clínica já aparecem para o admin na lista do DDX.</p>
    </Grupo>
    <Grupo titulo="Zerar progresso">
      <button type="button" className={BOTAO} disabled={ocupado} onClick={() => { if (confirmarReset) { setConfirmarReset(false); executar('resetarProgresso', {}, 'Progresso zerado.'); } else setConfirmarReset(true); }}>
        {confirmarReset ? 'Toque de novo para confirmar: zera XP, tickets, jogos e Revisão' : 'Zerar progresso'}</button>
    </Grupo>
    {mensagem && <p role="status" className="text-sm mt-2">{mensagem}</p>}
  </section>;
}
