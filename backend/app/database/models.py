import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from app.database.database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class PredictionRecord(Base):
    """
    Stores history of chest X-ray predictions performed by the system.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    image_path = Column(String(512), nullable=True)
    prediction = Column(String(50), nullable=False)  # "Normal" or "Pneumonia"
    confidence = Column(Float, nullable=False)       # 0.0 to 1.0
    probabilities = Column(JSON, nullable=True)      # {"Normal": 0.05, "Pneumonia": 0.95}
    model_version = Column(String(100), default="HospitalNet ResNet18 (FedAvg)")
    is_demo = Column(Integer, default=1)             # 1 if generated in demo mode
    created_at = Column(DateTime, default=get_utc_now, index=True)

class TrainingSession(Base):
    """
    Tracks federated learning simulation jobs, rounds, and metrics.
    """
    __tablename__ = "training_sessions"

    id = Column(String(64), primary_key=True, index=True)
    status = Column(String(50), default="idle")      # idle, running, completed, failed
    total_rounds = Column(Integer, default=3)
    current_round = Column(Integer, default=0)
    local_epochs = Column(Integer, default=1)
    num_hospitals = Column(Integer, default=3)
    is_demo = Column(Integer, default=1)
    
    # Global aggregated metrics
    global_accuracy = Column(Float, default=0.0)
    global_loss = Column(Float, default=0.0)
    
    # Detailed logs and round breakdown stored as JSON
    rounds_data = Column(JSON, default=list)         # List of round summaries
    hospital_data = Column(JSON, default=dict)       # Hospital info (sample counts, local acc)
    system_logs = Column(JSON, default=list)         # Step-by-step logs for UI live-feed
    
    started_at = Column(DateTime, default=get_utc_now)
    completed_at = Column(DateTime, nullable=True)
