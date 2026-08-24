"use client";

import React, { useMemo, useState } from "react";
import type { AnimationClip, DebugLog, Entity, ProjectData, UICanvasElement } from "@/engine/types/engine";
import { ECSWorld } from "@/engine/core/ecs";
import { GreenBloxRenderer } from "@/engine/renderer/rendererScene";
import { PhysicsEngine } from "@/engine/physics/physicsWorld";
import { AudioEngine } from "@/engine/audio/audioMixer";
import { LuaRuntimeEngine } from "@/engine/lua/luaRuntime";
import type { StudioToolMode } from "@/engine/editor/editorState";
import { StudioRibbon, type StudioWorkspaceTab } from "./StudioRibbon";
import { ViewportCanvas } from "./ViewportCanvas";
import { StudioRightDock } from "./StudioRightDock";
import { LuaEditorTab } from "@/components/studio/LuaEditorTab";
import { UICanvasTab } from "@/components/studio/UICanvasTab";
import { AnimationTab } from "@/components/studio/AnimationTab";
import { AudioMixerTab } from "@/components/studio/AudioMixerTab";
import { SettingsWorkspace } from "./SettingsWorkspace";
import { Database, Gauge, Package, PanelsTopLeft, Play, Puzzle, Save, Terminal } from "lucide-react";

