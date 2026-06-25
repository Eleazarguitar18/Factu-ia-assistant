import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { ReportesService } from 'src/reportes/services/reportes.service';

@Injectable()
export class AiAssistantService {
  private openai: OpenAI;
  private systemInstruction: string;
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    // Inyectamos únicamente tu servicio de reportes existente
    private readonly reportesService: ReportesService,
  ) {
    this.openai = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    const promptPath = path.join(
      process.cwd(),
      'src/ai-assistant/prompts/kantuta.promt.md',
    );
    this.systemInstruction = fs.readFileSync(promptPath, 'utf8');
  }

  /**
   * Extrae rangos de fechas en formato YYYY-MM-DD a partir de un texto libre
   */
  private extraerFechas(texto: string): { inicio: string; fin: string } {
    const hoy = new Date();
    const formatoFecha = (d: Date) => d.toISOString().split('T')[0];

    // Expresión regular básica para buscar fechas YYYY-MM-DD
    const matches = texto.match(/\d{4}-\d{2}-\d{2}/g);

    if (matches && matches.length >= 2) {
      return { inicio: matches[0], fin: matches[1] };
    } else if (matches && matches.length === 1) {
      return { inicio: matches[0], fin: formatoFecha(hoy) };
    }

    // Por defecto si no encuentra fechas legibles, asume el día de hoy
    return { inicio: formatoFecha(hoy), fin: formatoFecha(hoy) };
  }

  async procesarConsulta(texto: string): Promise<string> {
    try {
      this.logger.log(`[IA-ASSISTANT] Procesando consulta: "${texto}"`);

      // 1. PASO DE CLASIFICACIÓN (Detectar qué reporte necesita el usuario)
      const clasificacion = await this.openai.chat.completions.create({
        model: 'llama3-8b-8192', // Modelo rápido y económico para etiquetar la intención
        messages: [
          {
            role: 'system',
            content: `Tu única tarea es analizar la consulta del usuario y responder estrictamente con una de estas 4 palabras clave:
            - DASHBOARD: Si pregunta por estadísticas generales de hoy, ventas de hoy, recargas de hoy, productos más vendidos o stock bajo.
            - RANGO: Si pide explícitamente reportes de ventas filtrados por fechas, días específicos, meses o rangos temporales.
            - INVENTARIO: Si pregunta por totales de inventario, costos globales en almacén, precios totales o ganancias proyectadas.
            - RECHAZAR: Si saluda de forma casual, hace preguntas externas (cocina, tareas, chistes, programación) o temas ajenos a Kantuta POS.
            No agregues introducciones, explicaciones, ni signos de puntuación. Solo responde con la palabra clave exacta.`,
          },
          { role: 'user', content: texto },
        ],
        temperature: 0.0,
      });

      const intencion =
        clasificacion.choices[0].message.content?.trim().toUpperCase() ||
        'RECHAZAR';
      this.logger.log(`[IA-ASSISTANT] Intención detectada: ${intencion}`);

      // Si la intención es ajena al negocio, cortamos el flujo inmediatamente
      if (intencion.includes('RECHAZAR')) {
        return '🤖 *Kantuta AI:* Lo siento, como asistente de *Kantuta POS*, únicamente estoy autorizado para responder consultas relacionadas con la administración, ventas, inventarios y analíticas del negocio.';
      }

      // 2. OBTENCIÓN DE DATOS REALES SEGÚN LA INTENCIÓN
      let dataCruda: any = null;
      const anioActual = new Date().getFullYear();

      if (intencion.includes('DASHBOARD')) {
        dataCruda = await this.reportesService.getDashboardStats(anioActual);
      } else if (intencion.includes('RANGO')) {
        const { inicio, fin } = this.extraerFechas(texto);
        dataCruda = await this.reportesService.getVentasRangoData(
          inicio,
          fin,
          'Asistente_IA',
        );
      } else if (intencion.includes('INVENTARIO')) {
        dataCruda =
          await this.reportesService.getInventarioData('Asistente_IA');
      }

      // 3. RESPUESTA FINAL (La IA formatea los datos reales de tu base de datos)
      const respuestaFinal = await this.openai.chat.completions.create({
        model: 'llama3-70b-8192', // Modelo grande y preciso para redactar el informe final
        messages: [
          { role: 'system', content: this.systemInstruction },
          {
            role: 'system',
            content: `DATOS REALES EXTRAÍDOS DEL SISTEMA KANTUTA POS:
            ${JSON.stringify(dataCruda)}
            
            Instrucciones críticas:
            - Usa obligatoriamente los datos reales provistos arriba para responder la consulta del usuario.
            - Responde de forma concisa empleando negritas de markdown y viñetas (bullet points) para lectura rápida en WhatsApp.
            - Si los datos contienen montos, descríbelos claramente en moneda local.`,
          },
          { role: 'user', content: texto },
        ],
        temperature: 0.3,
      });

      return (
        respuestaFinal.choices[0].message.content ||
        'Sin respuesta en la capa de redacción.'
      );
    } catch (error) {
      this.logger.error(
        'Error crítico en el servicio AiAssistantService:',
        error,
      );
      return '⚠️ *Kantuta AI:* Estoy experimentando dificultades técnicas para consultar los reportes en este momento. Por favor, intenta de nuevo en unos minutos.';
    }
  }
}
