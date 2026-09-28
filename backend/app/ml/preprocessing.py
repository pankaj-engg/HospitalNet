"""
Image Preprocessing and Validation Pipeline for Chest X-Ray Images.

Standard Medical Imaging Transformation Pipeline:
1. Load image (supports PNG, JPG, JPEG, TIFF)
2. Convert grayscale / single-channel chest X-rays to 3-channel RGB (required for ResNet18)
3. Resize to 224x224 pixels
4. Normalize using ImageNet distribution parameters:
   - Mean: [0.485, 0.456, 0.406]
   - Std:  [0.229, 0.224, 0.225]
5. Convert to PyTorch Tensor with batch dimension (1, 3, 224, 224)
"""

import io
from typing import Tuple
from PIL import Image, ImageOps
import torch
from torchvision import transforms

# Preprocessing transform for inference and validation
inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Training data augmentation transform (random crop, slight rotation, horizontal flip)
training_transform = transforms.Compose([
    transforms.Resize((236, 236)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=10),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

def validate_image_file(filename: str, file_size: int) -> Tuple[bool, str]:
    """
    Validates file extension and size constraints.
    """
    import os
    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
    if file_size > MAX_FILE_SIZE:
        return False, f"File size exceeds maximum limit of {MAX_FILE_SIZE // (1024*1024)}MB."
    return True, ""

def preprocess_image_bytes(image_bytes: bytes) -> torch.Tensor:
    """
    Reads image bytes, validates PIL compatibility, converts to RGB,
    and applies standard ResNet18 normalization.
    Returns tensor with shape (1, 3, 224, 224).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Ensure image is RGB (convert grayscale if single-channel)
        if image.mode != "RGB":
            image = image.convert("RGB")
        tensor = inference_transform(image)
        # Add batch dimension
        return tensor.unsqueeze(0)
    except Exception as e:
        raise ValueError(f"Failed to decode or process image: {str(e)}")

def create_synthetic_xray(label: str = "Normal") -> Image.Image:
    """
    Generates a realistic synthetic chest X-ray like image for testing and demo modes
    when a user hasn't yet downloaded the 1GB Kaggle dataset.
    This enables full end-to-end training and inference on real PyTorch tensors.
    """
    import numpy as np
    # Base dark gradient simulating thoracic cavity
    h, w = 224, 224
    y, x = np.ogrid[:h, :w]
    center_y, center_x = h / 2, w / 2
    dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    
    # Thoracic ribcage simulation
    rib_pattern = np.sin(y / 10.0) * 15.0
    lung_field = np.clip(180 - dist_from_center * 0.9 + rib_pattern, 20, 240)
    
    # In pneumonia, add subtle opacities/consolidation in lung zones
    if label.lower() == "pneumonia":
        opacities = np.sin(x / 14.0) * np.cos(y / 14.0) * 40.0
        lung_field = np.clip(lung_field + opacities + 30, 0, 255)
        
    noise = np.random.normal(0, 8, (h, w))
    img_array = np.clip(lung_field + noise, 0, 255).astype(np.uint8)
    
    return Image.fromarray(img_array).convert("RGB")
