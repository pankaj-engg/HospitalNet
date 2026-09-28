"""
Prediction History and Analytics API Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import PredictionRecord

router = APIRouter(prefix="/history", tags=["Prediction History"])

@router.get("")
def get_prediction_history(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves stored chest X-ray predictions ordered by most recent.
    """
    total = db.query(PredictionRecord).count()
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "records": [
            {
                "id": r.id,
                "filename": r.filename,
                "image_path": r.image_path,
                "prediction": r.prediction,
                "confidence": r.confidence,
                "probabilities": r.probabilities,
                "model_version": r.model_version,
                "is_demo": bool(r.is_demo),
                "timestamp": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]
    }

@router.get("/stats")
def get_prediction_stats(db: Session = Depends(get_db)):
    """
    Computes statistical overview of historic predictions.
    """
    total = db.query(PredictionRecord).count()
    normal_count = db.query(PredictionRecord).filter(PredictionRecord.prediction == "Normal").count()
    pneumonia_count = db.query(PredictionRecord).filter(PredictionRecord.prediction == "Pneumonia").count()
    
    avg_conf = db.query(func.avg(PredictionRecord.confidence)).scalar() or 0.0

    return {
        "total_predictions": total,
        "normal_count": normal_count,
        "pneumonia_count": pneumonia_count,
        "average_confidence": round(float(avg_conf), 4)
    }

@router.delete("/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """
    Deletes a specific prediction entry from the database.
    """
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    
    db.delete(record)
    db.commit()
    return {"message": f"Prediction record {prediction_id} deleted successfully."}

@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    """
    Clears all saved prediction records.
    """
    count = db.query(PredictionRecord).delete()
    db.commit()
    return {"message": f"Cleared {count} prediction records from history."}
