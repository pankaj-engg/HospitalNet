import os
from pathlib import Path
from pydantic import BaseModel
from typing import List

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "HospitalNet"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'hospitalnet.db'}")
    
    # Storage Paths
    MODEL_DIR: Path = BASE_DIR / "models"
    MODEL_PATH: Path = BASE_DIR / "models" / "global_model.pth"
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    SAMPLE_DIR: Path = BASE_DIR / "sample_images"
    
    # Federated Learning Defaults
    DEFAULT_ROUNDS: int = 3
    DEFAULT_CLIENTS: int = 3
    DEFAULT_LOCAL_EPOCHS: int = 1
    BATCH_SIZE: int = 8
    IMAGE_SIZE: int = 224
    
    # Classes
    CLASSES: List[str] = ["Normal", "Pneumonia"]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()

# Ensure directories exist
settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
