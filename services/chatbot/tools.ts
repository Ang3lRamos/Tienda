import 'server-only';

import type { OpenAI } from 'openai';
import {
  getProducts,
  getProductBySlug,
  getFilterOptions,
} from '@/features/catalog/queries';
import { getActivePromotion } from '@/features/promotions/queries';
import { formatPrice, stockStatusLabel } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';
import type { CatalogFilters, SortOption } from '@/features/catalog/types';

/** Resultado de una herramienta: JSON para el modelo + productos para la UI. */
export interface ToolResult {
  result: unknown;
  products?: ProductSummary[];
}

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Forma compacta de un producto para el modelo (sin URLs, ahorra tokens). */
function compact(p: ProductSummary) {
  return {
    nombre: p.name,
    slug: p.slug,
    precio: formatPrice(p.price),
    precio_anterior: p.compareAtPrice ? formatPrice(p.compareAtPrice) : null,
    en_oferta: Boolean(p.compareAtPrice && p.compareAtPrice > p.price),
    categoria: p.categoryName,
    marca: p.brandName,
    genero: p.gender,
    disponibilidad: stockStatusLabel(p.stockStatus),
    colores: p.availableColors,
    tallas: p.availableSizes,
  };
}

// ---------------------------------------------------------------------------
// Definiciones de herramientas (formato OpenAI/OpenRouter)
// ---------------------------------------------------------------------------
export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Busca productos en el catálogo por texto y filtros. Úsala para preguntas sobre qué prendas hay, por color, talla, género, categoría, ofertas o presupuesto máximo.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Texto libre: nombre, tipo de prenda, material, palabra clave (p.ej. "chaqueta impermeable", "clima frío")' },
          color: { type: 'string', description: 'Color en español (p.ej. Negro, Blanco, Rojo)' },
          talla: { type: 'string', description: 'Talla exacta (p.ej. S, M, L, 32, 42)' },
          genero: { type: 'string', enum: ['men', 'women', 'unisex', 'kids'], description: 'men=hombre, women=mujer' },
          ofertas: { type: 'boolean', description: 'true para solo productos en oferta' },
          precio_max: { type: 'number', description: 'Precio máximo en pesos (COP)' },
          orden: { type: 'string', enum: ['nuevos', 'vendidos', 'precio-asc', 'precio-desc'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_details',
      description:
        'Obtiene el detalle de un producto (descripción, material, cuidados, tallas y stock por variante). Úsala para "cuántas quedan", tallas disponibles o combinaciones.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre o descripción del producto a buscar' },
        },
        required: ['nombre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_best_sellers',
      description: 'Devuelve los productos más vendidos de la tienda.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_products_on_sale',
      description: 'Devuelve los productos en oferta y la promoción activa.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_categories_brands',
      description: 'Lista las categorías, marcas, colores y tallas disponibles en la tienda.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// ---------------------------------------------------------------------------
// Ejecutores (consultan Supabase con datos REALES)
// ---------------------------------------------------------------------------
type Args = Record<string, unknown>;

export const toolExecutors: Record<string, (args: Args) => Promise<ToolResult>> = {
  async search_products(args) {
    const filters: CatalogFilters = {
      q: typeof args.query === 'string' ? args.query : undefined,
      color: typeof args.color === 'string' ? cap(args.color) : undefined,
      talla: typeof args.talla === 'string' ? String(args.talla).toUpperCase() : undefined,
      gender: typeof args.genero === 'string' ? (args.genero as CatalogFilters['gender']) : undefined,
      ofertas: args.ofertas === true,
      precioMax: typeof args.precio_max === 'number' ? args.precio_max : undefined,
      sort: typeof args.orden === 'string' ? (args.orden as SortOption) : undefined,
    };
    const { products, total } = await getProducts(filters);
    return {
      result: {
        total_encontrados: total,
        productos: products.slice(0, 8).map(compact),
        nota: products.length === 0 ? 'No hay productos que coincidan con esos criterios.' : undefined,
      },
      products: products.slice(0, 8),
    };
  },

  async get_product_details(args) {
    const nombre = String(args.nombre ?? '');
    const { products } = await getProducts({ q: nombre });
    const first = products[0];
    if (!first) {
      return { result: { encontrado: false, mensaje: `No se encontró un producto para "${nombre}".` } };
    }
    const detail = await getProductBySlug(first.slug);
    if (!detail) return { result: { encontrado: false } };
    return {
      result: {
        nombre: detail.name,
        precio: formatPrice(detail.price),
        precio_anterior: detail.compareAtPrice ? formatPrice(detail.compareAtPrice) : null,
        marca: detail.brandName,
        categoria: detail.categoryName,
        material: detail.material,
        cuidados: detail.careInstructions,
        disponibilidad: stockStatusLabel(detail.stockStatus),
        stock_total: detail.totalAvailable,
        variantes: detail.variants.map((v) => ({
          color: v.color,
          talla: v.size,
          unidades_disponibles: v.available,
          estado: stockStatusLabel(v.stockStatus),
        })),
      },
      products: [first],
    };
  },

  async get_best_sellers() {
    const { products } = await getProducts({ sort: 'vendidos' });
    const top = products.slice(0, 5);
    return { result: { mas_vendidos: top.map(compact) }, products: top };
  },

  async get_products_on_sale() {
    const [{ products }, promo] = await Promise.all([
      getProducts({ ofertas: true, sort: 'destacados' }),
      getActivePromotion(),
    ]);
    const top = products.slice(0, 8);
    return {
      result: {
        promocion_activa: promo
          ? { nombre: promo.name, descripcion: promo.description }
          : null,
        productos_en_oferta: top.map(compact),
      },
      products: top,
    };
  },

  async list_categories_brands() {
    const options = await getFilterOptions();
    return {
      result: {
        categorias: options.categories.map((c) => c.name),
        marcas: options.brands.map((b) => b.name),
        colores: options.colors,
        tallas: options.sizes,
        rango_precios: {
          min: formatPrice(options.priceRange.min),
          max: formatPrice(options.priceRange.max),
        },
      },
    };
  },
};
