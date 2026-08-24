"use client";

import React, { useState } from "react";
import { Entity, TransformComponent, MeshComponent, RigidBodyComponent, SceneData } from "@/engine/types/engine";
import { Sliders, Eye, Box, Activity, Sun, Droplet, Layers, HelpCircle } from "lucide-react";

interface InspectorPanelProps {
  selectedEntity: Entity | null;
  sceneEnvironment: SceneData["environment"];
  onUpdateEntity: (ent: Entity) => void;
  onUpdateEnvironment: (env: SceneData["environment"]) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedEntity,
  sceneEnvironment,
  onUpdateEntity,
  onUpdateEnvironment,
}) => {
  const [activeTab, setActiveTab] = useState<"entity" | "environment">("entity");

  if (!selectedEntity && activeTab === "entity") {
    return (
      <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col text-xs text-slate-300 select-none shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold tracking-wide uppercase text-slate-300">
          <span>Property Inspector</span>
          <Sliders className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="grid grid-cols-2 p-1 bg-slate-950/50 border-b border-slate-800 font-semibold text-center">
          <button onClick={() => setActiveTab("entity")} className="py-1 rounded bg-slate-800 text-emerald-400">Entity Props</button>
          <button onClick={() => setActiveTab("environment")} className="py-1 rounded text-slate-400">Sky & Water</button>
        </div>
        <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 gap-2 my-auto">
          <HelpCircle className="w-10 h-10 text-slate-600 stroke-1" />
          <p>No Entity Selected</p>
          <p className="text-[11px] text-slate-400">Click a part in the 3D Viewport or Scene Explorer to edit Transform, PBR material shaders, and Physics mass.</p>
        </div>
      </aside>
    );
  }

  const transform = selectedEntity?.components.find(c => c.type === "Transform") as TransformComponent | undefined;
  const mesh = selectedEntity?.components.find(c => c.type === "Mesh") as MeshComponent | undefined;
  const body = selectedEntity?.components.find(c => c.type === "RigidBody") as RigidBodyComponent | undefined;

  const handleTransformChange = (field: "position" | "rotation" | "scale", axis: "x" | "y" | "z", val: string) => {
    if (!selectedEntity || !transform) return;
    const num = parseFloat(val);
    const newTrans: TransformComponent = {
      ...transform,
      [field]: { ...transform[field], [axis]: isNaN(num) ? 0 : num }
    };
    const newComps = selectedEntity.components.map(c => c.type === "Transform" ? newTrans : c);
    onUpdateEntity({ ...selectedEntity, components: newComps });
  };

  const handleMeshChange = (key: keyof MeshComponent, val: any) => {
    if (!selectedEntity || !mesh) return;
    const newMesh: MeshComponent = { ...mesh, [key]: val };
    const newComps = selectedEntity.components.map(c => c.type === "Mesh" ? newMesh : c);
    onUpdateEntity({ ...selectedEntity, components: newComps });
  };

  const handleBodyChange = (key: keyof RigidBodyComponent, val: any) => {
    if (!selectedEntity || !body) return;
    const newBody: RigidBodyComponent = { ...body, [key]: val };
    if (key === "mass") {
      newBody.useGravity = parseFloat(val) > 0;
    }
    const newComps = selectedEntity.components.map(c => c.type === "RigidBody" ? newBody : c);
    onUpdateEntity({ ...selectedEntity, components: newComps });
  };

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col text-xs text-slate-200 select-none overflow-y-auto shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold tracking-wide uppercase text-slate-300">
        <span>Property Inspector</span>
        <Sliders className="w-4 h-4 text-emerald-400" />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-950/50 border-b border-slate-800 font-semibold text-center">
        <button onClick={() => setActiveTab("entity")} className={`py-1 rounded ${activeTab === "entity" ? "bg-slate-800 text-emerald-400 shadow" : "text-slate-400"}`}>Entity Props</button>
        <button onClick={() => setActiveTab("environment")} className={`py-1 rounded ${activeTab === "environment" ? "bg-slate-800 text-emerald-400 shadow" : "text-slate-400"}`}>Sky & Water</button>
      </div>

      {activeTab === "entity" && selectedEntity ? (
        <div className="p-3 flex flex-col gap-4 divide-y divide-slate-800">
          {/* General Entity Info */}
          <div>
            <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <Box className="w-4 h-4" /> {selectedEntity.name}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Instance Name</label>
                <input
                  type="text"
                  value={selectedEntity.name}
                  onChange={(e) => onUpdateEntity({ ...selectedEntity, name: e.target.value })}
                  className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Class Name</label>
                <input
                  type="text"
                  disabled
                  value={selectedEntity.className}
                  className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Transform Component */}
          {transform && (
            <div className="pt-3">
              <div className="font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Transform (X, Y, Z)</span>
                <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400">World Space</span>
              </div>

              {(["position", "rotation", "scale"] as const).map((field) => (
                <div key={field} className="mb-2.5">
                  <label className="text-slate-400 capitalize font-medium text-[11px] block mb-1">{field}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["x", "y", "z"] as const).map((axis) => (
                      <div key={axis} className="flex items-center bg-slate-950 rounded border border-slate-800 overflow-hidden">
                        <span className="bg-slate-800 px-1.5 py-1 text-[10px] font-mono uppercase text-slate-400">{axis}</span>
                        <input
                          type="number"
                          step="0.5"
                          value={transform[field][axis]}
                          onChange={(e) => handleTransformChange(field, axis, e.target.value)}
                          className="w-full bg-transparent px-1.5 py-1 text-slate-200 font-mono focus:outline-none focus:bg-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mesh / PBR Material Component */}
          {mesh && (
            <div className="pt-3">
              <div className="font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>PBR Material Shader</span>
                <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-cyan-400">WebGL 2</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">BrickColor</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded border border-slate-800">
                    <input
                      type="color"
                      value={mesh.color}
                      onChange={(e) => handleMeshChange("color", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-slate-300 uppercase">{mesh.color}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Geometry</label>
                  <select
                    value={mesh.geometry}
                    onChange={(e) => handleMeshChange("geometry", e.target.value)}
                    className="w-full bg-slate-950 py-1.5 px-2 rounded border border-slate-800 font-medium capitalize"
                  >
                    <option value="cube">Cube</option>
                    <option value="sphere">Sphere</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="plane">Plane</option>
                    <option value="capsule">Capsule</option>
                  </select>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Roughness (Matte)</span>
                  <span className="font-mono text-emerald-400">{mesh.roughness ?? 0.5}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mesh.roughness ?? 0.5}
                  onChange={(e) => handleMeshChange("roughness", parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Metalness (Reflective)</span>
                  <span className="font-mono text-cyan-400">{mesh.metalness ?? 0.2}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={mesh.metalness ?? 0.2}
                  onChange={(e) => handleMeshChange("metalness", parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* RigidBody Physics Component */}
          {body && (
            <div className="pt-3">
              <div className="font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Rigid Body & Dynamics</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                  {body.mass > 0 ? "Dynamic (Unanchored)" : "Anchored (Static)"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-slate-400 block mb-1" title="Mass = 0 anchors the part in mid-air">Mass (0 = Anchored)</label>
                  <input
                    type="number"
                    step="5"
                    value={body.mass}
                    onChange={(e) => handleBodyChange("mass", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-emerald-300"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Buoyancy Factor</label>
                  <input
                    type="number"
                    step="0.1"
                    value={body.buoyancyFactor ?? 1.0}
                    onChange={(e) => handleBodyChange("buoyancyFactor", parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Friction</label>
                  <input
                    type="number"
                    step="0.1"
                    value={body.friction}
                    onChange={(e) => handleBodyChange("friction", parseFloat(e.target.value) || 0.6)}
                    className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bounciness (Elastic)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={body.bounciness}
                    onChange={(e) => handleBodyChange("bounciness", parseFloat(e.target.value) || 0.2)}
                    className="w-full bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              onClick={() => onUpdateEntity({ ...selectedEntity })}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow transition"
            >
              Apply Changes
            </button>
          </div>
        </div>
      ) : (
        /* Sky & Water Environment Tab */
        <div className="p-3 flex flex-col gap-4 divide-y divide-slate-800">
          <div>
            <div className="text-cyan-400 font-bold mb-2 flex items-center gap-1.5">
              <Sun className="w-4 h-4" /> Atmospheric Skybox
            </div>
            <label className="text-slate-400 block mb-1">Skybox Atmosphere Preset</label>
            <select
              value={sceneEnvironment.skybox}
              onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, skybox: e.target.value as any })}
              className="w-full bg-slate-950 p-2 rounded border border-slate-800 font-semibold text-emerald-300"
            >
              <option value="SciFi">Sci-Fi Neon Night</option>
              <option value="Morning">Golden Morning</option>
              <option value="Sunset">Vaporwave Sunset</option>
              <option value="Cloudy">Tactical Cloudy Day</option>
              <option value="Midnight">Deep Midnight</option>
            </select>
          </div>

          <div className="pt-3">
            <div className="text-sky-400 font-bold mb-2 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" /> Procedural Ocean Water
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Set Water Level plane Y. Unanchored parts dipping beneath this Y altitude will simulate buoyant Archimedes waves!
            </p>
            <div>
              <label className="text-slate-400 block mb-1">Water Level Y (-100 to disable)</label>
              <input
                type="number"
                step="0.5"
                value={sceneEnvironment.waterLevel}
                onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, waterLevel: parseFloat(e.target.value) || -100 })}
                className="w-full bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 font-mono text-sky-300 font-bold"
              />
            </div>
            <div className="mt-2.5">
              <label className="text-slate-400 block mb-1">Water Tint Color</label>
              <input
                type="color"
                value={sceneEnvironment.waterColor || "#0284c7"}
                onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, waterColor: e.target.value })}
                className="w-full h-8 bg-slate-950 rounded border border-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3">
            <div className="font-bold text-slate-300 mb-2">Post-Processing Pipeline</div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sceneEnvironment.enableBloom}
                  onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, enableBloom: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Enable Neon Bloom FX</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sceneEnvironment.enableSSAO}
                  onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, enableSSAO: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Screen Space Ambient Occlusion</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sceneEnvironment.enableHDR}
                  onChange={(e) => onUpdateEnvironment({ ...sceneEnvironment, enableHDR: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>ACES Filmic Tone Mapping (HDR)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
