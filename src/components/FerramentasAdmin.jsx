import { useState } from 'react';
import { chamarPerfilPlanilha } from '../services/perfilPlanilha';

export default function FerramentasAdmin({ usuario, dadosUsuario, setDadosUsuario }) {
  const [operacao, setOperacao] = useState('setXP');
  const [valor, setValor] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  if (dadosUsuario?.role !== 'admin') return null;

  const executar = async evento => {
    evento.preventDefault();
    setOcupado(true);
    setMensagem('');
    try {
      const perfil = await chamarPerfilPlanilha(usuario, 'admin', { operacao, valor: Number(valor) });
      setDadosUsuario(perfil);
      setMensagem('Alteração salva na planilha.');
    } catch (erro) {
      setMensagem(erro.message || 'Não foi possível salvar.');
    } finally {
      setOcupado(false);
    }
  };

  return <section aria-label="Alterações de progresso">
    <p className="text-slate-300 text-xs mb-3">As alterações abaixo são salvas nos dados reais.</p>
    <form onSubmit={executar} className="flex flex-col gap-3">
      <label className="text-sm">Alteração<select value={operacao} onChange={evento => setOperacao(evento.target.value)} className="block rounded-xl bg-[#0B1120] border border-cyan-500/30 p-2 text-white"><option value="setXP">Definir XP global</option><option value="setNivelGlobal">Definir nível global</option><option value="resetarProgresso">Zerar progresso</option></select></label>
      {operacao !== 'resetarProgresso' && <label className="text-sm">Valor<input type="number" min="0" max={operacao === 'setXP' ? 1000000000 : 1000} required value={valor} onChange={evento => setValor(evento.target.value)} className="block rounded-xl bg-[#0B1120] border border-cyan-500/30 p-2 text-white" /></label>}
      <button className="stitch-primary" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Aplicar'}</button>
    </form>
    {mensagem && <p role="status" className="text-sm mt-2">{mensagem}</p>}
  </section>;
}
