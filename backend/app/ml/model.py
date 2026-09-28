"""
HospitalNet ResNet18 Model Definition and Weight Utilities.

Architecture:
- Base: ResNet18 (Residual Network with 18 layers)
  * Convolutional layers for deep spatial feature extraction (edges, textures, lung patterns)
  * Batch Normalization for stabilizing and accelerating convergence
  * ReLU activations for non-linearity
  * Max Pooling & Adaptive Average Pooling to downsample feature representations
  * Residual Shortcut connections that mitigate the vanishing gradient problem
- Custom Head:
  * Linear(in_features=512, out_features=2) for binary classification:
    [Class 0: Normal, Class 1: Pneumonia]
"""

import os
from collections import OrderedDict
from typing import List
import numpy as np
import torch
import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights

CLASSES = ["Normal", "Pneumonia"]

def build_resnet18(pretrained: bool = True, num_classes: int = 2) -> nn.Module:
    """
    Constructs a ResNet18 model modified for chest X-ray binary classification.
    
    If pretrained is True, it attempts to load weights pretrained on ImageNet.
    If network access or download fails, it gracefully falls back to initialized weights.
    """
    try:
        if pretrained:
            weights = ResNet18_Weights.DEFAULT
            model = resnet18(weights=weights)
        else:
            model = resnet18(weights=None)
    except Exception:
        # Fallback if offline or weight download encounters restriction
        model = resnet18(weights=None)

    # Replace the final fully connected layer (ImageNet 1000 classes -> 2 classes)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    return model

def get_model_parameters(model: nn.Module) -> List[np.ndarray]:
    """
    Extracts all model layer weights as a list of NumPy arrays.
    Used in Federated Learning to send model updates from local hospital clients
    to the central FedAvg server without sending any patient data.
    """
    return [val.cpu().numpy() for _, val in model.state_dict().items()]

def set_model_parameters(model: nn.Module, parameters: List[np.ndarray]) -> None:
    """
    Updates the model's state dictionary with the aggregated parameter weights
    received from the central FedAvg server.
    """
    params_dict = zip(model.state_dict().keys(), parameters)
    state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
    model.load_state_dict(state_dict, strict=True)

def save_global_model(model: nn.Module, path: str) -> None:
    """Saves the global model state dict to disk."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)

def load_global_model(model: nn.Module, path: str, device: torch.device = None) -> bool:
    """
    Loads model weights from the specified path.
    Returns True if successful, False if file doesn't exist.
    """
    if not os.path.exists(path):
        return False
    try:
        map_location = device if device else torch.device("cpu")
        state_dict = torch.load(path, map_location=map_location, weights_only=True)
        model.load_state_dict(state_dict)
        return True
    except Exception:
        # Fallback without weights_only if needed for older PyTorch versions
        try:
            state_dict = torch.load(path, map_location=map_location)
            model.load_state_dict(state_dict)
            return True
        except Exception:
            return False
