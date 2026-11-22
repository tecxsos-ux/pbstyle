from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Customer, Order
from app.schemas.schemas import CustomerRead, UserRegisterRequest
from app.services.email_service import send_welcome_email

router = APIRouter()


@router.get("/profile", response_model=Dict[str, Any])
async def get_user_profile(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Customer))
    customer = res.scalars().first()

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
                "Exklusiver Vorab-Zugang zu limitierten Tresor-Editionen",
            ],
        },
    }


@router.post("/register", response_model=Dict[str, Any])
async def register_user(data: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    email_clean = data.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Bitte geben Sie eine gültige E-Mail-Adresse ein.")

    existing_res = await db.execute(
        select(Customer).where(func.lower(Customer.email) == email_clean)
    )
    customer = existing_res.scalar_one_or_none()
    is_new = False

    if not customer:
        customer = Customer(
            email=email_clean,
            full_name=data.full_name.strip() or "PBSTYLE Mitglied",
            phone=data.phone,
            company=data.company,
            tier="Platinum Member",
            status="Aktiv",
            loyalty_points=250,
        )
        db.add(customer)
        await db.flush()
        await db.refresh(customer)
        is_new = True
    else:
        if data.full_name and data.full_name.strip():
            customer.full_name = data.full_name.strip()
        if data.phone:
            customer.phone = data.phone
        await db.flush()
        await db.refresh(customer)

    welcome_sent = await send_welcome_email(
        recipient_email=customer.email,
        full_name=customer.full_name,
        tier=customer.tier,
    )

    return {
        "success": True,
        "is_new": is_new,
        "welcome_email_sent": welcome_sent,
        "message": (
            f"Willkommen im PBSTYLE Atelier Club! Eine Bestätigung wurde an {customer.email} gesendet."
            if welcome_sent
            else f"Registrierung für {customer.email} erfolgreich abgeschlossen."
        ),
        "customer": CustomerRead.model_validate(customer),
    }
