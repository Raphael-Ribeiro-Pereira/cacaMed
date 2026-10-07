import EtapasDdx from './EtapasDdx';

// Erro médico: auditoria de um atendimento em quatro etapas (visual e fluxo em EtapasDdx).
export default function ErroMedico(props) {
  return <EtapasDdx modo="erroMedico" {...props} />;
}
