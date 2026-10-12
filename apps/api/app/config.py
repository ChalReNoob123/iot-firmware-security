import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SentinelForge Autonomous IoT Security Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super_secure_sentinelforge_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # Storage & Infrastructure Defaults
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinelforge.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "sentinelforge_graph_pass")

settings = Settings()
