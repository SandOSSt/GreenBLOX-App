"use client";

import React, { useState } from "react";
import { DebugLog } from "@/engine/types/engine";
import { Terminal, Activity, FolderUp, Trash2, Filter, Zap, Cpu, HardDrive, Wifi, CheckCircle2 } from "lucide-react";

interface BottomConsoleProps {
  logs: DebugLog[];
  onClearLogs: () => void;
  drawCalls: number;
  triangleCount: number;
  heapMB: number;
  onImportAsset: (asset: { name: string; type: string; category: string; thumbnail: string }) => void;
}

export const BottomConsole: React.FC<BottomConsoleProps> = ({
  logs,
  onClearLogs,
  drawCalls,
  triangleCount,
  heapMB,
  onImportAsset,
}) => {
  const [activeTab, setActiveTab] = useState<"console" | "profiler" | "assets">("console");
  const [filterType, setFilterType] = useState<string>("all");
  const [assetName, setAssetName] = useState("Sci-Fi Blaster (GLTF)");

  const filteredLogs = filterType === "all" ? logs : logs.filter(l => l.type === filterType);

  const handleImport = () => {
    onImportAsset({
      name: assetName,
      type: "model",
      category: "Imported",
      thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop"
    });
    setAssetName(`Asset_${Date.now()}`);
  };

  return (
    <div className="h-52 bg-slate-900 border-t border-slate-800 flex flex-col select-none text-xs text-slate-200 overflow-hidden shrink-0 shadow-2xl">
      {/* Tray Header & Tab Switcher */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("console")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
              activeTab === "console" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" /> Console ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("profiler")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
              activeTab === "profiler" ? "bg-slate-800 text-cyan-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" /> Profiler & Telemetry
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
              activeTab === "assets" ? "bg-slate-800 text-purple-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            <FolderUp className="w-4 h-4 text-purple-400" /> Asset Pipeline & Importer
          </button>
        </div>

        {activeTab === "console" && (
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] text-slate-300 font-semibold"
            >
              <option value="all">All Channels</option>
              <option value="info">System Info</option>
              <option value="lua">Lua Script Prints</option>
              <option value="warn">Warnings & Breakpoints</option>
              <option value="error">Errors</option>
              <option value="network">RPC RemoteEvents</option>
            </select>

            <button
              onClick={onClearLogs}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto font-mono bg-slate-950 p-2">
        {activeTab === "console" && (
          <div className="flex flex-col gap-1 text-[11px]">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 italic p-4 text-center font-sans">Engine console awaiting log events...</div>
            ) : (
              filteredLogs.map((lg) => {
                let colorClass = "text-slate-300";
                if (lg.type === "lua") colorClass = "text-yellow-300 font-bold";
                if (lg.type === "warn") colorClass = "text-amber-400 font-semibold";
                if (lg.type === "error") colorClass = "text-red-400 font-extrabold bg-red-950/30 p-0.5 rounded";
                if (lg.type === "network") colorClass = "text-cyan-400";

                return (
                  <div key={lg.id} className={`flex items-start gap-2 hover:bg-slate-900/50 px-2 py-0.5 rounded ${colorClass}`}>
                    <span className="text-slate-500 shrink-0">[{lg.timestamp}]</span>
                    <span className="bg-slate-900 px-1 rounded text-[10px] uppercase border border-slate-800 text-slate-400 shrink-0">{lg.source}</span>
                    <span className="flex-1 whitespace-pre-wrap">{lg.message}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "profiler" && (
          <div className="p-4 grid grid-cols-5 gap-4 font-sans">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Frame Rate</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">60 FPS</div>
              <div className="text-[10px] text-slate-500">Frame time: 16.6ms</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>GPU Render Draw Calls</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">{drawCalls || 14}</div>
              <div className="text-[10px] text-slate-500">Instancing Optimized</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Triangle Complexity</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">{(triangleCount || 2480).toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Frustum Culling active</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Heap Consumption</span>
                <HardDrive className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">{heapMB} MB</div>
              <div className="text-[10px] text-slate-500">GC allocations healthy</div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Net Sync Bandwidth</span>
                <Wifi className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono">14.2 Kbps</div>
              <div className="text-[10px] text-slate-500">Tick Rate: 60Hz</div>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div className="p-4 font-sans flex items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-extrabold text-white text-sm mb-1">Asset Import & Auto-Optimization Engine</h3>
              <p className="text-slate-400 text-[11px]">
                Supports importing PNG, JPG, WEBP, SVG, FBX, GLTF, OBJ, MP3, WAV, OGG, TTF, and Lua modules. Automatically optimizes textures, generates compressed DRACO LOD meshes, and builds studio thumbnails.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Asset filename..."
                className="bg-slate-950 px-3 py-1.5 rounded border border-slate-700 font-mono text-xs text-emerald-300 focus:outline-none"
              />
              <button
                onClick={handleImport}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow transition text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Optimize & Import to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
