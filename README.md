# 🧾 Factu - Asistente de Registro y Seguimiento de Facturas

**Factu** es un asistente automatizado de uso personal diseñado para simplificar la captura, almacenamiento, extracción de datos y seguimiento de facturas de compras y gastos. Funciona directamente a través de **WhatsApp** como interfaz de usuario, procesando la información con Inteligencia Artificial y organizando los respaldos en la nube de forma automatizada.

---

## 🛠️ Arquitectura y Stack Tecnológico

El sistema está construido como un servicio **Backend-only** (por el momento), utilizando un flujo basado en eventos y procesamiento de archivos multimedia:

- **Interfaz de Usuario / Cliente:** WhatsApp mediante **Baileys v7** (`@whiskeysockets/baileys`), interactuando de forma nativa con mensajes de texto e imágenes.
- **Motor de Inteligencia Artificial:** **Groq API** utilizando el modelo multimodal **`qwen/qwen3.6-27b`** o **`meta-llama/llama-4-scout-17b-16e-instruct`**, permitiendo la extracción de datos por visión (OCR + estructuración de datos).
- **Almacenamiento de Archivos (Respaldos):** **Google Drive API** para guardar las imágenes originales de las facturas organizadas en carpetas.
- **Base de Datos Relacional:** **PostgreSQL** para almacenar los metadatos estructurados de las facturas (monto, NIT/RUC, razón social, fecha, categoría de gasto) para su posterior consulta y reportería web.

---

## 📂 Flujo de Trabajo del Asistente
