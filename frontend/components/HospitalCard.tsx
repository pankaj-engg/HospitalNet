import React from "react";
import { Building2, Shield, Database, CheckCircle2, RefreshCw } from "lucide-react";

interface HospitalCardProps {
  id: string;
  name: string;
  location: string;
  specialty: string;
  description: string;
  status: string;
  accuracy: number;
  loss: number;
  samples: number;
  isTraining?: boolean;
}

export default function HospitalCard({
  id,
  name,
  location,
  specialty,
  description,
  status,
  accuracy,
  loss,
  samples,
  isTraining = false,
}: HospitalCardProps) {
  const isCompleted = status.toLowerCase().includes("completed");
  const isLocalTrain = status.toLowerCase().includes("train") || status.toLowerCase().includes("sgd");

  return (
    <div className={`relative rounded-xl border bg-[#0f172a]/80 p-5 backdrop-blur transition-all duration-300 ${
      isLocalTrain
        ? "border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
        : isCompleted
        ? "border-emerald-500/40"
        : "border-slate-800 hover:border-slate-700"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white text-base">{name}</h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {id.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{location} • {specialty}</p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isLocalTrain ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {status}
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Ready / Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              {status || "Idle"}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 line-clamp-2">{description}</p>

      {/* Metrics Grid */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Local Samples</p>
          <p className="text-sm font-bold text-white mt-0.5">{samples > 0 ? samples : "Active"}</p>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Local Accuracy</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">
            {accuracy > 0 ? `${(accuracy * 100).toFixed(1)}%` : "--"}
          </p>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Local Loss</p>
          <p className="text-sm font-bold text-amber-400 mt-0.5">
            {loss > 0 ? loss.toFixed(4) : "--"}
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-emerald-400/90 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/15">
        <Shield className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Privacy Confirmed: Patient X-rays never leave this node.</span>
      </div>
    </div>
  );
}