interface StudioEditorShellProps {
  currentProject: ProjectData;
  entities: Entity[];
  logs: DebugLog[];
  ecs: ECSWorld;
  renderer: GreenBloxRenderer;
  physics: PhysicsEngine;
  audioEngine: AudioEngine;
  luaEngine: LuaRuntimeEngine;
  workspaceTab: StudioWorkspaceTab;
  onChangeWorkspaceTab: (tab: StudioWorkspaceTab) => void;
  activeTool: StudioToolMode;
  onSetActiveTool: (tool: StudioToolMode) => void;
  playMode: "edit" | "play" | "pause";
  onSetPlayMode: (mode: "edit" | "play" | "pause") => void;
  selectedEntityId: string | null;
  selectedEntityIds: string[];
  onSelectEntity: (id: string | null, additive?: boolean) => void;
  activeScriptId: string | null;
  onSetActiveScriptId: (id: string | null) => void;
  onBackHome: () => void;
  onSave: () => void;
  onUpdateEntity: (entity: Entity) => void;
  onUpdateProject: (project: ProjectData) => void;
  onAddPart: () => void;
  onEnableTerrain: () => void;
  onAddSpawn: () => void;
  onAddCharacter: () => void;
  onCreateUI: () => void;
  onCreateScript: () => void;
  onRandomizeColor: () => void;
  onToggleLock: () => void;
  onToggleAnchor: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function StudioEditorShell({
  currentProject,
  entities,
  logs,
  ecs,
  renderer,
  physics,
  audioEngine,
  luaEngine,
  workspaceTab,
  onChangeWorkspaceTab,
  activeTool,
  onSetActiveTool,
  playMode,
  onSetPlayMode,
  selectedEntityId,
  selectedEntityIds,
  onSelectEntity,
  activeScriptId,
  onSetActiveScriptId,
  onBackHome,
  onSave,
  onUpdateEntity,
  onUpdateProject,
  onAddPart,
  onEnableTerrain,
  onAddSpawn,
  onAddCharacter,
  onCreateUI,
  onCreateScript,
  onRandomizeColor,
  onToggleLock,
  onToggleAnchor,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  canUndo,
  canRedo,
}: StudioEditorShellProps) {
  const [commandText, setCommandText] = useState('print("GreenBlox command bar ready")');

  const centerLabel = useMemo(() => {
    if (workspaceTab === "Home" || workspaceTab === "Model") return "Viewport";
    if (workspaceTab === "Avatar") return "Animation";
    return workspaceTab;
  }, [workspaceTab]);

  const executeCommand = () => {
    const source = commandText.trim();
    if (!source) return;
    try {
      luaEngine.executeScript("command_bar", "CommandBar.lua", source);
    } catch (error) {
      console.error(error);
    }
  };

  const renderCenterPanel = () => {
    if (workspaceTab === "Script") {
      return (
        <LuaEditorTab
          scripts={currentProject.luaScripts}
          activeScriptId={activeScriptId}
          onSelectScript={onSetActiveScriptId}
          onUpdateScriptCode={(id, newCode) => {
            onUpdateProject({
              ...currentProject,
              luaScripts: currentProject.luaScripts.map((script) => (script.id === id ? { ...script, code: newCode } : script)),
            });
          }}
          onCreateScript={onCreateScript}
          onDeleteScript={(id) => {
            const nextScripts = currentProject.luaScripts.filter((script) => script.id !== id);
            onUpdateProject({ ...currentProject, luaScripts: nextScripts });
            onSetActiveScriptId(nextScripts[0]?.id ?? null);
          }}
          luaEngine={luaEngine}
        />
      );
    }

    if (workspaceTab === "UI") {
      return (
        <UICanvasTab
          uiCanvases={currentProject.uiCanvases}
          onUpdateUI={(uiCanvases: UICanvasElement[]) => onUpdateProject({ ...currentProject, uiCanvases })}
        />
      );
    }

    if (workspaceTab === "Avatar") {
      return (
        <AnimationTab
          animations={currentProject.animationsData}
          onUpdateAnimations={(animationsData: AnimationClip[]) => onUpdateProject({ ...currentProject, animationsData })}
        />
      );
    }

    if (workspaceTab === "Audio") {
      return <AudioMixerTab audioEngine={audioEngine} />;
    }

    if (workspaceTab === "Settings") {
      return <SettingsWorkspace project={currentProject} onUpdateProject={onUpdateProject} onSave={onSave} />;
    }

    if (workspaceTab === "Plugins") {
      return <PluginWorkspace pluginNames={currentProject.installedPlugins || []} packageNames={currentProject.installedPackages || []} />;
    }

    return (
      <ViewportCanvas
        ecs={ecs}
        renderer={renderer}
        physics={physics}
        sceneData={currentProject.sceneData}
        uiCanvases={currentProject.uiCanvases}
        activeTool={activeTool}
        playMode={playMode}
        selectedEntityId={selectedEntityId}
        selectedCount={selectedEntityIds.length}
        onSelectEntity={onSelectEntity}
      />
    );
  };

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden text-white"
      style={{ background: "linear-gradient(180deg, #0a0b10 0%, #0a0c12 100%)" }}
    >
      <StudioRibbon
        projectTitle={currentProject.title}
        workspaceTab={workspaceTab}
        onChangeWorkspaceTab={onChangeWorkspaceTab}
        activeTool={activeTool}
        onSetTool={onSetActiveTool}
        playMode={playMode}
        onSetPlayMode={onSetPlayMode}
        onBackHome={onBackHome}
        onAddPart={onAddPart}
        onEnableTerrain={onEnableTerrain}
        onAddSpawn={onAddSpawn}
        onAddCharacter={onAddCharacter}
        onCreateUI={onCreateUI}
        onCreateScript={onCreateScript}
        onMaterialPaint={() => {
          onSetActiveTool("paint_material");
          onChangeWorkspaceTab("Model");
        }}
        onRandomizeColor={onRandomizeColor}
        onToggleLock={onToggleLock}
        onToggleAnchor={onToggleAnchor}
        onSave={onSave}
        onUndo={onUndo}
        onRedo={onRedo}
        onCopy={onCopy}
        onPaste={onPaste}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#10131a] px-3">
        <div className="relative flex h-full min-w-0 items-center rounded-t-md border-x border-t border-white/[0.07] bg-[#1a1e27] px-4 text-[12px] font-semibold tracking-[-0.01em] text-white/90">
          <span className="max-w-[45vw] truncate">{currentProject.title}</span>
          <span className="absolute -bottom-px left-0 h-px w-full bg-[#1a1e27]" />
        </div>
        <div className="text-[11px] text-white/35">{centerLabel}</div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[#0a0c12]">{renderCenterPanel()}</main>

        <StudioRightDock
          entities={entities}
          selectedEntityId={selectedEntityId}
          selectedEntityIds={selectedEntityIds}
          onSelectEntity={onSelectEntity}
          onUpdateEntity={onUpdateEntity}
          logs={logs}
        />
      </div>

      <footer
        className="flex min-h-11 shrink-0 items-center gap-2 overflow-x-auto px-3 py-1.5"
        style={{ background: "rgba(16, 19, 26, 0.96)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-emerald-200">
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-semibold tracking-wide">COMMAND</span>
        </div>
        <input
          value={commandText}
          onChange={(event) => setCommandText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") executeCommand();
          }}
          placeholder="type Lua, then Run or press Enter"
          className="gb-input h-8 min-w-[220px] flex-1 px-3 font-mono text-[11px]"
        />
        <button onClick={onSave} className="gb-action-btn gb-secondary h-8 shrink-0 px-3 text-[11px]">
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button onClick={executeCommand} className="gb-action-btn gb-primary h-8 shrink-0 px-3 text-[11px]">
          <Play className="h-3.5 w-3.5 fill-white" />
          <span className="hidden sm:inline">Run</span>
        </button>
      </footer>
    </div>
  );
}

function PluginWorkspace({ pluginNames, packageNames }: { pluginNames: string[]; packageNames: string[] }) {
  return (
    <div className="h-full overflow-auto bg-[#0d0f14] p-3 sm:p-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center gap-4 border-b border-white/[0.07] pb-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.045] text-emerald-200 ring-1 ring-white/[0.08]">
            <PanelsTopLeft className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold tracking-[-0.035em] text-white">Workspace Extensions</h2>
            <p className="mt-1 text-[12px] text-white/40">Registered runtime tools, packages and editor hooks attached to this project.</p>
          </div>
        </div>

        <section>
          <div className="gb-label mb-3">Active plugins</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pluginNames.map((plugin) => (
              <div key={plugin} className="gb-card gb-surface-soft rounded-2xl p-4">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                  <Puzzle className="h-4 w-4 text-emerald-200" />
                  {plugin}
                </div>
                <p className="text-[11px] leading-5 text-white/39">Loaded as a project-level extension for editor tooling and runtime behavior.</p>
              </div>
            ))}
            {pluginNames.length === 0 && <EmptyState text="No plugins are currently attached to this experience." />}
          </div>
        </section>

        <section>
          <div className="gb-label mb-3">Runtime packages</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {packageNames.map((pkg) => (
              <div key={pkg} className="gb-card gb-surface-soft rounded-2xl p-4">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-white">
                  <Package className="h-4 w-4 text-blue-200" />
                  {pkg}
                </div>
                <p className="break-all text-[11px] leading-5 text-white/39">Available through the Lua bridge and persistent project dependency registry.</p>
              </div>
            ))}
            {packageNames.length === 0 && <EmptyState text="No Lua/runtime packages are installed in this experience." />}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/[0.085] bg-white/[0.018] p-5 text-[12px] text-white/36 md:col-span-2 xl:col-span-3">{text}</div>;
}
