import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Stethoscope, Ticket } from 'lucide-react';
import { CASOS_PLANTAO, obterCasoPlantao, executarPlantao } from '../utils/plantao';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

export default function PlantaoMedico({ usuario, dadosUsuario, setDadosUsuario, setTelaAtual }) {
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [grupo, setGrupo] = useState('Avaliação');
  const [pedidoPendente, setPedidoPendente] = useState(null);
  const [escolhasLocais, setEscolhasLocais] = useState(null);
  const trava = useRef(false);
  const entrada = dadosUsuario?.ddx?.entrada;
  const caso = entrada ? obterCasoPlantao(entrada.casoId) : null;
  const relatorio = caso ? executarPlantao(caso, escolhasLocais ?? entrada.relatorio.escolhas) : null;
  const naoSalvo = Boolean(escolhasLocais && JSON.stringify(escolhasLocais) !== JSON.stringify(entrada?.relatorio.escolhas));
  const [mostrarRelatorio, setMostrarRelatorio] = useState(Boolean(entrada));

  useEffect(() => {
    if (!naoSalvo && !pedidoPendente) return;
    const avisar = evento => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [naoSalvo, pedidoPendente]);

  async function enviar(acao, dados) {
    if (trava.current) return;
    trava.current = true;
    setOcupado(true); setErro(''); setPedidoPendente({ acao, dados });
    try {
      const perfil = await chamarPerfilPlanilha(usuario, acao, dados);
      setDadosUsuario(perfil); setPedidoPendente(null); setEscolhasLocais(null); setMostrarRelatorio(true);
    } catch (e) { setErro(e.message || 'Não foi possível salvar. Tente enviar novamente.'); }
    finally { trava.current = false; setOcupado(false); }
  }

  async function recuperarPerfil() {
    if (trava.current || !window.confirm('Consultar o último progresso salvo? Ações locais não confirmadas serão descartadas. Nenhum novo ticket será cobrado.')) return;
    trava.current = true;
    setOcupado(true);
    try {
      const perfil = await chamarPerfilPlanilha(usuario, 'obterPerfil');
      setDadosUsuario(perfil); setEscolhasLocais(null); setPedidoPendente(null); setErro(''); setMostrarRelatorio(Boolean(perfil.ddx?.entrada));
    } catch (e) { setErro(e.message || 'Não foi possível consultar o perfil.'); }
    finally { trava.current = false; setOcupado(false); }
  }

  const iniciar = item => enviar('iniciarPlantao', { casoId: item.id, entradaId: crypto.randomUUID() });
  const agir = id => {
    const escolhas = [...relatorio.escolhas, id];
    const novo = executarPlantao(caso, escolhas);
    if (novo.encerrado || id === 'reavaliar') enviar('acaoPlantao', { entradaId: entrada.id, escolhas });
    else setEscolhasLocais(escolhas);
  };
  const emPartida = entrada && mostrarRelatorio;
  return <div className="stitch-page">
    <header className="stitch-header"><div className="stitch-brand"><Stethoscope /><strong>cacoMed</strong></div><span>DDX · Plantão médico</span></header>
    <main className="stitch-content">
      <button className="stitch-back" disabled={ocupado || Boolean(pedidoPendente)} onClick={() => { if (!naoSalvo || window.confirm('Há ações não salvas. Voltar descarta apenas essas ações; o último progresso salvo poderá ser retomado. Deseja voltar?')) setTelaAtual('menu'); }}><ArrowLeft size={17} /> Voltar à central</button>
      <button className="stitch-back" disabled={ocupado || Boolean(pedidoPendente)} onClick={() => { if (!naoSalvo || window.confirm('Descartar ações ainda não salvas do Plantão?')) setTelaAtual('erroMedico'); }}>Abrir Erro médico</button>
      {naoSalvo && <p role="status">Há ações ainda não salvas. Salve antes de sair ou recarregar.</p>}
      {naoSalvo && <button className="stitch-primary" disabled={ocupado || Boolean(pedidoPendente)} onClick={() => enviar('acaoPlantao', { entradaId: entrada.id, escolhas: relatorio.escolhas })}>Salvar progresso</button>}
      {erro && <div className="stitch-panel p-4 my-4" role="alert"><p>{erro}</p><p>O resultado só é confirmado após a resposta do serviço. Reenviar não cobra novamente nem duplica XP.</p>{pedidoPendente && <button className="stitch-primary" disabled={ocupado} onClick={() => enviar(pedidoPendente.acao, pedidoPendente.dados)}>Reenviar</button>}<button className="stitch-back" disabled={ocupado} onClick={recuperarPerfil}>Consultar progresso salvo</button></div>}
      <p role="status" aria-live="polite">{ocupado ? 'Salvando atendimento…' : ''}</p>
      {!emPartida ? <>
        <div className="stitch-heading"><div><h1>Plantão médico</h1><p>Escolha o sistema e acompanhe o paciente até a decisão final.</p></div><Ticket /></div>
        <p>{dadosUsuario?.tickets || 0} tickets · 1 ticket por entrada · repetição de caso não concede novo XP.</p>
        <div className="stitch-dashboard-grid">{CASOS_PLANTAO.map(item => <section className="stitch-panel p-6" key={item.id}><span className="stitch-kicker">{item.sistema}</span><h2>{item.titulo}</h2><p>{item.paciente}</p><p>{item.queixa}</p>{!item.revisado && <p>Em revisão clínica — teste exclusivo do administrador.</p>}<button className="stitch-primary mt-4" disabled={ocupado || Boolean(pedidoPendente) || (!item.revisado && dadosUsuario?.role !== 'admin') || ((!entrada || entrada.relatorio.encerrado) && !dadosUsuario?.tickets)} onClick={() => entrada && !entrada.relatorio.encerrado ? setMostrarRelatorio(true) : iniciar(item)}>{entrada && !entrada.relatorio.encerrado ? 'Retomar plantão' : 'Iniciar plantão · 1 ticket'}</button></section>)}</div>
        <section className="stitch-panel p-6 mt-6"><h2>Próximos modos</h2><p>Erro médico: analisar e corrigir um atendimento já realizado.</p><p>Causa e efeito: compreender mecanismos e consequências no organismo.</p></section>
      </> : <>
        <div className="stitch-heading"><div><span className="stitch-kicker">{caso.sistema} · {relatorio.minutos} min simulados</span><h1>{caso.paciente}</h1><p>{caso.queixa}</p></div></div>
        <section className="stitch-panel p-5 mb-6"><h2>Prontuário</h2><p>{caso.vitais}</p><p>{relatorio.estadoPaciente}</p><p>Hipótese atual: {caso.acoes.find(a => a.id === relatorio.hipotese)?.texto || 'Não registrada'}</p></section>
        {relatorio.encerrado ? <section className="stitch-panel p-6 mb-6" aria-labelledby="titulo-relatorio"><h2 id="titulo-relatorio">Relatório do plantão</h2><p>{relatorio.seguro ? 'Atendimento completo com critérios de segurança cumpridos.' : 'Atendimento encerrado com pontos para revisão.'}</p><p>XP confirmado: {entrada.xpConcedido ?? 0}</p><p>Raciocínio: {relatorio.pontos.raciocinio} · Segurança: {relatorio.pontos.seguranca} · Eficiência: {relatorio.pontos.eficiencia} · Desconto: {relatorio.desconto}</p>{entrada.xpConcedido === 0 && <p>Este caso pode já ter sido concluído. A repetição serve para revisão.</p>}{relatorio.altaInsegura && <p>Alta antes de completar tratamento, reavaliação ou orientações.</p>}<h3>Omissões para revisar</h3>{relatorio.omissoes.length ? <ul>{relatorio.omissoes.map(id => <li key={id}>{caso.acoes.find(a => a.id === id).texto}</li>)}</ul> : <p>Nenhuma etapa essencial omitida.</p>}<p><a href={caso.fonte} target="_blank" rel="noreferrer">Referência clínica e materiais para revisão</a></p><button className="stitch-primary" onClick={() => setMostrarRelatorio(false)}>Escolher próximo plantão</button></section> : <section className="stitch-panel p-5 mb-6"><h2>Ações do atendimento</h2><p>Você pode alternar entre as etapas. Leia os resultados no prontuário abaixo.</p><nav className="stitch-tabs" aria-label="Etapas do atendimento">{[...new Set(caso.acoes.map(a => a.grupo))].map(nome => <button aria-pressed={grupo === nome} key={nome} onClick={() => setGrupo(nome)}>{nome}</button>)}</nav><div className="grid gap-3 mt-4">{caso.acoes.filter(a => a.grupo === grupo).map(a => {
          const feita = relatorio.escolhas.includes(a.id);
          const faltam = (a.exige || []).filter(id => !relatorio.escolhas.includes(id));
          return <div key={a.id}><button className="stitch-back w-full text-left" disabled={ocupado || Boolean(pedidoPendente) || feita || faltam.length > 0} onClick={() => { if (!a.terminal || window.confirm('Encerrar o atendimento agora? As decisões e omissões serão avaliadas no relatório.')) agir(a.id); }}>{feita ? '✓ ' : ''}{a.texto}</button>{faltam.length > 0 && <p className="text-sm">Antes: {faltam.map(id => caso.acoes.find(item => item.id === id).texto).join('; ')}.</p>}</div>;
        })}</div></section>}
        <section className="stitch-panel p-5"><h2>Linha do tempo e informações descobertas</h2>{!relatorio.eventos.length && <p>Comece avaliando o paciente.</p>}<ol className="grid gap-4">{relatorio.eventos.map(evento => <li key={evento.id}><strong>{evento.minutos} min · {evento.texto}</strong><p>{evento.resposta}</p></li>)}</ol></section>
      </>}
    </main>
  </div>;
}
