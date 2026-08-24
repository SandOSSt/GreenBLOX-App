"use client";

import React, { useState } from "react";
import type { ProjectData } from "@/engine/types/engine";
import { Gauge, Globe2, MonitorCog, Rocket, Save, Settings2, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";

interface SettingsWorkspaceProps {
  project: ProjectData;
  onUpdateProject: (project: ProjectData) => void;
  onSave: () => void;
}

type SettingsSection = "general" | "publish" | "rendering" | "physics" | "multiplayer";

export function SettingsWorkspace({ project, onUpdateProject, onSave }: SettingsWorkspaceProps) {
  const [section, setSection] = useState<SettingsSection>("general");
  const environment = project.sceneData.environment;
  const physics = project.sceneData.physics;

  const updateEnvironment = (patch: Partial<ProjectData["sceneData"]["environment"]>) => {
    onUpdateProject({
      ...project,
      sceneData: {
        ...project.sceneData,
        environment: { ...environment, ...patch },
      },
    });
  };

  const updatePhysics = (patch: Partial<ProjectData["sceneData"]["physics"]>) => {
    onUpdateProject({
      ...project,
      sceneData: {
        ...project.sceneData,
        physics: { ...physics, ...patch },
      },
    });
  };

  return (
    <div className="h-full overflow-auto bg-[#0d0f14] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[1100px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-white/[0.075] pb-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/75"><Settings2 className="h-3.5 w-3.5" /> Project settings</div>
          <h1 className="text-[clamp(24px,3vw,36px)] font-semibold tracking-[-0.04em]">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-[12px] leading-5 text-white/42">Управление параметрами мира и runtime. Изменения применяются к текущей сцене сразу, а Save пишет их в проект.</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-[190px_minmax(0,1fr)]">
          <nav className="space-y-1">
            <SettingNav active={section === "general"} icon={Settings2} label="General" onClick={() => setSection("general")} />
            <SettingNav active={section === "publish"} icon={Rocket} label="Publish" onClick={() => setSection("publish")} />
            <SettingNav active={section === "rendering"} icon={MonitorCog} label="Rendering" onClick={() => setSection("rendering")} />
            <SettingNav active={section === "physics"} icon={Gauge} label="Physics" onClick={() => setSection("physics")} />
            <SettingNav active={section === "multiplayer"} icon={Users} label="Multiplayer" onClick={() => setSection("multiplayer")} />
          </nav>

          <div className="min-w-0">
            {section === "general" && (
              <SettingsCard title="Experience identity" icon={Settings2} description="Basic project metadata used by the engine workspace and registry.">
                <SettingField label="Project title"><input className="gb-input h-9 w-full px-3 text-sm" value={project.title} onChange={(event) => onUpdateProject({ ...project, title: event.target.value })} /></SettingField>
                <SettingField label="Description"><textarea className="gb-input min-h-[100px] w-full resize-y p-3 text-sm leading-5" value={project.description} onChange={(event) => onUpdateProject({ ...project, description: event.target.value })} /></SettingField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Genre"><select className="gb-input h-9 w-full px-3 text-sm" value={project.genre} onChange={(event) => onUpdateProject({ ...project, genre: event.target.value })}><option>Sandbox</option><option>Adventure</option><option>Action</option><option>RPG</option><option>Racing</option><option>Simulation</option></select></SettingField><SettingField label="Version"><input className="gb-input h-9 w-full px-3 font-mono text-sm" value={project.version} onChange={(event) => onUpdateProject({ ...project, version: event.target.value })} /></SettingField></div>
              </SettingsCard>
            )}

            {section === "publish" && (
              <SettingsCard
                title="Published place"
                icon={Rocket}
                description="Опубликуй карту, чтобы другие игроки видели её в твоём профиле и могли в неё играть и ставить лайки. Привязывается к аккаунту, с которого выполняется Save."
              >
                <ToggleRow
                  label="Опубликовать в GreenBlox"
                  description="Только опубликованные карты показываются в профиле и доступны друзьям для запуска. Черновики остаются приватными."
                  value={project.isPublished}
                  onChange={(value) => onUpdateProject({ ...project, isPublished: value })}
                />
                <SettingField label="Cover image URL">
                  <div className="flex items-start gap-3">
                    <div className="relative h-[76px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/[0.08]">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt="Cover" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-white/30">No cover</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="url"
                        value={project.thumbnail}
                        onChange={(event) => onUpdateProject({ ...project, thumbnail: event.target.value.trim() })}
                        placeholder="https://…  или  data:image/…"
                        className="gb-input h-9 w-full px-3 text-[12px] font-mono"
                      />
                      <p className="mt-1.5 text-[10px] leading-4 text-white/34">
                        Обложка карточки в профиле и в лаунчере. Поддерживает внешние URL и data:-картинки.
                      </p>
                    </div>
                  </div>
                </SettingField>
                <div className="rounded-xl border border-blue-200/10 bg-blue-200/[0.04] p-4 text-xs leading-5 text-blue-100/62">
                  <Globe2 className="mb-2 h-4 w-4 text-blue-200" />
                  Чтобы карта появилась в твоём профиле («Карты создателя»), войди в аккаунт в шапке студии и нажми Save — проект привяжется к твоему аккаунту и станет доступен другим игрокам.
                </div>
              </SettingsCard>
            )}

            {section === "rendering" && (
              <SettingsCard title="Rendering and atmosphere" icon={MonitorCog} description="Tune the initial visual pipeline and world lighting without leaving the editor.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Render quality"><select className="gb-input h-9 w-full px-3 text-sm" value={environment.renderQuality || "balanced"} onChange={(event) => updateEnvironment({ renderQuality: event.target.value as "performance" | "balanced" | "quality" })}><option value="performance">Performance</option><option value="balanced">Balanced</option><option value="quality">Quality</option></select></SettingField><SettingField label="Sky preset"><select className="gb-input h-9 w-full px-3 text-sm" value={environment.skybox} onChange={(event) => updateEnvironment({ skybox: event.target.value as ProjectData["sceneData"]["environment"]["skybox"] })}><option value="Morning">Morning</option><option value="Sunset">Sunset</option><option value="SciFi">SciFi</option><option value="Cloudy">Cloudy</option><option value="Midnight">Midnight</option></select></SettingField></div>
                <div className="rounded-xl border border-white/[0.075] bg-white/[0.025] p-4"><div className="mb-3 flex items-center justify-between text-xs text-white/58"><span>Time of day</span><span className="font-mono text-amber-200">{formatTime(environment.timeOfDay ?? 12)}</span></div><input type="range" min="0" max="24" step="0.25" value={environment.timeOfDay ?? 12} onChange={(event) => updateEnvironment({ timeOfDay: Number(event.target.value) })} className="w-full" /><div className="mt-2 flex justify-between text-[10px] text-white/26"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Ambient intensity"><input type="number" min="0" max="3" step="0.05" className="gb-input h-9 w-full px-3 font-mono text-sm" value={environment.ambientIntensity} onChange={(event) => updateEnvironment({ ambientIntensity: Number(event.target.value) })} /></SettingField><SettingField label="Sun intensity"><input type="number" min="0" max="5" step="0.05" className="gb-input h-9 w-full px-3 font-mono text-sm" value={environment.sunIntensity} onChange={(event) => updateEnvironment({ sunIntensity: Number(event.target.value) })} /></SettingField></div>
                <ToggleRow label="Bloom" description="Enable the renderer bloom profile." value={environment.enableBloom} onChange={(value) => updateEnvironment({ enableBloom: value })} /><ToggleRow label="SSAO" description="Enable screen-space ambient occlusion profile." value={environment.enableSSAO} onChange={(value) => updateEnvironment({ enableSSAO: value })} /><ToggleRow label="HDR" description="Use ACES filmic tone mapping." value={environment.enableHDR} onChange={(value) => updateEnvironment({ enableHDR: value })} />
              </SettingsCard>
            )}

            {section === "physics" && (
              <SettingsCard title="Physics simulation" icon={Gauge} description="World gravity, timing and water interaction defaults.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Gravity X"><input type="number" step="0.1" className="gb-input h-9 w-full px-3 font-mono text-sm" value={physics.gravity.x} onChange={(event) => updatePhysics({ gravity: { ...physics.gravity, x: Number(event.target.value) } })} /></SettingField><SettingField label="Gravity Y"><input type="number" step="0.1" className="gb-input h-9 w-full px-3 font-mono text-sm" value={physics.gravity.y} onChange={(event) => updatePhysics({ gravity: { ...physics.gravity, y: Number(event.target.value) } })} /></SettingField></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Gravity Z"><input type="number" step="0.1" className="gb-input h-9 w-full px-3 font-mono text-sm" value={physics.gravity.z} onChange={(event) => updatePhysics({ gravity: { ...physics.gravity, z: Number(event.target.value) } })} /></SettingField><SettingField label="Time scale"><input type="number" min="0" max="4" step="0.05" className="gb-input h-9 w-full px-3 font-mono text-sm" value={physics.timeScale} onChange={(event) => updatePhysics({ timeScale: Number(event.target.value) })} /></SettingField></div>
                <SettingField label="World water level"><div className="relative"><input type="number" step="0.5" className="gb-input h-9 w-full px-3 pr-12 font-mono text-sm" value={environment.waterLevel} onChange={(event) => updateEnvironment({ waterLevel: Number(event.target.value) })} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/28">Y</span></div></SettingField>
                <ToggleRow label="Physics sub-stepping" description="Run stable fixed sub-steps during the simulation loop." value={physics.enableSubStepping} onChange={(value) => updatePhysics({ enableSubStepping: value })} />
              </SettingsCard>
            )}

            {section === "multiplayer" && (
              <SettingsCard title="Multiplayer defaults" icon={Users} description="Configure the project’s default session profile. Network transport remains server-authoritative.">
                <ToggleRow label="Dedicated session profile" description="Use the 60Hz dedicated server profile for Play Mode." value={project.multiplayerConfig?.dedicatedServer !== false} onChange={(value) => onUpdateProject({ ...project, multiplayerConfig: { ...project.multiplayerConfig, dedicatedServer: value } })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><SettingField label="Tick rate"><input type="number" min="20" max="120" step="10" className="gb-input h-9 w-full px-3 font-mono text-sm" value={project.multiplayerConfig?.tickRate || 60} onChange={(event) => onUpdateProject({ ...project, multiplayerConfig: { ...project.multiplayerConfig, tickRate: Number(event.target.value) } })} /></SettingField><SettingField label="Max players"><input type="number" min="1" max="256" className="gb-input h-9 w-full px-3 font-mono text-sm" value={project.multiplayerConfig?.maxPlayers || 16} onChange={(event) => onUpdateProject({ ...project, multiplayerConfig: { ...project.multiplayerConfig, maxPlayers: Number(event.target.value) } })} /></SettingField></div>
                <ToggleRow label="P2P fallback" description="Keep the optional fallback flag in project configuration." value={project.multiplayerConfig?.p2pFallback !== false} onChange={(value) => onUpdateProject({ ...project, multiplayerConfig: { ...project.multiplayerConfig, p2pFallback: value } })} />
                <div className="rounded-xl border border-blue-200/10 bg-blue-200/[0.04] p-4 text-xs leading-5 text-blue-100/62"><Globe2 className="mb-2 h-4 w-4 text-blue-200" />Project settings control the default profile used by the Play Mode session. Runtime replication remains isolated from editor state until you start a session.</div>
              </SettingsCard>
            )}

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.075] bg-white/[0.025] p-3"><div className="flex items-center gap-2 text-[11px] text-white/42"><Sparkles className="h-3.5 w-3.5 text-emerald-200" /> Changes are live in the current editor session.</div><button onClick={onSave} className="gb-action-btn gb-save h-8 px-3 text-[10px]"><Save className="h-3.5 w-3.5" /> Save settings</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingNav({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semibold transition ${active ? "bg-[#3f6cff]/18 text-white ring-1 ring-[#5d80ff]/30" : "text-white/43 hover:bg-white/[0.04] hover:text-white/78"}`}><Icon className="h-4 w-4" />{label}</button>;
}

function SettingsCard({ title, icon: Icon, description, children }: { title: string; icon: React.ComponentType<{ className?: string }>; description: string; children: React.ReactNode }) {
  return <section className="gb-surface rounded-2xl p-4 sm:p-6"><div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-emerald-200"><Icon className="h-4 w-4" /></div><div><h2 className="text-lg font-semibold tracking-[-0.025em]">{title}</h2><p className="mt-1 text-xs leading-5 text-white/40">{description}</p></div></div><div className="space-y-4">{children}</div></section>;
}

function SettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-2 text-xs font-semibold text-white/58">{label}</div>{children}</label>;
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.065] bg-white/[0.02] p-3.5"><div><div className="text-sm font-semibold text-white/82">{label}</div><div className="mt-1 text-[11px] text-white/36">{description}</div></div><button onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-[#3f6cff]" : "bg-white/[0.12]"}`} aria-pressed={value}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition ${value ? "left-6" : "left-1"}`} /></button></div>;
}

function formatTime(value: number) {
  const hours = Math.floor(value) % 24;
  const minutes = Math.round((value - Math.floor(value)) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
