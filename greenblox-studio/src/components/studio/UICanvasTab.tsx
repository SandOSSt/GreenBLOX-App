"use client";

import React, { useState } from "react";
import { UICanvasElement } from "@/engine/types/engine";
import { Layout, Plus, Trash2, Sliders, Eye, EyeOff, Monitor, AlignLeft } from "lucide-react";

interface UICanvasTabProps {
  uiCanvases: UICanvasElement[];
  onUpdateUI: (canvases: UICanvasElement[]) => void;
}

export const UICanvasTab: React.FC<UICanvasTabProps> = ({ uiCanvases, onUpdateUI }) => {
  const [selectedId, setSelectedId] = useState<string | null>(uiCanvases[0]?.id || null);

  const selectedUI = uiCanvases.find(u => u.id === selectedId) || uiCanvases[0];

  const handleAddUI = () => {
    const newUI: UICanvasElement = {
      id: `ui_${Date.now()}`,
      name: `HUD_Element_${uiCanvases.length + 1}`,
      elementType: "Frame",
      x: 20,
      y: 100,
      width: 220,
      height: 60,
      anchor: "top-left",
      backgroundColor: "rgba(15, 23, 42, 0.85)",
      text: "New HUD Canvas Text",
      textColor: "#38bdf8",
      fontSize: 16,
      borderRadius: 10,
      opacity: 1,
      visible: true,
    };
    onUpdateUI([...uiCanvases, newUI]);
    setSelectedId(newUI.id);
  };

  const handleRemoveUI = (id: string) => {
    onUpdateUI(uiCanvases.filter(u => u.id !== id));
    if (selectedId === id) setSelectedId(uiCanvases[0]?.id || null);
  };

  const handleChange = (key: keyof UICanvasElement, val: any) => {
    if (!selectedUI) return;
    const updated = uiCanvases.map(u => u.id === selectedUI.id ? { ...u, [key]: val } : u);
    onUpdateUI(updated);
  };

  return (
    <div className="w-full h-full flex bg-slate-950 text-slate-200 select-none overflow-hidden text-xs">
      {/* UI List sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold uppercase tracking-wide text-slate-300">
          <span className="flex items-center gap-1.5"><Layout className="w-4 h-4 text-cyan-400" /> UI Canvases</span>
          <button
            onClick={handleAddUI}
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 flex items-center gap-0.5 border border-slate-800 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" /> Element
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {uiCanvases.map((u) => {
            const isSelected = u.id === selectedUI?.id;
            return (
              <div
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition ${
                  isSelected ? "bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500 font-bold" : "hover:bg-slate-800/50 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {u.visible ? <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  <span className="truncate">{u.name}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveUI(u.id); }}
                  className="p-1 hover:bg-red-900/60 rounded text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Screen Canvas Preview */}
      <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center overflow-auto">
        <div className="w-full max-w-4xl h-[520px] bg-slate-950 border-2 border-dashed border-slate-700 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col justify-between p-4">
          <div className="absolute top-2 right-3 text-slate-500 font-mono text-[11px] flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5" /> Live HUD Screen Overlay (1920x1080 Aspect)
          </div>

          {uiCanvases.map((ui) => {
            let positionStyle: React.CSSProperties = {};
            if (ui.anchor === "top-left") positionStyle = { top: ui.y, left: ui.x };
            else if (ui.anchor === "top-right") positionStyle = { top: ui.y, right: ui.x };
            else if (ui.anchor === "bottom-left") positionStyle = { bottom: ui.y, left: ui.x };
            else if (ui.anchor === "bottom-right") positionStyle = { bottom: ui.y, right: ui.x };
            else if (ui.anchor === "center") positionStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

            const isSelected = ui.id === selectedUI?.id;

            return (
              <div
                key={ui.id}
                onClick={() => setSelectedId(ui.id)}
                style={{
                  ...positionStyle,
                  width: ui.width,
                  height: ui.height,
                  backgroundColor: ui.backgroundColor,
                  color: ui.textColor || "#ffffff",
                  fontSize: ui.fontSize || 16,
                  borderRadius: ui.borderRadius || 8,
                  opacity: ui.visible ? (ui.opacity ?? 1) : 0.25
                }}
                className={`absolute cursor-pointer flex items-center justify-center p-3 font-bold text-center whitespace-pre-wrap leading-snug transition shadow-lg backdrop-blur-sm ${
                  isSelected ? "ring-2 ring-emerald-400 border border-white/40" : "border border-slate-700"
                }`}
              >
                {ui.text || ui.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* UI Property Editor Right Column */}
      {selectedUI && (
        <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col p-3 overflow-y-auto shrink-0 gap-4">
          <div className="font-bold uppercase tracking-wide text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Element Inspector</span>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Element Name</label>
            <input
              type="text"
              value={selectedUI.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Anchor Point</label>
              <select
                value={selectedUI.anchor}
                onChange={(e) => handleChange("anchor", e.target.value)}
                className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-semibold text-emerald-400"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="center">Center Screen</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Visible in Play</label>
              <button
                onClick={() => handleChange("visible", !selectedUI.visible)}
                className={`w-full py-1 rounded font-bold transition ${selectedUI.visible ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                {selectedUI.visible ? "Visible" : "Hidden"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Width (px)</label>
              <input type="number" value={selectedUI.width} onChange={(e) => handleChange("width", parseInt(e.target.value) || 100)} className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Height (px)</label>
              <input type="number" value={selectedUI.height} onChange={(e) => handleChange("height", parseInt(e.target.value) || 40)} className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono" />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Text Content</label>
            <textarea
              rows={2}
              value={selectedUI.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full bg-slate-950 p-2 rounded border border-slate-800 font-semibold text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Text Tint</label>
              <input type="color" value={selectedUI.textColor || "#ffffff"} onChange={(e) => handleChange("textColor", e.target.value)} className="w-full h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Font Size</label>
              <input type="number" value={selectedUI.fontSize || 16} onChange={(e) => handleChange("fontSize", parseInt(e.target.value) || 16)} className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono" />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
