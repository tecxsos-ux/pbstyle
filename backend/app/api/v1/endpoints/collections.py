from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryRead

router = APIRouter()

@router.get("", response_model=List[CategoryRead])
async def get_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories
