import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Check, ChevronDown, Eye, EyeOff, Grid3x3, HeartPulse, RotateCw, ScanLine, Search, Sparkles, Stethoscope, Trophy, X } from 'lucide-react';
import { tituloEpico } from '../utils/coroas';
import { MATERIA_CADASTRO, prefixoTitulo, tratamento } from '../utils/cracha';
import { ETAPA_MAXIMA, MATERIAS_CADASTRO, tituloVisitante } from '../utils/curso';
import { FOTOS } from '../utils/fotosCracha';
import { animar } from '../utils/prototipo';
import { Retrato } from './batalhaArte';
import { CrachaFrente } from './crachaUi';

// Peças das telas de entrada portadas do protótipo de movimento: casca (coluna única no celular,
// marca ou crachá ao lado na web), campos, escolhas do crachá e a impressão do crachá no cadastro.
export const Ecg = () => <svg className="ecg" viewBox="0 0 280 70" aria-hidden="true"><path d="M0 40h70l10-4 8 4h20l8-30 10 56 9-38 6 12h28l12-8 10 8h89" /></svg>;

export const GoogleG = () => <svg className="gg" viewBox="0 0 48 48" aria-hidden="true">
  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
</svg>;

export function Campo({ id, label, icon, estado, ajuda, children }) {
  const Ic = icon;
  return <label className="cr-f" htmlFor={id}>
    <span className="cr-l"><Ic size={12} />{label}</span>
    <span className={`cr-in au-in ${estado || ''}`}>{children}</span>
    {ajuda !== undefined && <span className="cr-help" aria-live="polite">{ajuda}</span>}
  </label>;
}
export const Ok = ({ on, children }) => <span className={`cr-st ${on ? 'ok' : 'chk'}`}>{on ? <Check size={13} /> : <span className="au-dot" />}{children}</span>;
export const Olho = ({ ver, set }) => <button type="button" className="au-eye" onClick={() => set(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? <EyeOff size={17} /> : <Eye size={17} />}</button>;
export const Erro = ({ texto }) => <AnimatePresence>{texto && <motion.p className="au-err" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><X size={15} />{texto}</motion.p>}</AnimatePresence>;

export function CascaEntrada({ web, lado, children }) {
  if (!web) return <div className="scroll au-m">{children}</div>;
  return <div className="au-web">
    <aside className="au-side">{lado}</aside>
    <div className="au-main scroll"><div className="au-col">{children}</div></div>
  </div>;
}

export const Marca = () => <div className="au-logo"><span className="au-mark"><Stethoscope /></span><span className="logo">caco<b>Med</b><i className="au-cur">_</i></span></div>;

const RECURSOS = [
  [Grid3x3, 'Cruzadinhas', 'Anatomia, fisiologia, farmaco e mais'],
  [HeartPulse, 'DDX · casos clínicos', 'Plantão, Erro médico e Causa e efeito'],
  [ScanLine, 'Quiz e Verdade ou mentira', 'Rodadas rápidas, com a fonte de cada resposta'],
  [Trophy, 'Devoradores de Plantão', 'Ranking da temporada e coroas por matéria'],
];
export function LadoMarca() {
  return <div className="au-brandside">
    <Marca />
    <span className="kicker">Terminal de plantão · nova temporada</span>
    <h2>O plantão que treina seu <b>raciocínio clínico</b>.</h2>
    <Ecg />
    <ul className="au-feats">{RECURSOS.map(([icone, t, d]) => { const Ic = icone; return <li key={t}><span className="ic"><Ic size={17} /></span><span><b>{t}</b><small>{d}</small></span></li>; })}</ul>
  </div>;
}

// cracha: { p, email, nome, username, foto, desde }, as mesmas props do CrachaFrente.
export function LadoCracha({ cracha }) {
  return <div className="au-crside">
    <span className="kicker">Prévia ao vivo</span>
    <div className="cr-lanyard" aria-hidden="true"><span className="cr-strap" /><span className="cr-clip" /></div>
    <div className="cr-card au-prev"><div className="cr-inner"><CrachaFrente {...cracha} /></div></div>
    <p>É assim que você aparece no ranking e no perfil. Dá para trocar a foto e o username depois.</p>
  </div>;
}

export function MiniCracha({ cracha }) {
  const materia = MATERIA_CADASTRO[cracha.p.materiaPreferida];
  const visitante = cracha.p.naoMedicina;
  const [titulo, emoji, cor] = visitante ? tituloVisitante(cracha.p.titulo) : tituloEpico(materia || '');
  return <div className="au-mini" aria-label="Prévia do crachá">
    <span className="au-mini-pic"><Retrato f={FOTOS[cracha.foto] || FOTOS[0]} /></span>
    <span className="au-mini-tx">
      <small className="mono">PRÉVIA DO CRACHÁ</small>
      <b>{cracha.p.titulo && prefixoTitulo(cracha.p) && `${prefixoTitulo(cracha.p)} `}{cracha.nome}</b>
      <span className="mono">@{cracha.username}</span>
      {materia || visitante ? <span className="cr-pill ti" style={{ '--tc': cor }}><span aria-hidden="true">{emoji}</span>{titulo}</span> : <span className="au-mini-q">Escolha a matéria para ganhar um título</span>}
    </span>
  </div>;
}

// Matérias numa caixa que rola: as de baixo aparecem pela metade num fade, que some no fim da lista.
function Materias({ materia, setMateria, tentou }) {
  const caixa = useRef(null);
  const [fim, setFim] = useState(false);
  const conferirFim = () => { const c = caixa.current; if (c) setFim(c.scrollTop + c.clientHeight >= c.scrollHeight - 4); };
  useEffect(conferirFim, []);
  return <>
    <div ref={caixa} onScroll={conferirFim} className={`au-mats rola ${fim ? 'fim' : ''} ${tentou && !materia ? 'bad' : ''}`} role="radiogroup" aria-label="Matéria preferida">
      {MATERIAS_CADASTRO.map(([v, t, e]) => <button key={v} type="button" role="radio" aria-checked={materia === v} className={materia === v ? 'on' : ''} onClick={() => setMateria(v)}><span aria-hidden="true">{e}</span>{t}</button>)}
    </div>
    <p className={`au-mats-dica ${fim ? 'fim' : ''}`} aria-hidden="true"><i>↓</i>role para ver as {MATERIAS_CADASTRO.length} matérias</p>
  </>;
}

// naoMedicina troca Dr./Dra. pelo título de visitante; o valor guardado continua Doutor/Doutora (é o que escolhe a foto padrão).
export function Escolhas({ titulo, setTitulo, materia, setMateria, foto, setFoto, tentou, naoMedicina = false, children }) {
  const epico = naoMedicina ? tituloVisitante(titulo) : materia ? tituloEpico(MATERIA_CADASTRO[materia]) : null;
  const rotulo = t => (naoMedicina ? tituloVisitante(t)[0].split(' ')[0] : t === 'Doutor' ? 'Dr.' : 'Dra.');
  return <>
    <div className="cr-f"><span className="cr-l">Título</span>
      <div className={`au-seg ${tentou && !titulo ? 'bad' : ''}`} role="radiogroup" aria-label="Título">
        {['Doutor', 'Doutora'].map(t => <button key={t} type="button" role="radio" aria-checked={titulo === t} className={titulo === t ? 'on' : ''} onClick={() => setTitulo(t)}>{rotulo(t)}<small>{naoMedicina ? 'no Plantão' : t}</small></button>)}
      </div>
    </div>
    {children}
    <div className="cr-f"><span className="cr-l">Matéria preferida</span>
      <Materias materia={materia} setMateria={setMateria} tentou={tentou} />
      {epico && <span className="cr-help au-ti">{naoMedicina ? 'Seu título no crachá' : 'Título épico no crachá'}: <b style={{ color: epico[2] }}>{naoMedicina && `${epico[1]} `}{epico[0]}</b></span>}
    </div>
    <div className="cr-f"><span className="cr-l">Foto do crachá</span>
      <div className="cr-fotos" role="radiogroup" aria-label="Foto do crachá">
        {FOTOS.map((ft, i) => <button key={ft.id} type="button" role="radio" aria-checked={foto === i} className={foto === i ? 'on' : ''} onClick={() => setFoto(i)} title={ft.nome}><Retrato f={ft} /></button>)}
      </div>
    </div>
  </>;
}

// Etapa do curso (1 a 12, ou formado) e "não sou de Medicina", decididos em 15/10/2026.
export function CursoCampos({ curso, setCurso, tentou }) {
  const { etapa, formado, naoMedicina } = curso;
  const mudar = novo => setCurso({ ...curso, ...novo });
  const porEtapa = v => mudar({ etapa: v === null ? null : Math.max(1, Math.min(ETAPA_MAXIMA, v)) });
  const travada = formado || naoMedicina;
  return <div className="cr-f"><label className="cr-l" htmlFor="cg-etapa">Etapa do curso</label>
    <div className="au-etapa">
      <div className={`au-num ${travada ? 'off' : ''}`}>
        <button type="button" aria-label="Diminuir etapa" disabled={travada || !etapa || etapa <= 1} onClick={() => porEtapa((etapa || 2) - 1)}>−</button>
        <input id="cg-etapa" inputMode="numeric" autoComplete="off" disabled={travada} aria-describedby="cg-etapa-suf" value={travada ? '' : etapa ?? ''}
          onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 2); porEtapa(d === '' ? null : Number(d)); }}
          onKeyDown={e => { if (e.key === 'ArrowUp') { e.preventDefault(); porEtapa((etapa || 0) + 1); } if (e.key === 'ArrowDown') { e.preventDefault(); porEtapa((etapa || 2) - 1); } }} />
        <button type="button" aria-label="Aumentar etapa" disabled={travada || etapa >= ETAPA_MAXIMA} onClick={() => porEtapa((etapa || 0) + 1)}>+</button>
      </div>
      <span className="au-num-suf" id="cg-etapa-suf">de {ETAPA_MAXIMA}</span>
      <label className="au-check" htmlFor="cg-formado">
        <input id="cg-formado" type="checkbox" checked={formado} disabled={naoMedicina} onChange={e => mudar({ formado: e.target.checked })} />
        <span className="box"><Check size={12} strokeWidth={3} /></span>Já sou formado(a)
      </label>
    </div>
    {tentou && !travada && !etapa && <span className="cr-help"><span className="cr-st no"><X size={13} />Escolha a etapa ou marque "Já sou formado(a)"</span></span>}
    <label className="au-check" htmlFor="cg-naomed">
      <input id="cg-naomed" type="checkbox" checked={naoMedicina} onChange={e => mudar({ naoMedicina: e.target.checked })} />
      <span className="box"><Check size={12} strokeWidth={3} /></span>Não sou de Medicina
    </label>
  </div>;
}

const semAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const destacar = (texto, busca) => {
  const i = busca ? semAcento(texto).indexOf(busca) : -1;
  return i < 0 ? texto : <>{texto.slice(0, i)}<mark>{texto.slice(i, i + busca.length)}</mark>{texto.slice(i + busca.length)}</>;
};
// Faculdade: menu com busca embutida (nome, sigla ou cidade, sem ligar para acentos) e "não achei" para digitar.
// A lista (cerca de 400 cursos) só carrega quando a tela abre.
export function MenuFaculdade({ valor, setValor, opcional, tentou }) {
  const [lista, setLista] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState(0);
  const [outra, setOutra] = useState(false);
  const raiz = useRef(null), botao = useRef(null), campoBusca = useRef(null), campoOutra = useRef(null);
  useEffect(() => { import('../utils/faculdadesMedicina').then(m => setLista(m.FACULDADES_MEDICINA)).catch(() => setLista([])); }, []);
  const doMenu = lista?.some(([n]) => n === valor);
  useEffect(() => { if (valor && lista && !doMenu) setOutra(true); }, [valor, lista, doMenu]);
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = e => { if (!raiz.current?.contains(e.target)) setAberto(false); };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto]);
  const q = semAcento(busca.trim());
  const itens = (lista || []).filter(([n, l]) => !q || semAcento(`${n} ${l}`).includes(q));
  const abrir = () => { setBusca(''); setAtivo(0); setAberto(true); setTimeout(() => campoBusca.current?.focus(), 0); };
  const fechar = (foco = true) => { setAberto(false); if (foco) botao.current?.focus(); };
  const escolher = i => {
    if (i === itens.length) { setOutra(true); setValor(''); fechar(false); setTimeout(() => campoOutra.current?.focus(), 0); return; }
    setOutra(false); setValor(itens[i][0]); fechar();
  };
  const tecla = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo(a => Math.min(a + 1, itens.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); escolher(Math.min(ativo, itens.length)); }
    else if (e.key === 'Escape') { e.preventDefault(); fechar(); }
  };
  useEffect(() => { if (aberto) raiz.current?.querySelector(`#fac-op-${ativo}`)?.scrollIntoView({ block: 'nearest' }); }, [ativo, aberto]);
  const mostrado = outra ? 'Outra faculdade' : valor;
  return <div className="cr-f"><span className="cr-l" id="cg-fac-l">Faculdade{opcional ? ' (opcional)' : ''}</span>
    <div className="au-fac" ref={raiz}>
      <button ref={botao} type="button" className={`au-fac-btn ${tentou && !opcional && !valor ? 'bad' : ''}`} aria-haspopup="listbox" aria-expanded={aberto}
        aria-labelledby="cg-fac-l cg-fac-v" onClick={() => (aberto ? fechar() : abrir())}>
        <span className={`val ${mostrado ? '' : 'ph'}`} id="cg-fac-v">{mostrado || 'Escolha sua faculdade'}</span><ChevronDown size={16} />
      </button>
      {aberto && <div className="au-fac-pop">
        <div className="au-fac-busca"><Search size={16} />
          <input ref={campoBusca} value={busca} placeholder="Busque por nome, sigla ou cidade" role="combobox" aria-expanded="true" aria-controls="cg-fac-lista"
            aria-autocomplete="list" aria-activedescendant={`fac-op-${ativo}`} autoComplete="off" onChange={e => { setBusca(e.target.value); setAtivo(0); }} onKeyDown={tecla} />
        </div>
        <ul className="au-fac-lista" id="cg-fac-lista" role="listbox" aria-labelledby="cg-fac-l">
          {!lista ? <li className="vazio">Carregando a lista…</li> : !itens.length && <li className="vazio">Nada encontrado para “{busca}”.</li>}
          {itens.map(([n, l], i) => <li key={`${n}|${l}`} id={`fac-op-${i}`} role="option" aria-selected={valor === n} className={i === ativo ? 'ativo' : ''}
            onPointerDown={e => e.preventDefault()} onClick={() => escolher(i)}><span>{destacar(n, q)}</span><small>{l}</small></li>)}
          <li id={`fac-op-${itens.length}`} role="option" aria-selected={outra} className={`outra ${ativo === itens.length ? 'ativo' : ''}`}
            onPointerDown={e => e.preventDefault()} onClick={() => escolher(itens.length)}>Não achei · digitar outra</li>
        </ul>
      </div>}
    </div>
    {outra && <span className={`cr-in au-in ${tentou && !opcional && !valor ? 'bad' : ''}`}>
      <input ref={campoOutra} aria-label="Nome da sua faculdade" maxLength={120} placeholder="Nome da sua faculdade" value={valor} onChange={e => setValor(e.target.value)} />
    </span>}
    <span className="cr-help au-ti">{opcional ? 'Se a sua não estiver na lista, use “digitar outra”.' : 'Lista de cursos de Medicina do Censo da Educação Superior (INEP/MEC).'}</span>
  </div>;
}

