# Federated Learning in HospitalNet

## 1. What is Federated Learning?

Federated Learning (FL) is a decentralized machine learning paradigm introduced by Google (McMahan et al., 2017) wherein multiple client devices or institutions train a shared global model collaboratively under the orchestration of a central server, **without exchanging their local training data**.

In traditional centralized machine learning:
$$\text{Data}_A + \text{Data}_B + \text{Data}_C \xrightarrow{\text{Upload}} \text{Central Server} \xrightarrow{\text{Train}} \text{Model}$$

In Federated Learning:
$$\text{Data}_k \text{ stays on Hospital } k$$
$$\text{Parameters}_k \xrightarrow{\text{Upload}} \text{Central Server} \xrightarrow{\text{FedAvg}} \text{Global Model}$$

---

## 2. The FedAvg (Federated Averaging) Algorithm

Let $K$ be the number of participating hospitals (in HospitalNet, $K = 3$: Hospital A, B, and C).
Let $D_k$ be the private dataset of hospital $k$, with $n_k = |D_k|$ samples.
The total number of samples across all institutions is:
$$N = \sum_{k=1}^K n_k$$

### Communication Round $t$:

1. **Server Broadcast**:
   The central server broadcasts current global weights $W_t$ to all selected hospital clients.

2. **Local Client Optimization**:
   Each hospital $k$ sets its local model $w_0^k \leftarrow W_t$ and performs $E$ epochs of local gradient descent using its local optimizer:
   $$w_{e+1}^k = w_e^k - \eta \nabla \mathcal{L}(w_e^k; \mathcal{B})$$
   where $\eta$ is the learning rate, $\mathcal{L}$ is the Cross-Entropy loss, and $\mathcal{B}$ is a mini-batch of local chest X-rays.

3. **Parameter Upload**:
   Each hospital uploads its updated weights $W_{t+1}^k$ and sample count $n_k$ back to the coordinator.

4. **Federated Aggregation**:
   The central server computes the weighted average of the client parameters:
   $$W_{t+1} = \sum_{k=1}^K \frac{n_k}{N} W_{t+1}^k$$

5. **Convergence**:
   Steps 1–4 repeat for $T$ communication rounds until convergence.

---

## 3. Why FedAvg is Ideal for Healthcare
1. **Regulatory Compliance**: Hospitals comply with HIPAA (Health Insurance Portability and Accountability Act) in the US and GDPR in Europe by preventing patient PHI (Protected Health Information) from leaving their protected networks.
2. **Mitigation of Data Imbalance**: Individual hospitals often suffer from demographic bias (e.g., pediatric vs. elderly pneumonia distributions). Federated aggregation generalizes features across all hospital demographics.
3. **Bandwidth Efficiency**: Model parameter matrices (approx. 45 MB for ResNet18) are dramatically smaller to transmit than hundreds of gigabytes of raw DICOM radiographic scans.

---

## 4. Flower Framework Integration
HospitalNet uses the **Flower (`flwr`)** federated learning framework:
- `flwr.client.NumPyClient`: Abstract client interface providing `get_parameters`, `fit`, and `evaluate`.
- `flwr.server.strategy.FedAvg`: Configurable server-side averaging strategy handling client selection, metric evaluation, and model parameter aggregation.
