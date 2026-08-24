"use client";

import React, { useState } from "react";
import { Box, Check, ChevronDown, Globe2, Moon, Plus, Settings2, Sun, X, Zap } from "lucide-react";

export interface NewExperienceConfig {
  title: string;
  description: string;
  genre: string;
  worldWidth: number;
  worldDepth: number;
  worldHeight: number;
  timeOfDay: number;
  skybox: "Morning" | "Sunset" | "SciFi" | "Cloudy" | "Midnight";
  waterEnabled: boolean;
  waterLevel: number;
  gravity: number;
  renderQuality: "performance" | "balanced" | "quality";
  multiplayer: boolean;
  maxPlayers: number;
}

interface NewExperienceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: NewExperienceConfig) => void;
}

type DialogTab = "general" | "world" | "runtime";

const initialConfig: NewExperienceConfig = {
  title: "Untitled Experience",
  description: "A new GreenBlox engine project.",
  genre: "Sandbox",
  worldWidth: 100,
  worldDepth: 100,
  worldHeight: 100,
  timeOfDay: 12,
  skybox: "Morning",
  waterEnabled: false,
  waterLevel: 0,
  gravity: 19.62,
  renderQuality: "balanced",
  multiplayer: true,
  maxPlayers: 16,
};

export function NewExperienceDialog({ open, onClose, onCreate }: NewExperienceDialogProps) {
  const [tab, setTab] = useState<DialogTab>("general");
  const [config, setConfig] = useState<NewExperienceConfig>(initialConfig);

  if (!open) return null;

  const setValue = <K extends keyof NewExperienceConfig>(key: K, value: NewExperienceConfig[K]) => {
    setConfig((previous) => ({ ...previous, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onCreate({
      ...config,
      title: config.title.trim() || "Untitled Experience",
      worldWidth: Math.max(16, config.worldWidth),
      worldDepth: Math.max(16, config.worldDepth),
      worldHeight: Math.max(16, config.worldHeight),
      maxPlayers: Math.max(1, config.maxPlayers),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Create new experience">
      <div className="flex max-h-[min(780px,calc(100vh-32px))] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#14171e] shadow-[0_30px_100px_rgba(0,0,0,0.58)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.075] bg-[#181b23] px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/80">
              <Plus className="h-3.5 w-3.5" />
              New project
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white">Create an Experience</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.07] hover:text-white" aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 gap-1 border-b border-white/[0.075] bg-[#101218] p-2 md:w-[190px] md:flex-col md:border-b-0 md:border-r">
            <DialogNav active={tab === "general"} icon={Settings2} label="General" onClick={() => setTab("general")} />
            <DialogNav active={tab === "world"} icon={Globe2} label="World" onClick={() => setTab("world")} />
            <DialogNav active={tab === "runtime"} icon={Zap} label="Runtime" onClick={() => setTab("runtime")} />
          </nav>

          <form id="new-experience-form" onSubmit={submit} className="min-h-0 flex-1 overflow-auto p-5 md:p-7">
            {tab === "general" && (
              <div className="space-y-5">
                <Intro title="Project identity" description="These values identify the experience in your project registry and editor tabs." />
                <Field label="Experience name" hint="Required">
                  <input className="gb-input h-10 w-full px-3 text-sm" value={config.title} onChange={(event) => setValue("title", event.target.value)} autoFocus />
                </Field>
                <Field label="Description" hint="Shown on the home screen">
                  <textarea className="gb-input min-h-[92px] w-full resize-y p-3 text-sm leading-5" value={config.description} onChange={(event) => setValue("description", event.target.value)} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Genre">
                    <select className="gb-input h-10 w-full px-3 text-sm" value={config.genre} onChange={(event) => setValue("genre", event.target.value)}>
                      <option>Sandbox</option>
                      <option>Adventure</option>
                      <option>Action</option>
                      <option>RPG</option>
                      <option>Racing</option>
                      <option>Platformer</option>
                      <option>Simulation</option>
                    </select>
                  </Field>
                  <Field label="Starter preset">
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/68">
                      <Box className="h-4 w-4 text-emerald-200" />
                      Runtime Baseplate
                      <ChevronDown className="ml-auto h-4 w-4 text-white/30" />
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {tab === "world" && (
              <div className="space-y-5">
                <Intro title="World composition" description="Set the initial playable canvas. All values are written to SceneData and can be changed later in Settings." />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <NumberField label="Canvas width" suffix="studs" value={config.worldWidth} onChange={(value) => setValue("worldWidth", value)} />
                  <NumberField label="Canvas depth" suffix="studs" value={config.worldDepth} onChange={(value) => setValue("worldDepth", value)} />
                  <NumberField label="World height" suffix="studs" value={config.worldHeight} onChange={(value) => setValue("worldHeight", value)} />
                </div>

                <div className="rounded-xl border border-white/[0.075] bg-white/[0.025] p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Sun className="h-4 w-4 text-amber-200" /> Lighting and time</div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_160px] md:items-end">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-white/52"><span>Time of day</span><span className="font-mono text-amber-200">{formatTime(config.timeOfDay)}</span></div>
                      <input type="range" min="0" max="24" step="0.25" value={config.timeOfDay} onChange={(event) => setValue("timeOfDay", Number(event.target.value))} className="w-full" />
                      <div className="mt-2 flex justify-between text-[10px] text-white/28"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
                    </div>
                    <Field label="Sky preset">
                      <select className="gb-input h-9 w-full px-2 text-xs" value={config.skybox} onChange={(event) => setValue("skybox", event.target.value as NewExperienceConfig["skybox"])}>
                        <option value="Morning">Morning</option>
                        <option value="Sunset">Sunset</option>
                        <option value="SciFi">SciFi</option>
                        <option value="Cloudy">Cloudy</option>
                        <option value="Midnight">Midnight</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.075] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400/10 text-cyan-200"><Moon className="h-4 w-4" /></div><div><div className="text-sm font-semibold text-white">Water surface</div><div className="text-xs text-white/40">Create a physical water plane in the initial scene.</div></div></div>
                  <input type="checkbox" checked={config.waterEnabled} onChange={(event) => setValue("waterEnabled", event.target.checked)} className="h-4 w-4 accent-[#3f6cff]" />
                </label>
                {config.waterEnabled && <NumberField label="Water level" suffix="Y" value={config.waterLevel} onChange={(value) => setValue("waterLevel", value)} />}
              </div>
            )}

            {tab === "runtime" && (
              <div className="space-y-5">
                <Intro title="Runtime defaults" description="Choose the baseline physics, rendering and multiplayer settings for the first play session." />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <NumberField label="Gravity strength" suffix="m/s²" value={config.gravity} onChange={(value) => setValue("gravity", value)} />
                  <Field label="Render quality">
                    <select className="gb-input h-10 w-full px-3 text-sm" value={config.renderQuality} onChange={(event) => setValue("renderQuality", event.target.value as NewExperienceConfig["renderQuality"])}>
                      <option value="performance">Performance</option>
                      <option value="balanced">Balanced</option>
                      <option value="quality">Quality</option>
                    </select>
                  </Field>
                </div>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.075] bg-white/[0.025] p-4">
                  <div><div className="text-sm font-semibold text-white">Multiplayer session</div><div className="text-xs text-white/40">Enable the default dedicated-server project profile.</div></div>
                  <input type="checkbox" checked={config.multiplayer} onChange={(event) => setValue("multiplayer", event.target.checked)} className="h-4 w-4 accent-[#3f6cff]" />
                </label>
                {config.multiplayer && <NumberField label="Maximum players" suffix="players" value={config.maxPlayers} onChange={(value) => setValue("maxPlayers", value)} />}
                <div className="rounded-xl border border-amber-200/10 bg-amber-200/[0.04] p-4 text-xs leading-5 text-amber-100/65">
                  These are project defaults, not a locked configuration. Every value remains editable from the Settings workspace after creation.
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.075] bg-[#101218] px-5 py-3">
          <div className="hidden text-[11px] text-white/35 sm:block">A baseplate and runtime scene will be generated.</div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={onClose} className="gb-action-btn gb-secondary px-4">Cancel</button>
            <button type="submit" form="new-experience-form" className="gb-action-btn gb-primary px-5"><Check className="h-4 w-4" /> Create Experience</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogNav({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex h-10 items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold transition md:w-full ${active ? "bg-[#3f6cff]/18 text-white shadow-[inset_0_0_0_1px_rgba(98,134,255,0.35)]" : "text-white/42 hover:bg-white/[0.04] hover:text-white/78"}`}><Icon className="h-4 w-4" />{label}</button>;
}

function Intro({ title, description }: { title: string; description: string }) {
  return <div className="border-b border-white/[0.07] pb-4"><h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h3><p className="mt-1.5 max-w-2xl text-xs leading-5 text-white/43">{description}</p></div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/62"><span>{label}</span>{hint && <span className="text-[10px] font-normal text-white/27">{hint}</span>}</div>{children}</label>;
}

function NumberField({ label, suffix, value, onChange }: { label: string; suffix: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label}><div className="relative"><input type="number" min="0" step="1" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="gb-input h-10 w-full px-3 pr-14 font-mono text-sm" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30">{suffix}</span></div></Field>;
}

function formatTime(value: number) {
  const hours = Math.floor(value) % 24;
  const minutes = Math.round((value - Math.floor(value)) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
