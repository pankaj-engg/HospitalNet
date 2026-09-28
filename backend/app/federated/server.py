"""
Federated Learning Server and Training Coordinator for HospitalNet.

Orchestrates multi-round federated training across Hospital A, B, and C:
1. Distributes current global ResNet18 model parameters to clients.
2. Instructs clients to train locally for `local_epochs` on private X-ray data.
3. Receives updated parameter vectors and sample counts.
4. Performs FedAvg aggregation: W_{t+1} = sum (n_k / N) * W_k.
5. Evaluates global model performance on validation sets.
6. Persists updated global model to `models/global_model.pth`.
7. Streams progress and metrics into SQLite database for real-time UI display.
"""

import os
import time
import uuid
import threading
import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import torch
import torch.nn as nn
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import SessionLocal
from app.database.models import TrainingSession
from app.ml.model import (
    build_resnet18,
    get_model_parameters,
    set_model_parameters,
    save_global_model
)
from app.federated.fedavg import federated_averaging, compute_federated_metrics
from app.federated.hospital_a import create_client_a, HOSPITAL_A_INFO
from app.federated.hospital_b import create_client_b, HOSPITAL_B_INFO
from app.federated.hospital_c import create_client_c, HOSPITAL_C_INFO

# In-memory store for active live training state
active_training: Dict[str, Any] = {
    "is_running": False,
    "session_id": None,
    "current_round": 0,
    "total_rounds": 0,
    "status": "idle",
    "step_message": "Ready to initiate federated learning.",
    "hospitals": {
        "hospital_a": {"name": HOSPITAL_A_INFO["name"], "status": "idle", "accuracy": 0.0, "loss": 0.0, "samples": 0},
        "hospital_b": {"name": HOSPITAL_B_INFO["name"], "status": "idle", "accuracy": 0.0, "loss": 0.0, "samples": 0},
        "hospital_c": {"name": HOSPITAL_C_INFO["name"], "status": "idle", "accuracy": 0.0, "loss": 0.0, "samples": 0}
    },
    "rounds_history": [],
    "logs": []
}

def log_event(session_id: str, message: str, hospital_id: Optional[str] = None):
    """Appends timestamped event log for live UI stream."""
    entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S"),
        "message": message,
        "hospital_id": hospital_id
    }
    active_training["logs"].append(entry)
    active_training["step_message"] = message

