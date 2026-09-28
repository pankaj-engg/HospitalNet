"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { fetchSampleImages, SampleImage } from "@/lib/api";

interface ImageUploaderProps {
  onPredict: (file: File) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onPredict, isLoading }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample image list on mount
  React.useEffect(() => {
    fetchSampleImages().then(setSamples).catch(() => {});
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG).");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = async (sample: SampleImage) => {
    try {
      setLoadingSample(true);
      const res = await fetch(`http://localhost:8000${sample.download_url}`);
      const blob = await res.blob();
      const file = new File([blob], sample.id, { type: "image/png" });
      handleFile(file);
    } catch {
      alert("Failed to load sample image from backend.");
    } finally {
      setLoadingSample(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onPredict(selectedFile);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-6 backdrop-blur shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">Chest X-Ray Input</h3>
          <p className="text-xs text-slate-400 mt-0.5">Upload a patient chest radiograph for classification</p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          ResNet18 224x224
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : previewUrl
              ? "border-emerald-500/40 bg-slate-900/60"
              : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {previewUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative w-44 h-44 rounded-lg overflow-hidden border border-slate-700 shadow-md mb-3 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Chest X-Ray Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{selectedFile?.name} ({(selectedFile?.size || 0) / 1024 > 1024 ? `${((selectedFile?.size || 0)/(1024*1024)).toFixed(1)}MB` : `${Math.round((selectedFile?.size || 0)/1024)}KB`})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Click or drag to change image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">Drag and drop chest X-ray here</p>
              <p className="text-xs text-slate-400 mt-1">or browse from your local computer</p>
              <p className="text-[10px] text-slate-500 mt-3">Supports PNG, JPG, JPEG up to 15MB</p>
            </div>
          )}
        </div>

        {/* Quick Sample Selector */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Or Test With Built-in Samples:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {samples.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={loadingSample || isLoading}
                onClick={() => handleLoadSample(s)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 text-left transition-all text-xs group"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-medium text-slate-200 block">{s.label}</span>
                    <span className="text-[10px] text-slate-500">Expected: {s.expected}</span>
                  </div>
                </div>
                <span className="text-[11px] text-blue-400 group-hover:underline">Load</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            !selectedFile || isLoading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25"
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Radiograph with Global ResNet18...</span>
            </>
          ) : (
            <span>Run Medical Classification</span>
          )}
        </button>
      </form>
    </div>
  );
}
