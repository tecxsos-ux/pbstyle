from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import CartItem, Product, ProductVariant
from app.schemas.schemas import CartItemAdd, CartItemUpdate, CartItemRead, CartSummary

router = APIRouter()

@router.get("/{session_id}", response_model=CartSummary)
async def get_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(CartItem)
        .where(CartItem.session_id == session_id)
        .options(
            selectinload(CartItem.product).selectinload(Product.images),
            selectinload(CartItem.variant)
        )
    )
    result = await db.execute(query)
    items = result.scalars().all()

    item_reads = []
    subtotal = 0.0
    for it in items:
        p = it.product
        v = it.variant
        price = p.base_price + (v.price_offset if v else 0.0)
        line_total = price * it.quantity
        subtotal += line_total
        img = p.images[0].image_url if p.images else None

        item_reads.append(
            CartItemRead(
                id=it.id,
                session_id=it.session_id,
                product_id=it.product_id,
                variant_id=it.variant_id,
                quantity=it.quantity,
                product_title=p.title,
                product_handle=p.handle,
                variant_title=v.title if v else None,
                unit_price=price,
                total_price=line_total,
                image_url=img,
                currency=p.currency
            )
        )

    return CartSummary(
        session_id=session_id,
        items=item_reads,
        item_count=sum(i.quantity for i in item_reads),
        subtotal=round(subtotal, 2),
        currency="CHF"
    )

@router.post("/items", response_model=CartSummary)
async def add_item_to_cart(item_in: CartItemAdd, db: AsyncSession = Depends(get_db)):
    # Verify product
    prod_res = await db.execute(select(Product).where(Product.id == item_in.product_id))
    product = prod_res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")

    # Check if item with same session, product and variant exists
    query = select(CartItem).where(
        CartItem.session_id == item_in.session_id,
        CartItem.product_id == item_in.product_id,
        CartItem.variant_id == item_in.variant_id
    )
    existing_res = await db.execute(query)
    existing = existing_res.scalar_one_or_none()

    if existing:
        existing.quantity += item_in.quantity
    else:
        new_item = CartItem(
            session_id=item_in.session_id,
            product_id=item_in.product_id,
            variant_id=item_in.variant_id,
            quantity=item_in.quantity
        )
        db.add(new_item)

    await db.flush()
    return await get_cart(item_in.session_id, db)

@router.put("/items/{item_id}", response_model=CartSummary)
async def update_cart_item(item_id: int, update_in: CartItemUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CartItem).where(CartItem.id == item_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Warenkorb-Eintrag nicht gefunden.")
    
    session_id = item.session_id
    item.quantity = update_in.quantity
    await db.flush()
    return await get_cart(session_id, db)

@router.delete("/items/{item_id}", response_model=CartSummary)
async def remove_cart_item(item_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CartItem).where(CartItem.id == item_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Warenkorb-Eintrag nicht gefunden.")

    session_id = item.session_id
    await db.delete(item)
    await db.flush()
    return await get_cart(session_id, db)

@router.delete("/{session_id}/clear", response_model=CartSummary)
async def clear_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.session_id == session_id))
    await db.flush()
    return await get_cart(session_id, db)
