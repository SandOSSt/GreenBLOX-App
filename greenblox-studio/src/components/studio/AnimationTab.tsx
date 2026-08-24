"use client";

import React, { useState } from "react";
import { AnimationClip } from "@/engine/types/engine";
import { Activity, Play, Pause, Plus, ShieldAlert, Cpu, Layers } from "lucide-react";

interface AnimationTabProps {
  animations: AnimationClip[];
  onUpdateAnimations: (anims: AnimationClip[]) => void;
}

export const AnimationTab: React.FC<AnimationTabProps> = ({ animations, onUpdateAnimations }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState(animations[0]?.id || null);
  const selectedAnim = animations.find(a => a.id === selectedId) || animations[0];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-hidden text-xs">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="font-bold uppercase tracking-wide text-sm">Animation & Inverse Kinematics (IK) Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition shadow ${
              isPlaying ? "bg-amber-600 text-white animate-pulse" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            {isPlaying ? "Pause Preview" : "Play Timeline Loop"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Clips list */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 p-3 gap-3">
          <div className="font-bold text-slate-300 flex items-center justify-between">
            <span>Animation Clips ({animations.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {animations.length === 0 ? (
              <div className="text-slate-500 italic p-3 text-center">No custom keyframes defined.</div>
            ) : (
              animations.map((anim) => (
                <div
                  key={anim.id}
                  onClick={() => setSelectedId(anim.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition ${
                    anim.id === selectedAnim?.id ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="text-sm">{anim.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Duration: {anim.duration}s | Keyframes: {anim.keyframes.length}</div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Timeline Keyframe Scrubber */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-slate-950/80 overflow-y-auto">
          {selectedAnim ? (
            <div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" /> Keyframe Timeline: {selectedAnim.name}
                  </h3>
                  <span className="bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono border border-emerald-800">
                    Looping: {selectedAnim.loop ? "ON" : "OFF"}
                  </span>
                </div>

                {/* Timeline bar representation */}
                <div className="relative w-full h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center px-4 my-4">
                  <div className="absolute inset-x-4 h-1 bg-slate-800 rounded-full" />
                  {selectedAnim.keyframes.map((kf, idx) => {
                    const percent = (kf.time / selectedAnim.duration) * 100;
                    return (
                      <div
                        key={idx}
                        style={{ left: `${percent}%` }}
                        className="absolute w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md transform -translate-x-1/2 flex items-center justify-center title"
                        title={`Keyframe at T=${kf.time}s`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  {selectedAnim.keyframes.map((kf, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
                      <div className="text-emerald-400 font-bold mb-2">Keyframe #{idx + 1} (T={kf.time}s)</div>
                      <div className="text-slate-300">Target ID: {kf.entityId}</div>
                      <div className="text-slate-400 mt-1">Pos: ({kf.position.x}, {kf.position.y}, {kf.position.z})</div>
                      <div className="text-slate-400">Rot: ({kf.rotation.x}, {kf.rotation.y}, {kf.rotation.z})</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 rounded-2xl border border-emerald-800/60 shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="text-emerald-300 font-extrabold text-base flex items-center gap-2 mb-1">
                    <Cpu className="w-5 h-5 text-emerald-400" /> 2-Bone Inverse Kinematics (IK) Rigging
                  </h4>
                  <p className="text-slate-300 text-xs max-w-2xl">
                    GreenBlox animation pipeline solves two-bone articular kinematics dynamically in real-time, allowing character hands and weapon muzzles to align precisely toward targets across uneven terrain!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Select an animation clip to inspect keyframe sequences.</div>
          )}
        </div>
      </div>
    </div>
  );
};
