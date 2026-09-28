"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldCheck, Cpu, Image as ImageIcon, History, Layers } from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const data = await fetchHealth();
        if (isMounted) {
          setHealth(data);
          setIsOnline(true);
        }
      } catch {
        if (isMounted) setIsOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/training", label: "Federated Training", icon: Layers },
    { href: "/predict", label: "X-Ray Prediction", icon: ImageIcon },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="border-b border-slate-800 bg-[#0b101d]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">HospitalNet</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FedAvg ResNet18
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Privacy-Preserving Medical AI</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Backend Status Indicator */}
        <div className="hidden md:flex items-center gap-3">
          {health?.demo_mode && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Demo Simulation Mode
            </span>
          )}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-red-400 animate-pulse"
              }`}
            />
            <span className={isOnline ? "text-slate-300" : "text-red-300"}>
              {isOnline ? "Backend Live" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
