import shutil
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Welfare Intelligence API for higher education scholarships & grant discovery",
)

# CORS configuration for authorized local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    tinyfish_cli_path = shutil.which("tinyfish")
    cli_version = None
    if tinyfish_cli_path:
        try:
            res = subprocess.run(
                ["tinyfish", "--version"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if res.returncode == 0:
                cli_version = res.stdout.strip()
        except Exception:
            cli_version = "available"

    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "tinyfish": {
            "cli_installed": bool(tinyfish_cli_path),
            "cli_version": cli_version or "not_found",
            "api_key_configured": bool(settings.TINYFISH_API_KEY.strip()),
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,
    )
