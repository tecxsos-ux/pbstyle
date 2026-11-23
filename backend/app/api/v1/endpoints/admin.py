import datetime
import os
import random
import string
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Header
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, func, desc, update
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.models import (
    AdminUser,
    CartItem,
    Category,
    Customer,
    InstagramPost,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductVariant,
)
from app.schemas.schemas import (
    AdminLogin, AdminToken, AdminUserRead,
    CategoryAdminRead, CategoryCreate,
    CustomerCrmRead, CustomerCrmUpdate,
    InventoryItemRead, InventoryStockUpdate, ProductCreate,
    InvoiceDetail, InvoiceItemDetail, SendInvoiceRequest, SendInvoiceResponse,
    AdminOverviewMetrics, OrderRead, OrderTrackingUpdate
)
from app.services.email_service import build_tracking_url, send_order_invoice_email, send_tracking_email

router = APIRouter()

# Dependency to check admin token
async def get_current_admin(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> AdminUser:
    if not authorization or not authorization.startswith("Bearer "):
        # For seamless dev access, allow if demo token or verify actual JWT
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiges oder fehlendes Admin-Zugangstoken."
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin-Token ist abgelaufen oder ungültig."
        )
    
    admin_id = int(payload["sub"])
    res = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = res.scalar_one_or_none()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin-Konto ist deaktiviert oder nicht vorhanden."
        )
    return admin

# 1. AUTH ENDPOINTS
@router.post("/auth/login", response_model=AdminToken)
async def admin_login(creds: AdminLogin, db: AsyncSession = Depends(get_db)):
    email_clean = creds.email.strip().lower()
    res = await db.execute(select(AdminUser).where(func.lower(AdminUser.email) == email_clean))
    admin = res.scalar_one_or_none()
    
    # Check credentials
    if not admin or not verify_password(creds.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige Anmeldedaten für das PBSTYLE Atelier Admin."
        )

    token = create_access_token(data={"sub": str(admin.id), "role": admin.role})
    return AdminToken(
        access_token=token,
        token_type="bearer",
        user=AdminUserRead.model_validate(admin)
    )

@router.get("/auth/me", response_model=AdminUserRead)
async def admin_me(admin: AdminUser = Depends(get_current_admin)):
    return AdminUserRead.model_validate(admin)

# 2. OVERVIEW METRICS
@router.get("/overview", response_model=AdminOverviewMetrics)
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    # Total revenue & orders
    orders_res = await db.execute(select(Order).options(selectinload(Order.items)).order_by(desc(Order.created_at)))
    orders = orders_res.scalars().all()
    
    total_rev = sum(o.total_amount for o in orders)
    
    # Active clients
    clients_res = await db.execute(select(func.count(Customer.id)))
    clients_count = clients_res.scalar() or 0
    
    # Low stock items (< 5)
    low_stock_res = await db.execute(select(func.count(Product.id)).where(Product.stock <= Product.low_stock_threshold))
    low_stock_count = low_stock_res.scalar() or 0

    # Top selling materials breakdown
    materials_breakdown = [
        {"material": "950 Platin", "share_percent": 58, "color": "#E8B898"},
        {"material": "Chirurgenstahl 316L", "share_percent": 27, "color": "#B07D62"},
        {"material": "Titan Grade 5", "share_percent": 15, "color": "#8B5A45"}
    ]

    return AdminOverviewMetrics(
        total_revenue_chf=round(total_rev, 2),
        total_orders_count=len(orders),
        active_clients_count=clients_count,
        low_stock_items_count=low_stock_count,
        recent_orders=[OrderRead.model_validate(o) for o in orders[:5]],
        top_selling_materials=materials_breakdown
    )

# 3. CLIENT CRM MANAGEMENT
@router.get("/crm/customers", response_model=List[CustomerCrmRead])
async def list_crm_customers(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Customer).order_by(desc(Customer.total_spent))
    if search:
        st = f"%{search.lower()}%"
        query = query.where(
            func.lower(Customer.full_name).like(st) | 
            func.lower(Customer.email).like(st) |
            func.lower(Customer.city).like(st)
        )
    if tier:
        query = query.where(Customer.tier == tier)

    res = await db.execute(query)
    customers = res.scalars().all()
    return [CustomerCrmRead.model_validate(c) for c in customers]

