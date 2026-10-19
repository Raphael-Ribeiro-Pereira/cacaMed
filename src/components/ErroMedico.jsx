import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ClipboardCheck, ExternalLink, X } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { CATEGORIAS_FALHA, obterAuditoria } from '../utils/erroMedico';
import { registrosComHora } from '../utils/ddxVisual';
import { useLargo } from '../utils/prototipo';
import { useEnvioDdx } from './ddxTela';
import { Resultado, SubiuNivel } from './resultadoUi';
import { XP_DDX } from '../utils/economia';

// Erro médico (desenho novo, 13/10/2026): o prontuário vira um papel. O jogador toca na linha onde o cuidado
// falhou, escolhe o tipo da falha e a correção. O servidor recebe as três etapas juntas e recalcula o resultado.
const ETAPAS = ['Toque no registro onde o cuidado falhou.', 'Que tipo de falha foi essa?', 'Qual seria a correção?'];

function Prontuario({ auditoria, selecionada, falha, aoToque, desabilitado }) {
  return <div className="dx-paper">
    <div className="hd"><span>Prontuário · {auditoria.tema}</span><span>{auditoria.paciente}</span></div>
    {registrosComHora(auditoria.registros).map(([hora, texto], k) => {
      const classe = `dx-row ${selecionada === k + 1 ? 'sel' : ''} ${falha === k + 1 ? 'flag' : ''}`;
      const conteudo = <><time>{hora}</time><p>{texto}</p></>;
      return aoToque
        ? <button key={k} className={classe} disabled={desabilitado} onClick={() => aoToque(k + 1)} aria-pressed={selecionada === k + 1}>{conteudo}</button>
        : <div key={k} className={classe}>{conteudo}</div>;
    })}
  </div>;
}

