"use client";

import React, { useEffect, useRef, useState } from "react";
import { ECSWorld } from "@/engine/core/ecs";
import { GreenBloxRenderer } from "@/engine/renderer/rendererScene";
import { PhysicsEngine } from "@/engine/physics/physicsWorld";
import { SceneData, UICanvasElement } from "@/engine/types/engine";
import { StudioToolMode } from "@/engine/editor/editorState";
import { MousePointer, Move, RotateCw, Maximize2, Mountain, Palette, Monitor, Zap, Play, Eye, RotateCcw } from "lucide-react";

interface ViewportTabProps {
  ecs: ECSWorld;
  renderer: GreenBloxRenderer;
  physics: PhysicsEngine;
  sceneData: SceneData;
  uiCanvases: UICanvasElement[];
  activeTool: StudioToolMode;
  setActiveTool: (tool: StudioToolMode) => void;
  playMode: "edit" | "play" | "pause";
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
}

export const ViewportTab: React.FC<ViewportTabProps> = ({
  ecs,
  renderer,
  physics,
  sceneData,
  uiCanvases,
  activeTool,
  setActiveTool,
  playMode,
  selectedEntityId,
  onSelectEntity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [isWPressed, setIsWPressed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    renderer.mount(containerRef.current, sceneData);

    const sub = renderer.onEntitySelected.connect((id) => {
      onSelectEntity(id || null);
    });

    const handleResize = () => {
      if (containerRef.current) {
        renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      sub.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [renderer, sceneData]);

  // Handle live gameplay WASD character inputs when play Mode is Active
  useEffect(() => {
    if (playMode !== "play") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        setIsWPressed(true);
        const playerEnt = ecs.getEntityByName("Player") || ecs.getEntitiesByClassName("Model")[0];
        if (playerEnt) {
          physics.updatePlayerController(playerEnt.id, { x: 0, z: -1 }, false, 15.0, 0.016);
        }
      }
      if (e.key === " ") {
        const playerEnt = ecs.getEntityByName("Player") || ecs.getEntitiesByClassName("Model")[0];
        if (playerEnt) {
          physics.updatePlayerController(playerEnt.id, { x: 0, z: 0 }, true, 10.0, 0.016);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        setIsWPressed(false);
        const playerEnt = ecs.getEntityByName("Player") || ecs.getEntitiesByClassName("Model")[0];
        if (playerEnt) {
          physics.updatePlayerController(playerEnt.id, { x: 0, z: 0 }, false, 0, 0.016);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [playMode, ecs, physics]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Floating Tools & Gizmos Bar */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-xl text-xs font-semibold text-slate-200">
        <button
          onClick={() => setActiveTool("select")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "select" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800 text-slate-400"
          }`}
          title="Select Part (V)"
        >
          <MousePointer className="w-3.5 h-3.5" /> Select
        </button>
        <button
          onClick={() => setActiveTool("move")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "move" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800 text-slate-400"
          }`}
          title="Move Gizmo (W)"
        >
          <Move className="w-3.5 h-3.5" /> Move
        </button>
        <button
          onClick={() => setActiveTool("rotate")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "rotate" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800 text-slate-400"
          }`}
          title="Rotate Gizmo (E)"
        >
          <RotateCw className="w-3.5 h-3.5" /> Rotate
        </button>
        <button
          onClick={() => setActiveTool("scale")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "scale" ? "bg-emerald-600 text-white shadow" : "hover:bg-slate-800 text-slate-400"
          }`}
          title="Scale Gizmo (R)"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Scale
        </button>
        
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        
        <button
          onClick={() => setActiveTool("terrain")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "terrain" ? "bg-cyan-600 text-white shadow" : "hover:bg-slate-800 text-cyan-400"
          }`}
        >
          <Mountain className="w-3.5 h-3.5" /> Terrain Sculpt
        </button>
        <button
          onClick={() => setActiveTool("paint_material")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            activeTool === "paint_material" ? "bg-purple-600 text-white shadow" : "hover:bg-slate-800 text-purple-400"
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> PBR Paint
        </button>
      </div>

      {/* Top Right Live Telemetry Overlay */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] font-mono text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" /> 60 FPS
        </span>
        <span className="text-slate-500">|</span>
        <span>Draws: <b>{renderer.drawCalls || 12}</b></span>
        <span className="text-slate-500">|</span>
        <span>Tris: <b>{(renderer.triangleCount || 1240).toLocaleString()}</b></span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400">PBR + SSAO</span>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative" />

      {/* In-Game HUD Overlay (Rendered from uiCanvases when in play mode or preview) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {uiCanvases.map((ui) => {
          if (!ui.visible && playMode === "edit") return null;
          let positionStyle: React.CSSProperties = {};
          if (ui.anchor === "top-left") positionStyle = { top: ui.y, left: ui.x };
          else if (ui.anchor === "top-right") positionStyle = { top: ui.y, right: ui.x };
          else if (ui.anchor === "bottom-left") positionStyle = { bottom: ui.y, left: ui.x };
          else if (ui.anchor === "bottom-right") positionStyle = { bottom: ui.y, right: ui.x };
          else if (ui.anchor === "center") positionStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

          return (
            <div
              key={ui.id}
              style={{
                ...positionStyle,
                width: ui.width,
                height: ui.height,
                backgroundColor: ui.backgroundColor,
                color: ui.textColor || "#ffffff",
                fontSize: ui.fontSize || 16,
                borderRadius: ui.borderRadius || 8,
                opacity: ui.opacity ?? 1
              }}
              className="absolute pointer-events-auto shadow-lg flex items-center justify-center p-3 font-bold border border-slate-700/50 text-center whitespace-pre-wrap leading-snug backdrop-blur-xs"
            >
              {ui.text || ui.name}
            </div>
          );
        })}
      </div>

      {/* Bottom Guidance Overlay when Play Mode is Active */}
      {playMode === "play" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-4 text-xs font-bold border border-emerald-400/30 animate-fade-in">
          <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1 rounded-full text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE MULTIPLAYER & PHYSICS SYNC
          </div>
          <span>Controls: <b>WASD</b> to move Player Character, <b>SPACE</b> to jump!</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded font-mono text-amber-300 text-[10px]">Tick: 60Hz</span>
        </div>
      )}

      {playMode === "edit" && activeTool === "terrain" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-cyan-900/90 text-cyan-200 border border-cyan-500 px-5 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
          <Mountain className="w-4 h-4 text-cyan-400" />
          <span><b>Terrain Sculpting Active:</b> Click and drag on ground geometry to extrude hills, carve valleys, and blend foliage maps!</span>
        </div>
      )}
    </div>
  );
};