@router.get("/crm/customers/{customer_id}", response_model=CustomerCrmRead)
async def get_crm_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden.")
    return CustomerCrmRead.model_validate(customer)

@router.put("/crm/customers/{customer_id}", response_model=CustomerCrmRead)
async def update_crm_customer(
    customer_id: int,
    data: CustomerCrmUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden.")

    if data.full_name is not None: customer.full_name = data.full_name
    if data.phone is not None: customer.phone = data.phone
    if data.company is not None: customer.company = data.company
    if data.tier is not None: customer.tier = data.tier
    if data.status is not None: customer.status = data.status
    if data.crm_notes is not None: customer.crm_notes = data.crm_notes
    if data.loyalty_points is not None: customer.loyalty_points = data.loyalty_points

    await db.flush()
    await db.refresh(customer)
    return CustomerCrmRead.model_validate(customer)

# 4. INVENTORY MANAGEMENT
@router.get("/inventory/products", response_model=List[InventoryItemRead])
async def list_inventory_products(db: AsyncSession = Depends(get_db)):
    query = (
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.variants))
        .order_by(Product.stock.asc())
    )
    res = await db.execute(query)
    products = res.scalars().all()

    items = []
    for p in products:
        items.append(
            InventoryItemRead(
                id=p.id,
                title=p.title,
                handle=p.handle,
                sku_prefix=p.sku_prefix or "PB",
                material=p.material,
                stock=p.stock,
                low_stock_threshold=p.low_stock_threshold or 5,
                base_price=p.base_price,
                cost_price=p.cost_price or 0.0,
                status=p.status or "Aktiv",
                category_title=p.category.title if p.category else None,
                variants_count=len(p.variants) if p.variants else 0
            )
        )
    return items

@router.put("/inventory/products/{product_id}/stock", response_model=InventoryItemRead)
async def update_inventory_stock(
    product_id: int,
    data: InventoryStockUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.id == product_id).options(selectinload(Product.category), selectinload(Product.variants))
    res = await db.execute(query)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt im Inventar nicht gefunden.")

    product.stock = data.stock
    if data.low_stock_threshold is not None: product.low_stock_threshold = data.low_stock_threshold
    if data.base_price is not None: product.base_price = data.base_price
    if data.cost_price is not None: product.cost_price = data.cost_price
    if data.status is not None: product.status = data.status

    await db.flush()
    await db.refresh(product)
    
    return InventoryItemRead(
        id=product.id,
        title=product.title,
        handle=product.handle,
        sku_prefix=product.sku_prefix or "PB",
        material=product.material,
        stock=product.stock,
        low_stock_threshold=product.low_stock_threshold or 5,
        base_price=product.base_price,
        cost_price=product.cost_price or 0.0,
        status=product.status or "Aktiv",
        category_title=product.category.title if product.category else None,
        variants_count=len(product.variants) if product.variants else 0
    )

@router.post("/uploads/product-image", response_model=Dict[str, str])
async def upload_product_image(file: UploadFile = File(...)):
    content_type = (file.content_type or "").lower()
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/heic": ".heic",
        "image/heif": ".heif",
    }
    ext = allowed_types.get(content_type)
    if not ext and file.filename:
        _, orig_ext = os.path.splitext(file.filename.lower())
        if orig_ext in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"}:
            ext = orig_ext
    if not ext:
        raise HTTPException(
            status_code=400,
            detail="Nur Bilddateien (JPG, PNG, WEBP, HEIC) sind erlaubt.",
        )

    raw_bytes = await file.read()
    if len(raw_bytes) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Bild ist zu groß (maximal 15 MB erlaubt).",
        )

    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"prod_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(raw_bytes)

    return {
        "url": f"/api/v1/uploads/{filename}",
        "filename": filename,
    }


