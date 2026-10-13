import os
import secrets
import logging
from typing import List
from pydantic import BaseModel

logger = logging.getLogger("sentinelforge.config")

class Settings(BaseModel):
    PROJECT_NAME: str = "SentinelForge Autonomous IoT Security Platform"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Secure JWT Secret Generation & Validation
    _raw_secret: str = os.getenv("JWT_SECRET", "")
    SECRET_KEY: str = _raw_secret if _raw_secret else secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # CORS Origin Whitelist
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sentinelforge.internal",
    ]
    
    # Storage & Infrastructure Defaults
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinelforge.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "sentinelforge_graph_pass")

    def __init__(self, **data):
        super().__init__(**data)
        if self.ENVIRONMENT == "production" and not os.getenv("JWT_SECRET"):
            raise RuntimeError("CRITICAL: JWT_SECRET environment variable must be explicitly defined in production mode!")

settings = Settings()

