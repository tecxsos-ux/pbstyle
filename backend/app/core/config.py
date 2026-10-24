from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PBstyle Luxury E-Commerce API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://pbstyle:pbstyle_secret@localhost:5432/pbstyle_db"
    SYNC_DATABASE_URL: str = "postgresql://pbstyle:pbstyle_secret@localhost:5432/pbstyle_db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8080",
    ]
    
    # Brand Information for SEO / AIO / GIO
    BRAND_NAME: str = "PBstyle"
    BRAND_TAGLINE: str = "Industrielle Eleganz — Swiss Precision & Fine Metallurgy"
    BRAND_URL: str = "https://pbstyle.ch"
    CURRENCY: str = "CHF"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
