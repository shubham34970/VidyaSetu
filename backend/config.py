import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for .env in backend/ or root
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent
if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")
elif (root_dir / ".env").exists():
    load_dotenv(root_dir / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "VidyaSetu Welfare Intelligence API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]
    TINYFISH_API_KEY: str = os.getenv("TINYFISH_API_KEY", "")
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "86400"))

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()
