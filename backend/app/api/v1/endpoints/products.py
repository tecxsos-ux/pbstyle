from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Product, Category, ProductImage, ProductVariant, Review
from app.schemas.schemas import ProductListRead, ProductDetailRead, ReviewCreate, ReviewRead

router = APIRouter()

@router.get("", response_model=List[ProductListRead])
async def get_products(
    category: Optional[str] = Query(None, description="Category handle"),
    material: Optional[str] = Query(None, description="Material filter comma-separated"),
    min_price: Optional[float] = Query(None, description="Min price in CHF"),
    max_price: Optional[float] = Query(None, description="Max price in CHF"),
    search: Optional[str] = Query(None, description="Search term in title, subtitle, material"),
    sort: Optional[str] = Query("featured", description="featured, price-asc, price-desc, title-asc"),
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.reviews)
        )
    )

    # Category filter
    if category and category.lower() != "all":
        query = query.join(Product.category).where(Category.handle == category.lower())

    # Material filter
    if material:
        materials = [m.strip().lower() for m in material.split(",") if m.strip()]
        if materials:
            query = query.where(func.lower(Product.material).in_(materials))

    # Price filters
    if min_price is not None:
        query = query.where(Product.base_price >= min_price)
    if max_price is not None:
        query = query.where(Product.base_price <= max_price)

    # Search filter
    if search:
        search_term = f"%{search.lower()}%"
        query = query.where(
            or_(
                func.lower(Product.title).like(search_term),
                func.lower(Product.subtitle).like(search_term),
                func.lower(Product.description).like(search_term),
                func.lower(Product.material).like(search_term)
            )
        )

    # Sorting
    if sort == "price-asc":
        query = query.order_by(Product.base_price.asc())
    elif sort == "price-desc":
        query = query.order_by(Product.base_price.desc())
    elif sort == "title-asc":
        query = query.order_by(Product.title.asc())
    else: # featured
        query = query.order_by(Product.is_featured.desc(), Product.id.asc())

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    response = []
    for p in products:
        featured_img = p.images[0].image_url if p.images else None
        ratings = [r.rating for r in p.reviews] if p.reviews else []
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0
        
        item = ProductListRead(
            id=p.id,
            title=p.title,
            handle=p.handle,
            subtitle=p.subtitle,
            description=p.description,
            material=p.material,
            base_price=p.base_price,
            compare_at_price=p.compare_at_price,
            currency=p.currency,
            is_featured=p.is_featured,
            is_new=p.is_new,
            stock=p.stock,
            specifications=p.specifications or {},
            care_instructions=p.care_instructions,
            certification=p.certification,
            category_id=p.category_id,
            category_title=p.category.title if p.category else None,
            featured_image=featured_img,
            average_rating=avg_rating,
            review_count=len(p.reviews)
        )
        response.append(item)

    return response

@router.get("/{handle}", response_model=ProductDetailRead)
async def get_product_by_handle(handle: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(Product)
        .where(Product.handle == handle)
        .options(
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.reviews)
        )
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail=f"Produkt mit Handle '{handle}' nicht gefunden.")

    ratings = [r.rating for r in product.reviews] if product.reviews else []
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 5.0

    return ProductDetailRead(
        id=product.id,
        title=product.title,
        handle=product.handle,
        subtitle=product.subtitle,
        description=product.description,
        material=product.material,
        base_price=product.base_price,
        compare_at_price=product.compare_at_price,
        currency=product.currency,
        is_featured=product.is_featured,
        is_new=product.is_new,
        stock=product.stock,
        specifications=product.specifications or {},
        care_instructions=product.care_instructions,
        certification=product.certification,
        category_id=product.category_id,
        category=product.category,
        images=product.images,
        variants=product.variants,
        reviews=product.reviews,
        average_rating=avg_rating,
        review_count=len(product.reviews)
    )

@router.post("/{handle}/reviews", response_model=ReviewRead)
async def add_product_review(
    handle: str,
    review_in: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.handle == handle)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden.")

    new_review = Review(
        product_id=product.id,
        author=review_in.author,
        rating=review_in.rating,
        title=review_in.title,
        comment=review_in.comment,
        verified_purchase=True
    )
    db.add(new_review)
    await db.flush()
    await db.refresh(new_review)
    return new_review
