import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { RELACOES, obterRelacao } from '../utils/causaEfeito';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

export default function CausaEfeito({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual }) {
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [pendente, setPendente] = useState(null);
  const [selecao, setSelecao] = useState('');
  const [listar, setListar] = useState(false);
  const trava = useRef(false);
  const entrada = dadosUsuario?.causaEfeito?.entrada;
  const auditoria = entrada ? obterRelacao(entrada.relacaoId) : null;
  const pergunta = auditoria?.perguntas[entrada.respostas.length];

  useEffect(() => {
    if (!pendente && !selecao) return;
    const avisar = evento => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [pendente, selecao]);

  async function enviar(acao, dados) {
    if (trava.current) return;
    trava.current = true; setOcupado(true); setErro(''); setPendente({ acao, dados });
    try {
      const perfil = await chamarPerfilPlanilha(usuario, acao, dados);
      setDadosUsuario(perfil); setPendente(null); setSelecao(''); setListar(false);
    } catch (e) { setErro(e.message || 'Não foi possível salvar o desafio.'); }
    finally { trava.current = false; setOcupado(false); }
  }

  async function recuperar() {
    if (trava.current || !window.confirm('Consultar o desafio salvo? A seleção ainda não confirmada será descartada.')) return;
    trava.current = true; setOcupado(true);
    try {
      const perfil = await chamarPerfilPlanilha(usuario, 'obterPerfil');
      setDadosUsuario(perfil); setPendente(null); setSelecao(''); setErro(''); setListar(false);
    } catch (e) { setErro(e.message); }
    finally { trava.current = false; setOcupado(false); }
  }

  return <div className="stitch-page">
    <header className="stitch-header"><div className="stitch-brand"><Stethoscope /><strong>cacoMed</strong></div><span>DDX · Causa e efeito</span></header>
    <main className="stitch-content">
      <button className="stitch-back" disabled={ocupado || Boolean(pendente)} onClick={() => { if (!selecao || window.confirm('Descartar a seleção ainda não confirmada? As respostas já salvas poderão ser retomadas.')) setTelaAtual('selecaoDDX'); }}><ArrowLeft size={17} /> Voltar aos modos DDX</button>
      <p role="status" aria-live="polite">{ocupado ? 'Salvando desafio…' : ''}</p>
      {erro && <section className="stitch-panel p-4 my-4" role="alert"><p>{erro}</p><p>Reenvie o mesmo pedido para recuperar a resposta sem duplicar ticket ou XP.</p>{pendente && <button className="stitch-primary" disabled={ocupado} onClick={() => enviar(pendente.acao, pendente.dados)}>Reenviar</button>}<button className="stitch-back" disabled={ocupado} onClick={recuperar}>Consultar desafio salvo</button></section>}
      {!entrada || listar ? <>
        <div className="stitch-heading"><div><h1>Causa e efeito</h1><p>Relacione mecanismo, consequência, compensação e efeito da intervenção.</p></div></div>
        <p>{dadosUsuario?.tickets || 0} tickets · 1 por desafio · repetições não concedem novo XP.</p>
        {RELACOES.map(item => {
          const { caso } = obterRelacao(item.id);
          return <section className="stitch-panel p-6" key={item.id}><span className="stitch-kicker">{caso.sistema}</span><h2>{item.titulo}</h2><p>{caso.paciente}</p>{!caso.revisado && <p>Em revisão clínica — piloto exclusivo do administrador.</p>}<button className="stitch-primary mt-4" disabled={ocupado || Boolean(pendente) || (!caso.revisado && dadosUsuario?.role !== 'admin') || !dadosUsuario?.tickets} onClick={() => enviar('iniciarRelacao', { relacaoId: item.id, entradaId: crypto.randomUUID() })}>Iniciar desafio · 1 ticket</button></section>;
        })}
      </> : <>
        <div className="stitch-heading"><div><span className="stitch-kicker">{auditoria.caso.sistema}</span><h1>Relações fisiológicas</h1><p>{auditoria.caso.paciente} · {auditoria.caso.queixa}</p></div></div>
        <section className="stitch-panel p-5 mb-6"><h2>Cenário clínico</h2><p>{auditoria.caso.vitais}</p><ol>{auditoria.registros.map(registro => <li key={registro} className="my-3">{registro}</li>)}</ol><p>{auditoria.contexto}</p></section>
        {entrada.relatorio ? <section className="stitch-panel p-6" aria-labelledby="relatorio-auditoria"><h2 id="relatorio-auditoria">Relatório do desafio</h2><p>{entrada.relatorio.acertos} de {entrada.relatorio.total} etapas corretas · XP confirmado: {entrada.xpConcedido}</p>{entrada.repeticao && <p>Este caso já foi concluído. Esta repetição não concede novo XP.</p>}{entrada.relatorio.etapas.map(etapa => <section key={etapa.id} className="my-5"><h3>{etapa.titulo}</h3><p>{etapa.acertou ? 'Correta' : 'Para revisar'} · Sua resposta: {etapa.escolha}</p>{!etapa.acertou && <p>Resposta esperada: {etapa.correta}</p>}<p>{etapa.explicacao}</p></section>)}<a href={auditoria.caso.fonte} target="_blank" rel="noreferrer">Referência para revisão clínica</a><p><button className="stitch-primary mt-4" onClick={() => setListar(true)}>Escolher próximo desafio</button></p></section> : <section className="stitch-panel p-6">
          <p>Etapa {entrada.respostas.length + 1} de {auditoria.perguntas.length}. As respostas confirmadas são salvas e não podem ser alteradas.</p>
          <fieldset disabled={ocupado || Boolean(pendente)}><legend className="text-lg mb-4">{pergunta.titulo}</legend>{pergunta.alternativas.map(alternativa => <label key={alternativa.id} className="block my-4"><input type="radio" name="resposta-auditoria" value={alternativa.id} checked={selecao === alternativa.id} onChange={() => setSelecao(alternativa.id)} /> {alternativa.texto}</label>)}</fieldset>
          <button className="stitch-primary" disabled={ocupado || Boolean(pendente) || !selecao} onClick={() => enviar('responderRelacao', { entradaId: entrada.id, respostas: [...entrada.respostas, selecao] })}>{entrada.respostas.length + 1 === auditoria.perguntas.length ? 'Concluir desafio' : 'Confirmar e continuar'}</button>
        </section>}
      </>}
    </main>
  </div>;
}
