"""
Health Check and System Diagnostics Endpoint.
"""

import os
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """
    Returns system health, configuration flags, and model readiness status.
    """
    model_exists = os.path.exists(str(settings.MODEL_PATH))
    hospital_dirs = ["hospital_a", "hospital_b", "hospital_c"]
    
    hospital_data_status = {}
    for h in hospital_dirs:
        h_dir = settings.DATA_DIR / h
        norm_count = len(list((h_dir / "normal").glob("*.*"))) if (h_dir / "normal").exists() else 0
        pneu_count = len(list((h_dir / "pneumonia").glob("*.*"))) if (h_dir / "pneumonia").exists() else 0
        hospital_data_status[h] = {
            "normal_samples": norm_count,
            "pneumonia_samples": pneu_count,
            "total_samples": norm_count + pneu_count
        }

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "model_file_exists": model_exists,
        "model_path": str(settings.MODEL_PATH.name),
        "hospitals_participating": 3,
        "hospital_partitions": hospital_data_status,
        "disclaimer": "HospitalNet is an academic prototype for federated learning research. Not for clinical diagnosis."
    }
