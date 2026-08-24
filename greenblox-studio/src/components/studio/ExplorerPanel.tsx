"use client";

import React, { useState } from "react";
import { Entity } from "@/engine/types/engine";
import { Folder, Box, FileCode, Sun, Shield, Car, Radio, Droplet, UserCheck, Search, Plus, Copy, Trash2, Lock, Unlock, ChevronRight, ChevronDown } from "lucide-react";

interface ExplorerPanelProps {
  entities: Entity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onAddPart: (geometry: "cube" | "sphere" | "cylinder" | "plane") => void;
  onDuplicateEntity: (id: string) => void;
  onDeleteEntity: (id: string) => void;
}

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({
  entities,
  selectedEntityId,
  onSelectEntity,
  onAddPart,
  onDuplicateEntity,
  onDeleteEntity,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"scene" | "assets">("scene");

  const filteredEntities = entities.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEntityIcon = (className: Entity["className"]) => {
    switch (className) {
      case "Part": return <Box className="w-4 h-4 text-emerald-400" />;
      case "Model": return <Box className="w-4 h-4 text-blue-400 fill-blue-400/20" />;
      case "Script": return <FileCode className="w-4 h-4 text-yellow-400" />;
      case "Light": return <Sun className="w-4 h-4 text-amber-300" />;
      case "SpawnLocation": return <Shield className="w-4 h-4 text-indigo-400" />;
      case "Vehicle": return <Car className="w-4 h-4 text-orange-400" />;
      case "Water": return <Droplet className="w-4 h-4 text-sky-400" />;
      case "NPC": return <UserCheck className="w-4 h-4 text-purple-400" />;
      case "Folder": default: return <Folder className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col select-none text-slate-200 text-xs shrink-0">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold tracking-wide uppercase text-slate-300">
        <span>Scene Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddPart("cube")}
            title="Add Cube Part"
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 flex items-center gap-0.5 text-[11px] font-mono border border-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Part
          </button>
        </div>
      </div>

      {/* Tab switch between hierarchy and quick part creator */}
      <div className="grid grid-cols-2 p-1 bg-slate-950/50 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("scene")}
          className={`py-1 rounded font-semibold text-center transition ${
            activeTab === "scene" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Hierarchy ({entities.length})
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`py-1 rounded font-semibold text-center transition ${
            activeTab === "assets" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          + Quick Spawn
        </button>
      </div>

      {activeTab === "scene" ? (
        <>
          {/* Search Filter */}
          <div className="p-2 border-b border-slate-800 bg-slate-900/50">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded pl-8 pr-3 py-1 border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredEntities.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic">No matching entities</div>
            ) : (
              filteredEntities.map((ent) => {
                const isSelected = selectedEntityId === ent.id;
                return (
                  <div
                    key={ent.id}
                    onClick={() => onSelectEntity(ent.id)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${
                      isSelected ? "bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500 font-medium" : "hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {getEntityIcon(ent.className)}
                      <span className="truncate" title={ent.name}>{ent.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-1 rounded border border-slate-800">
                        {ent.className}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDuplicateEntity(ent.id); }}
                        title="Duplicate Part"
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteEntity(ent.id); }}
                        title="Delete Part"
                        className="p-1 hover:bg-red-900/60 rounded text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Quick Spawn primitives & prefabs */
        <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 text-slate-300">
          <p className="text-slate-400 text-[11px]">Click to spawn verified geometric primitives and engine prefabs directly into Workspace:</p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddPart("cube")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-emerald-400 transition"
            >
              <Box className="w-6 h-6" />
              <span className="text-xs font-semibold text-slate-200">Cube Part</span>
            </button>
            <button
              onClick={() => onAddPart("sphere")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-blue-400 transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500/30 border border-blue-400 mx-auto" />
              <span className="text-xs font-semibold text-slate-200">Sphere Part</span>
            </button>
            <button
              onClick={() => onAddPart("cylinder")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-amber-400 transition"
            >
              <div className="w-5 h-6 rounded-sm bg-amber-500/30 border border-amber-400 mx-auto" />
              <span className="text-xs font-semibold text-slate-200">Cylinder Part</span>
            </button>
            <button
              onClick={() => onAddPart("plane")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-purple-400 transition"
            >
              <div className="w-8 h-3 bg-purple-500/30 border border-purple-400 mx-auto mt-2" />
              <span className="text-xs font-semibold text-slate-200">Platform Plane</span>
            </button>
          </div>

          <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
              <Shield className="w-4 h-4" /> Smart Duplication & Snap
            </div>
            <p className="text-[10px] text-slate-400">
              When duplicating items with <span className="font-mono text-emerald-300">Copy (Ctrl+D)</span>, GreenBlox applies automatic vertex & surface offset coordinates so obstacles align seamlessly!
            </p>
          </div>
        </div>
      )}

      {/* Explorer Status Footer */}
      <div className="p-2 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Workspace Instances: <b>{entities.length}</b></span>
        <span className="text-emerald-400 font-mono">PBR + Physics</span>
      </div>
    </aside>
  );
};
