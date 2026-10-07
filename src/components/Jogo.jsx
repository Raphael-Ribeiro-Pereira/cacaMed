import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { ArrowDownUp, Check, ChevronLeft, ChevronRight, CircleHelp, Delete, Settings2 } from 'lucide-react';
import { gerarTabuleiro } from '../utils/motorTabuleiro';
import { chamarOpenRouter } from '../services/openrouter';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';
import { aplicarProgressoMissoes, dataLocalHoje, lerMissoes } from '../utils/missoes';
import { nivelPorXP } from '../utils/economia';
import { celulasPreenchidasAteProximaVazia, escolherDirecaoDaEntrada, proximaCelulaDaEntrada, resolverLetraRepetida } from '../utils/navegacaoCruzadinha';
import { chaveCasa, estadoDaCasa, palavraDaCasa, palavrasDaGrade, palavrasResolvidas, tamanhoDaPalavra } from '../utils/cruzadinha';
import { animar, useLargo } from '../utils/prototipo';
import { Resultado, SubiuNivel } from './resultadoUi';

// Cruzadinha no visual do protótipo de movimento. O motor, as dicas, a pontuação e a gravação são os
// do jogo; a grade real é maior que a do protótipo, então o tabuleiro mantém zoom e arrasto.
const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const formatarTempo = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const aplicarCensura = (textoDica, palavraSecreta) => {
  if (!textoDica || !palavraSecreta) return textoDica;
  const palavraLimpa = normalizar(palavraSecreta);
  const radical = palavraLimpa.length > 4 ? palavraLimpa.substring(0, palavraLimpa.length - 2) : palavraLimpa;
  return textoDica.split(' ').map(palavra => {
    const pLimpa = normalizar(palavra).replace(/[^A-Z]/g, '');
    return pLimpa.includes(radical) && pLimpa.length >= radical.length ? '***' : palavra;
  }).join(' ');
};

const PASSOS_TUTORIAL = [
  { titulo: 'Escolha uma palavra', texto: 'Toque em uma casa para selecionar a palavra. Em um cruzamento, o jogo escolhe a palavra com mais casas vazias; toque de novo na casa, use Enter ou a tecla ⇅ para trocar a direção. As setas da dica passam para a palavra anterior ou a próxima.' },
  { titulo: 'Preencha a grade', texto: 'Digite uma letra por casa, no teclado da tela ou no do computador. O cursor pula letras já preenchidas e aceita a letra repetida de um cruzamento sem duplicá-la; apagar volta para a casa anterior. Arraste e use o zoom para ver a grade toda.' },
  { titulo: 'Entenda as cores', texto: 'Verde: letra certa. Amarelo: a letra existe na palavra, em outra posição. Vermelho: a letra não está na palavra. Quando todas as letras de uma palavra estão certas, ela acende. Complete todas para terminar o plantão.' },
  { titulo: 'Use as dicas', texto: 'A dica do laudo aparece junto da grade. A partir do nível 3 do tópico, você pode abrir dicas extras que valem para a partida toda: a do residente custa 5 XP e a do paciente, mais 10 XP.' },
  { titulo: 'Receba suas recompensas', texto: 'Letras e palavras formam o XP base. Nível e tempo podem multiplicá-lo; dicas reduzem o resultado, com mínimo de 10 XP por partida. Missões podem dar XP extra, e cada cruzadinha concluída concede 2 tickets, além das recompensas de missão e nível global. O resultado mostra cada parcela.' },
  { titulo: 'Antes de sair', texto: 'Se abandonar o plantão antes de completá-lo, as letras e o progresso desta partida serão perdidos. O botão de voltar pede confirmação.' },
];
const DICAS_EXTRAS = { 2: ['Dica do residente', 5], 3: ['Relato do paciente', 10] };
const PERFIL_NA_PLANILHA = ['planilha', 'supabase'].includes(import.meta.env.VITE_FONTE_DADOS);
// Na API, a partida vai com a sessão do próprio usuário (Firebase ou Supabase); o Firestore antigo só carrega sob demanda.
async function registrarPadrao(usuario, uid, partida) {
  if (PERFIL_NA_PLANILHA) return chamarPerfilPlanilha(usuario, 'registrarPartida', { partida });
  const { registrarCruzadinha } = await import('../services/registrarCruzadinha');
  return registrarCruzadinha(uid, partida);
}

