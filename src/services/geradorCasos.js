import HOUSE_PROMPT from '../../.cursor/skills/skill-gerar-caso-house.md?raw';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Usando Gemini 2.0 Flash Experimental conforme solicitado pelo usuário
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

/**
 * Gera um novo caso clínico complexo utilizando a lógica da Skill "Dr. House"
 * e a API do Gemini 2.0.
 * 
 * @returns {Promise<Object>} O objeto do caso clínico pronto para ser usado no estado React.
 */
export const gerarNovoPacienteHouse = async () => {
    try {
        if (!API_KEY) {
            throw new Error("Chave de API do Gemini não configurada.");
        }

        const payload = {
            contents: [{
                parts: [{
                    text: `${HOUSE_PROMPT}\n\nGere um novo caso clínico agora, seguindo estritamente o formato JSON e as regras de mecânicas ocultas.`
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: "application/json" // Força o retorno em JSON se o modelo suportar
            }
        };

        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Erro na API do Gemini:", errorBody);
            throw new Error(`Falha na comunicação com o laboratório central (IA). Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("A IA não retornou nenhum diagnóstico. Tente novamente.");
        }

        let contentText = data.candidates[0].content.parts[0].text;

        // Limpeza de redundâncias de markdown (mesmo com responseMimeType, é seguro manter)
        contentText = contentText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const casoClinico = JSON.parse(contentText);
            console.log("Caso House gerado com sucesso:", casoClinico.paciente.nome);
            return casoClinico;
        } catch (parseError) {
            console.error("Erro ao processar JSON da IA:", contentText);
            throw new Error("O prontuário da IA veio com erros de formatação. O Dr. House está ilegível.");
        }

    } catch (error) {
        console.error("Erro em gerarNovoPacienteHouse:", error);
        throw error;
    }
};
