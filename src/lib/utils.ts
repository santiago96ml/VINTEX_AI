import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

// --- NUEVA FUNCIÓN: LIMPIEZA DE CHAT ---
export const cleanChatMessage = (content: any): string => {
  if (!content) return "";

  // 1. Si es un objeto (JSON ya parseado por la DB)
  if (typeof content === 'object') {
    if (content.output) {
      // Extraemos solo los textos de mensaje_1, mensaje_2, etc.
      return Object.values(content.output)
        .filter((val: any) => typeof val === 'string' && val.trim().length > 0)
        .join(' ');
    }
    return content.text || JSON.stringify(content);
  }

  // 2. Si es un string (Texto plano o JSON stringificado)
  if (typeof content === 'string') {
    const trimmed = content.trim();

    // Caso Usuario: "Mensaje del paciente en texto: ..."
    if (trimmed.includes('Mensaje del paciente en texto:')) {
      return trimmed
        .replace('Mensaje del paciente en texto:', '')
        .replace('Mensaje del paciente en transcripción del audio:', '') // Eliminamos la segunda etiqueta
        .trim();
    }

    // Caso Asistente: JSON String
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return cleanChatMessage(parsed); // Recursivo para manejar el objeto
      } catch (e) {
        return content; // Si falla el parseo, devolvemos el original
      }
    }
  }

  return String(content);
};