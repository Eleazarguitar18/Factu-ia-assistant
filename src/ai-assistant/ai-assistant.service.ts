import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiAssistantService {
  private openai: OpenAI;
  private systemInstruction: string;
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly MODELO_IA = 'llama-3.3-70b-versatile';

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1', // URL de tu pasarela Groq
      apiKey: process.env.GROQ_API_KEY,
    });

    // Cambiado para que lea el archivo genérico ia-prompt.md
    const promptPath = path.join(
      process.cwd(),
      'src/ai-assistant/prompts/ia-promt.md',
    );
    this.systemInstruction = fs.readFileSync(promptPath, 'utf8');
  }

  async procesarConsulta(texto: string): Promise<string> {
    try {
      this.logger.log(`[IA-ASSISTANT] Solicitud: "${texto}"`);

      // Llamada directa usando la instrucción del archivo markdown
      const respuestaFinal = await this.openai.chat.completions.create({
        model: this.MODELO_IA,
        messages: [
          {
            role: 'system',
            content: this.systemInstruction,
          },
          {
            role: 'user',
            content: texto,
          },
        ],
        temperature: 0.7,
      });

      return (
        respuestaFinal.choices[0].message.content?.trim() ||
        'Sin datos disponibles.'
      );
    } catch (error) {
      this.logger.error('Error crítico en el flujo del Asistente:', error);
      return '⚠️ Error técnico al procesar la consulta con la IA.';
    }
  }
}
