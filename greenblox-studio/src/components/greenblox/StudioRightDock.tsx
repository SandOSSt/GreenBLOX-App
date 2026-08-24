"use client";

import React, { useMemo, useRef, useState } from "react";
import type { DebugLog, Entity, MeshComponent, RigidBodyComponent, TransformComponent } from "@/engine/types/engine";
import {
  Anchor,
  Bot,
  Box,
  ChevronDown,
  ChevronRight,
  Cloud,
  FolderTree,
  Lightbulb,
  Lock,
  Package,
  Search,
  ShieldCheck,
  Sun,
  TerminalSquare,
  Users,
  Wrench,
} from "lucide-react";

interface StudioRightDockProps {
  entities: Entity[];
  selectedEntityId: string | null;
  selectedEntityIds: string[];
  onSelectEntity: (id: string | null, additive?: boolean) => void;
  onUpdateEntity: (entity: Entity) => void;
  logs: DebugLog[];
}

const serviceTree = [
  { name: "Workspace", icon: FolderTree, accent: "text-emerald-200" },
  { name: "Players", icon: Users, accent: "text-blue-200" },
  { name: "Lighting", icon: Sun, accent: "text-amber-200" },
  { name: "ReplicatedStorage", icon: Package, accent: "text-violet-200" },
  { name: "ServerStorage", icon: Package, accent: "text-fuchsia-200" },
  { name: "StarterGui", icon: Cloud, accent: "text-cyan-200" },
  { name: "StarterPlayer", icon: Bot, accent: "text-rose-200" },
];

