export const chamarOpenRouter = async (prompt, options = {}) => {
  const response = await fetch('/api/ia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      temperature: options.temperature ?? 0.2
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Falha na comunicação com o serviço de IA.');
    error.code = data.code;
    throw error;
  }

  return data.content;
};
