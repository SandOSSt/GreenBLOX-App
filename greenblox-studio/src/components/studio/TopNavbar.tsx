"use client";

import React from "react";
import { ProjectData } from "@/engine/types/engine";
import { Play, Pause, Square, Save, UploadCloud, Plus, Code2, Boxes, Cpu, Wifi, BookOpen, Gamepad2, Layers, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";

interface TopNavbarProps {
  activeSection: "studio" | "arcade" | "packages" | "plugins" | "multiplayer" | "docs";
  setActiveSection: (section: "studio" | "arcade" | "packages" | "plugins" | "multiplayer" | "docs") => void;
  projects: ProjectData[];
  currentProject: ProjectData | null;
  onSelectProject: (proj: ProjectData) => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onPublishProject: () => void;
  playMode: "edit" | "play" | "pause";
  setPlayMode: (mode: "edit" | "play" | "pause") => void;
  isSaving: boolean;
  isPublishedSuccess: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeSection,
  setActiveSection,
  projects,
  currentProject,
  onSelectProject,
  onNewProject,
  onSaveProject,
  onPublishProject,
  playMode,
  setPlayMode,
  isSaving,
  isPublishedSuccess,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 select-none shadow-lg z-50">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setActiveSection("studio")} 
          className="cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center font-black text-xl text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            G
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              GreenBlox
            </h1>
            <p className="text-[10px] text-slate-400 font-mono -mt-1 uppercase tracking-wider">
              AAA Game Engine & Studio
            </p>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        <div className="ml-4 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          <select
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-200"
            value={currentProject?.id || ""}
            onChange={(e) => {
              const found = projects.find((p) => p.id === Number(e.target.value));
              if (found) onSelectProject(found);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.title}
              </option>
            ))}
          </select>
          <button
            onClick={onNewProject}
            title="Create New Project"
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-emerald-300 transition ml-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Sections */}
      <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs md:text-sm font-medium">
        <button
          onClick={() => setActiveSection("studio")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "studio" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Code2 className="w-4 h-4" /> Studio IDE
        </button>
        <button
          onClick={() => setActiveSection("arcade")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "arcade" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Experiences
        </button>
        <button
          onClick={() => setActiveSection("packages")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "packages" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Boxes className="w-4 h-4" /> Packages
        </button>
        <button
          onClick={() => setActiveSection("plugins")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "plugins" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Cpu className="w-4 h-4" /> Plugins
        </button>
        <button
          onClick={() => setActiveSection("multiplayer")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "multiplayer" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Wifi className="w-4 h-4" /> Multiplayer
        </button>
        <button
          onClick={() => setActiveSection("docs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeSection === "docs" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" /> API Docs
        </button>
      </nav>

      {/* Action Toolbar & Save/Publish */}
      <div className="flex items-center gap-2">
        {activeSection === "studio" && (
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 mr-2">
            <button
              onClick={() => setPlayMode(playMode === "play" ? "pause" : "play")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                playMode === "play"
                  ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {playMode === "play" ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              {playMode === "play" ? "PAUSE SIM" : "PLAY MODE"}
            </button>
            <button
              onClick={() => setPlayMode("edit")}
              disabled={playMode === "edit"}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
                playMode === "edit" ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" /> RESET
            </button>
          </div>
        )}

        <button
          onClick={onSaveProject}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs md:text-sm border border-slate-700 transition active:scale-95"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          {isSaving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={onPublishProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          {isPublishedSuccess ? "Published! 🎉" : "Publish Experience"}
        </button>
      </div>
    </header>
  );
};
