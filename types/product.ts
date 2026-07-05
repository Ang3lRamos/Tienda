import type { StockStatus, ProductGender } from './database.types';

/**
 * Modelo de vista para tarjetas y listados de producto.
 * Se construye a partir de la vista `products_with_stock` + imagen principal.
 */
export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  categoryName: string | null;
  brandName: string | null;
  gender: ProductGender;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  stockStatus: StockStatus;
  availableColors: string[];
  availableSizes: string[];
}
