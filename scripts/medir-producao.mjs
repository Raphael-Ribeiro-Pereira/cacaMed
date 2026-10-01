// Leituras públicas controladas; não acessa credenciais nem altera progresso.
import { writeFile } from 'node:fs/promises';
const base = 'https://lruzndfqfivlvcckvgbw.supabase.co/functions/v1/cacamed-api';
const stats = rows => {
  const sorted = rows.map(r => r.ms).sort((a,b)=>a-b);
  return { chamadas: rows.length, falhas: rows.filter(r=>r.status!==200).length,
    mediaMs: Math.round(sorted.reduce((a,b)=>a+b,0)/sorted.length),
    medianaMs: Math.round(sorted[Math.floor(sorted.length/2)]), p95Ms: Math.round(sorted[Math.ceil(sorted.length*.95)-1]),
    maxMs: Math.round(sorted.at(-1)) };
};
async function measure(url) {
  const start=performance.now();
  try {
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
    const bytes=(await response.arrayBuffer()).byteLength;
    return { ms: Math.round(performance.now()-start), status:response.status, bytes,
      serverTiming:response.headers.get('server-timing') };
  } catch { return { ms:Math.round(performance.now()-start),status:0 }; }
}
const report={ data:new Date().toISOString(), ambiente:'HTTP no computador, sem simulação de rede celular',
  primeiraRequisicao:await measure('https://caca-med.vercel.app/'),
  primeiraAPI:await measure(base+'?acao=ranking'), lotes:[] };
for(const concurrent of [1,10,25,50,100]) {
  const rows=await Promise.all(Array.from({length:concurrent},()=>measure(base+'?acao=ranking')));
  report.lotes.push({ simultaneas:concurrent,...stats(rows),amostras:rows });
  console.log(JSON.stringify({ simultaneas:concurrent,...stats(rows) }));
}
await writeFile(new URL('../docs/medicao-producao-2026-09-30.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ primeiraRequisicao:report.primeiraRequisicao,primeiraAPI:report.primeiraAPI }));
