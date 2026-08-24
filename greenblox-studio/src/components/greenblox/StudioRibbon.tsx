"use client";

import React from "react";
import {
  Anchor,
  Clipboard,
  ClipboardPaste,
  Cuboid,
  FileCode2,
  Flag,
  Lock,
  Maximize2,
  Monitor,
  Mountain,
  MousePointer2,
  Move,
  Paintbrush,
  Palette,
  Pause,
  Play,
  RotateCw,
  Save,
  Square,
  User,
  Undo2,
  Redo2,
} from "lucide-react";
import type { StudioToolMode } from "@/engine/editor/editorState";
import StudioAccountBar from "./StudioAccountBar";

export type StudioWorkspaceTab = "Home" | "Avatar" | "UI" | "Script" | "Model" | "Plugins" | "Audio" | "Settings";

interface StudioRibbonProps {
  projectTitle: string;
  workspaceTab: StudioWorkspaceTab;
  onChangeWorkspaceTab: (tab: StudioWorkspaceTab) => void;
  activeTool: StudioToolMode;
  onSetTool: (tool: StudioToolMode) => void;
  playMode: "edit" | "play" | "pause";
  onSetPlayMode: (mode: "edit" | "play" | "pause") => void;
  onBackHome: () => void;
  onAddPart: () => void;
  onEnableTerrain: () => void;
  onAddSpawn: () => void;
  onAddCharacter: () => void;
  onCreateUI: () => void;
  onCreateScript: () => void;
  onMaterialPaint: () => void;
  onRandomizeColor: () => void;
  onToggleLock: () => void;
  onToggleAnchor: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const workspaceTabs: StudioWorkspaceTab[] = ["Home", "Avatar", "UI", "Script", "Model", "Plugins", "Audio", "Settings"];

export function StudioRibbon({
  projectTitle,
  workspaceTab,
  onChangeWorkspaceTab,
  activeTool,
  onSetTool,
  playMode,
  onSetPlayMode,
  onBackHome,
  onAddPart,
  onEnableTerrain,
  onAddSpawn,
  onAddCharacter,
  onCreateUI,
  onCreateScript,
  onMaterialPaint,
  onRandomizeColor,
  onToggleLock,
  onToggleAnchor,
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  canUndo,
  canRedo,
}: StudioRibbonProps) {
  return (
    <header
      className="shrink-0 text-white"
      style={{
        background: "rgba(16, 19, 26, 0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 26px rgba(0,0,0,0.22)",
      }}
    >
      <div
        className="relative flex h-10 items-center overflow-x-auto border-b border-white/[0.05] px-3 text-[11px] text-white/45"
        style={{ background: "rgba(10, 12, 17, 0.6)" }}
      >
        <div className="flex h-full shrink-0 items-center gap-4">
          <button onClick={onBackHome} className="font-medium hover:text-white">
            File
          </button>
          <MenuLabel>Edit</MenuLabel>
          <MenuLabel>View</MenuLabel>
          <MenuLabel>Plugins</MenuLabel>
          <MenuLabel>Test</MenuLabel>
          <MenuLabel>Window</MenuLabel>
          <MenuLabel>Help</MenuLabel>
        </div>
        <div className="pointer-events-none absolute left-1/2 hidden max-w-[42vw] -translate-x-1/2 truncate font-medium text-white/34 lg:block">
          {projectTitle} — GreenBlox Engine
        </div>
        <div className="ml-auto mt-1 flex shrink-0 items-center gap-2 pl-8" aria-label="Account">
          <StudioAccountBar />
        </div>
      </div>

      <div
        className="flex h-11 items-center overflow-x-auto border-b border-white/[0.05] px-2"
        style={{ background: "rgba(20, 24, 31, 0.55)" }}
      >
        <button
          onClick={onBackHome}
          className="mr-1 inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-[12px] font-semibold text-white/72 transition hover:bg-white/[0.045] hover:text-white"
        >
          <img src="/favicon.svg" alt="GreenBlox Studio" className="h-4 w-4 rounded-sm" />
          GreenBlox
        </button>

        <div className="flex h-full shrink-0 items-end gap-0.5">
          {workspaceTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onChangeWorkspaceTab(tab)}
              className={`relative h-10 whitespace-nowrap rounded-t-md px-4 text-[12px] font-medium transition ${
                workspaceTab === tab
                  ? "bg-[#1a1e27] text-white shadow-[inset_1px_0_0_rgba(255,255,255,0.06),inset_-1px_0_0_rgba(255,255,255,0.06)]"
                  : "text-white/45 hover:bg-white/[0.04] hover:text-white/82"
              }`}
            >
              {tab}
              {workspaceTab === tab && (
                <span
                  className="absolute inset-x-2 top-0 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #6e8eff, #2cd6bb)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex min-h-[64px] items-stretch gap-1 overflow-x-auto px-2 py-2"
        style={{ background: "rgba(22, 26, 33, 0.5)" }}
      >
        <ToolCluster>
          <button onClick={onUndo} disabled={!canUndo} className="ribbon-btn disabled:cursor-not-allowed disabled:opacity-25" title="Undo (Ctrl/Cmd+Z)"><Undo2 className="h-[18px] w-[18px]" /><span>Undo</span></button>
          <button onClick={onRedo} disabled={!canRedo} className="ribbon-btn disabled:cursor-not-allowed disabled:opacity-25" title="Redo (Ctrl/Cmd+Shift+Z)"><Redo2 className="h-[18px] w-[18px]" /><span>Redo</span></button>
          <button onClick={onCopy} className="ribbon-btn" title="Copy (Ctrl/Cmd+C)"><Clipboard className="h-[18px] w-[18px]" /><span>Copy</span></button>
          <button onClick={onPaste} className="ribbon-btn" title="Paste (Ctrl/Cmd+V)"><ClipboardPaste className="h-[18px] w-[18px]" /><span>Paste</span></button>
        </ToolCluster>

        <Divider />

        <div className="hidden shrink-0 items-center rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 text-[10px] leading-4 text-white/38 xl:flex">
          Shift-click objects for multi-select. Transform gizmo edits the whole group.
        </div>

        <Divider />

        <ToolCluster>
          <ToolButton active={activeTool === "select"} icon={MousePointer2} label="Select" onClick={() => onSetTool("select")} shortcut="V" />
          <ToolButton active={activeTool === "move"} icon={Move} label="Move" onClick={() => onSetTool("move")} shortcut="W" />
          <ToolButton active={activeTool === "scale"} icon={Maximize2} label="Scale" onClick={() => onSetTool("scale")} shortcut="E" />
          <ToolButton active={activeTool === "rotate"} icon={RotateCw} label="Rotate" onClick={() => onSetTool("rotate")} shortcut="R" />
        </ToolCluster>

        <Divider />

        <ToolCluster>
          <ToolButton icon={Cuboid} label="Part" onClick={onAddPart} />
          <ToolButton icon={Mountain} label="Terrain" onClick={onEnableTerrain} />
          <ToolButton icon={Flag} label="Spawn" onClick={onAddSpawn} />
          <ToolButton icon={User} label="Avatar" onClick={onAddCharacter} />
          <ToolButton icon={Monitor} label="GUI" onClick={onCreateUI} />
          <ToolButton icon={FileCode2} label="Script" onClick={onCreateScript} />
        </ToolCluster>

        <Divider />

        <ToolCluster>
          <ToolButton icon={Palette} label="Material" onClick={onMaterialPaint} />
          <ToolButton icon={Paintbrush} label="Color" onClick={onRandomizeColor} />
          <ToolButton icon={Lock} label="Lock" onClick={onToggleLock} />
          <ToolButton icon={Anchor} label="Anchor" onClick={onToggleAnchor} />
        </ToolCluster>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
          <button
            onClick={() => onSetPlayMode(playMode === "play" ? "pause" : "play")}
            className="gb-action-btn gb-primary px-3.5"
            title="Start or pause simulation"
          >
            {playMode === "play" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            {playMode === "play" ? "Pause" : "Play"}
          </button>
          <button onClick={() => onSetPlayMode("edit")} className="gb-action-btn gb-secondary px-3.5" title="Stop simulation">
            <Square className="h-3.5 w-3.5" />
            Stop
          </button>
          <button onClick={onSave} className="gb-action-btn gb-save px-3.5" title="Save project">
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap hover:text-white/82">{children}</span>;
}

function ToolCluster({ children }: { children: React.ReactNode }) {
  return <div className="flex shrink-0 items-stretch rounded-md px-1">{children}</div>;
}

function Divider() {
  return <div className="mx-1.5 w-px shrink-0 self-stretch bg-white/[0.075]" />;
}

function ToolButton({
  active,
  icon: Icon,
  label,
  onClick,
  shortcut,
}: {
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`ribbon-btn relative ${active ? "ribbon-btn-active" : ""}`}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
      {shortcut && <span className="absolute right-1 top-1 hidden font-mono text-[8px] text-white/24 lg:block">{shortcut}</span>}
    </button>
  );
}
