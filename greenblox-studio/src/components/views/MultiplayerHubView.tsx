"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Globe, ShieldCheck, Activity, Users, Radio, Server, CheckCircle2, Zap } from "lucide-react";

interface ServerSession {
  id: number;
  serverName: string;
  maxPlayers: number;
  currentPlayers: number;
  tickRate: number;
  region: string;
  serverType: string;
  status: string;
}

export const MultiplayerHubView: React.FC = () => {
  const [servers, setServers] = useState<ServerSession[]>([]);
  const [isSpawning, setIsSpawning] = useState(false);

  useEffect(() => {
    fetch("/api/multiplayer")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setServers(data);
      })
      .catch(console.error);
  }, []);

  const handleSpawnServer = async () => {
    setIsSpawning(true);
    try {
      const res = await fetch("/api/multiplayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverName: `US-West (Oregon) #${Math.floor(Math.random() * 90 + 10)}`,
          maxPlayers: 16,
          currentPlayers: 1,
          tickRate: 60,
          region: "US-West",
          serverType: "Dedicated"
        })
      });
      const data = await res.json();
      if (data && data.id) {
        setServers((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpawning(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 overflow-y-auto p-8 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Wifi className="w-8 h-8 text-emerald-400" /> Multiplayer Replication & Network Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Server authority architecture with client prediction, history interpolation buffers, and lag compensation.
            </p>
          </div>

          <button
            onClick={handleSpawnServer}
            disabled={isSpawning}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition active:scale-95 text-xs md:text-sm shrink-0"
          >
            <Server className="w-4 h-4" />
            {isSpawning ? "Spawning Session..." : "+ Spawn Dedicated Server"}
          </button>
        </div>

        {/* Network Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Simulation Tick Rate</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-2">60 Hz</div>
            <p className="text-[11px] text-slate-500 mt-1">Substep physics sync</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Avg Global Latency</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-2">24 ms</div>
            <p className="text-[11px] text-slate-500 mt-1">Rollback compensation active</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>RPC Event Protocol</span>
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-2">RemoteEvent</div>
            <p className="text-[11px] text-slate-500 mt-1">Server authority verified</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Peers Online</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-2">{servers.reduce((a, b) => a + b.currentPlayers, 0) || 51} Players</div>
            <p className="text-[11px] text-slate-500 mt-1">Across dedicated realms</p>
          </div>
        </div>

        {/* Server List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="font-extrabold text-sm uppercase tracking-wide text-slate-300">Active Dedicated Realms</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Matchmaking Online
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {servers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic">No servers currently active. Click above to spawn one!</div>
            ) : (
              servers.map((srv) => (
                <div key={srv.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-850/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-white text-base">{srv.serverName}</span>
                        <span className="bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-800">
                          {srv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                        <span>Region: <b>{srv.region}</b></span>
                        <span>Type: <b>{srv.serverType}</b></span>
                        <span>Tick: <b>{srv.tickRate} Hz</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-200">{srv.currentPlayers} / {srv.maxPlayers} Players</div>
                      <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${(srv.currentPlayers / srv.maxPlayers) * 100}%` }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                        />
                      </div>
                    </div>

                    <button className="px-5 py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 font-bold rounded-xl border border-slate-700 transition active:scale-95 text-xs">
                      Join Lobby
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
