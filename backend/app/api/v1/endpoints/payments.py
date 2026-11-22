import datetime
import random
import string
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.models.models import CartItem, DiscountCode, Order, OrderItem, Product
from app.schemas.schemas import OrderCreate, OrderRead
from app.services.email_service import send_order_invoice_email

router = APIRouter()


def _configure_stripe():
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe ist auf dem Server noch nicht konfiguriert (STRIPE_SECRET_KEY fehlt).",
        )
    stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/config")
async def get_stripe_config():
    is_configured = bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_PUBLISHABLE_KEY)
    mode = "test" if "_test_" in settings.STRIPE_SECRET_KEY else "live"
    return {
        "enabled": is_configured,
        "mode": mode,
        "currency": "CHF",
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
        "supported_methods": ["card", "apple_pay", "google_pay", "link"],
    }


@router.post("/create-checkout-session")
async def create_checkout_session(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    _configure_stripe()

    # Fetch cart items
    query = (
        select(CartItem)
        .where(CartItem.session_id == order_in.session_id)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant),
        )
    )
    result = await db.execute(query)
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Ihr Warenkorb ist leer.")

    subtotal = 0.0
    order_items = []
    line_items = []

    # Check discount code first so we can apply it cleanly
    discount_percent = 0.0
    if order_in.promo_code:
        code_clean = order_in.promo_code.strip().upper()
        res_disc = await db.execute(
            select(DiscountCode).where(
                DiscountCode.code == code_clean, DiscountCode.is_active == True
            )
        )
        disc = res_disc.scalar_one_or_none()
        if disc:
            discount_percent = float(disc.discount_percent)

    for it in cart_items:
        p = it.product
        v = it.variant
        unit_price = p.base_price + (v.price_offset if v else 0.0)
        subtotal += unit_price * it.quantity
        img = p.images[0].image_url if p.images else None

        order_items.append(
            OrderItem(
                product_id=p.id,
                product_title=p.title,
                variant_title=v.title if v else None,
                unit_price=unit_price,
                quantity=it.quantity,
                image_url=img,
            )
        )

        # Apply percentage discount to unit price in Rappen (cents)
        effective_unit = unit_price * (1.0 - discount_percent / 100.0)
        unit_amount_cents = max(50, int(round(effective_unit * 100)))

        product_data = {
            "name": f"{p.title}{f' — {v.title}' if v else ''}",
            "description": (p.subtitle or p.description or "PBSTYLE Atelier Zürich")[:200],
        }
        if img and img.startswith("http"):
            product_data["images"] = [img]

        line_items.append(
            {
                "price_data": {
                    "currency": "chf",
                    "unit_amount": unit_amount_cents,
                    "product_data": product_data,
                },
                "quantity": it.quantity,
            }
        )

    discount_amount = round(subtotal * (discount_percent / 100.0), 2)
    shipping_cost = 0.0 if subtotal > 150.0 else 15.0
    total_amount = round(max(0.0, subtotal - discount_amount + shipping_cost), 2)

    if shipping_cost > 0:
        line_items.append(
            {
                "price_data": {
                    "currency": "chf",
                    "unit_amount": int(round(shipping_cost * 100)),
                    "product_data": {
                        "name": "Schweizer Post «Pro Clima» Kurierversand",
                        "description": "Versicherter Versand aus Zürich",
                    },
                },
                "quantity": 1,
            }
        )

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
        status="Zahlung ausstehend",
        payment_method="Stripe Checkout",
        created_at=datetime.datetime.utcnow(),
        items=order_items,
    )

    db.add(new_order)
    await db.flush()
    await db.refresh(new_order)

    try:
        checkout_session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            customer_email=order_in.customer_email,
            locale="de",
            success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/checkout?canceled=1",
            metadata={
                "order_id": str(new_order.id),
                "order_number": new_order.order_number,
                "cart_session_id": order_in.session_id,
            },
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=502, detail=f"Stripe-Fehler: {exc.user_message or str(exc)}")

    return {
        "checkout_url": checkout_session.url,
        "stripe_session_id": checkout_session.id,
        "order_number": new_order.order_number,
    }


@router.get("/verify-session/{stripe_session_id}")
async def verify_checkout_session(stripe_session_id: str, db: AsyncSession = Depends(get_db)):
    _configure_stripe()

    try:
        session = stripe.checkout.Session.retrieve(stripe_session_id)
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=f"Ungültige Stripe-Session: {str(exc)}")

    metadata = session.get("metadata") or {}
    order_id = metadata.get("order_id")
    cart_session_id = metadata.get("cart_session_id")

    if not order_id:
        raise HTTPException(status_code=404, detail="Keine Bestellung für diese Zahlung gefunden.")

    res = await db.execute(
        select(Order).where(Order.id == int(order_id)).options(selectinload(Order.items))
    )
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Bestellung nicht gefunden.")

    payment_status = session.get("payment_status")
    if payment_status == "paid":
        order.status = "Bezahlt (Stripe)"
        order.payment_status = "Bezahlt"
        if cart_session_id:
            await db.execute(delete(CartItem).where(CartItem.session_id == cart_session_id))
        if not order.invoice_sent:
            sent = await send_order_invoice_email(order)
            if sent:
                order.invoice_sent = True
                order.invoice_sent_at = datetime.datetime.utcnow()
        await db.flush()

    return {
        "paid": payment_status == "paid",
        "payment_status": payment_status,
        "stripe_session_id": stripe_session_id,
        "amount_total_chf": (session.get("amount_total") or 0) / 100.0,
        "order": OrderRead.model_validate(order),
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    _configure_stripe()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if settings.STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Webhook-Signatur ungültig: {str(exc)}")
    else:
        import json

        event = json.loads(payload.decode("utf-8"))

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata") or {}
        order_id = metadata.get("order_id")
        cart_session_id = metadata.get("cart_session_id")
        if order_id:
            res = await db.execute(
                select(Order).where(Order.id == int(order_id)).options(selectinload(Order.items))
            )
            order = res.scalar_one_or_none()
            if order:
                order.status = "Bezahlt (Stripe)"
                order.payment_status = "Bezahlt"
                if cart_session_id:
                    await db.execute(delete(CartItem).where(CartItem.session_id == cart_session_id))
                if not order.invoice_sent:
                    sent = await send_order_invoice_email(order)
                    if sent:
                        order.invoice_sent = True
                        order.invoice_sent_at = datetime.datetime.utcnow()
                await db.flush()

    return {"received": True}
