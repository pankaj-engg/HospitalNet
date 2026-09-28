"""
Standalone Global Model Initialization and Training Script.

Usage:
  python scripts/train_global_model.py [--quick-init | --train-epochs N]
"""

import sys
import argparse
from pathlib import Path
import torch
import torch.nn as nn

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(backend_dir))

from app.config import settings
from app.ml.model import build_resnet18, save_global_model
from app.ml.training import (
    LocalChestXRayDataset,
    train_one_local_epoch,
    ensure_hospital_dataset
)
from app.ml.preprocessing import training_transform

def quick_initialize_model():
    """Initializes ResNet18 with pretrained ImageNet features and adjusted FC head."""
    print("[*] Initializing HospitalNet ResNet18 global architecture...")
    model = build_resnet18(pretrained=True, num_classes=2)
    save_path = str(settings.MODEL_PATH)
    save_global_model(model, save_path)
    print(f"[✓] Initial global model saved to '{save_path}'.")

def train_model(epochs: int = 1):
    """Trains ResNet18 across all local partitions."""
    print(f"[*] Training global model for {epochs} epoch(s)...")
    for h in ["hospital_a", "hospital_b", "hospital_c"]:
        ensure_hospital_dataset(h, min_samples_per_class=8)

    model = build_resnet18(pretrained=True, num_classes=2)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

    # Train sequentially across hospitals
    for ep in range(epochs):
        for h in ["hospital_a", "hospital_b", "hospital_c"]:
            ds = LocalChestXRayDataset(str(settings.DATA_DIR / h), transform=training_transform)
            loader = torch.utils.data.DataLoader(ds, batch_size=8, shuffle=True)
            loss, acc = train_one_local_epoch(model, loader, optimizer, criterion, device)
            print(f"  Epoch {ep+1} | {h} - Loss: {loss:.4f}, Acc: {acc*100:.1f}%")

    save_path = str(settings.MODEL_PATH)
    save_global_model(model, save_path)
    print(f"[✓] Trained model saved to '{save_path}'.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick-init", action="store_true", help="Quickly initialize and save weights without long training")
    parser.add_argument("--train-epochs", type=int, default=1, help="Number of training epochs")
    args = parser.parse_args()

    if args.quick_init:
        quick_initialize_model()
    else:
        train_model(args.train_epochs)
