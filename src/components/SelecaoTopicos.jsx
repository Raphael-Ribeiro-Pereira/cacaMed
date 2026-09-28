import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Play, Stethoscope, Ticket } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import AdminSpeedDial from './AdminSpeedDial';

const normalizar = valor => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const titulo = valor => valor.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, letra => letra.toLocaleUpperCase('pt-BR'));
const progresso = xp => {
  const total = Number(xp) || 0;
  if (!total) return { nivel: 0, percentual: 0, atual: 0, proximo: 1000 };
  const nivel = Math.floor(Math.sqrt(total / 1000)) + 1;
  const piso = (nivel - 1) ** 2 * 1000;
  const teto = nivel ** 2 * 1000;
  return { nivel, percentual: Math.round((total - piso) / (teto - piso) * 100), atual: total - piso, proximo: teto - piso };
};

export default function SelecaoTopicos({ setTelaAtual, iniciarJogo, dadosUsuario, bancoDePalavras = {}, estadoBanco = 'pronto', erroBanco = '', recarregarBanco, usuario, setDadosUsuario }) {
  const alas = useMemo(() => {
    const grupos = new Map();
    Object.entries(bancoDePalavras).forEach(([chave, palavras]) => {
      if (!Array.isArray(palavras) || !palavras.length) return;
      const divisor = chave.indexOf('-');
      const materia = divisor < 0 ? chave : chave.slice(0, divisor);
      const subMateria = divisor < 0 ? 'GERAL' : chave.slice(divisor + 1);
      if (!grupos.has(materia)) grupos.set(materia, []);
      grupos.get(materia).push({ chave, nome: subMateria, quantidade: palavras.length });
    });
    return [...grupos].map(([nome, topicos]) => ({ nome, topicos: topicos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [bancoDePalavras]);
  const [alaSelecionada, setAlaSelecionada] = useState(null);
  const [topicoSelecionado, setTopicoSelecionado] = useState(null);
  const [nivelAdmin, setNivelAdmin] = useState('0');
  const [mensagemAdmin, setMensagemAdmin] = useState('');
  const [salvandoAdmin, setSalvandoAdmin] = useState(false);
  const ala = alas.find(item => item.nome === alaSelecionada) || alas[0];
  const topico = ala?.topicos.find(item => item.chave === topicoSelecionado) || ala?.topicos[0];
  const xpTopicos = dadosUsuario?.xpTopicos || {};
  const xpAla = ala?.topicos.reduce((total, item) => total + (Number(xpTopicos[normalizar(item.chave)]) || 0), 0) || 0;
  const statusAla = progresso(xpAla);

  return (
    <div className="stitch-page stitch-topic-select">
      <header className="stitch-header">
        <div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TERMINAL DE PLANTÃO</small></span></div>
        <span className="stitch-header-label">CRUZADINHAS MÉDICAS</span>
        <span className="stitch-header-ticket"><Ticket size={17} /> {Number(dadosUsuario?.tickets) || 0} tickets</span>
      </header>
      <main className="stitch-content">
        <button className="stitch-back" onClick={() => setTelaAtual('menu')}><ArrowLeft size={17} /> Voltar ao centro de comando</button>
        <div className="stitch-heading"><div><span className="stitch-kicker">SELEÇÃO DE PLANTÃO</span><h1>Escolha sua ala</h1><p>Selecione uma especialidade e o tópico que deseja estudar.</p></div><BookOpen size={34} /></div>
        {estadoBanco !== 'pronto' || alas.length === 0 ? <div className="stitch-panel stitch-empty" role={estadoBanco === 'erro' ? 'alert' : 'status'}><h2>{estadoBanco === 'carregando' ? 'Carregando tópicos...' : estadoBanco === 'erro' ? 'Não foi possível carregar os tópicos' : 'Não há tópicos disponíveis'}</h2><p>{estadoBanco === 'erro' ? erroBanco : estadoBanco === 'carregando' ? 'Consultando o banco de palavras.' : 'O banco de palavras não contém termos válidos no momento.'}</p>{estadoBanco === 'erro' && <button type="button" className="stitch-primary mt-4" onClick={recarregarBanco}>Tentar novamente</button>}</div> : (
          <div className="stitch-split">
            <section className="stitch-ala-list" aria-label="Especialidades">
              <h2>ALAS MÉDICAS <span>{alas.length} disponíveis</span></h2>
              {alas.map(item => {
                const xp = item.topicos.reduce((total, sub) => total + (Number(xpTopicos[normalizar(sub.chave)]) || 0), 0);
                const andamento = progresso(xp);
                return <button key={item.nome} className={`stitch-ala ${ala?.nome === item.nome ? 'is-selected' : ''}`} onClick={() => { setAlaSelecionada(item.nome); setTopicoSelecionado(null); }}>
                  <span className="stitch-ala-title"><span className="stitch-ala-icon"><Stethoscope size={21} /></span><span><strong>{titulo(item.nome)}</strong><small>{item.topicos.length} {item.topicos.length === 1 ? 'tópico' : 'tópicos'}</small></span><ChevronRight size={18} /></span>
                  <span className="stitch-ala-progress">DIFICULDADE {andamento.nivel} <span>{andamento.percentual}%</span></span>
                  <span className="stitch-progress"><span style={{ width: `${andamento.percentual}%` }} /></span>
                </button>;
              })}
            </section>
            <section key={ala.nome} className="stitch-panel stitch-topics">
              <div className="stitch-focus"><span className="stitch-focus-icon"><Stethoscope size={26} /></span><div><span className="stitch-kicker">FOCO DO PLANTÃO</span><h2>{titulo(ala.nome)}</h2><p>{ala.topicos.length} tópicos disponíveis</p></div><span className="stitch-level">DIFICULDADE {statusAla.nivel}</span></div>
              <div className="stitch-topics-inner"><h3>SISTEMAS E TÓPICOS DA ALA</h3><p>Escolha um tópico para gerar a cruzadinha.</p><div className="stitch-topic-list">
                {ala.topicos.map(item => { const andamento = progresso(xpTopicos[normalizar(item.chave)]); return <button key={item.chave} className={`stitch-topic ${topico?.chave === item.chave ? 'is-selected' : ''}`} onClick={() => setTopicoSelecionado(item.chave)}><span className="stitch-topic-row"><span className="stitch-radio" /><strong>{titulo(item.nome)}</strong><small>{item.quantidade} termos</small></span><span className="stitch-topic-detail">DIFICULDADE {andamento.nivel} · {andamento.atual}/{andamento.proximo} XP</span><span className="stitch-progress"><span style={{ width: `${andamento.percentual}%` }} /></span></button>; })}
              </div></div>
              <div className="stitch-topics-footer"><span>TÓPICO SELECIONADO: <strong>{titulo(topico.nome)}</strong></span><button className="stitch-primary" onClick={() => iniciarJogo(titulo(ala.nome), titulo(topico.nome))}><Play size={18} fill="currentColor" /> Iniciar plantão</button></div>
            </section>
          </div>
        )}
      </main>
      {dadosUsuario?.role === 'admin' && topico && <AdminSpeedDial titulo="Ferramentas admin · Cruzadinhas"><form className="flex flex-col gap-3" onSubmit={async evento => { evento.preventDefault(); setSalvandoAdmin(true); setMensagemAdmin(''); try { const perfil = await chamarPerfilPlanilha(usuario, 'admin', { operacao: 'setNivelCruzadinha', chaveXP: normalizar(topico.chave), valor: Number(nivelAdmin) }); setDadosUsuario(perfil); setMensagemAdmin('Dificuldade do tópico salva.'); } catch (erro) { setMensagemAdmin(erro.message); } finally { setSalvandoAdmin(false); } }}><label className="text-sm">Dificuldade de {titulo(topico.nome)}<input type="number" min="0" max="100" required value={nivelAdmin} onChange={evento => setNivelAdmin(evento.target.value)} className="mt-1 block w-full rounded-xl bg-[#0B1120] border border-cyan-500/30 p-2 text-white" /></label><button className="stitch-primary" disabled={salvandoAdmin}>Definir dificuldade</button>{mensagemAdmin && <span role="status" className="text-sm">{mensagemAdmin}</span>}</form></AdminSpeedDial>}
    </div>
  );
}
