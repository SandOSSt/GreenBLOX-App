"use client";

import React from "react";
import type { ProjectData } from "@/engine/types/engine";
import { Archive, ArrowRight, Box, FolderKanban, LayoutTemplate, Play, Plus, Search } from "lucide-react";

interface HomeLibrarySectionProps {
  section: "recents" | "experiences" | "templates" | "archive";
  projects: ProjectData[];
  onOpenProject: (project: ProjectData) => void;
  onCreateProject: () => void;
}

const templateRows = [
  { title: "Flat Baseplate", text: "A clean scene with a physical ground plane.", icon: Box },
  { title: "First-Person Arena", text: "Player controller, physics and combat-ready layout.", icon: FolderKanban },
  { title: "Open World", text: "World-size defaults for streaming terrain work.", icon: LayoutTemplate },
  { title: "UI Sandbox", text: "A focused canvas for HUD and interface iteration.", icon: LayoutTemplate },
];

export function HomeLibrarySection({ section, projects, onOpenProject, onCreateProject }: HomeLibrarySectionProps) {
  const title = section === "recents" ? "Recent projects" : section === "experiences" ? "Experiences" : section === "templates" ? "Templates" : "Archive";
  const description = section === "recents" ? "Your latest engine workspaces." : section === "experiences" ? "All projects currently available in the GreenBlox registry." : section === "templates" ? "Start from a configured runtime scene." : "Archived experiences are kept out of the active workspace.";

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:py-10">
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.075] pb-5 md:flex-row md:items-end">
        <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/75">GreenBlox library</div><h1 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h1><p className="mt-2 text-sm text-white/42">{description}</p></div>
        <div className="relative w-full md:w-[270px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><input className="gb-input h-9 w-full pl-9 pr-3 text-xs" placeholder="Search library" /></div>
      </div>

      {section === "archive" ? (
        <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.018] p-8 text-center"><div><Archive className="mx-auto h-8 w-8 text-white/22" /><h2 className="mt-4 text-lg font-semibold text-white/72">Archive is empty</h2><p className="mt-2 max-w-sm text-xs leading-5 text-white/36">Projects you archive will appear here without affecting the active engine workspace.</p></div></div>
      ) : section === "templates" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templateRows.map((template) => { const Icon = template.icon; const project = projects[0]; return <button key={template.title} onClick={() => project ? onOpenProject(project) : onCreateProject()} className="gb-card gb-surface-soft flex items-center gap-4 rounded-2xl p-5 text-left hover:border-white/[0.16]"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-emerald-200"><Icon className="h-6 w-6" /></div><div className="min-w-0"><div className="text-sm font-semibold text-white">{template.title}</div><div className="mt-1 text-xs leading-5 text-white/38">{template.text}</div></div><ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/25" /></button>; })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => <button key={project.id ?? project.title} onClick={() => onOpenProject(project)} className="gb-card gb-surface-soft overflow-hidden rounded-2xl text-left hover:border-white/[0.16]"><div className="aspect-[16/9] overflow-hidden bg-black/20"><img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105" /></div><div className="p-4"><div className="truncate text-sm font-semibold text-white">{project.title}</div><div className="mt-1 line-clamp-2 text-xs leading-5 text-white/40">{project.description}</div><div className="mt-4 flex items-center justify-between text-[10px] text-white/32"><span>{project.genre}</span><span>{project.isPublished ? "Published" : "Private"}</span></div></div></button>)}
          {projects.length === 0 && <div className="rounded-2xl border border-dashed border-white/[0.09] p-8 text-center text-xs text-white/36 sm:col-span-2 xl:col-span-3"><Play className="mx-auto mb-3 h-6 w-6 text-white/20" />No projects yet. <button onClick={onCreateProject} className="font-semibold text-emerald-200 hover:text-emerald-100">Create one <Plus className="inline h-3.5 w-3.5" /></button></div>}
        </div>
      )}
    </div>
  );
}
