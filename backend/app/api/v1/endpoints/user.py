from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.models import Customer, Order
from app.schemas.schemas import CustomerRead, OrderRead

router = APIRouter()

@router.get("/profile", response_model=Dict[str, Any])
async def get_user_profile(db: AsyncSession = Depends(get_db)):
    # Get primary demo customer or create one
    res = await db.execute(select(Customer))
    customer = res.scalars().first()
    
    # Get orders
    orders_res = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(10).options(selectinload(Order.items))
    )
    orders = orders_res.scalars().all()

    return {
        "customer": customer,
        "recent_orders": orders,
        "membership": {
            "tier": customer.tier if customer else "Titanium Elite",
            "points": customer.loyalty_points if customer else 1450,
            "eco_compliance": "Zertifiziert nach ISO 14001 & Schweizer Edelmetall-Standard",
            "benefits": [
                "Priorisierter Versand mit Schweizer Post Kurier",
                "Kostenlose lebenslange Ultraschallreinigung",
                "Exklusiver Vorab-Zugang zu limitierten Tresor-Editionen"
            ]
        }
    }