export function StudioRightDock({ entities, selectedEntityId, selectedEntityIds, onSelectEntity, onUpdateEntity, logs }: StudioRightDockProps) {
  const [query, setQuery] = useState("");
  const [propertyQuery, setPropertyQuery] = useState("");

  const selectedEntity = useMemo(() => entities.find((entity) => entity.id === selectedEntityId) ?? null, [entities, selectedEntityId]);
  const filteredEntities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entities;
    return entities.filter((entity) => entity.name.toLowerCase().includes(normalized) || entity.className.toLowerCase().includes(normalized));
  }, [entities, query]);

  const transform = selectedEntity?.components.find((component) => component.type === "Transform") as TransformComponent | undefined;
  const mesh = selectedEntity?.components.find((component) => component.type === "Mesh") as MeshComponent | undefined;
  const body = selectedEntity?.components.find((component) => component.type === "RigidBody") as RigidBodyComponent | undefined;

  const showTransform = !propertyQuery.trim() || "transform position rotation scale".includes(propertyQuery.toLowerCase());
  const showMaterial = !propertyQuery.trim() || "material color roughness metalness geometry emissive texture normal map".includes(propertyQuery.toLowerCase());
  const showPhysics = !propertyQuery.trim() || "physics rigidbody mass friction bounce anchor buoyancy".includes(propertyQuery.toLowerCase());

  const updateTransform = (group: "position" | "rotation" | "scale", axis: "x" | "y" | "z", raw: string) => {
    if (!selectedEntity || !transform) return;
    const value = Number(raw);
    const nextTransform: TransformComponent = {
      ...transform,
      [group]: {
        ...transform[group],
        [axis]: Number.isFinite(value) ? value : 0,
      },
    };

    onUpdateEntity({
      ...selectedEntity,
      components: selectedEntity.components.map((component) => (component.type === "Transform" ? nextTransform : component)),
    });
  };

  const updateMesh = (patch: Partial<MeshComponent>) => {
    if (!selectedEntity || !mesh) return;
    const nextMesh = { ...mesh, ...patch };
    onUpdateEntity({
      ...selectedEntity,
      components: selectedEntity.components.map((component) => (component.type === "Mesh" ? nextMesh : component)),
    });
  };

  const updateBody = (patch: Partial<RigidBodyComponent>) => {
    if (!selectedEntity || !body) return;
    const nextBody = { ...body, ...patch };
    onUpdateEntity({
      ...selectedEntity,
      components: selectedEntity.components.map((component) => (component.type === "RigidBody" ? nextBody : component)),
    });
  };

  return (
    <aside
      className="hidden h-full w-[310px] shrink-0 flex-col text-white lg:flex xl:w-[340px] 2xl:w-[380px]"
      style={{
        background: "rgba(16, 19, 26, 0.94)",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <DockSection title="Explorer" icon={FolderTree} className="min-h-[320px] max-h-[38%]">
        <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#101218]/85 p-2 backdrop-blur">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/24" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="gb-input h-7 w-full pl-8 text-[11px]"
            />
          </div>
        </div>

        <div className="p-1.5">
          {serviceTree.map((service) => (
            <ExplorerService key={service.name} {...service} selected={service.name === "Workspace"} />
          ))}

          <div className="ml-3 border-l border-white/[0.065] pl-1.5">
            {filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={(event) => onSelectEntity(entity.id, event.shiftKey)}
                className={`group flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] transition ${
                  entity.id === selectedEntityId
                    ? "bg-[#3f6cff]/28 text-white shadow-[inset_0_0_0_1px_rgba(93,128,255,0.5)]"
                    : selectedEntityIds.includes(entity.id)
                      ? "bg-[#3f6cff]/16 text-white/90 shadow-[inset_0_0_0_1px_rgba(93,128,255,0.28)]"
                      : "text-white/58 hover:bg-white/[0.045] hover:text-white/86"
                }`}
              >
                <ChevronRight className="h-3 w-3 shrink-0 text-white/25" />
                <Box className="h-3.5 w-3.5 shrink-0 text-cyan-200/80" />
                <span className="min-w-0 flex-1 truncate">{entity.name}</span>
                {entity.isLocked && <Lock className="h-3 w-3 text-white/30" />}
              </button>
            ))}
            {filteredEntities.length === 0 && <div className="px-3 py-5 text-[11px] italic text-white/28">No instances match this search.</div>}
          </div>
        </div>
      </DockSection>

      <DockSection title="Properties" icon={Wrench} className="min-h-[300px] flex-1">
        <div className="sticky top-0 z-10 border-b border-white/[0.055] bg-[#111319] p-2">
          <input
            value={propertyQuery}
            onChange={(event) => setPropertyQuery(event.target.value)}
            placeholder="Filter properties"
            className="gb-input h-7 w-full px-3 text-[11px]"
          />
        </div>

        <div className="space-y-2 p-2">
          {selectedEntityIds.length > 1 && (
            <div className="rounded-xl border border-[#5d80ff]/25 bg-[#3f6cff]/10 p-3 text-[11px] leading-5 text-blue-100/80">
              <div className="mb-1 font-semibold text-white">{selectedEntityIds.length} objects selected</div>
              Use the shared 3D gizmo to move, rotate, or scale the whole group. Color, Lock, Anchor, Delete, and Duplicate apply to all selected objects.
            </div>
          )}
          {!selectedEntity ? (
            <div className="grid min-h-[150px] place-items-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.018] p-4 text-center text-[11px] leading-5 text-white/34">
              Select an object in Explorer or directly in the 3D viewport.
            </div>
          ) : (
            <>
              <PropertyGroup title="Instance" defaultOpen>
                <PropertyRow label="Name">
                  <input
                    value={selectedEntity.name}
                    onChange={(event) => onUpdateEntity({ ...selectedEntity, name: event.target.value })}
                    className="gb-input h-7 w-full px-2 text-[11px]"
                  />
                </PropertyRow>
                <PropertyRow label="Class">
                  <div className="rounded-md bg-white/[0.035] px-2 py-1.5 font-mono text-[10px] text-white/42">{selectedEntity.className}</div>
                </PropertyRow>
              </PropertyGroup>

              {transform && showTransform && (
                <PropertyGroup title="Transform" defaultOpen>
                  {(["position", "rotation", "scale"] as const).map((group) => (
                    <PropertyRow key={group} label={group[0].toUpperCase() + group.slice(1)}>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["x", "y", "z"] as const).map((axis) => (
                          <div key={`${group}-${axis}`} className="relative">
                            <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] font-bold uppercase text-white/22">
                              {axis}
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              value={transform[group][axis]}
                              onChange={(event) => updateTransform(group, axis, event.target.value)}
                              className="gb-input h-7 w-full rounded-md pl-5 pr-1 text-right font-mono text-[10px]"
                            />
                          </div>
                        ))}
                      </div>
                    </PropertyRow>
                  ))}
                </PropertyGroup>
              )}

              {mesh && showMaterial && (
                <PropertyGroup title="Material" defaultOpen>
                  <PropertyRow label="Shape">
                    <select
                      value={mesh.geometry}
                      onChange={(event) => updateMesh({ geometry: event.target.value as MeshComponent["geometry"] })}
                      className="gb-input h-7 w-full px-2 text-[11px] capitalize"
                    >
                      {(["cube", "sphere", "cylinder", "plane", "capsule", "cone", "wedge"] as const).map((shape) => (
                        <option key={shape} value={shape}>
                          {shape}
                        </option>
                      ))}
                    </select>
                  </PropertyRow>
                  <PropertyRow label="Color">
                    <input type="color" value={mesh.color} onChange={(event) => updateMesh({ color: event.target.value })} className="gb-input h-7" />
                  </PropertyRow>
                  <SliderRow label="Roughness" min="0" max="1" step="0.05" value={mesh.roughness} onChange={(value) => updateMesh({ roughness: value })} />
                  <SliderRow label="Metalness" min="0" max="1" step="0.05" value={mesh.metalness} onChange={(value) => updateMesh({ metalness: value })} />
                  <PropertyRow label="Texture">
                    <input
                      value={mesh.textureUrl ?? ""}
                      onChange={(event) => {
                        const value = event.target.value.trim();
                        updateMesh(value ? { textureUrl: value } : { textureUrl: undefined });
                      }}
                      placeholder="Paste image URL or data:…"
                      className="gb-input h-7 w-full px-2 text-[10px] font-mono"
                    />
                  </PropertyRow>
                  <PropertyRow label="Normal Map">
                    <input
                      value={mesh.normalMapUrl ?? ""}
                      onChange={(event) => {
                        const value = event.target.value.trim();
                        updateMesh(value ? { normalMapUrl: value } : { normalMapUrl: undefined });
                      }}
                      placeholder="Paste normal map URL or data:…"
                      className="gb-input h-7 w-full px-2 text-[10px] font-mono"
                    />
                  </PropertyRow>
                </PropertyGroup>
              )}

              {body && showPhysics && (
                <PropertyGroup title="RigidBody" defaultOpen>
                  <PropertyRow label="Mass">
                    <input
                      type="number"
                      step="1"
                      value={body.mass}
                      onChange={(event) => {
                        const mass = Number(event.target.value);
                        updateBody({ mass: Number.isFinite(mass) ? mass : 0, useGravity: mass > 0 });
                      }}
                      className="gb-input h-7 w-full px-2 text-[11px]"
                    />
                  </PropertyRow>
                  <SliderRow label="Friction" min="0" max="1" step="0.05" value={body.friction} onChange={(value) => updateBody({ friction: value })} />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <ActionPill icon={Anchor} onClick={() => updateBody({ mass: body.mass > 0 ? 0 : 1, useGravity: body.mass <= 0 })}>
                      {body.mass > 0 ? "Anchor" : "Unanchor"}
                    </ActionPill>
                    <ActionPill icon={Lock} onClick={() => onUpdateEntity({ ...selectedEntity, isLocked: !selectedEntity.isLocked })}>
                      {selectedEntity.isLocked ? "Unlock" : "Lock"}
                    </ActionPill>
                  </div>
                </PropertyGroup>
              )}
            </>
          )}
        </div>
      </DockSection>

      <DockSection title="Assistant" icon={Bot} className="h-[34%] min-h-[230px]">
        <div className="space-y-2 p-2">
          <div className="rounded-xl border border-emerald-300/12 bg-[#13251f] p-3 text-[11px] leading-5 text-emerald-100/82">
            <div className="mb-1 flex items-center gap-2 font-semibold text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Runtime state healthy
            </div>
            ECS has {entities.length} instances. Last renderer and script events are mirrored below.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Selection" value={selectedEntityIds.length > 0 ? `${selectedEntityIds.length} active` : "None"} />
            <StatTile label="Log lines" value={logs.length.toString()} />
          </div>

          <div className="rounded-xl bg-white/[0.025] p-2.5">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/34">
              <TerminalSquare className="h-3.5 w-3.5" />
              Runtime output
            </div>
            <div className="max-h-[120px] space-y-1.5 overflow-auto">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="rounded-md bg-black/20 px-2 py-1.5 font-mono text-[9px] leading-4 text-white/48">
                  <div className="flex justify-between gap-2 text-white/25">
                    <span>{log.source}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="line-clamp-2">{log.message}</div>
                </div>
              ))}
              {logs.length === 0 && <div className="text-[10px] italic text-white/26">No output yet.</div>}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.055] bg-white/[0.025] p-3 text-[10px] leading-[17px] text-white/41">
            <div className="mb-1 flex items-center gap-2 font-bold uppercase tracking-[0.1em] text-white/42">
              <Lightbulb className="h-3.5 w-3.5 text-amber-200" />
              Workflow
            </div>
            Use <kbd>W</kbd>/<kbd>E</kbd>/<kbd>R</kbd> for gizmo states. Anchor locks physics through RigidBody mass. Save writes the serialized ECS back to PostgreSQL.
          </div>
        </div>
      </DockSection>
    </aside>
  );
}

function DockSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col border-b border-white/[0.075] bg-[#111319] ${className ?? ""}`}>
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/[0.055] bg-[#141720] px-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-white/78">
          <Icon className="h-3.5 w-3.5 text-white/42" />
          {title}
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-white/24" />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}

function ExplorerService({ name, icon: Icon, accent, selected }: { name: string; icon: React.ComponentType<{ className?: string }>; accent: string; selected?: boolean }) {
  return (
    <div className={`flex h-7 items-center gap-2 rounded-md px-2 text-[12px] transition ${selected ? "bg-white/[0.045] text-white/88" : "text-white/54 hover:bg-white/[0.035] hover:text-white/80"}`}>
      <ChevronDown className="h-3.5 w-3.5 text-white/24" />
      <Icon className={`h-3.5 w-3.5 ${accent}`} />
      <span className="min-w-0 truncate">{name}</span>
    </div>
  );
}

function PropertyGroup({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <details open={open} className="overflow-hidden rounded-xl bg-white/[0.025] ring-1 ring-white/[0.055]">
      <summary
        onClick={(event) => {
          event.preventDefault();
          setOpen(!open);
        }}
        className="flex h-8 cursor-pointer list-none items-center justify-between bg-white/[0.02] px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-white/36"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </summary>
      <div className="space-y-2.5 p-3">{children}</div>
    </details>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2">
      <div className="truncate text-[10px] font-medium text-white/42">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SliderRow({ label, min, max, step, value, onChange }: { label: string; min: string; max: string; step: string; value: number; onChange: (value: number) => void }) {
  return (
    <PropertyRow label={label}>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-7 w-full"
        />
        <span className="absolute right-0 top-[-17px] font-mono text-[9px] text-white/35">{value.toFixed(2)}</span>
      </div>
    </PropertyRow>
  );
}

function ActionPill({ icon: Icon, onClick, children }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="gb-action-btn gb-secondary h-7 gap-1.5 px-2 text-[10px]">
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-2.5 ring-1 ring-white/[0.055]">
      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/30">{label}</div>
      <div className="mt-1 truncate text-[12px] font-semibold text-white/82">{value}</div>
    </div>
  );
}