// Impressão do crachá enquanto o cadastro grava. Até o tempo previsto o crachá sai quase inteiro;
// o último trecho só sai quando o servidor confirma. etapa: índice do passo em andamento (passos.length = concluído).
const PREVISTO_MS = 2600;
export function Impressao({ cracha, passos, etapa, erro, tentativa, aoTentar, aoRevisar, aoEntrar }) {
  const ctl = useAnimationControls();
  const [saiu, setSaiu] = useState(null);
  const concluido = etapa >= passos.length;
  useEffect(() => {
    ctl.set({ y: '-101%' });
    if (animar()) ctl.start({ y: '-9%', transition: { duration: PREVISTO_MS / 1000, ease: [0.25, 0.1, 0.35, 1] } });
    return () => ctl.stop();
  }, [tentativa, ctl]);
  useEffect(() => { if (erro) ctl.stop(); }, [erro, ctl]);
  useEffect(() => {
    if (!concluido) return undefined;
    let vivo = true;
    const fim = animar() ? ctl.start({ y: '0%', transition: { duration: .5, ease: [0.16, 1, 0.3, 1] } }) : Promise.resolve(ctl.set({ y: '0%' }));
    fim.then(() => { if (vivo) setSaiu(tentativa); });
    return () => { vivo = false; };
  }, [concluido, ctl, tentativa]);
  const pronto = concluido && saiu === tentativa;
  const doutora = tratamento(cracha.p.titulo) === 'Dra.';
  const primeiro = String(cracha.nome || '').trim().split(/\s+/)[0];
  return <motion.div className="au-print" role="dialog" aria-modal="true" aria-label="Emissão do crachá" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="pr-in">
      <span className="kicker">Recepção · emissão de crachá</span>
      <h2>{pronto ? `Bem-vind${doutora ? 'a' : 'o'} ao plantão, ${prefixoTitulo(cracha.p) ? `${prefixoTitulo(cracha.p)} ` : ''}${primeiro}` : erro ? 'A impressora parou' : 'Imprimindo seu crachá'}</h2>
      <div className="pr-machine">
        <div className="pr-slot" aria-hidden="true"><span className={`pr-led ${erro ? 'err' : pronto ? 'ok' : ''}`} /><span className="pr-mouth" /></div>
        <div className="pr-window">
          <motion.div className="pr-card" animate={ctl}>
            <div className={`cr-card ${pronto ? 'pr-shine' : ''}`}><div className="cr-inner"><CrachaFrente {...cracha} /></div></div>
          </motion.div>
        </div>
      </div>
      <ol className="pr-steps">{passos.map((t, i) => {
        const st = erro && i === etapa ? 'err' : i < etapa || pronto ? 'done' : i === etapa ? 'on' : '';
        return <li key={t} className={st}>{st === 'done' ? <Check size={13} /> : st === 'err' ? <X size={13} /> : st === 'on' ? <span className="spin sm" /> : <span className="au-dot" />}{t}</li>;
      })}</ol>
      <AnimatePresence mode="wait">
        {pronto && <motion.div key="ok" className="pr-act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="pr-stamp"><Sparkles size={14} />Crachá emitido · missões do dia liberadas</span>
          <button className="primary" onClick={aoEntrar}><Stethoscope />Entrar no plantão</button>
        </motion.div>}
        {erro && <motion.div key="err" className="pr-act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="cr-err" role="alert">{erro}</p>
          <button className="primary" onClick={aoTentar}><RotateCw />Tentar de novo</button>
          <button className="ghost" onClick={aoRevisar}>Revisar dados</button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </motion.div>;
}
