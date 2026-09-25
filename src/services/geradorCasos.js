import HOUSE_PROMPT from '../../.cursor/skills/skill-gerar-caso-house.md?raw';
import IATROGENIA_PROMPT from '../../.cursor/skills/skill-gerar-caso-iatrogenia.md?raw';
import { chamarOpenRouter } from './openrouter';

/**
 * Gera um novo caso clínico complexo utilizando a lógica da Skill "Dr. House"
 * e a API de IA configurada no servidor.
 * 
 * @returns {Promise<Object>} O objeto do caso clínico pronto para ser usado no estado React.
 */
export const gerarNovoPacienteHouse = async () => {
    try {
        let contentText = await chamarOpenRouter(`${HOUSE_PROMPT}\n\nGere um novo caso clínico agora, seguindo estritamente o formato JSON e as regras de mecânicas ocultas.`, { temperature: 0.9 });

        // Limpeza de redundâncias de markdown (mesmo com responseMimeType, é seguro manter)
        contentText = contentText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const casoClinico = JSON.parse(contentText);
            return casoClinico;
        } catch {
            console.error("Erro ao processar JSON da IA.");
            throw new Error("O prontuário da IA veio com erros de formatação. O Dr. House está ilegível.");
        }

    } catch (error) {
        console.error("Erro em gerarNovoPacienteHouse:", error);
        throw error;
    }
};

/**
 * Gera um novo caso clínico de Iatrogenia (Modo Hardcore)
 * utilizando a Skill específica e a API de IA configurada no servidor.
 */
export const gerarCasoIatrogeniaHardcore = async () => {
    try {
        let contentText = await chamarOpenRouter(`${IATROGENIA_PROMPT}\n\nGere um novo caso de iatrogenia crítica agora, seguindo estritamente o formato JSON solicitado.`, { temperature: 1.0 });
        contentText = contentText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const casoHardcore = JSON.parse(contentText);
            return casoHardcore;
        } catch {
            console.error("Erro ao processar JSON Hardcore.");
            throw new Error("Falha ao decifrar o prontuário de emergência.");
        }
    } catch (error) {
        console.error("Erro em gerarCasoIatrogeniaHardcore:", error);
        throw error;
    }
};
