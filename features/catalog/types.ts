import type { ProductGender } from '@/types/database.types';

export type SortOption =
  | 'nuevos'
  | 'precio-asc'
  | 'precio-desc'
  | 'vendidos'
  | 'destacados';

export interface CatalogFilters {
  q?: string;
  categoria?: string; // slug
  marca?: string; // slug
  gender?: ProductGender;
  color?: string;
  talla?: string;
  precioMin?: number;
  precioMax?: number;
  ofertas?: boolean;
  novedades?: boolean;
  sort?: SortOption;
  page?: number;
}

export interface FilterOptions {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
  colors: string[];
  sizes: string[];
  priceRange: { min: number; max: number };
}

export const PAGE_SIZE = 12;
