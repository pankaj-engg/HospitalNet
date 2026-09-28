"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import PredictionCard from "@/components/PredictionCard";
import { predictXray, PredictionResult } from "@/lib/api";
import { AlertCircle, History, Activity } from "lucide-react";
import Link from "next/link";

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await predictXray(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to classify image. Please verify backend is running.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
              Inference Diagnostic Interface
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Chest X-Ray Pneumonia Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Evaluate chest radiographs using the trained global ResNet18 model produced through federated learning.
          </p>
        </div>

        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-blue-400" />
          <span>View Audit History</span>
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Classification Failed</p>
            <p className="text-[11px] text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Upload left, Result right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <ImageUploader onPredict={handlePredict} isLoading={isLoading} />
        </div>

        <div>
          {result ? (
            <PredictionCard result={result} />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 p-12 text-center backdrop-blur">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-500 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Awaiting Radiograph Input</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Upload a chest X-ray or click one of the pre-loaded sample radiographs on the left to initiate model inference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
