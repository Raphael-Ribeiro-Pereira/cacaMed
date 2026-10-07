import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Play, Settings2, Ticket } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { estimarXpCruzadinha, nivelDoTopico } from '../utils/cruzadinha';
import { fmt, gravarLocal, lerLocal, useLargo } from '../utils/prototipo';

// Seleção de ala e tópico do protótipo de movimento, com as alas e tópicos do banco de palavras real.
const normalizar = valor => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const titulo = valor => valor.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, letra => letra.toLocaleUpperCase('pt-BR'));
const CHAVE_ESCOLHA = 'cacoMed-cruzadinha-escolha';

export default function SelecaoTopicos({ setTelaAtual, iniciarJogo, dadosUsuario, bancoDePalavras = {}, estadoBanco = 'pronto', erroBanco = '', recarregarBanco, usuario, setDadosUsuario, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const alas = useMemo(() => {
    const grupos = new Map();
    Object.entries(bancoDePalavras).forEach(([chave, palavras]) => {
      if (!Array.isArray(palavras) || !palavras.length) return;
      const divisor = chave.indexOf('-');
      const materia = divisor < 0 ? chave : chave.slice(0, divisor);
      const subMateria = divisor < 0 ? 'GERAL' : chave.slice(divisor + 1);
      if (!grupos.has(materia)) grupos.set(materia, []);
      grupos.get(materia).push({ chave, nome: subMateria, quantidade: palavras.length, palavras });
    });
    return [...grupos].map(([nome, topicos]) => ({ nome, topicos: topicos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [bancoDePalavras]);
  const [escolha, setEscolha] = useState(() => lerLocal(CHAVE_ESCOLHA) || {});
  const ala = alas.find(item => item.nome === escolha.ala) || alas[0];
  const topico = ala?.topicos.find(item => item.chave === escolha.topico) || ala?.topicos[0];
  const escolher = (novaAla, novoTopico) => { const valor = { ala: novaAla, topico: novoTopico }; setEscolha(valor); gravarLocal(CHAVE_ESCOLHA, valor); };
  const xpTopicos = dadosUsuario?.xpTopicos || {};
  const nivel = item => nivelDoTopico(xpTopicos[normalizar(item.chave)]);
  const tickets = Number(dadosUsuario?.tickets) || 0;
  const admin = dadosUsuario?.role === 'admin';
  const [folhaAdmin, setFolhaAdmin] = useState(false);
  const [nivelAdmin, setNivelAdmin] = useState('0');
  const [mensagemAdmin, setMensagemAdmin] = useState('');
  const [salvandoAdmin, setSalvandoAdmin] = useState(false);
  const voltar = () => setTelaAtual('menu');
  const topbar = <div className="topbar">
    <button className="icon-btn" onClick={voltar} aria-label="Voltar"><ChevronLeft /></button>
    <h1><small>{web ? 'Cruzadinhas médicas' : 'Cruzadinhas'}</small>Escolha sua ala</h1>
    {admin && topico && <button className="icon-btn" onClick={() => { setMensagemAdmin(''); setFolhaAdmin(true); }} aria-label="Ferramentas admin"><Settings2 /></button>}
    <span className="chip"><Ticket /><span>{web ? `${fmt(tickets)} tickets` : fmt(tickets)}</span></span>
  </div>;

  if (estadoBanco !== 'pronto' || !alas.length) return <div className={`cbt ${web ? 'web' : ''}`}><div className="cbt-scr r-topics">
    {topbar}
    <div className="scroll plain" role={estadoBanco === 'erro' ? 'alert' : 'status'} style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      {estadoBanco === 'carregando' && <div className="spin" />}
      <span>{estadoBanco === 'carregando' ? 'Carregando os tópicos do banco de palavras...' : estadoBanco === 'erro' ? (erroBanco || 'Não foi possível carregar os tópicos.') : 'O banco de palavras não tem termos válidos no momento.'}</span>
      {estadoBanco === 'erro' && <button className="primary" style={{ maxWidth: 260 }} onClick={recarregarBanco}>Tentar novamente</button>}
    </div>
  </div></div>;

  const xpEstimado = topico ? estimarXpCruzadinha(topico.palavras, nivel(topico).nivel) : 0;
  const lista = <div className="topics">{ala.topicos.map((item, i) => {
    const andamento = nivel(item);
    return <button key={item.chave} className={`topic rise ${item.chave === topico?.chave ? 'on' : ''}`} style={{ '--i': i }} onClick={() => escolher(ala.nome, item.chave)} aria-pressed={item.chave === topico?.chave}>
      <span className="topic-row"><span className="radio" /><strong>{titulo(item.nome)}</strong><small>{item.quantidade} termos</small></span>
      <span className="topic-meta">NÍVEL {andamento.nivel} · {andamento.pct}% para o próximo</span>
      <span className="bar"><span style={{ width: `${andamento.pct}%` }} /></span>
    </button>;
  })}</div>;
  const dock = <div className="dock">
    <div className="info"><span>RECOMPENSA ESTIMADA <b>~{fmt(xpEstimado)} XP</b></span><span>+2 TICKETS POR PLANTÃO</span></div>
    <button className="primary" disabled={!topico} onClick={() => iniciarJogo(titulo(ala.nome), titulo(topico.nome))}><Play fill="currentColor" /> Iniciar plantão</button>
  </div>;
  const folha = <AnimatePresence>
    {folhaAdmin && <>
      <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFolhaAdmin(false)} />
      <motion.form key="sh" className="sheet" role="dialog" aria-modal="true" aria-label="Ferramentas admin" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onSubmit={async evento => {
          evento.preventDefault(); setSalvandoAdmin(true); setMensagemAdmin('');
          try { setDadosUsuario(await servicoPerfil(usuario, 'admin', { operacao: 'setNivelCruzadinha', chaveXP: normalizar(topico.chave), valor: Number(nivelAdmin) })); setMensagemAdmin('Nível do tópico salvo.'); }
          catch (erro) { setMensagemAdmin(erro.message); } finally { setSalvandoAdmin(false); }
        }}>
        <h3>Ferramentas admin</h3>
        <p>Nível de {titulo(topico.nome)}</p>
        <input className="mono" type="number" min="0" max="100" required value={nivelAdmin} onChange={evento => setNivelAdmin(evento.target.value)} aria-label="Nível do tópico"
          style={{ padding: 12, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--line-strong)', color: 'var(--text)' }} />
        <button className="primary" disabled={salvandoAdmin}>{salvandoAdmin ? 'Salvando...' : 'Definir nível'}</button>
        {mensagemAdmin && <p role="status">{mensagemAdmin}</p>}
        <button type="button" className="ghost" onClick={() => setFolhaAdmin(false)}>Fechar</button>
      </motion.form>
    </>}
  </AnimatePresence>;

  if (web) return <div className="cbt web"><div className="cbt-scr r-topics">
    {topbar}
    <div className="w-split">
      <aside className="w-col" aria-label="Alas">
        <span className="w-col-h">ALAS MÉDICAS <small>{alas.length} disponíveis</small></span>
        {alas.map((item, i) => {
          const pct = Math.round(item.topicos.reduce((s, t) => s + nivel(t).pct, 0) / item.topicos.length);
          return <button key={item.nome} className={`w-ala rise ${item.nome === ala.nome ? 'on' : ''}`} style={{ '--i': i }} onClick={() => escolher(item.nome, null)} aria-pressed={item.nome === ala.nome}>
            <span className="w-ala-t"><b>{titulo(item.nome)}</b><small>{item.topicos.length} {item.topicos.length === 1 ? 'tópico' : 'tópicos'}</small></span>
            <span className="topic-meta" style={{ margin: '10px 0 6px' }}>MAESTRIA {pct}%</span>
            <span className="bar"><span style={{ width: `${pct}%` }} /></span>
          </button>;
        })}
      </aside>
      <section className="w-main-panel" key={ala.nome}>
        <div className="scroll">
          <span className="kicker">Foco do plantão</span>
          <h2 className="w-h2">{titulo(ala.nome)}</h2>
          <p className="muted" style={{ marginBottom: 16 }}>Escolha um tópico para gerar a cruzadinha.</p>
          {lista}
        </div>
        {dock}
      </section>
    </div>
    {folha}
  </div></div>;

  return <div className="cbt"><div className="cbt-scr r-topics">
    {topbar}
    <div className="alas">{alas.map(item => <button key={item.nome} className={`ala ${item.nome === ala.nome ? 'on' : ''}`} onClick={() => escolher(item.nome, null)} aria-pressed={item.nome === ala.nome}>{titulo(item.nome)}</button>)}</div>
    <div className="scroll" key={ala.nome}>{lista}</div>
    {dock}
    {folha}
  </div></div>;
}
