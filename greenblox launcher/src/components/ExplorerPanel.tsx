// Roblox-Studio-style Explorer tree. `buildExplorer` turns engine parts into a
// hierarchy; `ExplorerTree` renders it inline (used inside the in-game menu).

import { useMemo, useState, type ReactNode } from "react";
import type { Part } from "../game/types";

export interface ExplorerNode {
  id: string;
  name: string;
  kind: "folder" | "service" | "model" | "part" | "other";
  parent?: ExplorerNode;
  children: ExplorerNode[];
  data?: { part: Part };
  expanded?: boolean;
}

function ServiceIcon({ className = "w-3.5 h-3.5", color = "text-emerald-300" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7l9 5 9-5-9-5z" className={color} fill="currentColor" fillOpacity="0.15" />
      <path d="M3 17l9 5 9-5M3 12l9 5 9-5" className={color} />
    </svg>
  );
}

function FolderIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" className="text-yellow-400" fill="rgba(250,204,21,0.15)" />
    </svg>
  );
}

function ScriptIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" className="text-emerald-300" />
    </svg>
  );
}

function CoinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" className="text-yellow-400" fill="rgba(250,204,21,0.2)" />
      <path d="M12 8v8M14.5 10.5H11a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3h-3.5" className="text-yellow-300" />
    </svg>
  );
}

function SkullIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM13 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0z" className="text-rose-400" fill="currentColor" />
      <path d="M12 2a9 9 0 0 0-9 9c0 2 .5 3.5 1.5 5v3c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3c1-1.5 1.5-3 1.5-5a9 9 0 0 0-9-9z" className="text-rose-400" fill="rgba(244,63,94,0.15)" />
    </svg>
  );
}

function FlagIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" className="text-emerald-400" fill="rgba(52,211,153,0.15)" />
      <line x1="4" y1="22" x2="4" y2="15" className="text-emerald-300" />
    </svg>
  );
}

function PartIcon({ kind, className = "w-3.5 h-3.5" }: { kind?: string; className?: string }) {
  if (kind === "coin") return <CoinIcon className={className} />;
  if (kind === "checkpoint") return <FlagIcon className={className} />;
  if (kind === "kill") return <SkullIcon className={className} />;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="2" className="text-sky-300" fill="rgba(56,189,248,0.15)" />
    </svg>
  );
}

const BLOCK_NAMES: Record<string, string> = {
  baseplate: "Baseplate",
  platform: "Platform",
  spawn: "SpawnLocation",
  checkpoint: "Checkpoint",
  coin: "Coin",
  kill: "KillBrick",
  win: "FinishPad",
  decor: "Decor",
  user: "UserPart",
};

export function buildExplorer(parts: Part[]): ExplorerNode {
  const game: ExplorerNode = { id: "Game", name: "Game", kind: "service", expanded: true, children: [] };
  const workspace: ExplorerNode = { id: "Workspace", name: "Workspace", kind: "service", parent: game, expanded: true, children: [] };
  game.children.push(workspace);

  game.children.push({ id: "Lighting", name: "Lighting", kind: "service", parent: game, children: [] });
  game.children.push({
    id: "Players",
    name: "Players",
    kind: "service",
    parent: game,
    children: [{ id: "LocalPlayer", name: "GreenBloxPlayer", kind: "other", children: [] }],
  });
  game.children.push({ id: "ReplicatedStorage", name: "ReplicatedStorage", kind: "service", parent: game, children: [] });
  game.children.push({
    id: "ServerScriptService",
    name: "ServerScriptService",
    kind: "service",
    parent: game,
    children: [{ id: "ObbyScript", name: "ObbyScript (LocalScript)", kind: "other", children: [] }],
  });

  const folderMap = new Map<string, ExplorerNode>();
  for (const p of parts) {
    let folder = "Obby";
    let name = BLOCK_NAMES[p.kind] ?? `Part_${p.id}`;
    if (p.kind === "coin") { folder = "Coins"; name = `Coin_${p.id}`; }
    else if (p.kind === "checkpoint") { folder = "Checkpoints"; name = `Checkpoint_${p.meta?.stage ?? 0}`; }
    else if (p.kind === "kill") { folder = "Hazards"; name = `Lava_${p.id}`; }
    else if (p.kind === "win") { folder = "EndZone"; name = "FinishPad"; }
    else if (p.kind === "decor") { folder = "Decor"; name = `Decor_${p.id}`; }
    else if (p.kind === "user") { folder = "UserParts"; name = `UserPart_${p.id}`; }
    else if (p.kind === "spawn") { folder = "Obby"; name = "SpawnLocation"; }

    let folderNode = folderMap.get(folder);
    if (!folderNode) {
      folderNode = { id: folder, name: folder, kind: folder === "Obby" ? "model" : "folder", parent: workspace, children: [] };
      workspace.children.push(folderNode);
      folderMap.set(folder, folderNode);
    }
    folderNode.children.push({ id: `part-${p.id}`, name, kind: "part", parent: folderNode, data: { part: p }, children: [] });
  }

  return game;
}

