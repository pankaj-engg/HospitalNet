"use client";

import { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Sliders,
  Layers,
  Cpu,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import TrainingProgress from "@/components/TrainingProgress";
import HospitalCard from "@/components/HospitalCard";
import {
  startTraining,
  fetchTrainingStatus,
  fetchHospitals,
  TrainingStatus,
  HospitalInfo
} from "@/lib/api";

export default function TrainingPage() {
  const [rounds, setRounds] = useState<number>(3);
  const [epochs, setEpochs] = useState<number>(1);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [hospitals, setHospitals] = useState<HospitalInfo[]>([]);

  // Polling for training status
  const loadStatus = async () => {
    try {
      const data = await fetchTrainingStatus();
      setStatus(data);
    } catch (e: any) {
      // Backend may be booting up
    }
  };

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(() => {});
    loadStatus();
    const interval = setInterval(loadStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleStartTraining = async () => {
    try {
      setIsStarting(true);
      setError(null);
      await startTraining(rounds, epochs, demoMode);
      await loadStatus();
    } catch (err: any) {
      setError(err.message || "Failed to start federated training session.");
    } finally {
      setIsStarting(false);
    }
  };

  const isTrainingActive = status?.is_running || isStarting;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-blue-400">
            Flower & FedAvg Engine
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Federated Training Simulation
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Coordinate collaborative decentralized ResNet18 training across Hospital A, B, and C.
          Parameter weights are aggregated using Federated Averaging (FedAvg) without extracting patient images.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-6 backdrop-blur shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-6">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Federated Hyperparameters & Setup</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Rounds */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Communication Rounds: <span className="text-blue-400 font-bold">{rounds}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={rounds}
              disabled={isTrainingActive}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>1 Round</span>
              <span>3 Rounds</span>
              <span>5 Rounds</span>
            </div>
          </div>

          {/* Local Epochs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Local Epochs per Hospital: <span className="text-emerald-400 font-bold">{epochs}</span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={epochs}
              disabled={isTrainingActive}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>1 Epoch</span>
              <span>2 Epochs</span>
              <span>3 Epochs</span>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Execution Mode
            </label>
            <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <button
                type="button"
                disabled={isTrainingActive}
                onClick={() => setDemoMode(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  demoMode
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Demo Simulation
              </button>
              <button
                type="button"
                disabled={isTrainingActive}
                onClick={() => setDemoMode(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !demoMode
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Real PyTorch
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {demoMode
                ? "Simulates multi-round convergence in seconds for viva demonstration."
                : "Executes real PyTorch SGD epochs and weight averaging on hospital data."}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Start button */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Hospitals Participating: <span className="text-white font-semibold">3 Nodes (A, B, C)</span>
          </div>

          <button
            onClick={handleStartTraining}
            disabled={isTrainingActive}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
              isTrainingActive
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/20 hover:scale-105"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isTrainingActive ? "Training In Progress..." : "Start Federated Training"}</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Telemetry Stream */}
      {status && <TrainingProgress status={status} />}

      {/* Hospital Nodes Status */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Live Node Telemetry</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hospitals.map((h) => {
            const hState = status?.hospitals?.[h.id];
            return (
              <HospitalCard
                key={h.id}
                id={h.id}
                name={h.name}
                location={h.location}
                specialty={h.specialty}
                description={h.description}
                status={hState?.status || "Ready"}
                accuracy={hState?.accuracy || 0.0}
                loss={hState?.loss || 0.0}
                samples={hState?.samples || 12}
                isTraining={status?.is_running}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
