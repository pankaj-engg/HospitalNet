"use client";

import React from "react";
import { Trash2, Calendar, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { HistoryRecord } from "@/lib/api";

interface HistoryTableProps {
  records: HistoryRecord[];
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

export default function HistoryTable({ records, onDelete, onClearAll }: HistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-12 text-center backdrop-blur">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white">No Predictions Recorded Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Chest X-rays you submit on the Prediction page will be evaluated and automatically saved to SQLite history.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 backdrop-blur shadow-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Diagnostic History Audit Log</h3>
          <p className="text-xs text-slate-400 mt-0.5">Persisted in SQLite database</p>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">ID</th>
              <th className="py-3.5 px-4 font-semibold">Filename</th>
              <th className="py-3.5 px-4 font-semibold">Prediction</th>
              <th className="py-3.5 px-4 font-semibold">Confidence</th>
              <th className="py-3.5 px-4 font-semibold">Model Version</th>
              <th className="py-3.5 px-4 font-semibold">Date & Time</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {records.map((rec) => {
              const isPneumonia = rec.prediction.toLowerCase() === "pneumonia";
              const dateStr = rec.timestamp
                ? new Date(rec.timestamp).toLocaleString()
                : "Just now";

              return (
                <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500">#{rec.id}</td>
                  <td className="py-3.5 px-4 font-medium text-white max-w-[180px] truncate" title={rec.filename}>
                    {rec.filename}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${
                        isPneumonia
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {isPneumonia ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {rec.prediction}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${isPneumonia ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.round(rec.confidence * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-200">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-[160px] truncate">
                    {rec.model_version}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1.5 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{dateStr}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDelete(rec.id)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
