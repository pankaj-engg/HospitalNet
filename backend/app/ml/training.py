"""
Local Model Training and Evaluation Routines for Hospital Clients.

Each simulated hospital trains its local ResNet18 model on its private partition of X-rays.
Only the resulting weights/gradients are communicated to the federated coordinator.
"""

import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from PIL import Image

from app.config import settings
from app.ml.preprocessing import training_transform, inference_transform, create_synthetic_xray

class LocalChestXRayDataset(Dataset):
    """
    Dataset representing a hospital's private local chest X-ray partition.
    Expects subdirectories:
      {hospital_dir}/normal/
      {hospital_dir}/pneumonia/
    """
    def __init__(self, data_dir: str, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.samples = []
        
        normal_dir = self.data_dir / "normal"
        pneumonia_dir = self.data_dir / "pneumonia"
        
        valid_exts = {".png", ".jpg", ".jpeg", ".bmp"}
        
        if normal_dir.exists():
            for p in normal_dir.iterdir():
                if p.suffix.lower() in valid_exts:
                    self.samples.append((str(p), 0))
                    
        if pneumonia_dir.exists():
            for p in pneumonia_dir.iterdir():
                if p.suffix.lower() in valid_exts:
                    self.samples.append((str(p), 1))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label

def ensure_hospital_dataset(hospital_name: str, min_samples_per_class: int = 8) -> int:
    """
    Checks if a hospital's private data folder has images.
    If empty, populates it with synthetic chest X-ray samples so training works out-of-the-box.
    Returns total sample count.
    """
    h_dir = settings.DATA_DIR / hospital_name
    normal_dir = h_dir / "normal"
    pneumonia_dir = h_dir / "pneumonia"
    
    normal_dir.mkdir(parents=True, exist_ok=True)
    pneumonia_dir.mkdir(parents=True, exist_ok=True)
    
    current_normal = len([f for f in normal_dir.iterdir() if f.is_file()])
    current_pneumonia = len([f for f in pneumonia_dir.iterdir() if f.is_file()])
    
    if current_normal < min_samples_per_class:
        for i in range(current_normal, min_samples_per_class):
            img = create_synthetic_xray("Normal")
            img.save(normal_dir / f"synthetic_norm_{i+1:03d}.png")
            
    if current_pneumonia < min_samples_per_class:
        for i in range(current_pneumonia, min_samples_per_class):
            img = create_synthetic_xray("Pneumonia")
            img.save(pneumonia_dir / f"synthetic_pneu_{i+1:03d}.png")
            
    total = len(list(normal_dir.glob("*.png"))) + len(list(pneumonia_dir.glob("*.png")))
    return total

def ensure_sample_evaluation_images():
    """Generates standard sample images in sample_images/ directory for easy testing."""
    sample_dir = settings.SAMPLE_DIR
    sample_dir.mkdir(parents=True, exist_ok=True)
    norm_path = sample_dir / "sample_normal_xray.png"
    pneu_path = sample_dir / "sample_pneumonia_xray.png"
    
    if not norm_path.exists():
        img = create_synthetic_xray("Normal")
        img.save(norm_path)
    if not pneu_path.exists():
        img = create_synthetic_xray("Pneumonia")
        img.save(pneu_path)

def train_one_local_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
    device: torch.device
) -> Tuple[float, float]:
    """
    Executes one local training epoch on private hospital data.
    Returns: (epoch_loss, epoch_accuracy)
    """
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    if len(dataloader.dataset) == 0:
        return 0.0, 0.0

    for images, labels in dataloader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += torch.sum(preds == labels.data).item()
        total += labels.size(0)

    epoch_loss = running_loss / max(total, 1)
    epoch_acc = correct / max(total, 1)
    return epoch_loss, epoch_acc

def evaluate_local_model(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device
) -> Tuple[float, float]:
    """
    Evaluates local hospital model performance.
    Returns: (loss, accuracy)
    """
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    if len(dataloader.dataset) == 0:
        return 0.0, 0.0

    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

    val_loss = running_loss / max(total, 1)
    val_acc = correct / max(total, 1)
    return val_loss, val_acc
