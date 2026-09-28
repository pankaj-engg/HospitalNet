"use client";

import React, { useState } from "react";
import { Building2, Server, Cpu, ShieldCheck, XCircle, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export default function FederatedFlowVisualizer() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    { title: "1. Local Training", desc: "Each hospital trains ResNet18 on private local X-rays. No images leave the building." },
    { title: "2. Weight Transmission", desc: "Hospitals extract only parameter vectors (weights & biases) and send them to the server." },
    { title: "3. FedAvg Aggregation", desc: "Central server computes weighted average of parameters: W_global = Σ (n_k / N) * W_k." },
    { title: "4. Global Model Deployment", desc: "Aggregated global model is distributed back or served for privacy-safe inference." }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0c1222]/90 p-6 backdrop-blur shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Federated Learning Architecture</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Flower / FedAvg
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual privacy architecture: Patient medical images remain strictly on-premises at all times.
          </p>
        </div>

        {/* Step buttons for interactive demonstration */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {steps.map((st, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeStep === i
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Diagram Canvas */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative">
        {/* Left: 3 Hospital Nodes */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Simulated Hospital Nodes (Edge)</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <Lock className="w-3 h-3" /> Data Kept Private
            </span>
          </div>

          {/* Hospital A */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-blue-500/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Hospital A</p>
                <p className="text-[10px] text-slate-400">Metro General (Partition 1)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Private SGD
            </span>
          </div>

          {/* Hospital B */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-blue-500/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Hospital B</p>
                <p className="text-[10px] text-slate-400">St. Jude Clinic (Partition 2)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Private SGD
            </span>
          </div>

          {/* Hospital C */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-blue-500/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Hospital C</p>
                <p className="text-[10px] text-slate-400">Apex Medical (Partition 3)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Private SGD
            </span>
          </div>
        </div>

        {/* Center: Communication Channel & FedAvg Aggregation */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-blue-500/30 bg-blue-950/20 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
            <Server className="w-7 h-7 text-white" />
          </div>
          <h4 className="text-sm font-bold text-white">Central Federated Server</h4>
          <p className="text-xs text-blue-300 mt-0.5">Flower Coordinator / FedAvg</p>

          <div className="mt-4 w-full bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-red-400">
                <XCircle className="w-3.5 h-3.5" /> Raw Patient Images
              </span>
              <span className="text-red-400 font-bold">NOT SHARED</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Model Weights Only
              </span>
              <span className="text-emerald-400 font-bold">TRANSMITTED</span>
            </div>
          </div>
        </div>

        {/* Right: Global Model & Web App */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Global Inference Pipeline
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Global ResNet18</h5>
              <p className="text-[10px] text-slate-400">Trained via FedAvg across all 3 nodes</p>
              <p className="text-[10px] text-purple-300 font-mono mt-0.5">models/global_model.pth</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">FastAPI & Next.js Interface</h5>
              <p className="text-[10px] text-slate-400">Safe inference API with SQLite audit log</p>
              <p className="text-[10px] text-emerald-300 font-mono mt-0.5">POST /api/predict</p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Banner for Active Step */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
            {steps[activeStep].title}
          </span>
          <span className="text-slate-300">{steps[activeStep].desc}</span>
        </div>
      </div>
    </div>
  );
}
