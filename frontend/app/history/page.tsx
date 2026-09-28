"use client";

import { useEffect, useState } from "react";
import HistoryTable from "@/components/HistoryTable";
import MetricCard from "@/components/MetricCard";
import {
  fetchHistory,
  fetchHistoryStats,
  deleteHistoryRecord,
  clearAllHistory,
  HistoryRecord,
  HistoryStats
} from "@/lib/api";
import { History, Activity, ShieldCheck, ShieldAlert, BarChart3 } from "lucide-react";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      const [hist, st] = await Promise.all([
        fetchHistory(100, 0),
        fetchHistoryStats().catch(() => null),
      ]);
      setRecords(hist.records || []);
      setStats(st);
    } catch {
      // Backend may be offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this prediction entry?")) {
      try {
        await deleteHistoryRecord(id);
        await loadHistoryData();
      } catch (e: any) {
        alert("Failed to delete record: " + e.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all historical prediction entries?")) {
      try {
        await clearAllHistory();
        await loadHistoryData();
      } catch (e: any) {
        alert("Failed to clear history: " + e.message);
      }
    }
  };

  const avgConfidence = stats?.average_confidence
    ? `${Math.round(stats.average_confidence * 100)}%`
    : "--";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-blue-400">
            Database Persistence Log
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Prediction Audit History
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Historical records of chest X-ray evaluations saved automatically into SQLite database.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Evaluated"
          value={stats?.total_predictions || 0}
          subtitle="Saved in SQLite"
          icon={History}
          color="blue"
        />
        <MetricCard
          title="Normal Cases"
          value={stats?.normal_count || 0}
          subtitle="Negative for pneumonia"
          icon={ShieldCheck}
          color="emerald"
        />
        <MetricCard
          title="Pneumonia Cases"
          value={stats?.pneumonia_count || 0}
          subtitle="Positive for consolidation"
          icon={ShieldAlert}
          color="amber"
        />
        <MetricCard
          title="Mean Model Confidence"
          value={avgConfidence}
          subtitle="Softmax probability"
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Table */}
      <HistoryTable
        records={records}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
