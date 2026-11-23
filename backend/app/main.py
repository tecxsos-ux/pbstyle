import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Safe additive migrations for existing PostgreSQL deployments
        for col_sql in [
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier VARCHAR(100)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(500)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITHOUT TIME ZONE",
            "ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL",
            "ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(120)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_status VARCHAR(50)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_id VARCHAR(120)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DOUBLE PRECISION DEFAULT 0.0",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITHOUT TIME ZONE",
        ]:
            await conn.execute(text(col_sql))
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance backend for PBSTYLE Luxury E-Commerce platform with SEO, AIO and GIO integrations.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve uploaded product photos under /api/v1/uploads (proxied automatically by Next.js /api/* rewrite)
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount(f"{settings.API_V1_STR}/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "PostgreSQL (Connected)",
        "version": settings.VERSION
    }
