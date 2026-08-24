"use client";

import React, { useState } from "react";
import { AudioEngine } from "@/engine/audio/audioMixer";
import { Radio, Volume2, Sliders, Play, Speaker, Disc } from "lucide-react";

interface AudioMixerTabProps {
  audioEngine: AudioEngine;
}

export const AudioMixerTab: React.FC<AudioMixerTabProps> = ({ audioEngine }) => {
  const [masterVol, setMasterVol] = useState(audioEngine.masterVolume);
  const [reverbZone, setReverbZone] = useState("None");
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleVolChange = (val: number) => {
    setMasterVol(val);
    audioEngine.setMasterVolume(val);
  };

  const handlePlayTest = (reverb: "None" | "Cave" | "Hall" | "Forest" | "Arena" = "None") => {
    setIsPlayingTest(true);
    audioEngine.playAudioSource("test_snd", {
      type: "AudioSource",
      enabled: true,
      audioUrl: "synth",
      volume: 0.8,
      pitch: 1.0,
      loop: false,
      spatial3D: true,
      maxDistance: 50,
      reverbZone: reverb
    }, { x: 5, y: 0, z: 5 });

    setTimeout(() => setIsPlayingTest(false), 800);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 select-none overflow-y-auto p-8 text-xs">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Radio className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">3D Spatial Audio & Reverb Mixer</h2>
              <p className="text-slate-400">Web Audio API hardware accelerated attenuations and acoustic room reflections</p>
            </div>
          </div>
        </div>

        {/* Master Gain Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-extrabold text-sm text-white">Master Output Volume</div>
              <div className="text-[11px] text-slate-400 font-mono">GainNode attenuation across all channels</div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-64">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={(e) => handleVolChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-emerald-400 text-sm">{(masterVol * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Reverb Ambient Zones */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-extrabold text-sm text-white mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Acoustic Reverb Ambient Zones
          </h3>
          <p className="text-slate-400 text-[11px] mb-6">
            Click to audition environmental spatial reverbs applied automatically when player characters step into designated volume boundaries:
          </p>

          <div className="grid grid-cols-3 gap-4">
            {(["None (Outdoors)", "Cave (Deep Echo)", "Hall (Reverb)", "Forest (Absorbent)", "Arena (Stadium)"] as const).map((zone) => {
              const key = zone.split(" ")[0] as any;
              return (
                <div key={key} className="bg-slate-950 p-5 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition">
                  <div>
                    <div className="font-bold text-slate-200 text-sm mb-1">{zone}</div>
                    <p className="text-[11px] text-slate-500 font-sans">Simulated early delay reflections and frequency dampeners.</p>
                  </div>
                  <button
                    onClick={() => handlePlayTest(key)}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold rounded-lg text-emerald-400 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Play className="w-4 h-4" /> Audition Sound
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