export default function Jogo({ bancoDePalavras, materia, subMateria, setTelaAtual, usuario, dadosUsuario, setDadosUsuario,
  registrar, servicoPerfil = chamarPerfilPlanilha, consultarIA = chamarOpenRouter }) {
  const web = useLargo();
  const meuUid = usuario?.uid || dadosUsuario?.uid;
  const admin = dadosUsuario?.role === 'admin';

  const chaveXP = `${normalizar(materia)}-${normalizar(subMateria)}`;
  const xpTopico = Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0;
  const nivelAtual = xpTopico === 0 ? 0 : Math.floor(Math.sqrt(xpTopico / 1000)) + 1;
  const dicasExtras = nivelAtual > 2;
  const [nivelDaGrade, setNivelDaGrade] = useState(nivelAtual);
  const [chaveRecarregamento, setChaveRecarregamento] = useState(0);

  const { gradePronta, limites } = useMemo(() => {
    const resultado = gerarTabuleiro(bancoDePalavras, chaveXP, nivelDaGrade);
    if (import.meta.env.DEV && resultado.selecao) console.debug('[Cruzadinha] seleção da grade', chaveXP, resultado.selecao);
    return resultado;
    // A chave força uma nova grade aleatória ao avançar, mesmo no mesmo nível.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancoDePalavras, chaveXP, chaveRecarregamento, nivelDaGrade]);
  const palavras = useMemo(() => palavrasDaGrade(gradePronta), [gradePronta]);
  const dicasBasicas = useMemo(() => {
    const mapa = {};
    gradePronta.flat().forEach(c => {
      if (c.palavraInicialHorizontal && c.dicaBasicaHorizontal) mapa[c.palavraInicialHorizontal] = c.dicaBasicaHorizontal;
      if (c.palavraInicialVertical && c.dicaBasicaVertical) mapa[c.palavraInicialVertical] = c.dicaBasicaVertical;
    });
    return mapa;
  }, [gradePronta]);

  const [valores, setValores] = useState({});
  const valoresRef = useRef(valores);
  valoresRef.current = valores;
  const [sel, setSel] = useState(null);
  const [dir, setDir] = useState('horizontal');
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [mensagemGeral, setMensagemGeral] = useState('Montando o plantão...');
  const [dicasSalvas, setDicasSalvas] = useState({});
  const pedindoDica = useRef(new Set());
  const [nivelDica, setNivelDica] = useState(1);
  const penalidadeXP = nivelDica === 3 ? 15 : nivelDica === 2 ? 5 : 0;
  const [tempo, setTempo] = useState(0);
  const [erros, setErros] = useState(0);
  const tentativasErradas = useRef(new Set());
  const puladas = useRef([]);
  const [vitoria, setVitoria] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [xpPendente, setXpPendente] = useState(null);
  const [subiu, setSubiu] = useState(null);
  const cadeadoRecompensa = useRef(false);
  const partidaId = useRef(null);
  const transform = useRef(null);
  const areaTabuleiro = useRef(null);
  const [area, setArea] = useState(null);
  const [intro, setIntro] = useState(animar);

  const tutorialConcluido = dadosUsuario?.tutorialCruzadinhasConcluido === true || dadosUsuario?.estatisticasGerais?.historico?.length > 0
    || Object.values(dadosUsuario?.estatisticas || {}).some(e => Number(e?.partidas) > 0);
  const [tutorialAberto, setTutorialAberto] = useState(!tutorialConcluido);
  const [passoTutorial, setPassoTutorial] = useState(0);
  const [salvandoTutorial, setSalvandoTutorial] = useState(false);
  const [erroTutorial, setErroTutorial] = useState('');
  const [folha, setFolha] = useState(null);
  const folhaRef = useRef(null);
  const bloqueado = vitoria || !jogoIniciado || tutorialAberto || Boolean(folha);

  const concluirTutorial = async () => {
    if (tutorialConcluido) { setTutorialAberto(false); return; }
    if (!meuUid) { setErroTutorial('Não foi possível identificar seu perfil. Entre novamente e tente de novo.'); return; }
    setSalvandoTutorial(true); setErroTutorial('');
    try {
      if (PERFIL_NA_PLANILHA || servicoPerfil !== chamarPerfilPlanilha) setDadosUsuario(await servicoPerfil(usuario, 'tutorial'));
      else {
        const [{ db }, { doc, updateDoc }] = await Promise.all([import('../firebase'), import('firebase/firestore')]);
        await updateDoc(doc(db, 'usuarios', meuUid), { tutorialCruzadinhasConcluido: true });
        setDadosUsuario(prev => ({ ...prev, tutorialCruzadinhasConcluido: true }));
      }
      setTutorialAberto(false);
    } catch (error) {
      console.error('Falha ao registrar tutorial da cruzadinha:', error);
      setErroTutorial('Não foi possível salvar o tutorial. Tente novamente.');
    } finally { setSalvandoTutorial(false); }
  };

  // Foco no primeiro botão da folha aberta; Escape fecha (o tutorial obrigatório não fecha).
  useEffect(() => {
    if (!folha && !tutorialAberto) return undefined;
    const anterior = document.activeElement;
    requestAnimationFrame(() => folhaRef.current?.querySelector('button:not(:disabled)')?.focus());
    const tecla = e => { if (e.key === 'Escape') { if (folha) setFolha(null); else if (tutorialConcluido) setTutorialAberto(false); } };
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('keydown', tecla); if (anterior?.isConnected) anterior.focus(); };
  }, [folha, tutorialAberto, passoTutorial, tutorialConcluido]);

  useEffect(() => {
    if (!jogoIniciado || vitoria || tutorialAberto || folha) return undefined;
    const intervalo = setInterval(() => setTempo(t => t + 1), 1000);
    return () => clearInterval(intervalo);
  }, [jogoIniciado, vitoria, tutorialAberto, folha]);

  // Dicas: até o nível 2 do tópico, a do banco (com a primeira letra); a partir do 3, a IA gera as três camadas.
  useEffect(() => {
    if (!palavras.length || jogoIniciado) return;
    let ativo = true;
    const lista = [...new Set(palavras.map(p => p.palavra))];
    if (nivelAtual <= 2) {
      const estaticas = {};
      lista.forEach(palavra => {
        estaticas[palavra] = { laudo: `${aplicarCensura(dicasBasicas[palavra] || 'Encontre esta estrutura.', palavra)} (Começa com a letra ${palavra[0]})`, residente: '', paciente: '' };
      });
      setDicasSalvas(estaticas);
      setJogoIniciado(true);
      return undefined;
    }
    setMensagemGeral(`A IA está preparando as dicas do nível ${nivelAtual}...`);
    const prompt = `Você é um gerador de dicas de palavras cruzadas médicas. Para CADA palavra da lista, crie 3 níveis de dicas (máx 15 palavras cada).
      Nível 1 (laudo): Termos técnicos anatômicos/patológicos formais.
      Nível 2 (residente): Correlação clínica, sintomas ou prática de hospital.
      Nível 3 (paciente): Linguagem extremamente simples e leiga, quase infantil.
      REGRAS ABSOLUTAS: É PROIBIDO usar a palavra solicitada ou os seus radicais nas dicas.
      Retorne APENAS um objeto JSON válido. Exemplo:
      {
        "FEMUR": { "laudo": "...", "residente": "...", "paciente": "..." },
        "TIBIA": { "laudo": "...", "residente": "...", "paciente": "..." }
      }
      Lista: ${lista.join(', ')}`;
    consultarIA(prompt, { temperature: 0.2 })
      .then(texto => { if (ativo) setDicasSalvas(JSON.parse(texto.replace(/```json/gi, '').replace(/```/g, '').trim())); })
      .catch(erro => console.error(erro))
      .finally(() => { if (ativo) setJogoIniciado(true); });
    return () => { ativo = false; };
  }, [palavras, nivelAtual, jogoIniciado, dicasBasicas, consultarIA]);

  const gerarDica = termo => {
    if (dicasSalvas[termo] || pedindoDica.current.has(termo)) return;
    pedindoDica.current.add(termo);
    const prompt = `Gere dicas para estudantes de medicina. O termo é [${termo}]. Retorne UM JSON estrito com 3 níveis curtos (máx 15 palavras). Formato: {"laudo": "termo técnico...", "residente": "prática clínica...", "paciente": "termo leigo..."}. PROIBIDO usar a palavra '${termo}'.`;
    consultarIA(prompt, { temperature: 0.2 })
      .then(texto => setDicasSalvas(prev => ({ ...prev, [termo]: JSON.parse(texto.replace(/```json/gi, '').replace(/```/g, '').trim()) })))
      .catch(() => setDicasSalvas(prev => ({ ...prev, [termo]: { laudo: 'Sem conexão com a IA. Tente deduzir pelas letras.', residente: 'Indisponível.', paciente: 'Indisponível.' } })))
      .finally(() => pedindoDica.current.delete(termo));
  };

  const focarCasa = (linha, coluna) => requestAnimationFrame(() => {
    const r = transform.current;
    if (r && document.getElementById(`casa-${linha}-${coluna}`)) r.zoomToElement(`casa-${linha}-${coluna}`, r.instance.transformState.scale, 260);
  });
  const selecionar = (celula, direcao, centralizar = false) => {
    setSel({ linha: celula.linha, coluna: celula.coluna });
    setDir(direcao);
    const p = palavraDaCasa(palavras, celula, direcao);
    if (p && jogoIniciado) gerarDica(p.palavra);
    if (centralizar) focarCasa(celula.linha, celula.coluna);
  };
  const irParaPalavra = (p, novos = valoresRef.current) => {
    const alvo = p.casas.find(k => !novos[k]) || p.casas[0];
    const [l, c] = alvo.split('-').map(Number);
    puladas.current = [];
    selecionar(gradePronta[l][c], p.d, true);
  };

  // Ao começar, a primeira palavra fica selecionada, como no protótipo.
  useEffect(() => {
    if (jogoIniciado && !sel && palavras.length) irParaPalavra(palavras[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogoIniciado, palavras]);

  const celulaSel = sel ? gradePronta[sel.linha]?.[sel.coluna] : null;
  const ativa = celulaSel ? palavraDaCasa(palavras, celulaSel, dir) : null;
  const resolvidas = useMemo(() => palavrasResolvidas(palavras, gradePronta, valores), [palavras, gradePronta, valores]);

  const escrever = (linha, coluna, letra) => {
    const novos = { ...valoresRef.current, [chaveCasa(linha, coluna)]: letra };
    valoresRef.current = novos;
    setValores(novos);
    if (letra !== gradePronta[linha][coluna].letraCerta.toUpperCase()) {
      const assinatura = `${linha}:${coluna}:${letra}`;
      if (!tentativasErradas.current.has(assinatura)) { tentativasErradas.current.add(assinatura); setErros(e => e + 1); }
    }
    puladas.current = [];
    const proxima = proximaCelulaDaEntrada(gradePronta, novos, linha, coluna, dir);
    if (proxima) {
      puladas.current = celulasPreenchidasAteProximaVazia(gradePronta, novos, linha, coluna, dir);
      setSel(proxima);
      return;
    }
    // Palavra toda certa: segue para a próxima que ainda tem casa vazia.
    const atual = palavraDaCasa(palavras, gradePronta[linha][coluna], dir);
    const certa = k => { const [l, c] = k.split('-').map(Number); return novos[k] === gradePronta[l][c].letraCerta.toUpperCase(); };
    if (!atual || !atual.casas.every(certa)) return;
    const i = palavras.indexOf(atual);
    for (let s = 1; s < palavras.length; s++) {
      const p = palavras[(i + s) % palavras.length];
      if (p.casas.some(k => !novos[k])) { irParaPalavra(p, novos); return; }
    }
  };
  const digitar = bruta => {
    const letra = normalizar(bruta);
    if (bloqueado || !sel || !/^[A-Z]$/.test(letra)) return;
    const r = resolverLetraRepetida(letra, puladas.current, valoresRef.current[chaveCasa(sel.linha, sel.coluna)]);
    if (r.acao === 'ignorar') return;
    if (r.acao === 'consumir') { puladas.current = r.restantes; return; }
    escrever(sel.linha, sel.coluna, r.letra);
  };
  const apagar = () => {
    if (bloqueado || !sel) return;
    puladas.current = [];
    const k = chaveCasa(sel.linha, sel.coluna);
    if (valoresRef.current[k]) {
      const novos = { ...valoresRef.current };
      delete novos[k];
      valoresRef.current = novos;
      setValores(novos);
      return;
    }
    const anterior = proximaCelulaDaEntrada(gradePronta, valoresRef.current, sel.linha, sel.coluna, dir, -1, false);
    if (anterior) setSel(anterior);
  };
  const alternar = () => {
    if (bloqueado || !celulaSel?.pertenceHorizontal || !celulaSel?.pertenceVertical) return;
    puladas.current = [];
    selecionar(celulaSel, dir === 'horizontal' ? 'vertical' : 'horizontal');
  };
  const tocar = celula => {
    if (bloqueado) return;
    puladas.current = [];
    const mesma = sel && sel.linha === celula.linha && sel.coluna === celula.coluna;
    if (mesma && celula.pertenceHorizontal && celula.pertenceVertical) selecionar(celula, dir === 'horizontal' ? 'vertical' : 'horizontal');
    else selecionar(celula, escolherDirecaoDaEntrada(gradePronta, valoresRef.current, celula, dir));
  };
  const mover = (dl, dc) => {
    if (bloqueado || !sel) return;
    for (let s = 1; s < 8; s++) {
      const c = gradePronta[sel.linha + dl * s]?.[sel.coluna + dc * s];
      if (!c) return;
      if (c.vazia || c.letraCerta === ' ') continue;
      const d = dc ? 'horizontal' : 'vertical';
      const pertence = d === 'horizontal' ? c.pertenceHorizontal : c.pertenceVertical;
      puladas.current = [];
      selecionar(c, pertence ? d : d === 'horizontal' ? 'vertical' : 'horizontal');
      return;
    }
  };
  const ciclar = passo => {
    if (bloqueado || !palavras.length) return;
    const i = ativa ? palavras.indexOf(ativa) : -1;
    irParaPalavra(palavras[(i + passo + palavras.length) % palavras.length]);
  };
  const abrirDicaExtra = () => {
    if (!dicasExtras || nivelDica >= 3 || vitoria) return;
    setNivelDica(n => n + 1);
    setFolha(null);
  };

  // Teclado físico: letras, apagar, Enter ou espaço para trocar a direção e setas para andar.
  useEffect(() => {
    const tecla = e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, select, .sheet')) return;
      if (e.key.length === 1 && /^[a-zà-ú]$/i.test(e.key)) { e.preventDefault(); digitar(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); apagar(); }
      else if ((e.key === 'Enter' || e.key === ' ') && (e.target === document.body || e.target.closest?.('.board'))) { e.preventDefault(); alternar(); }
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        mover(e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0, e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0);
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  // Vitória: calcula a prévia do XP com a mesma conta do servidor e grava a partida uma vez.
  useEffect(() => {
    if (!gradePronta.length || vitoria || cadeadoRecompensa.current) return;
    const letras = gradePronta.flat().filter(c => !c.vazia && c.letraCerta !== ' ');
    if (!letras.length || !letras.every(c => valores[chaveCasa(c.linha, c.coluna)] === c.letraCerta.toUpperCase())) return;
    cadeadoRecompensa.current = true;
    setVitoria(true);
    setFolha(null);
    const numLetras = letras.length;
    const numPalavras = palavras.length;
    const maiorPalavra = Math.max(...palavras.map(p => p.palavra.length));
    const xpLetras = numLetras * 2, xpPalavras = numPalavras * 10, base = xpLetras + xpPalavras;
    const multNivel = 1 + (Math.max(1, nivelDaGrade) - 1) * 0.1;
    const ideal = numPalavras * 15;
    const multTempo = tempo <= ideal * 0.25 ? 2 : tempo <= ideal * 0.5 ? 1.5 : tempo <= ideal ? 1.2 : 1;
    const xpCalculado = Math.floor(base * multNivel * multTempo) - penalidadeXP;
    const ganho = Math.max(10, xpCalculado);
    const missoes = aplicarProgressoMissoes(lerMissoes(dadosUsuario), { jogar_cruzadinha: 1, acertar_palavras: numPalavras });
    const concluidas = missoes.missoes.filter((m, i) => !lerMissoes(dadosUsuario)[i]?.concluida && m.concluida);
    setRelatorio({ ganho, letras: numLetras, palavras: numPalavras, xpLetras, xpPalavras, multNivel, multTempo, penalidade: penalidadeXP, xpCalculado, xpMissoes: missoes.xp, missoesConcluidas: concluidas, tempo, nivel: nivelDaGrade });
    if (!partidaId.current) partidaId.current = crypto.randomUUID();
    setXpPendente({ status: 'pendente', partida: { id: partidaId.current, chaveXP, subMateria, dia: dataLocalHoje(), xp: ganho, palavras: numPalavras, penalidadeXP, letras: numLetras, tempo, erros, maiorPalavra } });
  }, [valores, gradePronta, palavras, vitoria, nivelDaGrade, tempo, penalidadeXP, dadosUsuario, chaveXP, subMateria, erros]);
  // A grade acesa fica na tela por um instante antes do resultado, como no protótipo.
  useEffect(() => {
    if (!vitoria) return undefined;
    const t = setTimeout(() => setMostrarResultado(true), animar() ? 900 : 0);
    return () => clearTimeout(t);
  }, [vitoria]);

  useEffect(() => {
    if (!xpPendente || xpPendente.status !== 'pendente' || !meuUid) return;
    setXpPendente(prev => ({ ...prev, status: 'salvando' }));
    (registrar ? registrar(meuUid, xpPendente.partida) : registrarPadrao(usuario, meuUid, xpPendente.partida))
      .then(dados => {
        const xpRecebido = (Number(dados.xpTopicos?.[chaveXP]) || 0) - (Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0);
        const xpGlobal = (Number(dados.pontuacaoTotal) || 0) - (Number(dadosUsuario?.pontuacaoTotal) || 0);
        const tickets = (Number(dados.tickets) || 0) - (Number(dadosUsuario?.tickets) || 0);
        setRelatorio(prev => prev ? { ...prev, ganho: xpRecebido, xpMissoes: Math.max(0, xpGlobal - xpRecebido), ticketsRecebidos: Math.max(0, tickets) } : prev);
        const anterior = nivelPorXP(dadosUsuario?.pontuacaoTotal), novo = nivelPorXP(dados.pontuacaoTotal);
        if (novo > anterior) setTimeout(() => setSubiu({ from: anterior, to: novo, xp: Number(dados.pontuacaoTotal) || 0 }), animar() ? 1300 : 0);
        setDadosUsuario(dados);
        setXpPendente(prev => ({ ...prev, status: 'salvo' }));
      })
      .catch(error => {
        console.error('Falha ao salvar cruzadinha:', error);
        setXpPendente(prev => ({ ...prev, status: 'erro' }));
      });
  }, [xpPendente, meuUid, setDadosUsuario, chaveXP, dadosUsuario, registrar, usuario]);

  const novaPartida = nivel => {
    setNivelDaGrade(nivel);
    setValores({}); valoresRef.current = {}; setSel(null); setDir('horizontal');
    setVitoria(false); setMostrarResultado(false); setJogoIniciado(false); setMensagemGeral('Montando o plantão...');
    tentativasErradas.current.clear(); puladas.current = []; pedindoDica.current.clear();
    cadeadoRecompensa.current = false; partidaId.current = null;
    setDicasSalvas({}); setTempo(0); setErros(0); setRelatorio(null); setNivelDica(1); setXpPendente(null); setSubiu(null);
    setIntro(animar());
    setChaveRecarregamento(c => c + 1);
  };
  const avancar = () => {
    if (xpPendente?.status !== 'salvo') return;
    const xp = Number(dadosUsuario?.xpTopicos?.[chaveXP]) || 0;
    novaPartida(xp === 0 ? 0 : Math.floor(Math.sqrt(xp / 1000)) + 1);
  };

  const preencher = casas => {
    if (!admin || !jogoIniciado || vitoria) return;
    const novos = { ...valoresRef.current };
    casas.forEach(k => { const [l, c] = k.split('-').map(Number); novos[k] = gradePronta[l][c].letraCerta.toUpperCase(); });
    valoresRef.current = novos;
    setValores(novos);
    setFolha(null);
  };

  // A animação de entrada das casas roda uma vez; depois a classe sai para não repetir.
  const totalCasas = useMemo(() => gradePronta.flat().filter(c => !c.vazia && c.letraCerta !== ' ').length, [gradePronta]);
  const passoEntrada = Math.min(1, 45 / Math.max(1, totalCasas));
  useEffect(() => {
    if (!intro) return undefined;
    const t = setTimeout(() => setIntro(false), 120 + 45 * 26 + 700);
    return () => clearTimeout(t);
  }, [intro, chaveRecarregamento]);

  // O zoom inicial cabe a grade inteira na área do tabuleiro (com um piso para as casas não ficarem minúsculas).
  useLayoutEffect(() => {
    const el = areaTabuleiro.current;
    if (el && !mostrarResultado) setArea({ w: el.clientWidth, h: el.clientHeight });
  }, [chaveRecarregamento, web, mostrarResultado]);

  const raiz = conteudo => <div className={`cbt ${web ? 'web' : ''}`}>{conteudo}<AnimatePresence>{subiu && <SubiuNivel key="lvl" info={subiu} onClose={() => setSubiu(null)} />}</AnimatePresence></div>;

  if (mostrarResultado && relatorio) {
    const r = relatorio;
    const mm = formatarTempo(r.tempo);
    const fase = xpPendente?.status === 'salvo' ? 'ok' : xpPendente?.status === 'erro' ? 'erro' : 'salvando';
    const extras = [];
    if (r.xpMissoes > 0) extras.push([`Missões do dia${r.missoesConcluidas?.length ? `: ${r.missoesConcluidas.map(m => m.titulo.toLowerCase()).join(', ')}` : ''}`, `+${r.xpMissoes}`, 'mul']);
    if (r.ticketsRecebidos > 0) extras.push(['Tickets do plantão, missões e nível', `+${r.ticketsRecebidos} ticket${r.ticketsRecebidos > 1 ? 's' : ''}`, 'mul']);
    return raiz(<Resultado key={partidaId.current} stamp="PLANTÃO CONCLUÍDO" sub={`${materia} · ${subMateria} · ${mm}`} recibo={partidaId.current}
      linhas={[[`Letras certas (${r.letras})`, `+${r.xpLetras}`, 'pos'], [`Palavras (${r.palavras})`, `+${r.xpPalavras}`, 'pos'],
        [`Multiplicador do nível ${r.nivel}`, `×${r.multNivel.toFixed(1)}`, 'mul'], [`Bônus de tempo (${mm})`, `×${r.multTempo.toFixed(1)}`, 'mul'],
        [`Dicas extras`, r.penalidade ? `−${r.penalidade}` : '0', r.penalidade ? 'neg' : 'mut']]}
      total={r.ganho} extras={extras} bonus={r.xpMissoes || 0} fase={fase} aviso={r.xpCalculado < 10 ? 'Aplicado o mínimo de 10 XP por partida.' : null}
      aoTentar={() => setXpPendente(prev => ({ ...prev, status: 'pendente' }))}
      principal={{ rotulo: 'Próximo plantão', aoClicar: avancar }} aoVoltar={() => setTelaAtual('menu')} />);
  }

  const sair = () => { if (!vitoria) setFolha('sair'); };
  const topbar = <div className="topbar">
    <button className="icon-btn" onClick={sair} disabled={vitoria} aria-label="Abandonar plantão"><ChevronLeft /></button>
    <h1><small>{materia} · nível {nivelDaGrade}</small>{subMateria}</h1>
    {penalidadeXP > 0 && <span className="chip" title="Dicas extras">−{penalidadeXP} XP</span>}
    <button className="icon-btn" onClick={() => { setPassoTutorial(0); setErroTutorial(''); setTutorialAberto(true); }} disabled={vitoria} aria-label="Tutorial"><CircleHelp /></button>
    {admin && <button className="icon-btn" onClick={() => setFolha('admin')} disabled={vitoria || !jogoIniciado} aria-label="Ferramentas admin"><Settings2 /></button>}
  </div>;

  if (!gradePronta.length) return raiz(<div className="cbt-scr r-crossword">{topbar}
    <div className="scroll plain" role="alert" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <span>Não foi possível montar a grade deste tópico.</span>
      <button className="primary" style={{ maxWidth: 260 }} onClick={() => setTelaAtual('topicos')}>Escolher outro tópico</button>
    </div></div>);

  const resolvidasCasas = new Map();
  resolvidas.forEach(p => p.casas.forEach((k, i) => resolvidasCasas.set(k, i)));
  const casa = web ? 44 : 38;
  const colunas = limites.maxCol - limites.minCol + 1;
  const linhasGrade = limites.maxRow - limites.minRow + 1;
  const passoCasa = casa + (web ? 5 : 4);
  const escalaInicial = area ? Math.max(web ? 0.5 : 0.55, Math.min(1, area.w / (colunas * passoCasa + 64), area.h / (linhasGrade * passoCasa + 64))) : 1;
  let ordem = 0;
  const casas = [];
  for (let l = limites.minRow; l <= limites.maxRow; l++) for (let c = limites.minCol; c <= limites.maxCol; c++) {
    const celula = gradePronta[l][c];
    const k = chaveCasa(l, c);
    if (celula.vazia) { casas.push(<span key={k} />); continue; }
    if (celula.letraCerta === ' ') { casas.push(<span key={k} className="cell" style={{ opacity: .25 }} aria-hidden="true" />); continue; }
    const estado = estadoDaCasa(gradePronta, valores, celula);
    const naResolvida = resolvidasCasas.has(k);
    const cls = ['cell', ativa?.casas.includes(k) && 'inword', sel?.linha === l && sel?.coluna === c && 'sel', estado, naResolvida && 'solved'].filter(Boolean).join(' ');
    casas.push(<button key={k} id={`casa-${l}-${c}`} className={cls} style={{ '--i': Math.round(ordem++ * passoEntrada), '--d': naResolvida ? resolvidasCasas.get(k) : 0 }}
      onClick={() => tocar(celula)} aria-label={`Casa linha ${l + 1}, coluna ${c + 1}${celula.numero ? `, palavra ${celula.numero}` : ''}${valores[k] ? `, letra ${valores[k]}` : ', vazia'}`}>
      {celula.numero && <span className="n">{celula.numero}</span>}<span key={(valores[k] || '') + estado}>{valores[k]}</span>
    </button>);
  }

  const dica = ativa ? dicasSalvas[ativa.palavra] : null;
  const textoDica = !jogoIniciado ? mensagemGeral : !ativa ? 'Toque em uma casa para ver a dica.' : dica?.laudo || 'Consultando a dica...';
  const proximaExtra = DICAS_EXTRAS[nivelDica + 1];
  const pista = <div className="clue">
    <button className="icon-btn" onClick={() => ciclar(-1)} disabled={bloqueado} aria-label="Dica anterior"><ChevronLeft /></button>
    <span className="num mono">{ativa ? `${ativa.numero}${ativa.d === 'horizontal' ? '→' : '↓'}` : '…'}</span>
    <p aria-live="polite">{textoDica} {ativa && jogoIniciado && <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>({tamanhoDaPalavra(ativa.palavra)})</span>}
      {nivelDica >= 2 && dica?.residente && <span style={{ display: 'block', marginTop: 4, fontSize: 12, fontWeight: 500, color: 'var(--amber)' }}>Residente: {dica.residente}</span>}
      {nivelDica >= 3 && dica?.paciente && <span style={{ display: 'block', marginTop: 2, fontSize: 12, fontWeight: 500, color: 'var(--mint)' }}>Paciente: “{dica.paciente}”</span>}
    </p>
    <button className="icon-btn" onClick={() => ciclar(1)} disabled={bloqueado} aria-label="Próxima dica"><ChevronRight /></button>
  </div>;

  const folhas = <AnimatePresence>
    {(folha || tutorialAberto) && <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => { if (folha) setFolha(null); else if (tutorialConcluido) setTutorialAberto(false); }} />}
    {tutorialAberto && !folha && <motion.div key="tut" ref={folhaRef} className="sheet" role="dialog" aria-modal="true" aria-labelledby="tutorial-cruzadinha" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
      <span className="kicker">Tutorial · {passoTutorial + 1}/{PASSOS_TUTORIAL.length}</span>
      <h3 id="tutorial-cruzadinha">{PASSOS_TUTORIAL[passoTutorial].titulo}</h3>
      <p style={{ minHeight: 84 }}>{PASSOS_TUTORIAL[passoTutorial].texto}</p>
      {erroTutorial && <p role="alert" style={{ color: 'var(--crimson)' }}>{erroTutorial}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="ghost" disabled={passoTutorial === 0 || salvandoTutorial} onClick={() => setPassoTutorial(p => p - 1)}>Voltar</button>
        {passoTutorial < PASSOS_TUTORIAL.length - 1
          ? <button className="primary" onClick={() => setPassoTutorial(p => p + 1)}>Próximo</button>
          : <button className="primary" disabled={salvandoTutorial} onClick={concluirTutorial}>{salvandoTutorial ? 'Salvando...' : 'Começar plantão'}</button>}
      </div>
    </motion.div>}
    {folha && <motion.div key={folha} ref={folhaRef} className="sheet" role={folha === 'sair' ? 'alertdialog' : 'dialog'} aria-modal="true" aria-label={{ sair: 'Abandonar plantão', admin: 'Ferramentas admin', dica: 'Dica extra' }[folha]}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
      {folha === 'sair' && <>
        <h3>Abandonar plantão?</h3>
        <p>Você perderá as letras preenchidas e o progresso desta partida.</p>
        <button className="primary" onClick={() => setFolha(null)}>Continuar jogando</button>
        <button className="ghost" onClick={() => setTelaAtual('topicos')}>Abandonar</button>
      </>}
      {folha === 'dica' && <>
        <h3>{proximaExtra ? proximaExtra[0] : 'Dicas extras'}</h3>
        <p>{!dicasExtras ? 'As dicas extras abrem a partir do nível 3 do tópico.' : proximaExtra ? `Vale para todas as palavras desta partida e custa ${proximaExtra[1]} XP do resultado.` : 'Você já abriu todas as dicas desta partida.'}</p>
        {dicasExtras && proximaExtra && <button className="primary" onClick={abrirDicaExtra}>Abrir dica · −{proximaExtra[1]} XP</button>}
        <button className="ghost" onClick={() => setFolha(null)}>Voltar à grade</button>
      </>}
      {folha === 'admin' && <>
        <h3>Ferramentas admin</h3>
        <button className="ghost" disabled={!ativa} onClick={() => preencher(ativa.casas)}>Preencher palavra selecionada</button>
        <button className="ghost" onClick={() => preencher(palavras.flatMap(p => p.casas))}>Finalizar cruzadinha</button>
        <button className="ghost" onClick={() => { setFolha(null); novaPartida(nivelDaGrade); }}>Gerar nova grade</button>
        <button className="ghost" onClick={() => setFolha(null)}>Fechar</button>
      </>}
    </motion.div>}
  </AnimatePresence>;

  return raiz(<div className="cbt-scr r-crossword">
    <div inert={Boolean(folha) || tutorialAberto} style={{ display: 'contents' }}>
      {topbar}
      <div className="cw">
        <div className="cw-main">
          <div className="hud">
            <div><small>Tempo</small><b className="mono">{formatarTempo(tempo)}</b></div>
            <div><small>Palavras</small><b className="mono">{resolvidas.length}/{palavras.length}</b></div>
            <div className="err"><small>Erros</small><b className="mono">{erros}</b></div>
          </div>
          <div ref={areaTabuleiro} className={`board-wrap ${intro ? 'intro' : ''}`} style={{ display: 'block', padding: 0, overflow: 'hidden' }}>
            {intro && <span className="building" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>Montando tabuleiro</span>}
            {area && <TransformWrapper key={chaveRecarregamento} ref={transform} initialScale={escalaInicial} minScale={0.3} maxScale={2.5} centerOnInit limitToBounds={false}
              wheel={{ step: 0.1 }} pinch={{ step: 5 }} doubleClick={{ disabled: true }}>
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div className="board" style={{ gridTemplateColumns: `repeat(${colunas}, ${casa}px)`, width: 'max-content', maxWidth: 'none', padding: 32, opacity: jogoIniciado ? 1 : .6, transition: 'opacity .3s' }}>{casas}</div>
              </TransformComponent>
            </TransformWrapper>}
          </div>
          {pista}
        </div>
        {web && <aside className="cw-clues" aria-label="Dicas">
          {['horizontal', 'vertical'].map(d => <div key={d} className="cw-group">
            <span className="w-col-h">{d === 'horizontal' ? 'HORIZONTAIS' : 'VERTICAIS'}</span>
            {palavras.filter(p => p.d === d).map(p => {
              const feita = resolvidas.includes(p);
              return <button key={p.chave} className={`cw-clue ${p === ativa ? 'on' : ''} ${feita ? 'done' : ''}`} disabled={bloqueado} onClick={() => irParaPalavra(p)}>
                <span className="num mono">{p.numero}</span><span>{dicasSalvas[p.palavra]?.laudo || (jogoIniciado ? 'Consultando a dica...' : '...')} <small className="mono">({tamanhoDaPalavra(p.palavra)})</small></span>{feita && <Check size={15} />}
              </button>;
            })}
          </div>)}
          <div className="cw-help"><span><kbd>A–Z</kbd> digitar</span><span><kbd>⌫</kbd> apagar</span><span><kbd>Enter</kbd> trocar direção</span><span><kbd>←↑→↓</kbd> mover</span></div>
          {dicasExtras
            ? proximaExtra && <button className="ghost" disabled={bloqueado} onClick={abrirDicaExtra}>{proximaExtra[0]} · −{proximaExtra[1]} XP</button>
            : <p className="muted" style={{ fontSize: 12 }}>Dicas extras do residente e do paciente a partir do nível 3 do tópico.</p>}
        </aside>}
      </div>
      {!web && <div className="kb">{['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((linha, ri) => <div className="kb-row" key={linha}>
        {ri === 2 && <button className="key wide" onClick={alternar} disabled={bloqueado} aria-label="Trocar direção"><ArrowDownUp /></button>}
        {[...linha].map(l => <button key={l} className="key" onClick={() => digitar(l)} disabled={bloqueado}>{l}</button>)}
        {ri === 1 && <button className="key hint" onClick={() => setFolha('dica')} disabled={bloqueado} aria-label="Dicas extras">?</button>}
        {ri === 2 && <button className="key wide" onClick={apagar} disabled={bloqueado} aria-label="Apagar"><Delete /></button>}
      </div>)}</div>}
    </div>
    {folhas}
  </div>);
}
