"""
Federated Training Management API Endpoints.
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.database.models import TrainingSession
from app.federated.server import (
    start_training,
    get_current_training_status,
    active_training
)
from app.federated.hospital_a import HOSPITAL_A_INFO
from app.federated.hospital_b import HOSPITAL_B_INFO
from app.federated.hospital_c import HOSPITAL_C_INFO

router = APIRouter(prefix="/training", tags=["Federated Training"])

class StartTrainingRequest(BaseModel):
    rounds: int = Field(default=3, ge=1, le=10, description="Number of federated learning communication rounds")
    local_epochs: int = Field(default=1, ge=1, le=5, description="Local epochs per hospital node per round")
    demo_mode: Optional[bool] = Field(default=None, description="Force demo mode or use environment setting")

@router.post("/start")
def trigger_training(
    payload: StartTrainingRequest = StartTrainingRequest(),
    db: Session = Depends(get_db)
):
    """
    Initiates a new federated learning training session across Hospital A, B, and C.
    """
    is_demo = payload.demo_mode if payload.demo_mode is not None else settings.DEMO_MODE

    try:
        session_id = start_training(
            db=db,
            total_rounds=payload.rounds,
            local_epochs=payload.local_epochs,
            is_demo=is_demo
        )
        return {
            "message": "Federated training session started successfully.",
            "session_id": session_id,
            "total_rounds": payload.rounds,
            "local_epochs": payload.local_epochs,
            "demo_mode": is_demo,
            "hospitals_participating": 3
        }
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")

@router.get("/status")
def get_training_status(db: Session = Depends(get_db)):
    """
    Returns live progress, active round, hospital states, and real-time event logs.
    """
    status = get_current_training_status()
    
    # If not running, check if there is a recently saved session in DB
    if not status["is_running"] and not status["rounds_history"]:
        last_session = db.query(TrainingSession).order_by(TrainingSession.started_at.desc()).first()
        if last_session:
            return {
                "is_running": False,
                "session_id": last_session.id,
                "status": last_session.status,
                "current_round": last_session.current_round,
                "total_rounds": last_session.total_rounds,
                "global_accuracy": last_session.global_accuracy,
                "global_loss": last_session.global_loss,
                "step_message": f"Session {last_session.id} {last_session.status}.",
                "hospitals": last_session.hospital_data or status["hospitals"],
                "rounds_history": last_session.rounds_data or [],
                "logs": last_session.system_logs or []
            }
            
    return status

@router.get("/results")
def get_training_results(db: Session = Depends(get_db)):
    """
    Returns historical summary of all completed federated training sessions.
    """
    sessions = db.query(TrainingSession).order_by(TrainingSession.started_at.desc()).limit(10).all()
    return {
        "count": len(sessions),
        "sessions": [
            {
                "session_id": s.id,
                "status": s.status,
                "total_rounds": s.total_rounds,
                "local_epochs": s.local_epochs,
                "global_accuracy": s.global_accuracy,
                "global_loss": s.global_loss,
                "is_demo": bool(s.is_demo),
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                "rounds_summary": s.rounds_data
            }
            for s in sessions
        ]
    }

@router.get("/hospitals")
def get_hospitals_metadata():
    """
    Returns descriptive metadata, locations, and specialties for all 3 simulated hospitals.
    """
    return {
        "hospitals": [
            HOSPITAL_A_INFO,
            HOSPITAL_B_INFO,
            HOSPITAL_C_INFO
        ]
    }
