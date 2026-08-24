"use client";

import React, { useEffect, useState } from "react";
import { Boxes, Download, Search, Check, FileText, ExternalLink, PlusCircle } from "lucide-react";

interface PackageRegistryItem {
  id: number;
  packageName: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  category: string;
  downloads: number;
  documentation: string;
}

interface PackageRegistryViewProps {
  installedPackages: string[];
  onInstallPackage: (pkgName: string) => void;
}

export const PackageRegistryView: React.FC<PackageRegistryViewProps> = ({ installedPackages, onInstallPackage }) => {
  const [packages, setPackages] = useState<PackageRegistryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<PackageRegistryItem | null>(null);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPackages(data);
          if (data.length > 0) setSelectedPkg(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = packages.filter(p => p.packageName.toLowerCase().includes(searchQuery.toLowerCase()) || p.displayName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 overflow-y-auto p-8 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Boxes className="w-8 h-8 text-emerald-400" /> GreenBlox Package Manager
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              NPM-like module ecosystem. Install production character controllers, ragdoll constraints, tweening easers, and inventory GUIs directly into your active project.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search package repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 rounded-xl pl-10 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 text-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {filtered.map((pkg) => {
              const isInstalled = installedPackages.includes(pkg.packageName);
              const isSelected = selectedPkg?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? "bg-slate-900 border-emerald-500 shadow-xl" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-white text-base font-mono">{pkg.packageName}</span>
                      <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded font-mono text-emerald-400 border border-slate-700">
                        v{pkg.version}
                      </span>
                      <span className="text-[11px] bg-emerald-950/50 text-emerald-300 px-2 py-0.5 rounded uppercase font-bold">
                        {pkg.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{pkg.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 font-mono">
                      <span>By <b>{pkg.author}</b></span>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3 text-emerald-400" /> {(pkg.downloads || 10000).toLocaleString()} installs</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onInstallPackage(pkg.packageName); }}
                    disabled={isInstalled}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                      isInstalled
                        ? "bg-emerald-950 border border-emerald-600 text-emerald-400 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                    }`}
                  >
                    {isInstalled ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {isInstalled ? "Installed in Project" : "Install Package"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Details column */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6 shadow-xl flex flex-col gap-4">
            {selectedPkg ? (
              <>
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-extrabold text-lg text-white font-mono">{selectedPkg.packageName}</h3>
                  <p className="text-xs text-slate-400 mt-1">Documentation & Integration Guide</p>
                </div>

                <div className="prose prose-invert text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap">
                  {selectedPkg.documentation || "No README documentation provided."}
                </div>

                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>To import in Lua scripts: <code className="bg-slate-950 px-1.5 py-0.5 rounded font-bold">require("{selectedPkg.packageName}")</code></span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-center py-12">Select a module to view documentation.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
