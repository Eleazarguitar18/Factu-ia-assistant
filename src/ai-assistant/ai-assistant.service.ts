import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
// Importa tus servicios CRUD existentes aquí
import { ServiciosFijosService } from 'src/servicios-fijos/servicios-fijos.service';
import { FacturasService } from 'src/facturas/facturas.service';

@Injectable()
export class AiAssistantService {
  private openai: OpenAI;
  private systemInstruction: string;
  private readonly logger = new Logger(AiAssistantService.name);

  private readonly MODELO_TEXTO = 'llama-3.3-70b-versatile';
  private readonly MODELO_VISION = 'llama-3.1-8b-instant';

  constructor(
    // Inyectamos tus CRUDs existentes
    private readonly serviciosFijosService: ServiciosFijosService,
    private readonly facturasService: FacturasService,
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    const promptPath = path.join(
      process.cwd(),
      'src/ai-assistant/prompts/ia-promt.md',
    );
    this.systemInstruction = fs.readFileSync(promptPath, 'utf8');
  }

  /**
   * Maneja la conversación guiada paso a paso.
   * Enviamos el historial completo para que recuerde qué datos ya se validaron.
   */
  async procesarConversacion(
    textoUser: string,
    historial: any[] = [],
  ): Promise<string> {
    try {
      this.logger.log(`[IA-ASSISTANT] Entrada de usuario: "${textoUser}"`);

      const respuestaFinal = await this.openai.chat.completions.create({
        model: this.MODELO_TEXTO,
        messages: [
          { role: 'system', content: this.systemInstruction },
          ...historial,
          { role: 'user', content: textoUser },
        ],
        temperature: 0.2, // Muy baja para evitar que invente preguntas o converse de más
      });

      return (
        respuestaFinal.choices[0].message.content?.trim() ||
        'No obtuve respuesta.'
      );
    } catch (error) {
      this.logger.error('Error en el procesamiento del chat:', error);
      return '⚠️ Error técnico al procesar el chat con el asistente.';
    }
  }

  /**
   * Analiza la imagen cargada en Base64 para extraer exclusivamente los campos requeridos.
   */
  async extraerCamposDeImagen(base64Image: string): Promise<string> {
    try {
      this.logger.log(`[IA-ASSISTANT] Extrayendo datos de imagen...`);

      const instruccionesVision = `
        ${this.systemInstruction}
        
        INSTRUCCIÓN DE VISIÓN CRÍTICA:
        Analiza el documento provisto en la imagen. Tu único objetivo es extraer los siguientes datos si están presentes:
        - Nombre del Servicio (ej. ENTEL INTERNET, DELAPAZ LUZ)
        - Código de Cliente / Número de cuenta / Código fijo
        - Monto de la factura
        - Mes del periodo (ej. enero, febrero, etc.)
        - Año (ej. 2026)

        Devuelve únicamente los datos que logres encontrar de forma estructurada para continuar la conversación con el usuario. No asumas ni inventes datos que no se lean con claridad.
      `;

      const respuestaFinal = await this.openai.chat.completions.create({
        model: this.MODELO_VISION,
        messages: [
          { role: 'system', content: instruccionesVision.trim() },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza la siguiente imagen y extrae la información para las tablas.',
              },
              { type: 'image_url', image_url: { url: base64Image } },
            ],
          },
        ],
        temperature: 0.1,
      });

      return (
        respuestaFinal.choices[0].message.content?.trim() ||
        'No se pudo leer la imagen.'
      );
    } catch (error) {
      this.logger.error('Error en análisis de visión:', error);
      return '⚠️ Error técnico al procesar la imagen.';
    }
  }
}
