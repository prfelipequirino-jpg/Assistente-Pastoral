
import { GoogleGenAI, Type } from "@google/genai";
import { EventCategory, MessageAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMessage = async (message: string): Promise<MessageAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise a seguinte mensagem do WhatsApp e extraia informações de agendamento.
    
    Mensagem: "${message}"
    
    Data de Hoje: ${new Date().toLocaleDateString('pt-BR')}
    
    Regras:
    1. Determine se a mensagem contém um compromisso ou evento futuro.
    2. Extraia o título do evento.
    3. Identifique a data (se for "amanhã", calcule baseado na data de hoje).
    4. Identifique o horário de início e fim (se não houver fim, presuma 1 hora de duração).
    5. Categorize obrigatoriamente como: "Agenda Pastoral" (atividades de igreja, aconselhamento, sermão), "Evento Familiar" (festas, reuniões de família, lazer com parentes) ou "Outro".
    
    Responda EXCLUSIVAMENTE em formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isEvent: { type: Type.BOOLEAN },
          title: { type: Type.STRING },
          date: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
          startTime: { type: Type.STRING, description: "Formato HH:mm" },
          endTime: { type: Type.STRING, description: "Formato HH:mm" },
          category: { 
            type: Type.STRING, 
            description: "Deve ser 'Agenda Pastoral', 'Evento Familiar' ou 'Outro'" 
          },
          reasoning: { type: Type.STRING }
        },
        required: ["isEvent", "title", "date", "startTime", "endTime", "category"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as MessageAnalysis;
};
