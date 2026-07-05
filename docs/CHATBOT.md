# Chatbot IA con OpenRouter + Tool Calling

## Objetivo

Un asistente que responde **únicamente con datos reales** de la tienda. El LLM
**no tiene acceso** a la base de datos: sólo puede *pedir* información llamando a
herramientas (function calling) que **nosotros** ejecutamos contra Supabase en el
servidor. Si un dato no viene de una herramienta, el modelo no debe inventarlo.

## Sobre el modelo `openrouter/free`

`openrouter/free` **no es un id de modelo válido** en OpenRouter. Además, muchos
modelos gratuitos **no soportan tool calling**. Por eso el modelo es
**configurable** vía `OPENROUTER_MODEL` y por defecto usamos un modelo gratuito
que **sí** soporta herramientas, por ejemplo:

- `meta-llama/llama-3.3-70b-instruct:free`
- `qwen/qwen-2.5-72b-instruct:free`
- `mistralai/mistral-small-3.1-24b-instruct:free`

OpenRouter expone una API **compatible con OpenAI**, así que usamos el SDK
`openai` apuntando a `https://openrouter.ai/api/v1`.

## Arquitectura del flujo (bucle de herramientas)

```
Cliente (widget chat)
   │  POST /api/chat  { messages, conversationId }
   ▼
Route Handler  app/api/chat/route.ts
   │  1. Construye system prompt + historial (memoria de conversación)
   │  2. Llama a OpenRouter con la lista de "tools" (JSON schema)
   ▼
OpenRouter (LLM)
   │  Decide: ¿responder o llamar una herramienta?
   │  → devuelve tool_calls: [ search_products({ query, color, size }) ]
   ▼
Servidor ejecuta la herramienta  → consulta Supabase (datos REALES)
   │  → devuelve el resultado (JSON) al modelo como mensaje "tool"
   ▼
OpenRouter (LLM)  vuelve a razonar con los datos reales
   │  (puede encadenar más herramientas: maxSteps)
   ▼
Respuesta final en lenguaje natural + productos citados
   │  → se persiste en chatbot_messages (analítica de "más consultados")
   ▼
Cliente renderiza texto + tarjetas de producto + sugerencias rápidas
```

## Herramientas expuestas al modelo (`services/chatbot/tools.ts`)

Cada herramienta tiene un **JSON Schema** (parámetros) y un ejecutor tipado que
consulta Supabase con el cliente admin (sólo lectura de catálogo publicado):

| Herramienta | Para qué sirve |
|-------------|----------------|
| `search_products` | Buscar por nombre/categoría/marca/color/talla/material/keywords, con filtros de precio, oferta, novedad, disponibilidad. |
| `get_product_details` | Ficha completa de un producto (descripción, material, variantes, stock). |
| `check_availability` | Stock y estado (disponible/últimas unidades/agotado) por color y talla. |
| `list_categories` / `list_brands` | Catálogo de categorías y marcas. |
| `get_products_on_sale` | Productos con `compare_at_price` (en oferta). |
| `get_best_sellers` | Más vendidos (`sold_count`). |
| `get_new_arrivals` | Novedades (`published_at`). |
| `recommend_outfit` | Sugerir combinaciones (p.ej. tenis que combinan con una chaqueta). |

> Todas las consultas respetan `status = 'published'` y devuelven precios, stock
> y tallas **directamente de la BD**. El modelo recibe exactamente esos datos.

## System prompt (reglas anti-alucinación)

El *system prompt* instruye al modelo, en resumen:

1. Eres el asistente de la tienda de moda.
2. **Nunca inventes** productos, precios, stock, tallas ni disponibilidad.
3. Para cualquier dato de catálogo, **usa una herramienta**. Si la herramienta
   no devuelve resultados, dilo con honestidad y ofrece alternativas.
4. Responde en español, con tono cercano y profesional.
5. Recomienda productos relacionados y outfits cuando aporte valor.
6. Cita los productos por nombre y precio tal como los devolvió la herramienta.

## Memoria de conversación

- Cada conversación se guarda en `chatbot_conversations`; cada turno en
  `chatbot_messages` (incluyendo `tool_calls` y `referenced_products`).
- Al continuar el chat, se recargan los últimos N mensajes como contexto, de
  modo que el asistente "recuerda" lo hablado.

## Analítica (Dashboard de IA)

De `chatbot_messages` se derivan las métricas del panel:
- **Productos más consultados** → `referenced_products` (GIN index).
- **Preguntas frecuentes** → agrupación de mensajes `role='user'`.
- **Consultas sin respuesta** → turnos donde ninguna herramienta devolvió datos.
- **Productos más recomendados** y **tiempo promedio de respuesta**.
