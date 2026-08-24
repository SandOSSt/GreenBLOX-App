"use client";

import React, { useState } from "react";
import { BookOpen, Code2, Copy, Check, ChevronRight, Sparkles, Terminal } from "lucide-react";

interface ApiDocSection {
  title: string;
  serviceName: string;
  description: string;
  methods: { name: string; signature: string; description: string; example: string }[];
}

const API_DOCS: ApiDocSection[] = [
  {
    title: "Workspace & ECS hierarchy",
    serviceName: "Workspace",
    description: "The primary 3D world scene root container. Use to inspect parts, spawn geometry, and query dynamic instances.",
    methods: [
      {
        name: "FindFirstChild",
        signature: 'Workspace:FindFirstChild(name: string): Instance | nil',
        description: "Returns the first child entity in the Scene Tree matching the name string, or nil if none found.",
        example: 'local player = Workspace:FindFirstChild("Player")\nif player then\n  print("Found Player in Workspace!")\nend'
      },
      {
        name: "CreatePart",
        signature: 'Workspace:CreatePart(name: string, geometry: string, x: number, y: number, z: number, color: string): Instance',
        description: "Instantly spawns a verified physical 3D primitive part into the simulated engine scene.",
        example: 'local wall = Workspace:CreatePart("ArenaWall", "cube", 10, 5, -10, "#3b82f6")'
      }
    ]
  },
  {
    title: "TweenService & Easing",
    serviceName: "TweenService",
    description: "Hardware accelerated smooth transitions for coordinates, camera paths, and interface opacity.",
    methods: [
      {
        name: "Create",
        signature: 'TweenService:Create(target: Instance, tweenInfo: table, properties: table): Tween',
        description: "Prepares an interpolating animation curve across target instance parameters.",
        example: 'local tween = game:GetService("TweenService"):Create(part, nil, { Position = Vector3.new(20, 10, 0) })\ntween:Play()'
      }
    ]
  },
  {
    title: "RemoteEvent & RPC Networking",
    serviceName: "RemoteEvent",
    description: "Secure cross-boundary replication between dedicated servers and connected clients with lag compensation.",
    methods: [
      {
        name: "FireServer",
        signature: 'RemoteEvent:FireServer(...args: any[]): void',
        description: "Dispatches a client packet directly to the authoritative server game loop.",
        example: 'local scoreEvent = game:GetService("RemoteEvent").new("OnScore")\nscoreEvent:FireServer("BlueTeam", 5)'
      },
      {
        name: "FireAllClients",
        signature: 'RemoteEvent:FireAllClients(...args: any[]): void',
        description: "Broadcasts state snapshots to every connected client in the multiplayer session.",
        example: 'scoreEvent:FireAllClients("Game Over! Victory!")'
      }
    ]
  },
  {
    title: "Vector3 & Math Library",
    serviceName: "Vector3 / math",
    description: "High performance geometric vector computation and trigonometric helpers.",
    methods: [
      {
        name: "Vector3.new",
        signature: 'Vector3.new(x: number, y: number, z: number): Vector3',
        description: "Constructs a 3-dimensional Euclidean coordinate vector.",
        example: 'part.Position = Vector3.new(15, 2.5, -30)'
      }
    ]
  }
];

export const ApiDocumentationView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<ApiDocSection>(API_DOCS[0]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (code: string, idx: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 overflow-hidden flex select-none text-xs md:text-sm">
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 bg-slate-950">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" /> API Reference
          </h2>
          <p className="text-slate-400 text-xs mt-1">Lua Scripting standard library & IntelliSense autocompletion specs.</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {API_DOCS.map((doc) => {
            const isSelected = doc.serviceName === selectedSection.serviceName;
            return (
              <div
                key={doc.serviceName}
                onClick={() => setSelectedSection(doc)}
                className={`p-4 cursor-pointer transition flex items-center justify-between ${
                  isSelected ? "bg-emerald-600/20 text-emerald-300 border-l-4 border-emerald-500 font-extrabold" : "hover:bg-slate-800/50 text-slate-400"
                }`}
              >
                <div>
                  <div className="font-mono text-white text-sm">{doc.serviceName}</div>
                  <div className="text-[11px] text-slate-500 font-sans mt-0.5">{doc.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Documentation Container */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="border-b border-slate-800 pb-5">
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">Service Reference</span>
            <h1 className="text-3xl font-black text-white mt-1 font-mono">{selectedSection.serviceName}</h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{selectedSection.description}</p>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-extrabold text-white">Methods & Functions</h2>

            {selectedSection.methods.map((meth, idx) => (
              <div key={meth.name} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 bg-slate-900/90 border-b border-slate-800">
                  <span className="text-emerald-400 font-mono text-base font-extrabold">{meth.signature}</span>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">{meth.description}</p>
                </div>

                <div className="p-5 bg-slate-950 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
                    <span>Example Script Code</span>
                    <button
                      onClick={() => handleCopy(meth.example, `${meth.name}-${idx}`)}
                      className="flex items-center gap-1 hover:text-white transition"
                    >
                      {copiedIndex === `${meth.name}-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIndex === `${meth.name}-${idx}` ? "Copied!" : "Copy Snippet"}
                    </button>
                  </div>

                  <pre className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-emerald-300 overflow-x-auto">
                    {meth.example}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800 p-6 rounded-2xl flex items-center gap-4 text-xs text-slate-300">
            <Sparkles className="w-8 h-8 text-emerald-400 shrink-0 animate-pulse" />
            <div>
              <div className="font-extrabold text-emerald-300 text-sm mb-1">Live Autocompletion Ready in Studio</div>
              <span>When writing code in the Studio IDE Monaco Editor, GreenBlox provides instant code hints and syntax error tracing for all documented methods.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