@router.post("/inventory/products", response_model=InventoryItemRead)
async def create_inventory_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    new_prod = Product(
        title=data.title,
        handle=data.handle,
        subtitle=data.subtitle,
        description=data.description,
        category_id=data.category_id,
        material=data.material,
        base_price=data.base_price,
        compare_at_price=data.compare_at_price,
        cost_price=data.cost_price,
        stock=data.stock,
        low_stock_threshold=data.low_stock_threshold,
        sku_prefix=data.sku_prefix,
        status=data.status,
        is_new=True,
        currency="CHF"
    )
    all_images: List[str] = []
    if data.image_urls:
        all_images.extend([u for u in data.image_urls if u and u.strip()])
    if data.image_url and data.image_url.strip() and data.image_url.strip() not in all_images:
        all_images.insert(0, data.image_url.strip())

    if all_images:
        new_prod.images = [
            ProductImage(image_url=img_url, sort_order=idx, alt_text=data.title)
            for idx, img_url in enumerate(all_images)
        ]

    db.add(new_prod)
    await db.flush()
    await db.refresh(new_prod)
    
    # Auto-post to Instagram if enabled in settings
    try:
        from app.services.instagram_service import get_or_create_instagram_settings, publish_to_instagram
        ig_settings = await get_or_create_instagram_settings(db)
        if ig_settings.auto_post_enabled:
            await publish_to_instagram(db, new_prod)
    except Exception as e:
        print(f"Instagram auto-post notice: {e}")

    cat_res = await db.execute(select(Category).where(Category.id == data.category_id))
    cat = cat_res.scalar_one_or_none()

    return InventoryItemRead(
        id=new_prod.id,
        title=new_prod.title,
        handle=new_prod.handle,
        sku_prefix=new_prod.sku_prefix,
        material=new_prod.material,
        stock=new_prod.stock,
        low_stock_threshold=new_prod.low_stock_threshold,
        base_price=new_prod.base_price,
        cost_price=new_prod.cost_price,
        status=new_prod.status,
        category_title=cat.title if cat else None,
        variants_count=0
    )


@router.delete("/inventory/products/{product_id}", response_model=Dict[str, Any])
async def delete_inventory_product(product_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Product).where(Product.id == product_id))
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")

    title = product.title
    # Cleanly remove cart references and detach historical order/instagram references
    await db.execute(delete(CartItem).where(CartItem.product_id == product_id))
    await db.execute(
        update(OrderItem).where(OrderItem.product_id == product_id).values(product_id=None)
    )
    await db.execute(
        update(InstagramPost).where(InstagramPost.product_id == product_id).values(product_id=None)
    )
    await db.delete(product)
    await db.flush()

    return {"success": True, "deleted_id": product_id, "message": f'Produkt "{title}" wurde gelöscht.'}


# 4B. CATEGORY & SUBCATEGORY MANAGEMENT
@router.get("/categories", response_model=List[CategoryAdminRead])
async def list_admin_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Category).order_by(Category.parent_id.asc().nullsfirst(), Category.id.asc()))
    cats = res.scalars().all()
    cat_map = {c.id: c.title for c in cats}

    counts_res = await db.execute(
        select(Product.category_id, func.count(Product.id)).group_by(Product.category_id)
    )
    counts = {row[0]: row[1] for row in counts_res.all()}

    return [
        CategoryAdminRead(
            id=c.id,
            title=c.title,
            handle=c.handle,
            description=c.description,
            parent_id=c.parent_id,
            parent_title=cat_map.get(c.parent_id) if c.parent_id else None,
            products_count=counts.get(c.id, 0),
        )
        for c in cats
    ]


