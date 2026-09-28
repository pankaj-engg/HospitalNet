"use client";

import React from "react";
import { Layers, Activity, CheckCircle2, RefreshCw, Terminal, TrendingUp } from "lucide-react";
import { TrainingStatus } from "@/lib/api";

interface TrainingProgressProps {
  status: TrainingStatus;
}

export default function TrainingProgress({ status }: TrainingProgressProps) {
  const percent = status.total_rounds > 0
    ? Math.round((status.current_round / status.total_rounds) * 100)
    : 0;

  const isCompleted = status.status === "completed";
  const isRunning = status.status === "running";

  return (
    <div className="space-y-6">
      {/* Top Status Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Federated Execution Status
              </span>
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Training Complete
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Round {status.current_round} of {status.total_rounds}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{status.step_message}</p>
          </div>

          {/* Global metrics pill */}
          {status.global_accuracy !== undefined && status.global_accuracy > 0 && (
            <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div>
                <p className="text-[11px] text-slate-400">Global FedAvg Accuracy</p>
                <p className="text-lg font-bold text-emerald-400">
                  {(status.global_accuracy * 100).toFixed(2)}%
                </p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <p className="text-[11px] text-slate-400">Global FedAvg Loss</p>
                <p className="text-lg font-bold text-amber-400">
                  {status.global_loss ? status.global_loss.toFixed(4) : "--"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Simulation Progress</span>
            <span className="font-semibold text-white">{percent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Round-by-Round Convergence Cards */}
      {status.rounds_history && status.rounds_history.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-6 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Round-by-Round Convergence Metrics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {status.rounds_history.map((r) => (
              <div
                key={r.round}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Round {r.round}</span>
                  <span className="text-[11px] text-slate-400">FedAvg Complete</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Accuracy</p>
                    <p className="text-base font-bold text-emerald-400">
                      {(r.global_accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Loss</p>
                    <p className="text-base font-bold text-amber-400">{r.global_loss.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live System Logs Terminal */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0f1d] p-5 shadow-inner">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Federated Coordinator Live Event Stream</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Flower 1.x FedAvg</span>
        </div>
        <div className="font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto pr-2 text-slate-300">
          {status.logs.length === 0 ? (
            <p className="text-slate-500 italic">No training events yet. Click &quot;Start Federated Training&quot; to begin.</p>
          ) : (
            status.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                <span className={
                  log.message.includes("Complete") || log.message.includes("success")
                    ? "text-emerald-400 font-medium"
                    : log.message.includes("Round")
                    ? "text-blue-300 font-semibold"
                    : "text-slate-300"
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
