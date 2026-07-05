import type { StockStatus, ProductGender, ProductStatus } from './database.types';

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

export interface ProductImageView {
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface ProductVariantView {
  id: string;
  sku: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  price: number | null;
  available: number;
  stockStatus: StockStatus;
}

export interface ProductReviewView {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  authorName: string;
  createdAt: string;
}

/** Detalle completo de un producto (página de producto). */
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  material: string | null;
  careInstructions: string | null;
  gender: ProductGender;
  status: ProductStatus;
  price: number;
  compareAtPrice: number | null;
  brandName: string | null;
  brandSlug: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  keywords: string[];
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  images: ProductImageView[];
  variants: ProductVariantView[];
  availableColors: { name: string; hex: string | null }[];
  availableSizes: string[];
  totalAvailable: number;
  stockStatus: StockStatus;
}
