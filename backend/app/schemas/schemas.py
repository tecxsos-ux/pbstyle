from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Category
class CategoryBase(BaseModel):
    title: str
    handle: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryRead(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# Images & Variants
class ProductImageRead(BaseModel):
    id: int
    image_url: str
    alt_text: Optional[str] = None
    sort_order: int
    class Config:
        from_attributes = True

class ProductVariantRead(BaseModel):
    id: int
    title: str
    sku: str
    price_offset: float
    size: Optional[str] = None
    finish: Optional[str] = None
    in_stock: bool
    class Config:
        from_attributes = True

# Reviews
class ReviewBase(BaseModel):
    author: str
    rating: int = Field(ge=1, le=5)
    title: str
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int
    product_id: int
    verified_purchase: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Product Read
class ProductBase(BaseModel):
    title: str
    handle: str
    subtitle: Optional[str] = None
    description: str
    material: str
    base_price: float
    compare_at_price: Optional[float] = None
    currency: str = "CHF"
    is_featured: bool = False
    is_new: bool = False
    stock: int = 10
    specifications: Dict[str, Any] = {}
    care_instructions: Optional[str] = None
    certification: Optional[str] = None

class ProductListRead(ProductBase):
    id: int
    category_id: int
    category_title: Optional[str] = None
    featured_image: Optional[str] = None
    average_rating: float = 5.0
    review_count: int = 0
    class Config:
        from_attributes = True

class ProductDetailRead(ProductBase):
    id: int
    category_id: int
    category: Optional[CategoryRead] = None
    images: List[ProductImageRead] = []
    variants: List[ProductVariantRead] = []
    reviews: List[ReviewRead] = []
    average_rating: float = 5.0
    review_count: int = 0
    class Config:
        from_attributes = True

# Cart Schemas
class CartItemAdd(BaseModel):
    session_id: str
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)

class CartItemRead(BaseModel):
    id: int
    session_id: str
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    product_title: str
    product_handle: str
    variant_title: Optional[str] = None
    unit_price: float
    total_price: float
    image_url: Optional[str] = None
    currency: str = "CHF"

class CartSummary(BaseModel):
    session_id: str
    items: List[CartItemRead] = []
    item_count: int = 0
    subtotal: float = 0.0
    currency: str = "CHF"

# Order Schemas
class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    address: str
    apartment: Optional[str] = None
    city: str
    postal_code: str
    country: str = "Schweiz"
    phone: Optional[str] = None

class OrderCreate(BaseModel):
    session_id: str
    customer_email: str
    customer_name: str
    shipping_address: ShippingAddress
    promo_code: Optional[str] = None
    payment_method: str = "Kreditkarte (Geschützt)"

class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_title: str
    variant_title: Optional[str] = None
    unit_price: float
    quantity: int
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    order_number: str
    customer_email: str
    customer_name: str
    shipping_address: Dict[str, Any]
    subtotal: float
    discount_amount: float
    shipping_cost: float
    total_amount: float
    currency: str
    status: str
    payment_method: str
    invoice_number: Optional[str] = None
    invoice_sent: Optional[bool] = False
    tracking_number: Optional[str] = None
    tracking_carrier: Optional[str] = None
    tracking_url: Optional[str] = None
    shipped_at: Optional[datetime] = None
    created_at: datetime
    items: List[OrderItemRead] = []
    class Config:
        from_attributes = True


class OrderTrackingUpdate(BaseModel):
    tracking_number: str
    tracking_carrier: str = "Schweizer Post «Pro Clima»"
    tracking_url: Optional[str] = None
    custom_note: Optional[str] = None
    send_email: bool = True


