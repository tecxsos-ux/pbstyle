import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="superadmin") # superadmin, atelier_manager, concierge
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    handle = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    handle = Column(String(200), unique=True, index=True, nullable=False)
    subtitle = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    material = Column(String(100), nullable=False, index=True) # platinum, brushed steel, titanium, sterling silver
    base_price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, default=0.0)
    currency = Column(String(10), default="CHF")
    
    is_featured = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    
    # Inventory attributes
    stock = Column(Integer, default=10)
    low_stock_threshold = Column(Integer, default=5)
    sku_prefix = Column(String(50), default="PB")
    status = Column(String(50), default="Aktiv") # Aktiv, Entwurf, Archiviert
    
    # Rich Technical Specs & Origin for Luxury AIO/GIO
    specifications = Column(JSON, default=dict)
    care_instructions = Column(Text, nullable=True)
    certification = Column(String(255), default="Swiss Precision Certified • ISO 9001 Metallurgie")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    alt_text = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    title = Column(String(100), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    price_offset = Column(Float, default=0.0)
    size = Column(String(50), nullable=True)
    finish = Column(String(50), nullable=True)
    stock = Column(Integer, default=5)
    in_stock = Column(Boolean, default=True)

    product = relationship("Product", back_populates="variants")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product")
    variant = relationship("ProductVariant")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    shipping_address = Column(JSON, nullable=False)
    
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="CHF")
    
    status = Column(String(50), default="Verarbeitung") # Verarbeitung, Versendet, Zugestellt, Storniert
    payment_method = Column(String(50), default="Kreditkarte (Geschützt)")
    payment_status = Column(String(50), default="Bezahlt")
    
    # Invoice & Mail attributes
    invoice_number = Column(String(50), nullable=True)
    invoice_sent = Column(Boolean, default=False)
    invoice_sent_at = Column(DateTime, nullable=True)
    invoice_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    customer = relationship("Customer", back_populates="orders")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_title = Column(String(255), nullable=False)
    variant_title = Column(String(100), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    image_url = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    author = Column(String(100), nullable=False)
    rating = Column(Integer, default=5)
    title = Column(String(200), nullable=False)
    comment = Column(Text, nullable=False)
    verified_purchase = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="reviews")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company = Column(String(150), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default="Schweiz")
    
    tier = Column(String(50), default="Titanium Elite") # Titanium Elite, Platinum Member, Gold Atelier, Gast
    status = Column(String(50), default="Aktiv") # Aktiv, VIP, Inaktiv
    eco_status = Column(String(100), default="PBSTYLE Eco-Standard Zertifiziert")
    loyalty_points = Column(Integer, default=1450)
    
    # CRM metrics & concierge history
    total_spent = Column(Float, default=0.0)
    orders_count = Column(Integer, default=0)
    last_order_at = Column(DateTime, nullable=True)
    crm_notes = Column(Text, nullable=True) # Besondere Ringgrößen, Bevorzugte Metalle, Ansprechpartner
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    orders = relationship("Order", back_populates="customer")


class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)


class InstagramSettings(Base):
    __tablename__ = "instagram_settings"

    id = Column(Integer, primary_key=True, index=True)
    account_username = Column(String(100), default="@pbstyle.ch")
    business_account_id = Column(String(100), default="17841405309211880")
    access_token = Column(Text, nullable=True)
    auto_post_enabled = Column(Boolean, default=True)
    auto_hashtags = Column(Text, default="#pbstyle #swissjewelry #950platin #hautejoaillerie #atelierzurich #swissmade #swissluxury")
    post_template = Column(Text, default="Neu im Atelier Zürich: {title}\n\n{subtitle}\n\nWerkstoff: {material}\nToleranz: ±0.01 mm Horologie-Standard\nPreis: CHF {price} inkl. MWST\n\nDirekt im Tresor entdecken (Link in Bio).\n\n{hashtags}")
    is_connected = Column(Boolean, default=True)
    last_sync_at = Column(DateTime, default=datetime.datetime.utcnow)
    posts_count = Column(Integer, default=12)
    followers_count = Column(Integer, default=24800)


class InstagramPost(Base):
    __tablename__ = "instagram_posts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    instagram_media_id = Column(String(100), nullable=True)
    caption = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=False)
    permalink = Column(String(255), nullable=True)
    status = Column(String(50), default="published")  # published, simulated, scheduled, failed
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product")

