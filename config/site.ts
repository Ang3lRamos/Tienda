import { publicEnv } from './env';

/** Configuración global de la tienda (marca, navegación, metadatos). */
export const siteConfig = {
  name: 'Átelier',
  tagline: 'Moda con intención',
  description:
    'Tienda de ropa premium: colecciones cuidadas, envío rápido y un asistente inteligente que te ayuda a elegir.',
  url: publicEnv.NEXT_PUBLIC_SITE_URL,
  locale: 'es-CO',
  currency: 'COP',
} as const;

/** Navegación principal de la tienda. */
export const mainNav = [
  { title: 'Novedades', href: '/catalogo?sort=nuevos' },
  { title: 'Mujer', href: '/catalogo?gender=women' },
  { title: 'Hombre', href: '/catalogo?gender=men' },
  { title: 'Categorías', href: '/categorias' },
  { title: 'Ofertas', href: '/catalogo?ofertas=1' },
] as const;

/** Navegación del panel de administración. */
export const adminNav = [
  { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { title: 'Productos', href: '/admin/productos', icon: 'Shirt' },
  { title: 'Categorías', href: '/admin/categorias', icon: 'Tags' },
  { title: 'Marcas', href: '/admin/marcas', icon: 'Award' },
  { title: 'Inventario', href: '/admin/inventario', icon: 'Boxes' },
  { title: 'Pedidos', href: '/admin/pedidos', icon: 'ShoppingBag' },
  { title: 'Reseñas', href: '/admin/resenas', icon: 'Star' },
  { title: 'Clientes', href: '/admin/clientes', icon: 'Users' },
  { title: 'Usuarios', href: '/admin/usuarios', icon: 'ShieldCheck' },
  { title: 'Promociones', href: '/admin/promociones', icon: 'Percent' },
  { title: 'Chat IA', href: '/admin/chat-ia', icon: 'Sparkles' },
  { title: 'Configuración', href: '/admin/configuracion', icon: 'Settings' },
] as const;
