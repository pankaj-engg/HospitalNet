import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "HospitalNet — CNN-Based Federated Learning for Medical Imaging",
  description: "Privacy-Preserving Chest X-Ray Classification Prototype Using Flower, FedAvg, and ResNet18.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        {/* Academic Prototype Footer */}
        <footer className="border-t border-slate-900 bg-[#060911] py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
            <p className="font-medium text-slate-400">
              HospitalNet — Final Year BE Project Prototype
            </p>
            <p>
              A CNN-Based Federated Learning Framework for Privacy-Preserving Medical Image Classification
            </p>
            <p className="text-[11px] text-amber-500/80 pt-1">
              ⚠ Academic research demonstration prototype only. Not for clinical diagnosis or treatment.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
