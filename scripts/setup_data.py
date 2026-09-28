"""
HospitalNet Dataset Setup Script.

Usage:
  # Option 1: Automatic synthetic demo data setup (default)
  python scripts/setup_data.py

  # Option 2: Split an existing downloaded Kaggle Chest X-Ray dataset into 3 hospital partitions
  python scripts/setup_data.py --source "C:/path/to/chest_xray/train"
"""

import os
import sys
import shutil
import argparse
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(backend_dir))

from app.config import settings
from app.ml.training import ensure_hospital_dataset, ensure_sample_evaluation_images

def split_kaggle_dataset(source_dir: Path):
    """
    Splits downloaded chest_xray directory into 3 hospital partitions:
    - Hospital A: ~33%
    - Hospital B: ~33%
    - Hospital C: ~34%
    """
    print(f"[*] Slicing Kaggle dataset from {source_dir}...")
    source_normal = source_dir / "NORMAL"
    source_pneumonia = source_dir / "PNEUMONIA"

    if not source_normal.exists() or not source_pneumonia.exists():
        print("[!] Error: Expected 'NORMAL' and 'PNEUMONIA' subfolders in source directory.")
        return

    hospitals = ["hospital_a", "hospital_b", "hospital_c"]
    for h in hospitals:
        (settings.DATA_DIR / h / "normal").mkdir(parents=True, exist_ok=True)
        (settings.DATA_DIR / h / "pneumonia").mkdir(parents=True, exist_ok=True)

    normal_files = sorted(list(source_normal.glob("*.*")))
    pneumonia_files = sorted(list(source_pneumonia.glob("*.*")))

    print(f"[*] Found {len(normal_files)} Normal images and {len(pneumonia_files)} Pneumonia images.")

    for idx, f in enumerate(normal_files):
        target_h = hospitals[idx % 3]
        shutil.copy2(f, settings.DATA_DIR / target_h / "normal" / f.name)

    for idx, f in enumerate(pneumonia_files):
        target_h = hospitals[idx % 3]
        shutil.copy2(f, settings.DATA_DIR / target_h / "pneumonia" / f.name)

    print("[✓] Successfully partitioned dataset across Hospital A, B, and C.")

def setup_demo_synthetic_data():
    """Generates synthetic initial partitions for hospitals A, B, C."""
    print("[*] Generating synthetic demo chest X-ray partitions for Hospital A, B, C...")
    for h in ["hospital_a", "hospital_b", "hospital_c"]:
        count = ensure_hospital_dataset(h, min_samples_per_class=12)
        print(f"  -> {h}: {count} private sample images ready.")

    ensure_sample_evaluation_images()
    print("[✓] Demo partitions and evaluation sample images successfully created.")

def main():
    parser = argparse.ArgumentParser(description="HospitalNet Data Partitioning Tool")
    parser.add_argument("--source", type=str, default="", help="Path to Kaggle chest_xray dataset")
    args = parser.parse_args()

    if args.source and Path(args.source).exists():
        split_kaggle_dataset(Path(args.source))
    else:
        setup_demo_synthetic_data()

if __name__ == "__main__":
    main()
