export interface Category {
  id: number;
  title: string;
  handle: string;
  description?: string | null;
  image_url?: string | null;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price_offset: number;
  size?: string | null;
  finish?: string | null;
  in_stock: boolean;
}

export interface Review {
  id: number;
  product_id: number;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  handle: string;
  subtitle?: string | null;
  description: string;
  material: string;
  base_price: number;
  compare_at_price?: number | null;
  currency: string;
  is_featured: boolean;
  is_new: boolean;
  stock: number;
  specifications: Record<string, string | number | boolean>;
  care_instructions?: string | null;
  certification?: string | null;
  category_id: number;
  category_title?: string | null;
  category?: Category | null;
  featured_image?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  average_rating: number;
  review_count: number;
}

export interface CartItem {
  id: number;
  session_id: string;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product_title: string;
  product_handle: string;
  variant_title?: string | null;
  unit_price: number;
  total_price: number;
  image_url?: string | null;
  currency: string;
}

export interface CartSummary {
  session_id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  currency: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company?: string | null;
  address: string;
  apartment?: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone?: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  variant_title?: string | null;
  unit_price: number;
  quantity: number;
  image_url?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export interface DiscountResult {
  valid: boolean;
  code: string;
  discount_percent: number;
  message: string;
}
