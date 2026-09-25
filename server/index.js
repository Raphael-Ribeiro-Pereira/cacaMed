/* global process */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.API_PORT || 3001);
const model = process.env.OPENROUTER_MODEL || 'qwen/qwen3.8-27b:free';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '256kb' }));

app.get('/', (_req, res) => {
  res.json({ app: 'cacoMed', status: 'online', service: 'api' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/ia', async (req, res) => {
  const { prompt, temperature = 0.2 } = req.body || {};

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY não configurada.' });
  }

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'O prompt é obrigatório.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'cacoMed'
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const providerError = data?.error || {};
      console.error(`[IA] OpenRouter respondeu HTTP ${response.status}: ${providerError.code || 'sem código'} — ${providerError.message || 'sem mensagem'}`);
      if (response.status === 429) {
        return res.status(429).json({
          error: 'O limite do OpenRouter foi atingido. Aguarde alguns instantes ou verifique sua cota.',
          code: 'OPENROUTER_RATE_LIMIT'
        });
      }
      return res.status(response.status).json({ error: 'Falha na comunicação com o serviço de IA.' });
    }

    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim() === '') {
      console.error('[IA] Resposta sem conteúdo utilizável.');
      return res.status(502).json({ error: 'O serviço de IA não retornou conteúdo.' });
    }

    return res.json({ content });
  } catch {
    console.error('[IA] Erro de comunicação com OpenRouter.');
    return res.status(502).json({ error: 'Não foi possível conectar ao serviço de IA.' });
  }
});

app.listen(port, () => {
  console.log(`[API] cacoMed IA disponível em http://localhost:${port}`);
});
