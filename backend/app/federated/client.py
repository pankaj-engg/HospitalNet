"""
Flower-Compatible Federated Learning Client for Hospital Nodes.

Each instance represents an individual hospital (Hospital A, B, or C).
It trains on locally stored, private patient X-rays and returns only model updates.
"""

from typing import List, Tuple, Dict, Any
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from app.config import settings
from app.ml.model import build_resnet18, get_model_parameters, set_model_parameters
from app.ml.preprocessing import training_transform, inference_transform
from app.ml.training import (
    LocalChestXRayDataset,
    train_one_local_epoch,
    evaluate_local_model,
    ensure_hospital_dataset
)

try:
    import flwr as fl
    FLWR_AVAILABLE = True
except ImportError:
    FLWR_AVAILABLE = False
    # Fallback dummy class if Flower is not yet installed in active context
    class DummyClient:
        pass
    fl = type("fl", (), {"client": type("client", (), {"NumPyClient": DummyClient})})()

class HospitalClient(fl.client.NumPyClient):
    """
    Hospital Federated Learning Client.
    """
    def __init__(self, hospital_id: str, data_dir: Path, epochs: int = 1, batch_size: int = 8, device: torch.device = None):
        self.hospital_id = hospital_id
        self.data_dir = Path(data_dir)
        self.epochs = epochs
        self.batch_size = batch_size
        self.device = device or (torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu"))
        
        # Ensure sample data exists in this hospital's local directory
        self.sample_count = ensure_hospital_dataset(self.data_dir.name)

        # Build local ResNet18 model
        self.model = build_resnet18(pretrained=False, num_classes=2).to(self.device)
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=1e-4)

        # Load local private dataset
        self.train_dataset = LocalChestXRayDataset(str(self.data_dir), transform=training_transform)
        self.train_loader = DataLoader(
            self.train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            drop_last=False
        )

        self.val_dataset = LocalChestXRayDataset(str(self.data_dir), transform=inference_transform)
        self.val_loader = DataLoader(
            self.val_dataset,
            batch_size=self.batch_size,
            shuffle=False
        )

    def get_parameters(self, config: Dict[str, Any] = None) -> List[np.ndarray]:
        """Returns local model weights to the server."""
        return get_model_parameters(self.model)

    def fit(self, parameters: List[np.ndarray], config: Dict[str, Any] = None) -> Tuple[List[np.ndarray], int, Dict[str, Any]]:
        """
        1. Receive current global parameters from server.
        2. Set local model weights to global parameters.
        3. Train for specified local epochs on private hospital dataset.
        4. Return updated weights, sample count, and training metrics.
        """
        set_model_parameters(self.model, parameters)

        epochs = (config and config.get("epochs")) or self.epochs
        latest_loss = 0.0
        latest_acc = 0.0

        for _ in range(epochs):
            latest_loss, latest_acc = train_one_local_epoch(
                model=self.model,
                dataloader=self.train_loader,
                optimizer=self.optimizer,
                criterion=self.criterion,
                device=self.device
            )

        updated_parameters = get_model_parameters(self.model)
        sample_count = len(self.train_dataset)

        metrics = {
            "hospital_id": self.hospital_id,
            "loss": float(latest_loss),
            "accuracy": float(latest_acc),
            "samples": sample_count
        }
        return updated_parameters, sample_count, metrics

    def evaluate(self, parameters: List[np.ndarray], config: Dict[str, Any] = None) -> Tuple[float, int, Dict[str, Any]]:
        """
        Evaluates the received global model on this hospital's local validation partition.
        """
        set_model_parameters(self.model, parameters)
        val_loss, val_acc = evaluate_local_model(
            model=self.model,
            dataloader=self.val_loader,
            criterion=self.criterion,
            device=self.device
        )
        sample_count = len(self.val_dataset)
        return float(val_loss), sample_count, {"accuracy": float(val_acc), "hospital_id": self.hospital_id}
