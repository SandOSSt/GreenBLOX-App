"use client";

import React, { useState } from "react";
import { ProjectData } from "@/engine/types/engine";
import { Gamepad2, Play, Code2, Eye, ThumbsUp, Users, Shield, Sparkles } from "lucide-react";

interface ExperiencesArcadeProps {
  projects: ProjectData[];
  onOpenInStudio: (proj: ProjectData) => void;
}

export const ExperiencesArcade: React.FC<ExperiencesArcadeProps> = ({ projects, onOpenInStudio }) => {
  const [selectedToPlay, setSelectedToPlay] = useState<ProjectData | null>(null);

  const published = projects.filter(p => p.isPublished);

  if (selectedToPlay) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 p-6 select-none overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Instant Multiplayer Experience
              </span>
              <h1 className="text-3xl font-black mt-1 text-white">{selectedToPlay.title}</h1>
              <p className="text-slate-400 text-sm mt-1">Created by <b className="text-slate-200">{selectedToPlay.author}</b> | Version: {selectedToPlay.version}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenInStudio(selectedToPlay)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-slate-200 flex items-center gap-2 border border-slate-700 transition"
              >
                <Code2 className="w-4 h-4 text-emerald-400" /> Remix in Studio IDE
              </button>
              <button
                onClick={() => setSelectedToPlay(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-white transition"
              >
                Exit Game
              </button>
            </div>
          </div>

          {/* Fullscreen interactive simulator banner */}
          <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 flex flex-col items-center justify-center text-center p-8 group">
            <img
              src={selectedToPlay.thumbnail}
              alt={selectedToPlay.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[2px] group-hover:scale-105 transition duration-700"
            />
            <div className="relative z-10 max-w-2xl bg-slate-950/85 p-8 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Gamepad2 className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white">Connected to US-East Dedicated Server #01</h2>
              <p className="text-slate-300 text-sm">
                You are testing <span className="font-bold text-emerald-400">{selectedToPlay.title}</span> in GreenBlox High Performance 60Hz Play Mode. Client predictions, remote weapons events, and PBR lighting active!
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400 font-bold">Ping: 24ms</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">Peers Online: 14 / 16</span>
                <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400">Tick Rate: 60Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 overflow-y-auto p-8 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-emerald-400" /> Published Experiences Arcade
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore production games built inside GreenBlox Engine. Play online with dedicated server lag compensation or open any experience in the Studio IDE!
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Verified 60Hz PBR Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {published.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition group"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-slate-800">
                    {proj.genre}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-slate-300 flex items-center gap-1.5 border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> 14 Online
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-300 transition">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{proj.description}</p>

                  <div className="flex items-center gap-4 mt-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {proj.viewsCount || 4200} Views</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> {proj.likesCount || 890} Likes</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  onClick={() => setSelectedToPlay(proj)}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 text-sm"
                >
                  <Play className="w-4 h-4 fill-white" /> Play Instant Multiplayer
                </button>
                <button
                  onClick={() => onOpenInStudio(proj)}
                  title="Remix & Edit in Studio"
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition flex items-center justify-center"
                >
                  <Code2 className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
