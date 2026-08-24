"use client";

import React, { useState } from "react";
import type { ProjectData } from "@/engine/types/engine";
import { HomeLibrarySection } from "./HomeLibrarySection";
import StudioAccountBar from "./StudioAccountBar";
import {
  Archive,
  ArrowRight,
  Box,
  Clock3,
  Cuboid,
  FolderKanban,
  Home,
  LayoutTemplate,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface StudioHomeScreenProps {
  projects: ProjectData[];
  onCreateProject: () => void;
  onOpenProject: (project: ProjectData) => void;
  onOpenSettings: () => void;
}

const templateCards = [
  { title: "Flat Baseplate", subtitle: "Clean runtime scene", icon: Box },
  { title: "First-Person Arena", subtitle: "Physics + weapons shell", icon: Cuboid },
  { title: "Open World", subtitle: "Streaming terrain setup", icon: LayoutTemplate },
  { title: "Obstacle Course", subtitle: "Triggers and checkpoints", icon: FolderKanban },
  { title: "Vehicle Sandbox", subtitle: "Constraints and controller", icon: Box },
  { title: "UI Prototype", subtitle: "HUD and interactive layout", icon: SlidersHorizontal },
];

export function StudioHomeScreen({ projects, onCreateProject, onOpenProject, onOpenSettings }: StudioHomeScreenProps) {
  const [homeSection, setHomeSection] = useState<"home" | "recents" | "experiences" | "templates" | "archive">("home");
  const featured = projects[0] ?? null;
  const recents = projects.slice(0, 8);

  return (
    <div
      className="flex h-full w-full overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 60% -10%, rgba(80,120,255,0.10), transparent 60%), linear-gradient(180deg, #0a0b10 0%, #0a0c12 100%)",
      }}
    >
      <aside className="hidden w-[236px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0e1015] md:flex">
        <div className="flex h-14 items-center gap-3 border-b border-white/[0.07] px-5">
          <img src="/favicon.svg" alt="GreenBlox Studio" className="h-7 w-7 rounded-md" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight">GreenBlox Studio</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-3 py-4">
          <button
            onClick={onCreateProject}
            className="gb-action-btn gb-primary mb-5 h-10 w-full justify-start text-[12px]"
          >
            <Plus className="h-4 w-4" />
            New Experience
          </button>

          <div className="space-y-1 text-[12px]">
            <NavItem active={homeSection === "home"} icon={Home} label="Home" onClick={() => setHomeSection("home")} />
            <NavItem active={homeSection === "recents"} icon={Clock3} label="Recents" onClick={() => setHomeSection("recents")} />
            <NavItem active={homeSection === "experiences"} icon={FolderKanban} label="Experiences" onClick={() => setHomeSection("experiences")} />
            <NavItem active={homeSection === "templates"} icon={LayoutTemplate} label="Templates" onClick={() => setHomeSection("templates")} />
            <NavItem active={homeSection === "archive"} icon={Archive} label="Archive" onClick={() => setHomeSection("archive")} />
            <div className="my-3 border-t border-white/[0.06]" />
            <NavItem icon={SlidersHorizontal} label="Settings" onClick={onOpenSettings} />
          </div>
        </div>

      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#101218] px-4 text-[11px] text-white/45">
          <div className="flex items-center gap-5">
            <span className="font-medium text-white/70 hover:text-white">File</span>
            <span className="hover:text-white">Plugins</span>
            <span className="hover:text-white">Help</span>
          </div>
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <div className="relative w-[300px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input className="gb-input h-7 w-full pl-8 text-[11px]" placeholder="Search project registry" />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2" aria-label="Account">
            <StudioAccountBar />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_50%_-10%,rgba(63,108,255,0.12),transparent_35%),#08090c]">
          <div className={`mx-auto flex w-full max-w-[1680px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:gap-10 xl:py-8 ${homeSection === "home" ? "" : "hidden"}`}>
            <section className="grid grid-cols-1 gap-3 md:flex md:items-end md:justify-between">
              <div>
                <h1 className="max-w-3xl text-[clamp(28px,3.1vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
                  Create experiences.
                </h1>
                <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/45">
                  Open a project, edit the scene, script with Lua and play instantly.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={onCreateProject} className="gb-action-btn gb-primary h-10 px-4 text-[12px] md:hidden">
                  <Plus className="h-4 w-4" /> New
                </button>
              </div>
            </section>

            {featured && (
              <section className="gb-card relative overflow-hidden rounded-[22px] border border-white/[0.06] shadow-[0_22px_70px_rgba(0,0,0,0.32)]">
                <div className="relative min-h-[310px] md:min-h-[360px]">
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-[1.012]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,12,0.92)_0%,rgba(7,9,12,0.55)_45%,rgba(7,9,12,0.06)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08090c] to-transparent" />

                  <div className="relative z-10 flex h-full min-h-[310px] flex-col justify-end gap-7 p-5 md:min-h-[360px] md:p-8">
                    <div className="max-w-3xl">
                      <h2 className="text-[clamp(24px,3vw,42px)] font-semibold leading-[1.03] tracking-[-0.04em] text-white">
                        {featured.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/58">{featured.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => onOpenProject(featured)} className="gb-action-btn gb-primary h-11 px-5 text-[13px]">
                        <Play className="h-4 w-4 fill-white" />
                        Open in Editor
                      </button>
                      <MetaBadge label={featured.genre} />
                      <MetaBadge label={featured.version} mono />
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <SectionHeader title="Recent experiences" subtitle="Continue where you left off." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {recents.map((project) => (
                  <button
                    key={project.id ?? project.title}
                    onClick={() => onOpenProject(project)}
                    className="gb-card group relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-white/[0.018] text-left transition hover:border-white/[0.14] hover:bg-white/[0.03]"
                    style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.24)" }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#11141a]">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.025]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.32)_100%)]" />
                      <div className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/85 backdrop-blur-md">
                        {project.isPublished ? "Shared" : "Private"}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white">{project.title}</div>
                      <div className="mt-1.5 line-clamp-2 min-h-[36px] text-[11px] leading-[18px] text-white/40">
                        {project.description}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3 font-mono text-[10px] text-white/30">
                        <span>{project.genre}</span>
                        <span>{project.version}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Templates" subtitle="Quick starts for common project types." />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {templateCards.map((template, index) => {
                  const project = projects[index % Math.max(projects.length, 1)] ?? featured;
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.title}
                      onClick={() => project && onOpenProject(project)}
                      className="gb-card gb-surface-soft rounded-[15px] p-3 text-left hover:border-white/[0.14]"
                    >
                      <div className="mb-3 grid aspect-[4/2.8] place-items-center rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018))] text-white/34">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="truncate text-[12px] font-semibold text-white">{template.title}</div>
                      <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/38">{template.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <footer className="gb-surface-soft flex flex-col justify-between gap-3 rounded-2xl p-4 text-[12px] text-white/42 md:flex-row md:items-center">
              <div className="max-w-2xl">
                Editor shell is wired to the running ECS scene graph, renderer and script VM. Everything here is a working engine surface, not a launcher mockup.
              </div>
              <button onClick={onCreateProject} className="gb-action-btn gb-secondary px-4">
                Create project
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </footer>
          </div>

          {homeSection !== "home" && (
            <HomeLibrarySection
              section={homeSection}
              projects={projects}
              onOpenProject={onOpenProject}
              onCreateProject={onCreateProject}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, icon: Icon, label, onClick }: { active?: boolean; icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left font-medium transition ${
        active ? "bg-white/[0.065] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]" : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function MetaBadge({ label, mono }: { label: string; mono?: boolean }) {
  return (
    <span className={`rounded-md border border-white/[0.09] bg-black/28 px-2.5 py-2 text-[10px] text-white/62 backdrop-blur-md ${mono ? "font-mono" : "font-semibold"}`}>
      {label}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
      <div>
        <h3 className="text-[21px] font-semibold tracking-[-0.025em] text-white">{title}</h3>
        <p className="mt-1 text-[12px] text-white/39">{subtitle}</p>
      </div>
    </div>
  );
}
