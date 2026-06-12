
// Fix: Use direct process.env.API_KEY and correct property access for response text.
import { GoogleGenAI, Chat } from "@google/genai";
import { VectorData, AIExplanation } from "../types";

// Initialize lazily to prevent crashing when API key is missing
let ai: GoogleGenAI | null = null;
let activeChat: Chat | null = null;

const getAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const startExploration = async (
  v1: VectorData,
  v2: VectorData,
  op: string,
  result: number | VectorData
): Promise<AIExplanation> => {
  const resultStr = typeof result === 'number' 
    ? result.toFixed(4) 
    : `(${result.x}, ${result.y}, ${result.z})`;

  const systemInstruction = `
    Eres un Mentor de Geometría Vectorial ultra-dinámico. 
    Tu estilo es:
    1. EXTREMADAMENTE BREVE: Máximo 3 frases cortas.
    2. DINÁMICO: Usa emojis para resaltar conceptos (🚀, 📐, 🛠️).
    3. DIRECTO: Ve al grano, sin introducciones largas.
    4. RESPUESTAS EN ESPAÑOL.
  `;

  const aiInstance = getAI();
  if (!aiInstance) {
    return {
      title: "IA no disponible ⚠️",
      explanation: "No se configuró la API KEY de Gemini.",
      physicalInterpretation: "La aplicación funciona sin IA, pero el tutor está desactivado."
    };
  }

  // Start chat with model name and config as per guidelines.
  activeChat = aiInstance.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    }
  });

  const prompt = `
    Analiza esta acción:
    Vectores: A(${v1.x}, ${v1.y}, ${v1.z}) y B(${v2.x}, ${v2.y}, ${v2.z})
    Operación: ${op}
    Resultado: ${resultStr}

    Genera un JSON con:
    - title: Título corto con emoji (ej: "¡Suma Explosiva! 🚀").
    - explanation: Explicación en 2 puntos clave muy breves.
    - physicalInterpretation: Ejemplo de uso real en una sola frase.
    
    Responde ÚNICAMENTE el JSON.
  `;

  const response = await activeChat.sendMessage({ message: prompt });
  
  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonStr) as AIExplanation;
  } catch (err) {
    return {
      title: "Resultado 🎯",
      explanation: "Operación completada con éxito en el espacio vectorial.",
      physicalInterpretation: "Este cálculo es vital para motores de física y navegación."
    };
  }
};

export const askFollowUp = async (question: string): Promise<string> => {
  if (!activeChat) {
    throw new Error("No hay una sesión de chat activa. Realiza una operación primero.");
  }
  // Enfatizar brevedad en preguntas de seguimiento
  const prompt = `Responde de forma ultra-breve (máximo 40 palabras) a: ${question}`;
  const response = await activeChat.sendMessage({ message: prompt });
  return response.text || "No hay respuesta.";
};
