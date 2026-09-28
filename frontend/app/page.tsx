import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Building2,
  Lock,
  ArrowRight,
  Database,
  Activity,
  AlertTriangle,
  Server,
  Zap
} from "lucide-react";
import FederatedFlowVisualizer from "@/components/FederatedFlowVisualizer";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Final Year Engineering Academic Project Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Privacy-Preserving Medical AI with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Federated Learning
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          HospitalNet demonstrates collaborative training of deep Convolutional Neural Networks (ResNet18) 
          across three simulated hospitals using Flower & FedAvg. Patient X-rays never leave hospital boundaries.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
          >
            <span>Open System Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/training"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Simulate Federated Training</span>
          </Link>
          <Link
            href="/predict"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Test X-Ray Classifier</span>
          </Link>
        </div>
      </section>

      {/* Interactive Visualizer Section */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">How Federated Learning Operates</h2>
          <p className="text-xs text-slate-400 mt-1">
            Interactive breakdown of weights transmission versus local data custody.
          </p>
        </div>
        <FederatedFlowVisualizer />
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Problem Card */}
        <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 backdrop-blur space-y-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">The Healthcare Data Problem</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Data Silos:</strong> Medical institutions are legally barred (HIPAA, GDPR) from pooling identifiable chest X-rays to a centralized server.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Single Point of Failure:</strong> Central data lakes create catastrophic breach targets for patient health records.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>Underpowered Local Models:</strong> A single hospital has insufficient diversity to train generalizable deep neural networks alone.</span>
            </li>
          </ul>
        </div>

        {/* Solution Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 backdrop-blur space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">The HospitalNet Solution</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Zero Raw Data Transfer:</strong> Patient chest radiographs remain encrypted on local hospital infrastructure.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>FedAvg Weight Aggregation:</strong> Only mathematical parameter vectors (weights & biases) are aggregated via Flower.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Global ResNet18 Intelligence:</strong> Every hospital benefits from the collective intelligence of the entire network.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/70 p-8 backdrop-blur space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-white">Modern Full-Stack Architecture</h3>
          <p className="text-xs text-slate-400 mt-1">Modular components designed for academic demonstration and viva presentation</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
            <Cpu className="w-6 h-6 text-purple-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">PyTorch & ResNet18</h4>
            <p className="text-[11px] text-slate-400">Deep residual CNN transfer learning for binary X-ray classification.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
            <Layers className="w-6 h-6 text-blue-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Flower (flwr) & FedAvg</h4>
            <p className="text-[11px] text-slate-400">Industry-standard federated learning framework and weighted parameter averaging.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
            <Server className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">FastAPI & SQLite</h4>
            <p className="text-[11px] text-slate-400">Asynchronous backend REST API with persistent prediction audit trails.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
            <Zap className="w-6 h-6 text-cyan-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Next.js & Tailwind</h4>
            <p className="text-[11px] text-slate-400">Responsive clinical research dashboard with live telemetry and drag-drop triage.</p>
          </div>
        </div>
      </section>

      {/* Research Disclaimer Box */}
      <section className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-amber-300">Academic Prototype Notice</h4>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            HospitalNet is engineered specifically as a bachelor-degree / master-degree prototype to explore 
            the viability of Federated Averaging (FedAvg) with Convolutional Neural Networks on medical imaging data. 
            All classifications and confidence scores are simulation outputs for research evaluation and must never 
            be used in clinical decision-making.
          </p>
        </div>
      </section>
    </div>
  );
}
