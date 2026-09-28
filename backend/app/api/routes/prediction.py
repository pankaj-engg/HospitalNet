"""
Prediction API Routes for Chest X-Ray Classification.
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.database.models import PredictionRecord
from app.ml.preprocessing import validate_image_file
from app.ml.inference import run_inference
from app.ml.training import ensure_sample_evaluation_images

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("")
async def predict_xray(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts a chest X-ray image file, runs inference via ResNet18,
    persists the record to SQLite, and returns diagnosis classification.
    """
    # Read file bytes
    contents = await file.read()
    file_size = len(contents)
    
    # Validate format and size
    is_valid, err_msg = validate_image_file(file.filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    # Save uploaded file safely with unique filename
    unique_name = f"{uuid.uuid4().hex[:10]}_{file.filename}"
    save_path = settings.UPLOADS_DIR / unique_name
    with open(save_path, "wb") as f:
        f.write(contents)

    # Run inference
    try:
        result = run_inference(contents)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error: {str(e)}"
        )

    # Record in database
    record = PredictionRecord(
        filename=file.filename,
        image_path=f"/uploads/{unique_name}",
        prediction=result["prediction"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        model_version=result["model"],
        is_demo=1 if result["is_demo"] else 0
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "image_path": record.image_path,
        "prediction": record.prediction,
        "confidence": record.confidence,
        "probabilities": record.probabilities,
        "model": record.model_version,
        "is_demo": bool(record.is_demo),
        "timestamp": record.created_at.isoformat() if record.created_at else None,
        "message": result["message"],
        "disclaimer": "Research prototype only. This result is not a medical diagnosis."
    }

@router.get("/samples")
def list_sample_images():
    """Returns available sample X-ray images for immediate demo testing."""
    ensure_sample_evaluation_images()
    return {
        "samples": [
            {
                "id": "sample_normal_xray.png",
                "label": "Normal Chest X-Ray (Synthetic/Demo)",
                "expected": "Normal",
                "download_url": "/api/predict/sample-image/sample_normal_xray.png"
            },
            {
                "id": "sample_pneumonia_xray.png",
                "label": "Pneumonia Chest X-Ray (Synthetic/Demo)",
                "expected": "Pneumonia",
                "download_url": "/api/predict/sample-image/sample_pneumonia_xray.png"
            }
        ]
    }

@router.get("/sample-image/{sample_name}")
def get_sample_image(sample_name: str):
    """Streams a sample chest X-ray image for testing."""
    sample_path = settings.SAMPLE_DIR / sample_name
    if not sample_path.exists():
        ensure_sample_evaluation_images()
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample image not found.")
    return FileResponse(str(sample_path), media_type="image/png")
