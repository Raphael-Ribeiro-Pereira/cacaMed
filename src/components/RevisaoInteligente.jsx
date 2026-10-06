import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, RotateCcw, Stethoscope, XCircle } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

const ROTULO_MODO = { quiz: 'QUIZ', verdadeMentira: 'VERDADE OU MENTIRA', batalha: 'BATALHA DIAGNÓSTICA' };
const quandoRevisar = data => !data ? 'Sem data prevista' : Date.parse(data) <= Date.now() ? 'Na próxima sessão disponível'
  : new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function RevisaoInteligente({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const [escolha, setEscolha] = useState(null);
  const [listar, setListar] = useState(false);
  const piloto = dadosUsuario?.role !== 'admin';
  const stats = dadosUsuario?.revisao || {};
  const resumo = stats.resumo;
  const entrada = stats.entrada;
  const ativa = entrada && !entrada.encerrada;
  const item = ativa ? entrada.itens[entrada.resultados.length] : null;
  const ultimo = ativa ? entrada.resultados.at(-1) : null;
  const relatorio = !listar && entrada?.relatorio;
  const bloqueado = carregando || ocupado || Boolean(pendente);

  useEffect(() => {
    let atual = true;
    servicoPerfil(usuario, 'consultarRevisao').then(perfil => { if (atual) setDadosUsuario(perfil); })
      .catch(falha => { if (atual) setErro(falha.message); })
      .finally(() => { if (atual) setCarregando(false); });
    return () => { atual = false; };
  }, [usuario, servicoPerfil, setDadosUsuario]);

  async function enviar(pedido) {
    if (ocupado) return;
    setOcupado(true); setErro(''); setPendente(pedido);
    try {
      const perfil = await servicoPerfil(usuario, pedido.acao, pedido);
      setDadosUsuario(perfil); setPendente(null); setEscolha(null);
      if (pedido.acao !== 'consultarRevisao') setListar(false);
    } catch (falha) { setErro(falha.message); }
    finally { setOcupado(false); }
  }
  const consultar = () => enviar({ acao: 'consultarRevisao' });
  const voltar = () => {
    if (escolha !== null && !window.confirm('Sair e descartar a seleção ainda não enviada? As respostas confirmadas ficam salvas.')) return;
    setTelaAtual('menu');
  };
  const feedback = (resultado, q, i) => {
    const texto = valor => q.modo !== 'verdadeMentira' ? q.opcoes.find(o => o.id === valor)?.texto : valor ? 'Verdadeira' : 'Falsa';
    return <section className="stitch-panel treino-feedback" key={`${resultado.modo}-${resultado.itemId}`}>
      <h3>{resultado.acertou ? <CheckCircle2 size={20} /> : <XCircle size={20} />}{i + 1}. {q.enunciado || q.texto}</h3>
      <p>Sua resposta: <strong>{texto(resultado.escolha)}</strong> · {resultado.acertou ? 'Correta' : 'Para revisar'}</p>
      {!resultado.acertou && <p>Resposta correta: <strong>{texto(resultado.correta)}</strong></p>}
      <p>{resultado.explicacao}</p><p>Próxima revisão: {quandoRevisar(resultado.proximaRevisao)}</p>
      {/^https?:\/\//.test(resultado.fonte) ? <a href={resultado.fonte} target="_blank" rel="noreferrer">Consultar referência</a> : resultado.fonte && <p>Fonte: {resultado.fonte}</p>}
    </section>;
  };

  return <div className="stitch-page treino-page">
    <header className="stitch-header"><div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>REVISÃO DO APRENDIZADO</small></span></div><span className="stitch-header-label">PILOTO</span></header>
    <main className="stitch-content treino-content">
      <button className="stitch-back" disabled={bloqueado} onClick={voltar}><ArrowLeft size={17} /> Centro de comando</button>
      <div className="stitch-heading"><div><span className="stitch-kicker">APRENDA COM SEUS ERROS</span><h1>Revisão inteligente</h1><p>Até cinco itens dos seus erros anteriores. Cada acerto aumenta o intervalo para rever o assunto.</p></div><BookOpen size={36} /></div>
      <section className="treino-economy" aria-label="Regras da revisão"><span>Gratuito · sem consumir tickets</span><span>Sem XP ou tickets de recompensa</span><span>Seu progresso fica salvo</span></section>
      {erro && <section className="stitch-panel treino-error" role="alert"><p>{erro}</p><p>As respostas confirmadas são preservadas. Reenvio não duplica tentativas.</p>{pendente && <button className="stitch-primary" disabled={ocupado} onClick={() => enviar(pendente)}>Reenviar pedido</button>}<button className="stitch-back" disabled={ocupado} onClick={consultar}>Consultar revisão salva</button></section>}
      <p className="treino-status" role="status">{carregando ? 'Consultando seus erros…' : ocupado ? 'Salvando sua revisão…' : `${stats.itens || 0} ${stats.itens === 1 ? 'item revisado' : 'itens revisados'} · ${stats.acertos || 0} ${stats.acertos === 1 ? 'acerto' : 'acertos'}`}</p>
      {piloto && <p className="stitch-panel revisao-empty">Piloto disponível para administrador enquanto validamos os intervalos e a experiência.</p>}
      {!piloto && !carregando && !ativa && !relatorio && <section className="stitch-panel revisao-empty">
        {!resumo ? <><h2>Vamos consultar sua fila</h2><p>Carregue o progresso salvo para começar.</p></> : resumo.disponiveis ? <><h2>{resumo.disponiveis} {resumo.disponiveis === 1 ? 'item disponível' : 'itens disponíveis'}</h2><p>Esta sessão terá até cinco itens. Você pode sair e retomar depois.</p></> : resumo.total ? <><h2>Revisão em dia</h2><p>Seus itens estão aguardando o próximo intervalo. Volte em {quandoRevisar(resumo.proximaRevisao)}.</p></> : <><h2>Seu aprendizado começa nos jogos</h2><p>Você ainda não tem itens para revisar. Jogue uma rodada para criar sua primeira revisão.</p></>}
        {resumo?.disponiveis > 0 && <button className="stitch-primary" disabled={bloqueado} onClick={() => enviar({ acao: 'iniciarRevisao', revisaoId: crypto.randomUUID() })}>Iniciar revisão <ArrowRight size={18} /></button>}
        <button className="stitch-back" disabled={bloqueado} onClick={consultar}><RotateCcw size={17} /> Atualizar fila</button>
      </section>}
      {ativa && item && <>
        <section className="stitch-panel treino-question">
          <div className="treino-question-header"><span className="stitch-kicker">ITEM {entrada.resultados.length + 1}/{entrada.itens.length} · {ROTULO_MODO[item.modo] || 'REVISÃO'}</span><span>{item.tema}</span></div>
          <fieldset disabled={bloqueado}><legend>{item.enunciado || item.texto}</legend><div className="treino-options">{(item.modo !== 'verdadeMentira' ? item.opcoes : [{ id: true, texto: 'Verdadeira' }, { id: false, texto: 'Falsa' }]).map((opcao, i) => <label key={String(opcao.id)} className={escolha === opcao.id ? 'is-selected' : ''}><input type="radio" name={item.id} checked={escolha === opcao.id} onChange={() => setEscolha(opcao.id)} /><span className="treino-option-letter">{'ABCD'[i]}</span><span>{opcao.texto}</span></label>)}</div></fieldset>
          <button className="stitch-primary treino-submit" disabled={bloqueado || escolha === null} onClick={() => enviar({ acao: 'responderRevisao', revisaoId: entrada.id, itemId: item.id, versao: item.versao, escolha })}>Confirmar resposta <ArrowRight size={18} /></button>
        </section>
        {ultimo && feedback(ultimo, entrada.itens[entrada.resultados.length - 1], entrada.resultados.length - 1)}
        <button className="stitch-back treino-abandon" disabled={bloqueado} onClick={() => { if (window.confirm('Encerrar esta sessão? As respostas confirmadas ficam salvas; os demais itens continuam na fila.')) enviar({ acao: 'encerrarRevisao', revisaoId: entrada.id }); }}>Encerrar esta sessão</button>
      </>}
      {relatorio && <>
        <section className="stitch-panel treino-result"><span className="stitch-kicker">REVISÃO SALVA{entrada.abandonada ? ' · ENCERRADA ANTES DO FINAL' : ''}</span><h2>{relatorio.respondidos ? `${relatorio.acertos}/${relatorio.respondidos} respostas corretas` : 'Sessão encerrada sem respostas'}</h2><p>{relatorio.respondidos} de {relatorio.total} itens revisados.</p>{relatorio.temas.length > 0 && <p>Temas: {relatorio.temas.join(' · ')}</p>}<p>Próxima reapresentação: {quandoRevisar(relatorio.proximaRevisao)}</p><p>Os itens respondidos voltam com os intervalos programados. Seus jogos continuam disponíveis.</p><button className="stitch-primary" disabled={bloqueado} onClick={() => { setListar(true); consultar(); }}>Ver próxima revisão <ArrowRight size={18} /></button></section>
        <div className="treino-review">{entrada.resultados.map((r, i) => feedback(r, entrada.itens[i], i))}</div>
      </>}
    </main>
  </div>;
}
