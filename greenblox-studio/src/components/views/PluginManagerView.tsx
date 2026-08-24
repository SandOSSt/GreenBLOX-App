"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Check, Wrench, Sparkles, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

interface PluginItem {
  id: number;
  name: string;
  description: string;
  version: string;
  author: string;
  targetSystem: string;
  isActiveByDefault: boolean;
}

interface PluginManagerViewProps {
  installedPlugins: string[];
  onTogglePlugin: (pluginName: string) => void;
}

export const PluginManagerView: React.FC<PluginManagerViewProps> = ({ installedPlugins, onTogglePlugin }) => {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);

  useEffect(() => {
    fetch("/api/plugins")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlugins(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 overflow-y-auto p-8 select-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Cpu className="w-8 h-8 text-emerald-400" /> Engine Plugin & Extensions Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Extend GreenBlox Studio capabilities with custom rendering shaders, level generators, and network diagnostic utilities.
            </p>
          </div>
          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sandboxed Runtime
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.map((plg) => {
            const isActive = installedPlugins.includes(plg.name);
            return (
              <div
                key={plg.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-slate-950 px-3 py-1 rounded-full font-mono text-emerald-400 border border-slate-800 uppercase font-bold">
                      {plg.targetSystem} System
                    </span>
                    <span className="text-xs font-mono text-slate-500">v{plg.version}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">{plg.name}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{plg.description}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-3">Author: <b className="text-slate-400">{plg.author}</b></p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {isActive ? <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
                    {isActive ? "Active in Studio" : "Disabled"}
                  </span>

                  <button
                    onClick={() => onTogglePlugin(plg.name)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 ${
                      isActive
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    }`}
                  >
                    {isActive ? "Disable Plugin" : "Activate Plugin"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
