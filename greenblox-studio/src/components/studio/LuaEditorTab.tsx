"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { LuaScriptFile } from "@/engine/types/engine";
import { LuaRuntimeEngine } from "@/engine/lua/luaRuntime";
import { Play, Plus, Trash2, FileCode, Bug, Eye, AlertCircle, CheckCircle, Terminal, RefreshCw } from "lucide-react";

interface LuaEditorTabProps {
  scripts: LuaScriptFile[];
  activeScriptId: string | null;
  onSelectScript: (id: string) => void;
  onUpdateScriptCode: (id: string, newCode: string) => void;
  onCreateScript: (type: "Script" | "LocalScript" | "ModuleScript") => void;
  onDeleteScript: (id: string) => void;
  luaEngine: LuaRuntimeEngine;
}

export const LuaEditorTab: React.FC<LuaEditorTabProps> = ({
  scripts,
  activeScriptId,
  onSelectScript,
  onUpdateScriptCode,
  onCreateScript,
  onDeleteScript,
  luaEngine,
}) => {
  const [watchExpr, setWatchExpr] = useState("Workspace:FindFirstChild('Player')");
  const [watchResult, setWatchResult] = useState<any>(null);

  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0];

  const handleRunCurrent = () => {
    if (!activeScript) return;
    luaEngine.executeScript(activeScript.id, activeScript.name, activeScript.code);
  };

  const handleEvalWatch = () => {
    const res = luaEngine.evalWatchExpression(watchExpr);
    setWatchResult(res);
  };

  return (
    <div className="w-full h-full flex bg-slate-950 text-slate-200 select-none overflow-hidden text-xs">
      {/* Script List Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold uppercase tracking-wide text-slate-300">
          <span className="flex items-center gap-1.5"><FileCode className="w-4 h-4 text-yellow-400" /> Lua Scripts</span>
          <button
            onClick={() => onCreateScript("Script")}
            title="Create new Lua Script"
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 flex items-center gap-0.5 border border-slate-800 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {scripts.map((sc) => {
            const isSelected = sc.id === (activeScript?.id);
            return (
              <div
                key={sc.id}
                onClick={() => onSelectScript(sc.id)}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition ${
                  isSelected ? "bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500 font-bold" : "hover:bg-slate-800/50 text-slate-400"
                }`}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-slate-200 font-mono text-xs">{sc.name}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{sc.description || sc.type}</span>
                </div>

                {scripts.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteScript(sc.id); }}
                    className="p-1 hover:bg-red-900/60 rounded text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400">
          <p><b>IntelliSense Enabled:</b> Use <span className="text-emerald-300 font-mono">Workspace</span>, <span className="text-cyan-300 font-mono">TweenService</span>, and <span className="text-yellow-300 font-mono">RemoteEvent</span> globals.</p>
        </div>
      </aside>

      {/* Main Code Editor Container */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Editor Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold font-mono text-sm">{activeScript?.name || "No script selected"}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono border border-slate-700">
              {activeScript?.type}
            </span>
          </div>

          <button
            onClick={handleRunCurrent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition active:scale-95 text-xs"
          >
            <Play className="w-4 h-4 fill-white" /> Run Script Live in Engine
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative">
          {activeScript ? (
            <Editor
              height="100%"
              defaultLanguage="lua"
              theme="vs-dark"
              value={activeScript.code}
              onChange={(val) => onUpdateScriptCode(activeScript.id, val || "")}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true
              }}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">Select a script to begin coding.</div>
          )}
        </div>
      </div>

      {/* Right Side Live Debugger & Watch Expressions */}
      <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 font-bold tracking-wide uppercase text-slate-300">
          <span className="flex items-center gap-1.5"><Bug className="w-4 h-4 text-emerald-400" /> Live Lua Debugger</span>
        </div>

        <div className="p-3 flex flex-col gap-4 divide-y divide-slate-800">
          {/* Watch Variable Expression */}
          <div>
            <label className="text-slate-300 font-bold block mb-1.5 flex items-center gap-1">
              <Eye className="w-4 h-4 text-cyan-400" /> Evaluate Expression Watcher
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={watchExpr}
                onChange={(e) => setWatchExpr(e.target.value)}
                placeholder="e.g. Workspace:FindFirstChild('Player')"
                className="flex-1 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleEvalWatch}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold rounded border border-slate-700 text-slate-200"
              >
                Eval
              </button>
            </div>

            {watchResult && (
              <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] overflow-x-auto">
                {watchResult.error ? (
                  <span className="text-red-400">Error: {watchResult.error}</span>
                ) : (
                  <span className="text-cyan-300">Value: {JSON.stringify(watchResult.value, null, 2)}</span>
                )}
              </div>
            )}
          </div>

          {/* Breakpoints */}
          <div className="pt-3">
            <div className="text-slate-300 font-bold mb-2 flex items-center justify-between">
              <span>Active Breakpoints</span>
              <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Line Tracing</span>
            </div>
            <p className="text-[11px] text-slate-400">
              When execution reaches a breakpoint line, GreenBlox pauses simulation and outputs variable memory snapshots to the Console below.
            </p>
            <div className="mt-2 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-slate-300 text-center">
              No paused frames active.
            </div>
          </div>

          {/* Quick API Snippets */}
          <div className="pt-3">
            <div className="text-slate-300 font-bold mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-yellow-400" /> Quick Code Insert
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onUpdateScriptCode(activeScript.id, activeScript.code + `\nlocal part = Workspace:CreatePart("NewCube", "cube", 0, 10, 0, "#10b981")\n`)}
                className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[11px] text-emerald-400 transition"
              >
                + Spawn Dynamic Part
              </button>
              <button
                onClick={() => onUpdateScriptCode(activeScript.id, activeScript.code + `\nlocal event = game:GetService("RemoteEvent").new("ScoreSync")\nevent:FireServer(100)\n`)}
                className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[11px] text-cyan-400 transition"
              >
                + Fire RPC RemoteEvent
              </button>
              <button
                onClick={() => onUpdateScriptCode(activeScript.id, activeScript.code + `\nlocal tween = game:GetService("TweenService"):Create(Workspace:FindFirstChild("Player"), nil, { Position = Vector3.new(0, 15, 0) })\ntween:Play()\n`)}
                className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[11px] text-yellow-400 transition"
              >
                + Tween Position Smoothly
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
