import { CartSummary, DiscountResult, Order, Product, ShippingAddress } from './types';

function getApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://localhost:8000/api/v1';
  }
  return '/api/v1';
}

export interface FetchProductsParams {
  category?: string;
  material?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export async function fetchProducts(params?: FetchProductsParams): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });
  }
  const qs = query.toString();
  const url = `${getApiBase()}/products${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('fetchProducts error:', err);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const url = `${getApiBase()}/products/${encodeURIComponent(handle)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to fetch product ${handle}: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('fetchProductByHandle error:', err);
    return null;
  }
}

export async function fetchCart(sessionId: string): Promise<CartSummary> {
  const res = await fetch(`${getApiBase()}/cart/${encodeURIComponent(sessionId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cart: ${res.status}`);
  }
  return await res.json();
}

export async function addToCartApi(
  sessionId: string,
  productId: number,
  variantId?: number,
  quantity: number = 1
): Promise<CartSummary> {
  const res = await fetch(`${getApiBase()}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add item to cart: ${res.status}`);
  }
  return await res.json();
}

export async function updateCartItemApi(itemId: number, quantity: number): Promise<CartSummary> {
  const res = await fetch(`${getApiBase()}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update cart item: ${res.status}`);
  }
  return await res.json();
}

export async function removeCartItemApi(itemId: number): Promise<CartSummary> {
  const res = await fetch(`${getApiBase()}/cart/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to remove cart item: ${res.status}`);
  }
  return await res.json();
}

export async function clearCart(sessionId: string): Promise<CartSummary> {
  const res = await fetch(`${getApiBase()}/cart/${encodeURIComponent(sessionId)}/clear`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to clear cart: ${res.status}`);
  }
  return await res.json();
}

export async function validateDiscountCodeApi(code: string): Promise<DiscountResult> {
  const res = await fetch(`${getApiBase()}/orders/validate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new Error(`Failed to validate discount code: ${res.status}`);
  }
  return await res.json();
}

export interface CreateOrderPayload {
  session_id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  promo_code?: string | null;
  payment_method: string;
}

export async function createOrderApi(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${getApiBase()}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Failed to create order: ${res.status}`);
  }
  return await res.json();
}

export interface StripeCheckoutSessionResponse {
  checkout_url: string;
  stripe_session_id: string;
  order_number: string;
}

export async function createStripeCheckoutSessionApi(
  payload: CreateOrderPayload
): Promise<StripeCheckoutSessionResponse> {
  const res = await fetch(`${getApiBase()}/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Stripe Checkout konnte nicht gestartet werden (${res.status})`);
  }
  return await res.json();
}

export interface StripeVerifyResponse {
  paid: boolean;
  payment_status: string;
  stripe_session_id: string;
  amount_total_chf: number;
  order: Order;
}

export async function verifyStripeSessionApi(sessionId: string): Promise<StripeVerifyResponse> {
  const res = await fetch(
    `${getApiBase()}/payments/verify-session/${encodeURIComponent(sessionId)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Zahlung konnte nicht verifiziert werden (${res.status})`);
  }
  return await res.json();
}
