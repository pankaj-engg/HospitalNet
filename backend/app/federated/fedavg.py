"""
Federated Averaging (FedAvg) Implementation for HospitalNet.

FedAvg Algorithm (McMahan et al., 2017):
At round t:
1. Server distributes global model weights W_t to participating hospital clients.
2. Each hospital k in {A, B, C} performs local SGD on its private dataset D_k:
   W_{t+1}^k = LocalTrain(W_t, D_k)
3. Each hospital sends only its updated parameter vector W_{t+1}^k and dataset size n_k to the server.
4. The central server computes the weighted federated average:
   W_{t+1} = sum_{k=1}^K (n_k / N) * W_{t+1}^k
   where N = sum_{k=1}^K n_k is total samples across all hospitals.
5. Patient X-rays NEVER leave the hospitals. Only parameter vectors are transmitted.
"""

from typing import List, Tuple, Dict, Any
import numpy as np

def federated_averaging(weights_and_counts: List[Tuple[List[np.ndarray], int]]) -> List[np.ndarray]:
    """
    Computes weighted federated average of parameter lists across multiple hospital clients.
    
    Args:
        weights_and_counts: List of tuples (client_weights, sample_count)
    Returns:
        Aggregated global model weights as list of NumPy arrays.
    """
    if not weights_and_counts:
        raise ValueError("Cannot perform FedAvg with empty client updates.")
        
    total_samples = sum(count for _, count in weights_and_counts)
    if total_samples == 0:
        raise ValueError("Total sample count across clients must be greater than zero.")

    # Initialize accumulator matching the structure of first client's weights
    first_client_weights = weights_and_counts[0][0]
    aggregated_weights = [np.zeros_like(layer, dtype=np.float64) for layer in first_client_weights]

    # Weighted sum: sum_k (n_k / N) * W_k
    for client_weights, count in weights_and_counts:
        weight_factor = count / total_samples
        for i, layer_params in enumerate(client_weights):
            aggregated_weights[i] += layer_params.astype(np.float64) * weight_factor

    # Convert back to original dtypes (float32 for PyTorch tensors)
    return [layer.astype(np.float32) for layer in aggregated_weights]

def compute_federated_metrics(client_metrics: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Aggregates validation accuracy and loss across hospital clients weighted by sample count.
    """
    total_samples = sum(m.get("samples", 1) for m in client_metrics)
    if total_samples == 0:
        return {"accuracy": 0.0, "loss": 0.0}

    weighted_acc = sum(m.get("accuracy", 0.0) * m.get("samples", 1) for m in client_metrics) / total_samples
    weighted_loss = sum(m.get("loss", 0.0) * m.get("samples", 1) for m in client_metrics) / total_samples

    return {
        "accuracy": round(float(weighted_acc), 4),
        "loss": round(float(weighted_loss), 4),
        "total_samples": total_samples
    }
