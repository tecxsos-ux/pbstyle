from fastapi import APIRouter
from app.api.v1.endpoints import products, collections, cart, orders, user, seo, admin, instagram

api_router = APIRouter()

api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(collections.router, prefix="/collections", tags=["Collections"])
api_router.include_router(cart.router, prefix="/cart", tags=["Cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(user.router, prefix="/user", tags=["User Profile"])
api_router.include_router(seo.router, prefix="/seo", tags=["SEO & AIO / GIO"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin CRM & Inventory"])
api_router.include_router(instagram.router, prefix="/instagram", tags=["Instagram Connector & Auto-Post"])


