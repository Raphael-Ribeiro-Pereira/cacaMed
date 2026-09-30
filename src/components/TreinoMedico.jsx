import { useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, CircleHelp, Stethoscope, Ticket, XCircle } from 'lucide-react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { progressoGlobal } from '../utils/economia';

export default function TreinoMedico({ modo, usuario, dadosUsuario, setDadosUsuario, setTelaAtual, servicoPerfil = chamarPerfilPlanilha }) {
  const [listar, setListar] = useState(false);
  const [escolha, setEscolha] = useState('');
  const [selecionadas, setSelecionadas] = useState([]);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null);
  const quiz = modo === 'quiz';
  const titulo = quiz ? 'Quiz médico' : 'Verdade ou mentira';
  const stats = dadosUsuario?.treinos?.[modo] || {};
  const entrada = stats.entrada;
  const ativa = entrada && !entrada.encerrada;
  const item = ativa && quiz ? entrada.itens[entrada.respostas.length] : null;
  const ultimo = ativa && quiz ? entrada.resultados.at(-1) : null;
  const nivel = progressoGlobal(dadosUsuario);
  const bloqueado = false;
  async function enviar(pedido) {
    if (ocupado) return;
    setOcupado(true); setErro(''); setPendente(pedido);
    try {
      const perfil = await servicoPerfil(usuario, pedido.acao, { ...pedido, modo });
      setDadosUsuario(perfil); setPendente(null); setListar(false); setEscolha(''); setSelecionadas([]);
    } catch (falha) { setErro(falha.message); }
    finally { setOcupado(false); }
  }
  async function recuperar() {
    setOcupado(true); setErro('');
    try {
      setDadosUsuario(await servicoPerfil(usuario, 'obterPerfil'));
      setPendente(null); setEscolha(''); setSelecionadas([]); setListar(false);
    } catch (falha) { setErro(falha.message); }
    finally { setOcupado(false); }
  }
  const voltar = () => {
    if ((escolha || selecionadas.length) && !window.confirm('Sair e descartar a seleção ainda não enviada? As respostas confirmadas ficam salvas.')) return;
    setTelaAtual('menu');
  };
  const alternar = id => setSelecionadas(anteriores => anteriores.includes(id) ? anteriores.filter(item => item !== id) : [...anteriores, id]);
  const relatorio = !listar && entrada?.relatorio;

  return <div className="stitch-page treino-page">
    <header className="stitch-header"><div className="stitch-brand"><span className="stitch-brand-icon"><Stethoscope size={22} /></span><span><strong>cacoMed</strong><small>TREINAMENTO MÉDICO</small></span></div><span className="stitch-header-ticket"><Ticket size={18} /> {dadosUsuario?.tickets || 0} tickets</span></header>
    <main className="stitch-content treino-content">
      <button className="stitch-back" disabled={ocupado || Boolean(pendente)} onClick={voltar}><ArrowLeft size={17} /> Centro de comando</button>
      <div className="stitch-heading"><div><span className="stitch-kicker">{quiz ? 'TEORIA E CASOS' : 'CURIOSIDADES, MITOS E ABSURDOS'}</span><h1>{titulo}</h1><p>{quiz ? 'Cinco perguntas. Uma alternativa por vez.' : 'Cinco frases. Selecione somente as verdadeiras e confirme o conjunto.'}</p></div>{quiz ? <Brain size={36} /> : <CircleHelp size={36} />}</div>
      <section className="treino-economy" aria-label="Recompensas"><span>Jogo gratuito</span><span>{quiz ? '20 XP por acerto em Teoria · 25 XP em Casos' : '20 XP por frase classificada corretamente'}</span><span>2 rodadas com ≥1 acerto → 1 ticket</span></section>
      {erro && <section className="stitch-panel treino-error" role="alert"><p>{erro}</p><p>O resultado só é confirmado depois de salvar. Reenviar o mesmo pedido não duplica XP nem tickets.</p>{pendente && <button className="stitch-primary" disabled={ocupado} onClick={() => enviar(pendente)}>Reenviar pedido</button>}<button className="stitch-back" disabled={ocupado} onClick={recuperar}>Consultar progresso salvo</button></section>}
      <p className="treino-status" role="status">{ocupado ? 'Salvando seu progresso…' : `Nível ${nivel.nivel} · ${nivel.xp.toLocaleString('pt-BR')} XP · Progresso de ticket deste modo: ${stats.medidor || 0}/2`}</p>
      {!ativa && !relatorio && <>
        {bloqueado && <p className="stitch-panel p-4">O banco inicial está em validação de conteúdo. Piloto disponível para administrador.</p>}
        <div className="stitch-dashboard-grid">
          {(quiz ? [['teoria', 'Teoria', 'Anatomia, fisiologia, conceitos e princípios de cuidado.', 100], ['casos', 'Casos clínicos', 'Situações curtas para interpretar e escolher uma resposta.', 125]] : [['misto', 'Desafiar meu radar', 'De 1 a 4 verdades por rodada. A quantidade é sorteada e fica em segredo até o resultado.', 100]]).map(([variante, nome, descricao, maximo]) => <section className="stitch-mode" key={variante}><h2>{nome}</h2><p>{descricao}</p><span className="stitch-mode-stat">Até {maximo} XP · nenhum ticket consumido</span><button className="stitch-primary" disabled={ocupado || Boolean(pendente) || bloqueado} onClick={() => enviar({ acao: 'iniciarTreino', variante, entradaId: crypto.randomUUID() })}>Iniciar rodada <ArrowRight size={18} /></button></section>)}
        </div>
      </>}
      {ativa && <>
        <section className="stitch-panel treino-question">
          <div className="treino-question-header"><span className="stitch-kicker">{quiz ? `${entrada.variante === 'casos' ? 'CASOS CLÍNICOS' : 'TEORIA'} · PERGUNTA ${entrada.respostas.length + 1}/5` : 'UMA RODADA · CINCO FRASES'}</span><span>{quiz ? item.tema : `${selecionadas.length} selecionadas`}</span></div>
          {quiz ? <fieldset disabled={ocupado || Boolean(pendente)}><legend>{item.enunciado}</legend><div className="treino-options">{item.opcoes.map((opcao, i) => <label key={opcao.id} className={escolha === opcao.id ? 'is-selected' : ''}><input type="radio" name={item.id} value={opcao.id} checked={escolha === opcao.id} onChange={() => setEscolha(opcao.id)} /><span className="treino-option-letter">{'ABCD'[i]}</span><span>{opcao.texto}</span></label>)}</div></fieldset> : <fieldset disabled={ocupado || Boolean(pendente)}><legend>Quais destas afirmações são verdadeiras?</legend><p className="treino-hint">Há pelo menos uma verdade e uma mentira. Frases não selecionadas serão consideradas falsas.</p><div className="treino-options">{entrada.itens.map((frase, i) => <label key={frase.id} className={selecionadas.includes(frase.id) ? 'is-selected' : ''}><input type="checkbox" checked={selecionadas.includes(frase.id)} onChange={() => alternar(frase.id)} /><span className="treino-option-letter">{i + 1}</span><span>{frase.texto}</span></label>)}</div></fieldset>}
          <button className="stitch-primary treino-submit" disabled={ocupado || Boolean(pendente) || (quiz ? !escolha : selecionadas.length < 1 || selecionadas.length > 4)} onClick={() => enviar({ acao: 'responderTreino', entradaId: entrada.id, respostas: quiz ? [...entrada.respostas, { itemId: item.id, escolha }] : entrada.itens.map(frase => ({ itemId: frase.id, escolha: selecionadas.includes(frase.id) })) })}>{quiz ? 'Confirmar resposta' : 'Confirmar as cinco frases'} <ArrowRight size={18} /></button>
          {!quiz && <p className="treino-hint">Selecione de 1 a 4 frases. A avaliação considera as marcadas e as deixadas como falsas.</p>}
        </section>
        {ultimo && <section className="stitch-panel treino-feedback" role="status"><strong>{ultimo.acertou ? 'Resposta anterior correta' : 'Resposta anterior para revisar'}</strong><p>{ultimo.explicacao}</p><a href={ultimo.fonte} target="_blank" rel="noreferrer">Consultar referência</a></section>}
        <button className="stitch-back treino-abandon" disabled={ocupado || Boolean(pendente)} onClick={() => { if (window.confirm('Encerrar esta rodada sem recompensa? As respostas já confirmadas ficam registradas.')) enviar({ acao: 'abandonarTreino', entradaId: entrada.id }); }}>Abandonar rodada</button>
      </>}
      {relatorio && <>
        <section className="stitch-panel treino-result"><span className="stitch-kicker">RODADA SALVA</span><h2>{relatorio.acertos}/5 {quiz ? 'respostas corretas' : 'frases classificadas corretamente'}</h2><div className="treino-result-metrics"><span><strong>+{relatorio.xp}</strong> XP do jogo</span><span><strong>+{relatorio.xpMissoes}</strong> XP de missões</span><span><strong>+{relatorio.ticketsRodada + relatorio.ticketsMissoes + relatorio.ticketsNivel}</strong> tickets</span></div><p>{relatorio.valida ? `Rodada válida para o ticket. Progresso: ${relatorio.medidor}/2${relatorio.ticketsRodada ? ' · 1 ticket de jogo concedido.' : ' · mais uma rodada válida concede 1 ticket.'}` : 'Nenhum acerto: esta rodada não avança o contador de tickets.'}</p>{relatorio.ticketsMissoes > 0 && <p>Missões concluídas: +{relatorio.ticketsMissoes} ticket(s).</p>}{relatorio.ticketsNivel > 0 && <p>Subida de nível: +{relatorio.ticketsNivel} ticket(s).</p>}<p>Seus erros foram registrados para a revisão futura.</p><button className="stitch-primary" disabled={ocupado || Boolean(pendente)} onClick={() => setListar(true)}>Nova rodada <ArrowRight size={18} /></button></section>
        <div className="treino-review">{entrada.resultados.map((resultado, i) => {
          const q = entrada.itens[i];
          const texto = valor => quiz ? q.opcoes.find(o => o.id === valor)?.texto : valor ? 'Verdadeira' : 'Falsa';
          return <section className="stitch-panel treino-feedback" key={resultado.itemId}><h3>{resultado.acertou ? <CheckCircle2 size={20} /> : <XCircle size={20} />} {i + 1}. {quiz ? q.enunciado : q.texto}</h3><p>Sua resposta: <strong>{texto(resultado.escolha)}</strong> · {resultado.acertou ? 'Correta' : 'Para revisar'}</p>{!resultado.acertou && <p>Gabarito: <strong>{texto(resultado.correta)}</strong></p>}<p>{resultado.explicacao}</p><a href={resultado.fonte} target="_blank" rel="noreferrer">Fonte e explicação de referência</a></section>;
        })}</div>
      </>}
    </main>
  </div>;
}