export function flattenTree(root: ExplorerNode): ExplorerNode[] {
  const out: ExplorerNode[] = [];
  const walk = (n: ExplorerNode) => {
    out.push(n);
    if (n.expanded) n.children.forEach(walk);
  };
  walk(root);
  return out;
}

function countDepth(node: ExplorerNode, root: ExplorerNode): number {
  let d = 0;
  let cur: ExplorerNode | undefined = node;
  while (cur && cur !== root) {
    cur = cur.parent;
    d++;
  }
  return d;
}

function ChevronIcon({ open, className = "w-3 h-3" }: { open: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** Embeddable explorer tree (no panel chrome) — used inside the game menu. */
export function ExplorerTree({
  root,
  onTeleport,
}: {
  root: ExplorerNode;
  onTeleport: (x: number, y: number, z: number) => void;
}) {
  const [tick, setTick] = useState(0);
  const flat = useMemo(() => flattenTree(root), [root, tick] as const);

  const toggleNode = (n: ExplorerNode) => {
    n.expanded = !n.expanded;
    setTick((t) => t + 1);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0f1013]">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/4 px-3 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">Workspace</div>
        <span className="font-mono text-[10px] text-white/35">{flat.filter((n) => n.kind === "part").length} деталей</span>
      </div>
      <div className="gb-scroll max-h-[46vh] select-none overflow-y-auto py-1 font-mono text-[11px]">
        {flat.map((node) => {
          const depth = countDepth(node, root);
          const hasChildren = node.children.length > 0;
          let icon: ReactNode = null;
          if (node.kind === "service") icon = <ServiceIcon className="w-3.5 h-3.5" color="text-sky-300" />;
          else if (node.kind === "folder") icon = <FolderIcon />;
          else if (node.kind === "part") icon = <PartIcon kind={node.data?.part.kind} />;
          else if (node.name.endsWith("Script")) icon = <ScriptIcon />;
          else icon = <ServiceIcon className="w-3.5 h-3.5" color="text-emerald-300" />;

          return (
            <div
              key={node.id}
              className="group flex cursor-default items-center gap-1.5 px-2 py-0.5 hover:bg-white/5"
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              onClick={() => { if (hasChildren) toggleNode(node); }}
            >
              {hasChildren ? (
                <ChevronIcon open={!!node.expanded} className="h-2.5 w-2.5 shrink-0 text-white/40" />
              ) : (
                <span className="h-2.5 w-2.5 shrink-0" />
              )}
              <span className="shrink-0">{icon}</span>
              <span className={`truncate ${node.kind === "service" ? "font-semibold text-sky-200/80" : node.kind === "folder" || node.kind === "model" ? "text-yellow-100/90" : node.kind === "part" ? "text-white/75" : "text-emerald-200/80"}`}>
                {node.name}
              </span>
              {node.data?.part && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const p = node.data!.part;
                    onTeleport(p.pos.x, p.pos.y + 2, p.pos.z);
                  }}
                  className="ml-auto rounded-full bg-[#1ed760]/85 px-2 py-0.5 text-[9px] font-black text-[#05210e] opacity-0 transition-opacity hover:bg-[#1ed760] group-hover:opacity-100"
                >
                  GO
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/8 px-3 py-1.5 font-mono text-[10px] text-white/30">
        Клик по папке — открыть/свернуть • GO — телепорт к детали
      </div>
    </div>
  );
}
