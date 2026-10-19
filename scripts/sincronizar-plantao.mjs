// Os motores do Apps Script estão congelados e este script não gera mais nada:
// - docs/historico/apps-script/plantao-motor.gs (Plantão, Erro médico e Causa e efeito) desde 13/10/2026;
// - docs/historico/apps-script/treinos-motor.gs (treinos, missões e Revisão) desde 19/10/2026, na economia v2.
// O Apps Script é o backend antigo; o site só usa a Edge Function do Supabase (sincronizada por scripts/sincronizar-supabase.mjs).
console.log('Motores do Apps Script congelados (docs/historico/apps-script); nada a sincronizar.');
