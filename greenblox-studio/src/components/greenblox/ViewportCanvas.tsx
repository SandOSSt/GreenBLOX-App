"use client";

import React, { useEffect, useRef, useState } from "react";
import { ECSWorld } from "@/engine/core/ecs";
import { GreenBloxRenderer } from "@/engine/renderer/rendererScene";
import { PhysicsEngine } from "@/engine/physics/physicsWorld";
import type { SceneData, UICanvasElement } from "@/engine/types/engine";
import type { StudioToolMode } from "@/engine/editor/editorState";
import { Activity, MousePointer2 } from "lucide-react";
import { inputState } from "@/engine/core/input";

interface ViewportCanvasProps {
  ecs: ECSWorld;
  renderer: GreenBloxRenderer;
  physics: PhysicsEngine;
  sceneData: SceneData;
  uiCanvases: UICanvasElement[];
  activeTool: StudioToolMode;
  playMode: "edit" | "play" | "pause";
  selectedEntityId: string | null;
  selectedCount: number;
  onSelectEntity: (id: string | null) => void;
}

export function ViewportCanvas({
  ecs,
  renderer,
  physics,
  sceneData,
  uiCanvases,
  activeTool,
  playMode,
  selectedEntityId,
  selectedCount,
  onSelectEntity,
}: ViewportCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectEntityRef = useRef(onSelectEntity);
  const [cameraView, setCameraView] = useState<"perspective" | "top" | "front" | "right">("perspective");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapSize, setSnapSize] = useState(0.5);
  const [gridVisible, setGridVisible] = useState(true);
  const [transformSpace, setTransformSpace] = useState<"world" | "local">("world");

  useEffect(() => {
    onSelectEntityRef.current = onSelectEntity;
  }, [onSelectEntity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    renderer.mount(container, sceneData);
    renderer.applyEnvironment(sceneData.environment);
    renderer.rebuildScene();

    // Selection is handled via renderer.onSelectionChanged in page.tsx.
    // ViewportCanvas does NOT call onSelectEntity on viewport clicks to avoid loop-back.
    // This dummy subscription keeps the connection alive for cleanup.
    const selectionConnection = { disconnect: () => {} };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.resize(Math.max(1, width), Math.max(1, height));
    });
    observer.observe(container);

    return () => {
      selectionConnection.disconnect();
      observer.disconnect();
    };
  }, [ecs, renderer]);

  useEffect(() => {
    renderer.applyEnvironment(sceneData.environment);
  }, [renderer, sceneData.environment]);

  useEffect(() => {
    renderer.setGridSnap(snapEnabled, snapSize);
  }, [renderer, snapEnabled, snapSize]);

  useEffect(() => {
    renderer.setGridVisible(gridVisible);
  }, [renderer, gridVisible]);

  useEffect(() => {
    renderer.setTransformSpace(transformSpace);
  }, [renderer, transformSpace]);

  // Selection is NOT synced here on purpose. The renderer is the single source
  // of truth and fires onSelectionChanged → page.tsx updates the React state.
  // Calling renderer.selectEntity(selectedEntityId) here would REPLACE the whole
  // selection with a single entity every time the primary id changed — that was
  // the exact bug that made Shift-click multi-select instantly collapse to one
  // object. Viewport clicks already go through renderer.raycastSelect (additive
  // on Shift), so no effect is needed.

  // Input is handled centrally in page.tsx to avoid conflicts.
  // This effect is kept only for potential future UI-specific needs.


  return (
    <div className="gb-viewport relative h-full w-full overflow-hidden bg-[#151821]">
      <div ref={containerRef} className="gb-view-frame absolute inset-0" />

      {playMode !== "play" && (
        <>
          <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 overflow-hidden rounded-lg border border-white/[0.10] bg-[#161920]/92 p-0.5 text-[10px] font-medium shadow-xl backdrop-blur-md">
            {(["perspective", "top", "front", "right"] as const).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCameraView(view);
                  renderer.setCameraView(view);
                }}
                className={`rounded-md px-3 py-1.5 capitalize transition ${cameraView === view ? "bg-white/[0.12] text-white" : "text-white/45 hover:text-white/80"}`}
              >
                {view}
              </button>
            ))}
          </div>

          <div className="absolute left-3 top-12 z-30 flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-[#161920]/90 px-2.5 py-2 text-[10px] text-white/60 shadow-lg backdrop-blur-md">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={snapEnabled} onChange={(e) => setSnapEnabled(e.target.checked)} className="accent-[#5d80ff]" /> Grid snap</label>
            <span className="flex items-center gap-0.5 overflow-hidden rounded-md bg-white/[0.05] p-0.5">
              {[0.25, 0.5, 1, 2, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setSnapSize(step)}
                  className={`rounded px-1.5 py-0.5 font-mono transition ${Math.abs(snapSize - step) < 1e-9 ? "bg-white/[0.14] text-white" : "text-white/45 hover:text-white/80"}`}
                >
                  {step}
                </button>
              ))}
            </span>
            <input type="number" min="0.05" step="0.25" value={snapSize} onChange={(e) => setSnapSize(Math.max(0.05, Number(e.target.value) || 0.5))} className="gb-input h-6 w-14 px-1.5 text-center font-mono text-[10px]" />
            <span className="text-white/30">studs</span>
            <div className="hidden text-[9px] leading-3 text-white/34 xl:block">
              hold <kbd className="rounded bg-white/[0.08] px-1 font-mono">Ctrl</kbd> while dragging for free placement
            </div>
            <span className="h-4 w-px bg-white/[0.08]" />
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={gridVisible} onChange={(e) => setGridVisible(e.target.checked)} className="accent-[#5d80ff]" /> Show grid</label>
            <button onClick={() => setTransformSpace(transformSpace === "world" ? "local" : "world")} className="rounded-md bg-white/[0.06] px-2 py-1 text-white/65 hover:bg-white/[0.10] hover:text-white">{transformSpace}</button>
          </div>
        </>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 text-[10px]">
        <div className="gb-overlay-chip font-medium uppercase tracking-[0.08em]">
          <Activity className="h-3.5 w-3.5 text-emerald-200" />
          {sceneData.environment.skybox}
        </div>
        <div className="gb-overlay-chip">
          <MousePointer2 className="h-3.5 w-3.5 text-white/42" />
          {activeTool.replace("_", " ")}
        </div>
        {selectedCount > 1 && (
          <div className="gb-overlay-chip border-[#5d80ff]/40 bg-[#3f6cff]/20 font-semibold text-blue-100">
            {selectedCount} selected
          </div>
        )}
        {playMode === "play" && (
          <div className="gb-overlay-chip border-emerald-300/20 bg-emerald-950/50 text-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
            Simulation
          </div>
        )}
      </div>





      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {uiCanvases.map((ui) => {
          if (!ui.visible && playMode !== "play") return null;

          let style: React.CSSProperties = {};
          if (ui.anchor === "top-left") style = { top: ui.y, left: ui.x };
          if (ui.anchor === "top-right") style = { top: ui.y, right: ui.x };
          if (ui.anchor === "bottom-left") style = { bottom: ui.y, left: ui.x };
          if (ui.anchor === "bottom-right") style = { bottom: ui.y, right: ui.x };
          if (ui.anchor === "center") style = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

          return (
            <div
              key={ui.id}
              style={{
                ...style,
                width: ui.width,
                height: ui.height,
                backgroundColor: ui.backgroundColor,
                color: ui.textColor || "#fff",
                fontSize: ui.fontSize || 13,
                borderRadius: ui.borderRadius || 8,
                opacity: ui.visible ? ui.opacity ?? 1 : 0.22,
              }}
              className="absolute flex items-center justify-center border border-white/[0.12] px-3 text-center font-semibold shadow-[0_14px_35px_rgba(0,0,0,0.22)] backdrop-blur-sm"
            >
              {ui.text || ui.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