def run_federated_simulation_thread(session_id: str, total_rounds: int, local_epochs: int, is_demo: bool):
    """
    Background worker thread executing the federated learning rounds.
    """
    global active_training
    db: Session = SessionLocal()
    
    try:
        active_training["is_running"] = True
        active_training["session_id"] = session_id
        active_training["current_round"] = 0
        active_training["total_rounds"] = total_rounds
        active_training["status"] = "running"
        active_training["rounds_history"] = []
        active_training["logs"] = []

        log_event(session_id, f"Initializing Federated Training session {session_id} (Demo={is_demo})...")
        log_event(session_id, f"Config: {total_rounds} rounds, {local_epochs} local epochs, 3 hospital nodes.")

        # Initialize global model
        global_model = build_resnet18(pretrained=False, num_classes=2)
        global_parameters = get_model_parameters(global_model)

        hospitals = [
            ("hospital_a", create_client_a(epochs=local_epochs), HOSPITAL_A_INFO),
            ("hospital_b", create_client_b(epochs=local_epochs), HOSPITAL_B_INFO),
            ("hospital_c", create_client_c(epochs=local_epochs), HOSPITAL_C_INFO),
        ]

        # Update initial hospital sample counts in active state
        for hid, client, info in hospitals:
            active_training["hospitals"][hid]["samples"] = len(client.train_dataset)

        time.sleep(0.5)

        for round_num in range(1, total_rounds + 1):
            active_training["current_round"] = round_num
            log_event(session_id, f"=== Round {round_num}/{total_rounds} Started ===")
            
            client_updates = []
            round_client_metrics = []

            # Step 1: Distribute global parameters and local train at each hospital
            for hid, client, info in hospitals:
                active_training["hospitals"][hid]["status"] = f"Training (Local Epochs: {local_epochs})"
                log_event(session_id, f"Distributing global weights to {info['name']}...", hid)
                time.sleep(0.4 if is_demo else 0.1)

                if is_demo:
                    # Realistic simulated convergence progression
                    base_acc = 0.72 + (round_num * 0.055) + np.random.uniform(-0.02, 0.02)
                    base_loss = max(0.20, 0.65 - (round_num * 0.12) + np.random.uniform(-0.03, 0.03))
                    samples = len(client.train_dataset) if len(client.train_dataset) > 0 else 16
                    
                    active_training["hospitals"][hid]["status"] = "SGD Local Optimization"
                    log_event(session_id, f"{info['name']}: Performing private local SGD optimization...", hid)
                    time.sleep(0.6)

                    # Extract perturbed parameters to simulate training weights
                    client_weights = [w + np.random.normal(0, 0.005, w.shape).astype(np.float32) for w in global_parameters]
                    client_metrics = {
                        "hospital_id": hid,
                        "accuracy": round(float(base_acc), 4),
                        "loss": round(float(base_loss), 4),
                        "samples": samples
                    }
                else:
                    # Real PyTorch training on hospital data
                    log_event(session_id, f"{info['name']}: Running local PyTorch training...", hid)
                    client_weights, samples, client_metrics = client.fit(global_parameters)

                active_training["hospitals"][hid]["accuracy"] = client_metrics["accuracy"]
                active_training["hospitals"][hid]["loss"] = client_metrics["loss"]
                active_training["hospitals"][hid]["status"] = "Transmitting Model Parameters"
                
                log_event(session_id, f"{info['name']}: Local Accuracy: {client_metrics['accuracy']*100:.1f}%, Loss: {client_metrics['loss']:.4f}. Sending weights.", hid)
                time.sleep(0.4 if is_demo else 0.1)
                
                active_training["hospitals"][hid]["status"] = "Completed Round"
                client_updates.append((client_weights, samples))
                round_client_metrics.append(client_metrics)

            # Step 2: FedAvg Aggregation on Central Server
            log_event(session_id, f"Central Server: Performing FedAvg parameter aggregation across {len(client_updates)} hospitals...")
            time.sleep(0.5 if is_demo else 0.1)

            aggregated_parameters = federated_averaging(client_updates)
            global_parameters = aggregated_parameters
            set_model_parameters(global_model, global_parameters)

            # Step 3: Compute round evaluation metrics
            fed_metrics = compute_federated_metrics(round_client_metrics)
            
            round_summary = {
                "round": round_num,
                "global_accuracy": fed_metrics["accuracy"],
                "global_loss": fed_metrics["loss"],
                "hospitals": {
                    m["hospital_id"]: {
                        "accuracy": m["accuracy"],
                        "loss": m["loss"],
                        "samples": m["samples"]
                    } for m in round_client_metrics
                }
            }
            active_training["rounds_history"].append(round_summary)
            active_training["global_accuracy"] = fed_metrics["accuracy"]
            active_training["global_loss"] = fed_metrics["loss"]
            log_event(session_id, f"FedAvg Aggregation Complete for Round {round_num}. Global Accuracy: {fed_metrics['accuracy']*100:.2f}%, Loss: {fed_metrics['loss']:.4f}")

            # Persist checkpoint to database
            session_rec = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
            if session_rec:
                session_rec.current_round = round_num
                session_rec.global_accuracy = fed_metrics["accuracy"]
                session_rec.global_loss = fed_metrics["loss"]
                session_rec.rounds_data = active_training["rounds_history"]
                session_rec.hospital_data = active_training["hospitals"]
                session_rec.system_logs = active_training["logs"]
                db.commit()

            time.sleep(0.5)

        # Training Completed: Save Global Model checkpoint
        save_global_model(global_model, str(settings.MODEL_PATH))
        log_event(session_id, f"Successfully persisted updated global model to '{settings.MODEL_PATH.name}'.")

        active_training["status"] = "completed"
        active_training["is_running"] = False
        log_event(session_id, "Federated training session successfully completed!")

        session_rec = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
        if session_rec:
            session_rec.status = "completed"
            session_rec.completed_at = datetime.datetime.now(datetime.timezone.utc)
            session_rec.rounds_data = active_training["rounds_history"]
            session_rec.hospital_data = active_training["hospitals"]
            session_rec.system_logs = active_training["logs"]
            db.commit()

    except Exception as e:
        active_training["status"] = "failed"
        active_training["is_running"] = False
        log_event(session_id, f"Training Error: {str(e)}")
        session_rec = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
        if session_rec:
            session_rec.status = "failed"
            db.commit()
    finally:
        db.close()

def start_training(db: Session, total_rounds: int = 3, local_epochs: int = 1, is_demo: bool = True) -> str:
    """
    Spawns an asynchronous federated training session.
    """
    global active_training
    if active_training["is_running"]:
        raise RuntimeError("A federated training simulation is already actively running.")

    session_id = f"fl_sess_{uuid.uuid4().hex[:8]}"
    
    # Create DB record
    session_rec = TrainingSession(
        id=session_id,
        status="running",
        total_rounds=total_rounds,
        current_round=0,
        local_epochs=local_epochs,
        num_hospitals=3,
        is_demo=1 if is_demo else 0,
        global_accuracy=0.0,
        global_loss=0.0,
        rounds_data=[],
        hospital_data=active_training["hospitals"],
        system_logs=[]
    )
    db.add(session_rec)
    db.commit()

    # Launch background thread
    t = threading.Thread(
        target=run_federated_simulation_thread,
        args=(session_id, total_rounds, local_epochs, is_demo),
        daemon=True
    )
    t.start()
    return session_id

def get_current_training_status() -> Dict[str, Any]:
    """Returns the live in-memory training progress and metrics."""
    return active_training
