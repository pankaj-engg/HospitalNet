import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "purple";
  badge?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  badge,
}: MetricCardProps) {
  const colorMap = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400 bg-blue-500/15",
    emerald: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400 bg-emerald-500/15",
    amber: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400 bg-amber-500/15",
    purple: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400 bg-purple-500/15",
  };

  const iconBg = {
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5 backdrop-blur shadow-sm hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-1.5 text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${iconBg[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Mode</span>
          <span className="font-medium text-slate-300">{badge}</span>
        </div>
      )}
    </div>
  );
}
