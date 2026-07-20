/**
 * Tipos de la base de datos.
 *
 * ⚠️ Este archivo está escrito a mano para desarrollar con tipado estricto.
 * Cuando conectes tu proyecto Supabase, regenéralo con la fuente de verdad:
 *
 *     npm run db:types      (supabase gen types typescript --local)
 *
 * Mantiene la MISMA forma que el output de `supabase gen types`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// --- Enums -----------------------------------------------------------
export type ProductStatus = 'draft' | 'published' | 'archived';
export type ProductGender = 'men' | 'women' | 'unisex' | 'kids';
export type OrderStatus =
  | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type MovementType = 'in' | 'out' | 'adjustment' | 'reservation' | 'release';
export type DiscountType = 'percentage' | 'fixed';
export type PromotionScope = 'all' | 'category' | 'brand' | 'product';
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';
export type NotificationType = 'order' | 'promotion' | 'stock' | 'system' | 'account';
export type StockStatus = 'disponible' | 'ultimas_unidades' | 'agotado';

// Helper para definir una tabla con Row/Insert/Update.
// `Relationships: []` es necesario para que el parser de select de supabase-js
// infiera correctamente los resultados (lo incluye `supabase gen types`).
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

// --- Rows ------------------------------------------------------------
export type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}
export type PermissionRow = {
  id: string;
  code: string;
  description: string | null;
  created_at: string;
}
export type ProfileRow = {
  id: string;
  role_id: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type AddressRow = {
  id: string;
  user_id: string;
  label: string | null;
  recipient: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}
export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  gender: ProductGender;
  base_price: number;
  compare_at_price: number | null;
  material: string | null;
  care_instructions: string | null;
  keywords: string[];
  status: ProductStatus;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
export type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  color: string | null;
  color_hex: string | null;
  size: string | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProductImageRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}
export type InventoryRow = {
  id: string;
  variant_id: string;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}
export type InventoryMovementRow = {
  id: string;
  variant_id: string;
  type: MovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference: string | null;
  created_by: string | null;
  created_at: string;
}
export type PromotionRow = {
  id: string;
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  scope: PromotionScope;
  target_id: string | null;
  banner_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  per_user_limit: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}
export type CartRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}
export type CartItemRow = {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  added_at: string;
}
export type WishlistRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}
export type RecentlyViewedRow = {
  id: string;
  user_id: string;
  product_id: string;
  viewed_at: string;
}
export type OrderRow = {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  payment_reference: string | null;
  payment_provider: string | null;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  coupon_id: string | null;
  shipping_address: Json | null;
  billing_address: Json | null;
  notes: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
}
export type OrderItemRow = {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}
export type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}
export type ChatbotConversationRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}
export type ChatbotMessageRow = {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string | null;
  tool_calls: Json | null;
  referenced_products: string[];
  tokens: number | null;
  created_at: string;
}
export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Json | null;
  is_read: boolean;
  created_at: string;
}
export type ActivityLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json | null;
  ip_address: string | null;
  created_at: string;
}
export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// Vista: producto + stock agregado
export type ProductWithStockRow = ProductRow & {
  total_stock: number;
  available_stock: number;
  stock_status: StockStatus;
}

// --- Database --------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      roles: Table<RoleRow>;
      permissions: Table<PermissionRow>;
      role_permissions: Table<{ role_id: string; permission_id: string }>;
      profiles: Table<ProfileRow>;
      addresses: Table<AddressRow>;
      categories: Table<CategoryRow>;
      brands: Table<BrandRow>;
      products: Table<ProductRow>;
      product_variants: Table<ProductVariantRow>;
      product_images: Table<ProductImageRow>;
      inventory: Table<InventoryRow>;
      inventory_movements: Table<InventoryMovementRow>;
      promotions: Table<PromotionRow>;
      coupons: Table<CouponRow>;
      carts: Table<CartRow>;
      cart_items: Table<CartItemRow>;
      wishlist: Table<WishlistRow>;
      recently_viewed: Table<RecentlyViewedRow>;
      orders: Table<OrderRow>;
      order_items: Table<OrderItemRow>;
      reviews: Table<ReviewRow>;
      chatbot_conversations: Table<ChatbotConversationRow>;
      chatbot_messages: Table<ChatbotMessageRow>;
      notifications: Table<NotificationRow>;
      activity_logs: Table<ActivityLogRow>;
      newsletter_subscribers: Table<NewsletterSubscriberRow>;
    };
    Views: {
      products_with_stock: { Row: ProductWithStockRow; Relationships: [] };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_role_name: { Args: Record<string, never>; Returns: string };
      apply_inventory_movement: {
        Args: {
          p_variant_id: string;
          p_type: MovementType;
          p_quantity: number;
          p_reason?: string;
          p_reference?: string;
          p_actor?: string;
        };
        Returns: InventoryRow;
      };
    };
    Enums: {
      product_status: ProductStatus;
      product_gender: ProductGender;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      movement_type: MovementType;
      discount_type: DiscountType;
      promotion_scope: PromotionScope;
      chat_role: ChatRole;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
}
