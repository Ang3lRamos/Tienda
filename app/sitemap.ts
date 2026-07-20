import type { MetadataRoute } from 'next';
import { createPublicSupabase } from '@/lib/supabase/server';
import { siteConfig } from '@/config/site';

export const revalidate = 3600; // regenera cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/catalogo',
    '/categorias',
    '/catalogo?ofertas=1',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  // Páginas de contenido: cambian poco y no compiten con el catálogo.
  const contentRoutes: MetadataRoute.Sitemap = [
    '/ayuda/envios',
    '/ayuda/devoluciones',
    '/ayuda/tallas',
    '/sobre-nosotros',
    '/sostenibilidad',
    '/contacto',
    '/empleo',
    '/legal/terminos',
    '/legal/privacidad',
    '/legal/tratamiento-datos',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicSupabase();
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products').select('slug, updated_at').eq('status', 'published'),
      supabase.from('categories').select('slug').eq('is_active', true),
    ]);

    const productRoutes = ((products as unknown as { slug: string; updated_at: string }[]) ?? []).map(
      (p) => ({
        url: `${base}/producto/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }),
    );
    const categoryRoutes = ((categories as unknown as { slug: string }[]) ?? []).map((c) => ({
      url: `${base}/catalogo?categoria=${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    dynamicRoutes = [...productRoutes, ...categoryRoutes];
  } catch {
    // Si Supabase no está disponible en build, se sirve solo el sitemap estático.
  }

  return [...staticRoutes, ...contentRoutes, ...dynamicRoutes];
}
