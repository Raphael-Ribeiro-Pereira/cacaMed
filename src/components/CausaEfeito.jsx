import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ExternalLink, GitBranch, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { ELOS, obterRelacao } from '../utils/causaEfeito';
import { lerVitais } from '../utils/ddxVisual';
import { useLargo } from '../utils/prototipo';
import { Vitais } from './ddxUi';
import { useEnvioDdx } from './ddxTela';
import { Resultado, SubiuNivel } from './resultadoUi';

// Causa e efeito (desenho novo, 13/10/2026): o jogador monta o circuito colocando cartas nos quatro elos, do
// estímulo ao tratamento, e testa. A correção é do servidor; o resultado mostra em que elo a corrente quebra.
function Circuito({ relacao, colocadas, resultado, aoToque, proximo }) {
  return <div className="dx-map" role="list" aria-label="Circuito causal">
    <div className="dx-slot stim" role="listitem"><span className="dot">♥</span><div><div className="lab">Estímulo</div><div className="fill">{relacao.estimulo}</div></div></div>
    {ELOS.map((elo, k) => {
      const carta = colocadas[k] && relacao.cartas.find(c => c.id === colocadas[k]);
      const res = resultado ? resultado[k] : null;
      const estado = res === true ? 'ok' : res === false ? 'miss' : carta ? 'has' : k === proximo ? 'next' : '';
      const quebrou = resultado && resultado.findIndex(r => !r) === k;
      return <div key={elo.id} style={{ display: 'contents' }}>
        <div className={`dx-wire ${resultado ? (res === false || (resultado.findIndex(r => !r) >= 0 && k > resultado.findIndex(r => !r)) ? 'broken' : 'ok') : carta ? 'lit' : ''}`} />
        <div className={`dx-slot ${estado}`} role="listitem">
          <span className="dot">{res === true ? <Check size={14} /> : res === false ? <X size={14} /> : k + 1}</span>
          <div><div className="lab">{elo.rotulo}{quebrou ? ' · a corrente quebra aqui' : ''}</div>
            {aoToque && carta ? <button className="fill" onClick={() => aoToque(k)} aria-label={`Devolver a carta do elo ${elo.rotulo}`}>{carta.texto}</button>
              : <div className="fill">{carta ? carta.texto : k === proximo ? 'Escolha uma carta abaixo' : '—'}</div>}</div>
        </div>
      </div>;
    })}
  </div>;
}