export default function ErroMedico({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const web = useLargo();
  const entrada = dadosUsuario?.erroMedico?.entrada;
  let auditoria = null;
  try { auditoria = entrada ? obterAuditoria(entrada.auditoriaId) : null; } catch { auditoria = null; }
  const [etapa, setEtapa] = useState(0);
  const [linha, setLinha] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [correcao, setCorrecao] = useState(null);
  const { estado, enviar, subiu, setSubiu } = useEnvioDdx({ usuario, dadosUsuario, setDadosUsuario, servicoPerfil, acao: 'responderAuditoria', entradaId: entrada?.id });
  const voltar = () => setTelaAtual('selecaoDDX');
  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;
  const topbar = <div className="topbar"><button className="icon-btn" onClick={voltar} aria-label="Voltar ao DDX"><ChevronLeft /></button>
    <h1><small>Erro médico{auditoria ? ` · ${auditoria.paciente}` : ''}</small>{auditoria?.titulo || 'Erro médico'}</h1></div>;

  if (!entrada || !auditoria) return raiz(<div className="cbt-scr">{topbar}
    <div className="scroll plain" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <span>Nenhuma auditoria aberta. Escolha um caso no DDX para começar.</span>
      <button className="primary violet" style={{ maxWidth: 260 }} onClick={voltar}>Ir para o DDX</button>
    </div></div>);

  if (entrada.relatorio) {
    const r = entrada.relatorio;
    const linhaServidor = Number(String(entrada.respostas?.[0] || '').slice(1)) || linha;
    // Economia v3: as etapas só mostram o acerto; o XP sai em base (300) e bônus.
    const xp = Number(entrada.xpConcedido) || 0;
    const linhas = [...r.etapas.map(e => [`${e.id === 'linha' ? 'Registro' : e.id === 'categoria' ? 'Tipo da falha' : 'Correção'} ${e.acertou ? '✓' : '✗'}`, '', e.acertou ? 'pos' : 'mut']),
      ['Análise concluída', xp ? `+${XP_DDX}` : '+0', xp ? 'pos' : 'mut'], ...(xp > XP_DDX ? [['Bônus', `+${xp - XP_DDX}`, 'pos']] : [])];
    if (entrada.repeticao) linhas.push(['Repetição da versão', '×0', 'mut']);
    const tudo = r.acertos === r.total;
    return raiz(<Resultado key={entrada.id} stamp={tudo ? 'AUDITORIA CONCLUÍDA' : 'AUDITORIA COM PONTOS'} tom={tudo ? 'violet' : 'amber'} recibo={entrada.id}
      sub={`${auditoria.titulo} · ${r.acertos}/${r.total} acertos`} linhas={linhas} total={Number(entrada.xpConcedido) || 0} fase="ok"
      aviso={entrada.repeticao ? 'Repetição: XP só na primeira conclusão desta versão.' : null}
      principal={{ rotulo: 'Voltar ao DDX', aoClicar: voltar }} aoVoltar={() => setTelaAtual('menu')}
      detalhes={<>
        <Prontuario auditoria={auditoria} selecionada={linhaServidor !== auditoria.falha.linha ? linhaServidor : null} falha={auditoria.falha.linha} />
        {r.etapas.map(e => <div key={e.id} className="det">
          <b className={e.acertou ? 'yes' : 'no'}>{e.acertou ? <Check /> : <X />}{e.titulo}</b>
          <p>Sua resposta: {e.escolha}</p>
          {!e.acertou && <p>Esperada: {e.correta}</p>}
          <p style={{ color: 'var(--muted)' }}>{e.explicacao}</p>
        </div>)}
        {/^https:\/\//.test(auditoria.fonte || '') && <a className="det" href={auditoria.fonte} target="_blank" rel="noreferrer" style={{ color: 'var(--mint)', display: 'flex', gap: 6, alignItems: 'center' }}>Fonte do caso <ExternalLink size={13} /></a>}
      </>} />);
  }

  const bloqueado = estado === 'enviando';
  const escolhido = [linha, categoria, correcao][etapa];
  const pronto = escolhido != null;
  const confirmar = () => {
    if (!pronto || bloqueado) return;
    if (etapa < 2) { setEtapa(etapa + 1); return; }
    enviar([`l${linha}`, categoria, correcao]);
  };
  const passos = <div className="stepper" style={{ marginBottom: 4 }}>{ETAPAS.map((_, k) => <span key={k} className={k < etapa ? 'done' : k === etapa ? 'cur' : ''} />)}</div>;
  const corpo = <div className="dx-stage">
    {passos}
    <span className="kicker" style={{ color: '#b49cff' }}>Etapa {etapa + 1} de 3</span>
    <p className="q">{ETAPAS[etapa]}</p>
    {etapa === 0 && <><Prontuario auditoria={auditoria} selecionada={linha} aoToque={setLinha} desabilitado={bloqueado} />
      <div className="det" style={{ marginTop: 4 }}><b><ClipboardCheck size={15} /> Antes de começar</b><p>{auditoria.contexto}</p></div></>}
    {etapa === 1 && <div className="dx-chips" role="radiogroup" aria-label="Tipo da falha">{CATEGORIAS_FALHA.map(c =>
      <button key={c.id} role="radio" aria-checked={categoria === c.id} className={categoria === c.id ? 'on' : ''} onClick={() => setCategoria(c.id)}>{c.texto}</button>)}</div>}
    {etapa === 2 && <div className="opts">{auditoria.correcoes.map((c, k) =>
      <button key={c.id} className={`opt ${correcao === c.id ? 'on' : ''}`} onClick={() => setCorrecao(c.id)} aria-pressed={correcao === c.id}><span className="ltr">{'ABCD'[k]}</span><span>{c.texto}</span></button>)}</div>}
  </div>;
  const dock = <div className="dock">
    {estado === 'erro' && <div className="info" style={{ justifyContent: 'center' }}><button className="sync err" onClick={() => enviar([`l${linha}`, categoria, correcao])}><span className="dot" />Não gravou. Toque para reenviar</button></div>}
    <div className="info"><span>3 ETAPAS · <b>300 XP</b> + BÔNUS</span><span>RESPOSTAS NÃO MUDAM</span></div>
    <div style={{ display: 'flex', gap: 8 }}>
      {etapa > 0 && <button className="ghost" style={{ width: 'auto', padding: '0 16px' }} disabled={bloqueado} onClick={() => setEtapa(etapa - 1)}>Voltar</button>}
      <button className="primary violet" disabled={!pronto || bloqueado} onClick={confirmar}>{bloqueado ? 'Registrando o parecer…' : etapa < 2 ? 'Continuar' : 'Registrar parecer'}</button>
    </div>
  </div>;
  return raiz(<div className="cbt-scr">{topbar}<div className="scroll" style={{ paddingTop: 0 }}>{corpo}</div>{dock}</div>);
}