class UserRegisterRequest(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    company: Optional[str] = None

# Customer Schemas
class CustomerRead(BaseModel):
    id: int
    email: str
    full_name: str
    tier: str
    eco_status: str
    loyalty_points: int
    created_at: datetime
    class Config:
        from_attributes = True

# Discount
class DiscountValidate(BaseModel):
    code: str

class DiscountResult(BaseModel):
    valid: bool
    code: str
    discount_percent: float = 0.0
    message: str

# AIO / GIO Knowledge Manifest for AI Search engines
class AiManifest(BaseModel):
    brand_entity: Dict[str, Any]
    core_values: List[str]
    materials_catalog: List[Dict[str, Any]]
    products_semantic_summary: List[Dict[str, Any]]
    faq_knowledge_graph: List[Dict[str, str]]
    sustainability_and_craftsmanship: Dict[str, Any]

# Admin Auth Schemas
class AdminLogin(BaseModel):
    email: str
    password: str

class AdminUserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AdminUserRead

# CRM Customer Schemas
class CustomerCrmRead(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "Schweiz"
    tier: str
    status: str
    loyalty_points: int
    total_spent: float
    orders_count: int
    last_order_at: Optional[datetime] = None
    crm_notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class CustomerCrmUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    tier: Optional[str] = None
    status: Optional[str] = None
    crm_notes: Optional[str] = None
    loyalty_points: Optional[int] = None

# Inventory Schemas
class InventoryItemRead(BaseModel):
    id: int
    title: str
    handle: str
    sku_prefix: Optional[str] = None
    material: str
    stock: int
    low_stock_threshold: int
    base_price: float
    cost_price: float
    status: str
    category_title: Optional[str] = None
    variants_count: int = 0
    class Config:
        from_attributes = True

class InventoryStockUpdate(BaseModel):
    stock: int = Field(ge=0)
    low_stock_threshold: Optional[int] = None
    base_price: Optional[float] = None
    cost_price: Optional[float] = None
    status: Optional[str] = None

class ProductCreate(BaseModel):
    title: str
    handle: str
    subtitle: Optional[str] = None
    description: str
    category_id: int
    material: str
    base_price: float
    compare_at_price: Optional[float] = None
    cost_price: float = 0.0
    stock: int = 10
    low_stock_threshold: int = 5
    sku_prefix: str = "PB"
    status: str = "Aktiv"
    image_url: Optional[str] = None

# Invoice & Mail Schemas
class InvoiceItemDetail(BaseModel):
    title: str
    variant: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float

class InvoiceDetail(BaseModel):
    invoice_number: str
    order_number: str
    order_id: int
    issue_date: str
    due_date: str
    customer_name: str
    customer_email: str
    shipping_address: Dict[str, Any]
    items: List[InvoiceItemDetail]
    subtotal: float
    discount_amount: float
    shipping_cost: float
    vat_rate_percent: float = 8.1 # Swiss MwSt 8.1%
    vat_amount: float
    net_amount: float
    total_amount: float
    currency: str = "CHF"
    payment_method: str
    payment_status: str
    qr_bill_reference: str
    invoice_sent: bool
    invoice_sent_at: Optional[datetime] = None

class SendInvoiceRequest(BaseModel):
    order_id: int
    recipient_email: str
    subject: Optional[str] = None
    custom_message: Optional[str] = None
    cc_email: Optional[str] = None

class SendInvoiceResponse(BaseModel):
    success: bool
    message: str
    order_id: int
    recipient_email: str
    dispatched_at: datetime
    preview_url: str

# Overview KPIs
class AdminOverviewMetrics(BaseModel):
    total_revenue_chf: float
    total_orders_count: int
    active_clients_count: int
    low_stock_items_count: int
    recent_orders: List[OrderRead]
    top_selling_materials: List[Dict[str, Any]]

# Instagram Auto-Post Schemas
class InstagramSettingsRead(BaseModel):
    id: int
    account_username: str
    business_account_id: str
    auto_post_enabled: bool
    auto_hashtags: str
    post_template: str
    is_connected: bool
    last_sync_at: Optional[datetime] = None
    posts_count: int
    followers_count: int
    class Config:
        from_attributes = True

class InstagramSettingsUpdate(BaseModel):
    account_username: Optional[str] = None
    business_account_id: Optional[str] = None
    access_token: Optional[str] = None
    auto_post_enabled: Optional[bool] = None
    auto_hashtags: Optional[str] = None
    post_template: Optional[str] = None
    is_connected: Optional[bool] = None

class InstagramPostRead(BaseModel):
    id: int
    product_id: Optional[int] = None
    instagram_media_id: Optional[str] = None
    caption: str
    image_url: str
    permalink: Optional[str] = None
    status: str
    likes_count: int
    comments_count: int
    error_message: Optional[str] = None
    created_at: datetime
    product_title: Optional[str] = None
    class Config:
        from_attributes = True

class PublishProductToInstagramRequest(BaseModel):
    product_id: int
    custom_caption: Optional[str] = None
    custom_image_url: Optional[str] = None

class InstagramPublishResult(BaseModel):
    success: bool
    post: InstagramPostRead
    message: str


