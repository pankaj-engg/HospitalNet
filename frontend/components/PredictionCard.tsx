"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Database, Info } from "lucide-react";
import { PredictionResult } from "@/lib/api";

interface PredictionCardProps {
  result: PredictionResult;
}

export default function PredictionCard({ result }: PredictionCardProps) {
  const isPneumonia = result.prediction.toLowerCase() === "pneumonia";
  const confidencePercent = Math.round(result.confidence * 100);

  const probNormal = result.probabilities?.Normal ? Math.round(result.probabilities.Normal * 100) : (100 - confidencePercent);
  const probPneumonia = result.probabilities?.Pneumonia ? Math.round(result.probabilities.Pneumonia * 100) : confidencePercent;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 backdrop-blur shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Diagnostic Inference Output
          </span>
          <h3 className="text-xl font-bold text-white mt-0.5">Classification Result</h3>
        </div>
        {result.is_demo && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Demo / Simulated Checkpoint
          </span>
        )}
      </div>

      {/* Main Prediction Highlight */}
      <div className={`p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
        isPneumonia
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
            isPneumonia
              ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-red-500/10"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10"
          }`}>
            {isPneumonia ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Detected</p>
            <h2 className="text-3xl font-extrabold text-white mt-0.5">{result.prediction}</h2>
            <p className="text-xs text-slate-400 mt-1">{result.filename}</p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 min-w-[140px] text-right">
          <p className="text-xs font-medium text-slate-400">Model Confidence</p>
          <p className={`text-3xl font-extrabold mt-0.5 ${isPneumonia ? "text-red-400" : "text-emerald-400"}`}>
            {confidencePercent}%
          </p>
        </div>
      </div>

      {/* Probabilities Distribution */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Softmax Probability Distribution</span>
          <span>Normal: {probNormal}% | Pneumonia: {probPneumonia}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${probNormal}%` }}
            title={`Normal: ${probNormal}%`}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${probPneumonia}%` }}
            title={`Pneumonia: ${probPneumonia}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Class 0: Normal ({probNormal}%)
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Class 1: Pneumonia ({probPneumonia}%)
          </span>
        </div>
      </div>

      {/* Model & Storage Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Model Architecture</span>
            <span className="font-semibold text-slate-200">{result.model}</span>
          </div>
        </div>
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center gap-2.5">
          <Database className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Database Persistence</span>
            <span className="font-semibold text-emerald-400">Saved to SQLite (Record #{result.id})</span>
          </div>
        </div>
      </div>

      {/* Mandatory Academic & Medical Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-200/90 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Mandatory Medical Research Disclaimer</p>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            This application is an academic research prototype developed for educational and experimental demonstration. 
            Predictions are generated via simulated federated deep learning (ResNet18) and must 
            <span className="font-semibold underline"> NOT</span> be utilized for clinical diagnosis, patient triage, or medical treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
