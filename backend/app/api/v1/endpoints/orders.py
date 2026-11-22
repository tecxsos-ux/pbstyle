import random
import string
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Order, OrderItem, CartItem, Product, DiscountCode
from app.schemas.schemas import OrderCreate, OrderRead, DiscountValidate, DiscountResult
from app.services.email_service import send_order_invoice_email

router = APIRouter()

@router.post("/validate-discount", response_model=DiscountResult)
async def validate_discount(data: DiscountValidate, db: AsyncSession = Depends(get_db)):
    code_clean = data.code.strip().upper()
    res = await db.execute(select(DiscountCode).where(DiscountCode.code == code_clean, DiscountCode.is_active == True))
    discount = res.scalar_one_or_none()
    
    if discount:
        return DiscountResult(
            valid=True,
            code=discount.code,
            discount_percent=discount.discount_percent,
            message=f"Gutscheincode {discount.code} erfolgreich angewendet! ({int(discount.discount_percent)}% Rabatt)"
        )
    return DiscountResult(
        valid=False,
        code=code_clean,
        discount_percent=0.0,
        message="Ungültiger oder abgelaufener Rabattcode."
    )

@router.post("/checkout", response_model=OrderRead)
async def checkout(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    # Fetch cart items
    query = (
        select(CartItem)
        .where(CartItem.session_id == order_in.session_id)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant)
        )
    )
    result = await db.execute(query)
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Ihr Warenkorb ist leer.")

    # Calculate subtotal
    subtotal = 0.0
    order_items = []
    for it in cart_items:
        p = it.product
        v = it.variant
        price = p.base_price + (v.price_offset if v else 0.0)
        subtotal += price * it.quantity
        img = p.images[0].image_url if p.images else None

        order_items.append(
            OrderItem(
                product_id=p.id,
                product_title=p.title,
                variant_title=v.title if v else None,
                unit_price=price,
                quantity=it.quantity,
                image_url=img
            )
        )

    # Check discount
    discount_amount = 0.0
    if order_in.promo_code:
        code_clean = order_in.promo_code.strip().upper()
        res_disc = await db.execute(select(DiscountCode).where(DiscountCode.code == code_clean, DiscountCode.is_active == True))
        disc = res_disc.scalar_one_or_none()
        if disc:
            discount_amount = round(subtotal * (disc.discount_percent / 100.0), 2)

    shipping_cost = 0.0 if subtotal > 150.0 else 15.0 # Free shipping over 150 CHF
    total_amount = round(subtotal - discount_amount + shipping_cost, 2)

    # Generate Order Number: PB-2026-XXXX
    random_suffix = "".join(random.choices(string.digits, k=4))
    order_number = f"PB-2026-{random_suffix}"
    invoice_number = f"INV-2026-{random_suffix}"

    new_order = Order(
        order_number=order_number,
        invoice_number=invoice_number,
        customer_email=order_in.customer_email,
        customer_name=order_in.customer_name,
        shipping_address=order_in.shipping_address.model_dump(),
        subtotal=round(subtotal, 2),
        discount_amount=discount_amount,
        shipping_cost=shipping_cost,
        total_amount=total_amount,
        currency="CHF",
        status="Verarbeitung",
        payment_method=order_in.payment_method,
        created_at=datetime.datetime.utcnow(),
        items=order_items
    )

    db.add(new_order)
    
    # Clear cart
    await db.execute(delete(CartItem).where(CartItem.session_id == order_in.session_id))
    
    await db.flush()
    await db.refresh(new_order)

    # Re-query with items loaded
    res_final = await db.execute(
        select(Order).where(Order.id == new_order.id).options(selectinload(Order.items))
    )
    final_order = res_final.scalar_one()

    # Send automated Thank-You + Official Invoice email via info@pbstyle.ch
    sent = await send_order_invoice_email(final_order)
    if sent:
        final_order.invoice_sent = True
        final_order.invoice_sent_at = datetime.datetime.utcnow()
        await db.flush()

    return final_order

@router.get("/{order_number}", response_model=OrderRead)
async def get_order_by_number(order_number: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(Order)
        .where(Order.order_number == order_number)
        .options(selectinload(Order.items))
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")
    return order