export default function CausaEfeito({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const entrada = dadosUsuario?.causaEfeito?.entrada;
  let relacao = null;
  try { relacao = entrada ? obterRelacao(entrada.relacaoId) : null; } catch { relacao = null; }
  const [colocadas, setColocadas] = useState([null, null, null, null]);
  const { estado, enviar, subiu, setSubiu } = useEnvioDdx({ usuario, dadosUsuario, setDadosUsuario, servicoPerfil, acao: 'responderRelacao', entradaId: entrada?.id });
  const voltar = () => setTelaAtual('selecaoDDX');
  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;
  const topbar = <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar ao DDX"><ChevronLeft /></button>
    <h1><small>Causa e efeito{relacao ? ` · ${relacao.paciente}` : ''}</small>{relacao?.titulo || 'Causa e efeito'}</h1></div>;

  if (!entrada || !relacao) return raiz(<div className="cbt-scr">{topbar}
    <div className="scroll plain" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <span>Nenhum mapa aberto. Escolha um caso no DDX para começar.</span>
      <button className="primary violet" style={{ maxWidth: 260 }} onClick={voltar}>Ir para o DDX</button>
    </div></div>);

  const vitais = lerVitais(relacao.vitais);
  if (entrada.relatorio) {
    const r = entrada.relatorio;
    const resultado = r.etapas.map(e => e.acertou);
    const respondidas = r.etapas.map((e, k) => relacao.cartas.find(c => c.texto === e.escolha)?.id || colocadas[k]);
    const linhas = r.etapas.map((e, k) => [`${ELOS[k].rotulo} ${e.acertou ? '✓' : '✗'}`, e.acertou ? '+25' : '+0', e.acertou ? 'pos' : 'mut']);
    if (entrada.repeticao) linhas.push(['Repetição da versão', '×0', 'mut']);
    return raiz(<Resultado key={entrada.id} stamp={resultado.every(Boolean) ? 'CIRCUITO FECHADO' : 'CIRCUITO COM FALHA'} tom={resultado.every(Boolean) ? 'violet' : 'amber'} recibo={entrada.id}
      sub={`${relacao.titulo} · ${r.acertos}/${r.total} elos`} linhas={linhas} total={Number(entrada.xpConcedido) || 0} fase="ok"
      aviso={entrada.repeticao ? 'Repetição: XP só na primeira conclusão desta versão.' : null}
      principal={{ rotulo: 'Voltar ao DDX', aoClicar: voltar }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={<>
        <Circuito relacao={relacao} colocadas={respondidas} resultado={resultado} />
        {r.etapas.map((e, k) => <div key={e.id} className="det">
          <b className={e.acertou ? 'yes' : 'no'}>{e.acertou ? <Check /> : <X />}{ELOS[k].rotulo}</b>
          {!e.acertou && <><p>Sua carta: {e.escolha}</p><p>Carta certa: {e.correta}</p></>}
          <p style={{ color: 'var(--muted)' }}>{e.explicacao}</p>
        </div>)}
        {/^https:\/\//.test(relacao.fonte || '') && <a className="det" href={relacao.fonte} target="_blank" rel="noreferrer" style={{ color: 'var(--mint)', display: 'flex', gap: 6, alignItems: 'center' }}>Fonte do caso <ExternalLink size={13} /></a>}
      </>} />);
  }

  const proximo = colocadas.findIndex(c => !c);
  const cheio = proximo < 0;
  const usadas = new Set(colocadas.filter(Boolean));
  const colocar = id => { if (proximo >= 0 && estado !== 'enviando') setColocadas(c => c.map((x, k) => (k === proximo ? id : x))); };
  const devolver = k => { if (estado !== 'enviando') setColocadas(c => c.map((x, i) => (i === k ? null : x))); };
  const testar = () => enviar(colocadas);

  const painel = <>
    <div className="monitor"><div className="mon-head"><div><b>{relacao.paciente}</b><small>{relacao.cenario}</small></div><span className="state">{relacao.tema.toUpperCase()}</span></div><Vitais v={vitais} /></div>
    <p className="q" style={{ marginTop: 12 }}>{relacao.contexto}</p>
  </>;
  const mao = <>
    <div className="sec" style={{ margin: '14px 2px 8px' }}><h2>Sua mão</h2><span>{relacao.cartas.length - usadas.size} cartas</span></div>
    <div className="dx-deck">{relacao.cartas.map(c => <button key={c.id} disabled={usadas.has(c.id) || cheio || estado === 'enviando'} onClick={() => colocar(c.id)}>{c.texto}</button>)}</div>
  </>;
  const dock = <div className="dock">
    {estado === 'erro' && <div className="info" style={{ justifyContent: 'center' }}><button className="sync err" onClick={testar}><span className="dot" />Não gravou. Toque para reenviar</button></div>}
    <div className="info"><span>{ELOS.length} ELOS · <b>25 XP</b> CADA</span><span>O TESTE É FINAL</span></div>
    <button className="primary violet" disabled={!cheio || estado === 'enviando'} onClick={testar}>
      {estado === 'enviando' ? 'Testando o circuito…' : cheio ? <><GitBranch size={16} /> Testar circuito</> : `Faltam ${colocadas.filter(c => !c).length} elos`}</button>
  </div>;
  const circuito = <Circuito relacao={relacao} colocadas={colocadas} proximo={proximo} aoToque={devolver} />;

  if (web) return raiz(<div className="cbt-scr">{topbar}
    <div className="et-grid">
      <aside className="et-left"><div className="scroll" style={{ padding: 0 }}>{painel}{mao}</div></aside>
      <section className="et-right"><div className="scroll">{circuito}</div>{dock}</section>
    </div></div>);
  return raiz(<div className="cbt-scr">{topbar}
    <div className="scroll" style={{ paddingTop: 0 }}>{painel}<div style={{ height: 12 }} />{circuito}{mao}</div>
    {dock}
  </div>);
}