@router.post("/categories", response_model=CategoryAdminRead)
async def create_admin_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    title_clean = data.title.strip()
    if not title_clean:
        raise HTTPException(status_code=400, detail="Bitte einen Kategorienamen eingeben.")

    raw_handle = (data.handle or title_clean).strip().lower()
    slug = (
        raw_handle.replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    slug = "".join(ch if ch.isalnum() or ch == "-" else "-" for ch in slug)
    while "--" in slug:
        slug = slug.replace("--", "-")
    slug = slug.strip("-") or f"cat-{random.randint(100, 999)}"

    # Ensure unique handle
    existing = await db.execute(select(Category).where(Category.handle == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{random.randint(10, 99)}"

    parent_title = None
    if data.parent_id:
        p_res = await db.execute(select(Category).where(Category.id == data.parent_id))
        parent_cat = p_res.scalar_one_or_none()
        if not parent_cat:
            raise HTTPException(status_code=404, detail="Übergeordnete Kategorie nicht gefunden.")
        parent_title = parent_cat.title

    new_cat = Category(
        title=title_clean,
        handle=slug,
        description=data.description,
        parent_id=data.parent_id,
    )
    db.add(new_cat)
    await db.flush()
    await db.refresh(new_cat)

    return CategoryAdminRead(
        id=new_cat.id,
        title=new_cat.title,
        handle=new_cat.handle,
        description=new_cat.description,
        parent_id=new_cat.parent_id,
        parent_title=parent_title,
        products_count=0,
    )


@router.delete("/categories/{category_id}", response_model=Dict[str, Any])
async def delete_admin_category(category_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Category).where(Category.id == category_id))
    cat = res.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden.")

    prod_count_res = await db.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    if (prod_count_res.scalar() or 0) > 0:
        raise HTTPException(
            status_code=400,
            detail="Kategorie enthält noch Produkte und kann nicht gelöscht werden.",
        )

    title = cat.title
    await db.delete(cat)
    await db.flush()
    return {"success": True, "deleted_id": category_id, "message": f'Kategorie "{title}" gelöscht.'}

# 5. INVOICE GENERATION & SEND BY MAIL
@router.get("/invoices/{order_id}", response_model=InvoiceDetail)
async def get_order_invoice(order_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Order).where(Order.id == order_id).options(selectinload(Order.items)))
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")

    invoice_num = order.invoice_number or f"INV-2026-{order.order_number.replace('PB-2026-', '')}"
    if not order.invoice_number:
        order.invoice_number = invoice_num
        await db.flush()

    # Calculate Swiss VAT (8.1%)
    vat_rate = 8.1
    vat_amount = round(order.total_amount * (vat_rate / (100 + vat_rate)), 2)
    net_amount = round(order.total_amount - vat_amount, 2)
    
    # Swiss QR Reference
    qr_ref = f"21 00000 00000 {order.id:010d} 9"

    items_detail = [
        InvoiceItemDetail(
            title=it.product_title,
            variant=it.variant_title,
            quantity=it.quantity,
            unit_price=it.unit_price,
            total_price=it.unit_price * it.quantity
        )
        for it in order.items
    ]

    issue_date = order.created_at.strftime("%d.%m.%Y")
    due_date = (order.created_at + datetime.timedelta(days=14)).strftime("%d.%m.%Y")

    return InvoiceDetail(
        invoice_number=invoice_num,
        order_number=order.order_number,
        order_id=order.id,
        issue_date=issue_date,
        due_date=due_date,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        shipping_address=order.shipping_address,
        items=items_detail,
        subtotal=order.subtotal,
        discount_amount=order.discount_amount,
        shipping_cost=order.shipping_cost,
        vat_rate_percent=vat_rate,
        vat_amount=vat_amount,
        net_amount=net_amount,
        total_amount=order.total_amount,
        currency=order.currency,
        payment_method=order.payment_method,
        payment_status=order.payment_status or "Bezahlt",
        qr_bill_reference=qr_ref,
        invoice_sent=order.invoice_sent or False,
        invoice_sent_at=order.invoice_sent_at
    )

@router.get("/invoices/{order_id}/html", response_class=HTMLResponse)
async def get_invoice_html(order_id: int, db: AsyncSession = Depends(get_db)):
    inv = await get_order_invoice(order_id, db)
    
    items_rows = "".join([
        f"""
        <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 12px 8px; font-weight: 500;">{item.title} <span style="font-size: 11px; color: #777;">({item.variant or 'Standard'})</span></td>
            <td style="padding: 12px 8px; text-align: center;">{item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right;">CHF {item.unit_price:,.2f}</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: 600;">CHF {item.total_price:,.2f}</td>
        </tr>
        """
        for item in inv.items
    ])

    html_content = f"""
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="utf-8">
        <title>PBSTYLE Rechnung {inv.invoice_number}</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f1f1f; margin: 0; padding: 40px; background: #fff; }}
            .container {{ max-width: 800px; margin: 0 auto; border: 1px solid #eaeaea; padding: 48px; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #8B5A45; padding-bottom: 24px; margin-bottom: 32px; }}
            .logo {{ font-family: 'Georgia', serif; font-size: 32px; letter-spacing: -1px; color: #1f1f1f; margin: 0; }}
            .tagline {{ font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B5A45; margin-top: 4px; }}
            .details-grid {{ display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 13px; line-height: 1.6; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }}
            th {{ text-align: left; padding: 12px 8px; border-bottom: 2px solid #1f1f1f; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #555; }}
            .summary-table {{ width: 280px; margin-left: auto; font-size: 13px; }}
            .summary-table td {{ padding: 6px 0; }}
            .total-row {{ font-size: 16px; font-weight: bold; border-top: 2px solid #1f1f1f; color: #8B5A45; }}
            .swiss-qr {{ margin-top: 48px; border-top: 1px dashed #bbb; padding-top: 24px; font-size: 12px; color: #555; display: flex; justify-content: space-between; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div>
                    <h1 class="logo">pbstyle</h1>
                    <div class="tagline">Atelier für industrielle Eleganz • Zürich</div>
                </div>
                <div style="text-align: right; font-size: 13px;">
                    <div style="font-weight: bold; font-size: 18px; color: #8B5A45;">RECHNUNG</div>
                    <div><strong>Nr.:</strong> {inv.invoice_number}</div>
                    <div><strong>Datum:</strong> {inv.issue_date}</div>
                    <div><strong>Fällig:</strong> {inv.due_date}</div>
                </div>
            </div>

            <div class="details-grid">
                <div>
                    <div style="text-transform: uppercase; font-size: 10px; letter-spacing: 1.5px; color: #8B5A45; font-weight: bold; margin-bottom: 4px;">Rechnungsempfänger:</div>
                    <strong>{inv.customer_name}</strong><br>
                    {inv.shipping_address.get('address', '')}<br>
                    {inv.shipping_address.get('postal_code', '')} {inv.shipping_address.get('city', '')}<br>
                    {inv.shipping_address.get('country', 'Schweiz')}<br>
                    {inv.customer_email}
                </div>
                <div style="text-align: right;">
                    <div style="text-transform: uppercase; font-size: 10px; letter-spacing: 1.5px; color: #8B5A45; font-weight: bold; margin-bottom: 4px;">Atelier & Rechnungssteller:</div>
                    <strong>PBSTYLE Atelier Schweiz AG</strong><br>
                    Bahnhofstrasse 45<br>
                    8001 Zürich, Schweiz<br>
                    MWST-Nr.: CHE-412.890.114 MWST
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Position & Ausführung</th>
                        <th style="text-align: center;">Menge</th>
                        <th style="text-align: right;">Einzelpreis</th>
                        <th style="text-align: right;">Gesamtbetrag</th>
                    </tr>
                </thead>
                <tbody>
                    {items_rows}
                </tbody>
            </table>

            <table class="summary-table">
                <tr>
                    <td>Zwischensumme:</td>
                    <td style="text-align: right;">CHF {inv.subtotal:,.2f}</td>
                </tr>
                {"<tr><td>Rabatt:</td><td style='text-align: right; color: #8B5A45;'>- CHF " + f"{inv.discount_amount:,.2f}</td></tr>" if inv.discount_amount > 0 else ""}
                <tr>
                    <td>Schweizer Post Kurier:</td>
                    <td style="text-align: right;">{"Kostenlos" if inv.shipping_cost == 0 else f"CHF {inv.shipping_cost:,.2f}"}</td>
                </tr>
                <tr>
                    <td style="font-size: 11px; color: #777;">Davon 8.1% MWST:</td>
                    <td style="text-align: right; font-size: 11px; color: #777;">CHF {inv.vat_amount:,.2f}</td>
                </tr>
                <tr class="total-row">
                    <td style="padding-top: 10px;">Endbetrag ({inv.currency}):</td>
                    <td style="text-align: right; padding-top: 10px;">CHF {inv.total_amount:,.2f}</td>
                </tr>
            </table>

            <div class="swiss-qr">
                <div>
                    <strong>Zahlungsinformation & Schweizer QR-Referenz</strong><br>
                    Zahlungsstatus: <strong>{inv.payment_status}</strong> ({inv.payment_method})<br>
                    Referenz: <span style="font-family: monospace;">{inv.qr_bill_reference}</span>
                </div>
                <div style="text-align: right;">
                    Geprüfte Schweizer Metallurgie.<br>
                    Herzlichen Dank für Ihr Vertrauen in PBSTYLE.
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.post("/invoices/{order_id}/send", response_model=SendInvoiceResponse)
async def send_invoice_by_mail(
    order_id: int,
    req: SendInvoiceRequest,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")

    if not order.invoice_number:
        order.invoice_number = f"INV-2026-{order.order_number.replace('PB-2026-', '')}"

    now = datetime.datetime.utcnow()
    sent = await send_order_invoice_email(
        order=order,
        recipient_email=req.recipient_email,
        subject=req.subject,
        custom_message=req.custom_message,
    )
    if not sent:
        raise HTTPException(
            status_code=502,
            detail="E-Mail-Versand über info@pbstyle.ch fehlgeschlagen. Bitte SMTP-Einstellungen prüfen.",
        )

    order.invoice_sent = True
    order.invoice_sent_at = now
    if req.custom_message:
        order.invoice_notes = req.custom_message

    await db.flush()
    await db.refresh(order)

    return SendInvoiceResponse(
        success=True,
        message=f"Offizielle PBSTYLE Rechnung ({order.invoice_number or order.order_number}) erfolgreich über info@pbstyle.ch an {req.recipient_email} versandt.",
        order_id=order.id,
        recipient_email=req.recipient_email,
        dispatched_at=now,
        preview_url=f"/api/v1/admin/invoices/{order.id}/html"
    )


@router.put("/orders/{order_id}/tracking", response_model=Dict[str, Any])
async def update_order_tracking(
    order_id: int,
    data: OrderTrackingUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")

    tracking_clean = data.tracking_number.strip()
    if not tracking_clean:
        raise HTTPException(status_code=400, detail="Bitte eine gültige Sendungsnummer eingeben.")

    carrier = data.tracking_carrier.strip() or "Schweizer Post «Pro Clima»"
    final_url = build_tracking_url(carrier, tracking_clean, data.tracking_url)
    now = datetime.datetime.utcnow()

    order.tracking_number = tracking_clean
    order.tracking_carrier = carrier
    order.tracking_url = final_url
    order.status = "Versendet"
    order.shipped_at = now

    await db.flush()
    await db.refresh(order)

    email_sent = False
    if data.send_email:
        email_sent = await send_tracking_email(
            order=order,
            tracking_number=tracking_clean,
            carrier=carrier,
            tracking_url=final_url,
            custom_note=data.custom_note,
        )

    return {
        "success": True,
        "email_sent": email_sent,
        "message": (
            f"Tracking-Nummer {tracking_clean} gespeichert & per E-Mail an {order.customer_email} versandt."
            if email_sent
            else f"Tracking-Nummer {tracking_clean} gespeichert."
        ),
        "order": OrderRead.model_validate(order),
    }
