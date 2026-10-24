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

# Pre-compute CORS list before pydantic-settings sees it
_cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
_cors_list = [o.strip() for o in _cors_raw.split(",") if o.strip()]


class Settings(BaseSettings):
    PROJECT_NAME: str = "VidyaSetu Welfare Intelligence API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    TINYFISH_API_KEY: str = ""
    CACHE_TTL_SECONDS: int = 86400

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return _cors_list


settings = Settings()
