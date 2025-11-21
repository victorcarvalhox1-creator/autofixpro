import { GoogleGenAI, Type } from "@google/genai";
import { ServiceOrder, Part } from "../types";

// Ideally process.env.API_KEY, but handling graceful fallback/mock if missing in this demo context
const apiKey = process.env.API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeOSRisk = async (os: ServiceOrder): Promise<string> => {
  if (!ai) return "AI não configurada (Sem API Key).";

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Analise a seguinte Ordem de Serviço de uma oficina de funilaria e pintura.
      Identifique riscos de atraso, inconsistências financeiras ou problemas com peças.
      Seja breve e direto, focando em alertas para o gestor.

      Dados da OS:
      Veículo: ${os.vehicle.brand} ${os.vehicle.model} (${os.vehicle.year})
      Descrição do Dano: ${os.description}
      Status Atual: ${os.status}
      Previsão Entrega: ${os.deliveryForecast}
      Peças Solicitadas: ${os.parts.map(p => `${p.name} (${p.status})`).join(', ') || 'Nenhuma peça listada'}
      
      Responda em português, em formato de texto simples (bullet points).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar análise.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Erro ao conectar com o serviço de IA.";
  }
};

export const suggestParts = async (description: string, carModel: string): Promise<any[]> => {
   if (!ai) return [];
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `Baseado na descrição do acidente: "${description}" para o carro "${carModel}", liste 3 a 5 peças que provavalmente precisarão ser trocadas.`,
       config: {
         responseMimeType: "application/json",
         responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               partName: { type: Type.STRING },
               probability: { type: Type.STRING, description: "Alta, Média ou Baixa" }
             }
           }
         }
       }
     });
     
     return JSON.parse(response.text || "[]");
   } catch (e) {
     console.error(e);
     return [];
   }
}

export const estimateWorkload = async (description: string, carModel: string): Promise<{ estimatedDays: number, estimatedLaborCost: number, reasoning: string }> => {
  if (!ai) return { estimatedDays: 0, estimatedLaborCost: 0, reasoning: "IA não configurada." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Para um serviço de funilaria e pintura em um ${carModel} com o seguinte dano: "${description}", estime o tempo em dias úteis e o custo aproximado de mão de obra em Reais (BRL).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedDays: { type: Type.INTEGER },
            estimatedLaborCost: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Erro ao estimar carga de trabalho:", e);
    return { estimatedDays: 5, estimatedLaborCost: 1000, reasoning: "Estimativa padrão (Erro IA)." };
  }
}
