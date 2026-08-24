import { useEffect, useRef, useState } from "react";
import { RobloxEngine, type EngineCallbacks } from "./game/RobloxEngine";
import { DEFAULT_AVATAR, type AvatarColors } from "./game/Avatar";
import type { GameStats, PartMaterial, PartShape } from "./game/types";
import { PALETTE } from "./game/types";
import { buildExplorer, ExplorerTree, type ExplorerNode } from "./game/ExplorerTree";

type Tab = "explorer" | "avatar";

const COLORS: AvatarColors = { ...DEFAULT_AVATAR };

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RobloxEngine | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [won, setWon] = useState(false);
  const [tab, setTab] = useState<Tab>("explorer");
  const [colors, setColors] = useState<AvatarColors>(COLORS);
  const [explorerRoot, setExplorerRoot] = useState<ExplorerNode | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const cb: EngineCallbacks = {
      onStats: (s) => setStats(s),
      onCheckpoint: (stage) => { setMenuOpen((m) => m); },
      onCoin: () => {},
      onDeath: () => {},
      onWin: () => setWon(true),
      onLocked: () => {},
    };
    const engine = new RobloxEngine(containerRef.current, cb, colors);
    engineRef.current = engine;
    setExplorerRoot(buildExplorer(engine.parts));
    engine.setSoundFxEnabled(true);
    return () => {
      engine.dispose();
      engineRef.current = null;
      setWon(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMenu = () => {
    setMenuOpen((m) => {
      const next = !m;
      if (engineRef.current) engineRef.current.paused = next;
      return next;
    });
  };

  const restart = () => {
    engineRef.current?.fullReset();
    setWon(false);
    setMenuOpen(false);
    engineRef.current!.paused = false;
  };

  const teleport = (x: number, y: number, z: number) => {
    const e = engineRef.current;
    if (!e) return;
    e.pos.set(x, y, z);
    e.vel.set(0, 0, 0);
  };

  const applyColors = (next: AvatarColors) => {
    setColors(next);
    engineRef.current?.setAvatarColors(next);
  };

  const setPart = (i: number) => (hex: number) => {
    const next: AvatarColors = { ...colors };
    const keys: (keyof AvatarColors)[] = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", "shirt"];
    next[keys[i]] = hex;
    applyColors(next);
  };

  const setBuildColor = (hex: number) => engineRef.current?.setBuildColor(hex);
  const setBuildMaterial = (m: PartMaterial) => engineRef.current?.setBuildMaterial(m);
  const toggleBuild = () => engineRef.current?.toggleBuild();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0" />

      {/* HUD top-left: stage / coins / deaths */}
      {stats && !menuOpen && !won && (
        <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 font-mono text-[12px] text-white/90 backdrop-blur-sm">
          <div>Этап {Math.min(stats.stage + 1, stats.totalStages)}/{stats.totalStages}</div>
          <div>Монеты {stats.coins}/{stats.totalCoins}</div>
          <div>Смерти {stats.deaths} · {stats.fps} FPS</div>
        </div>
      )}

      {/* Controls hint */}
      {!menuOpen && !won && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-4 py-2 text-[11px] font-bold text-white/70 backdrop-blur-sm">
          WASD — ходьба · Shift — бег · ПКМ — камера · Space — прыжок · B — стройка
        </div>
      )}

      {/* Menu button */}
      {!menuOpen && !won && (
        <button
          type="button"
          onClick={toggleMenu}
          className="absolute top-4 right-4 rounded-xl bg-[#1ed760] px-4 py-2 text-[13px] font-extrabold text-[#05210e] shadow-[0_4px_16px_rgba(30,215,96,0.4)] hover:bg-[#2ae06c]"
        >
          Меню (Esc)
        </button>
      )}

      {/* Pause menu */}
      {menuOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[min(640px,92vw)] rounded-3xl border border-white/10 bg-[#141414] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold">Меню</h2>
              <button type="button" onClick={toggleMenu} className="rounded-full bg-white/8 px-3 py-1 text-[12px] font-bold text-white hover:bg-white/15">
                Продолжить
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              {(["explorer", "avatar"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold ${tab === t ? "bg-[#1ed760] text-[#05210e]" : "bg-white/6 text-white/70 hover:bg-white/12"}`}
                >
                  {t === "explorer" ? "Explorer" : "Аватар"}
                </button>
              ))}
            </div>

            {tab === "explorer" && explorerRoot && (
              <ExplorerTree root={explorerRoot} onTeleport={(x, y, z) => { teleport(x, y, z); }} />
            )}

            {tab === "avatar" && (
              <div className="gb-scroll max-h-[46vh] overflow-y-auto">
                {(["Голова", "Торс", "Левая рука", "Правая рука", "Левая нога", "Правая нога", "Рубашка"] as const).map((label, i) => (
                  <div key={label} className="mb-3">
                    <div className="mb-1.5 text-[12px] font-bold text-white/70">{label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {PALETTE.map((p) => (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => setPart(i)(p.hex)}
                          className={`h-7 w-7 rounded-lg ring-1 ring-white/10 transition hover:scale-110` + (Object.values(colors)[i] === p.hex ? ` ring-2 ring-[#1ed760]` : "")}
                          style={{ background: `#${p.hex.toString(16).padStart(6, "0")}` }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
              <button type="button" onClick={restart} className="rounded-xl bg-[#1ed760] px-4 py-2 text-[13px] font-extrabold text-[#05210e] hover:bg-[#2ae06c]">
                Заново
              </button>
              <button type="button" onClick={() => { engineRef.current?.respawn(false); toggleMenu(); }} className="rounded-xl bg-white/8 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/15">
                Респавн
              </button>
              <button
                type="button"
                onClick={() => { setSoundOn((s) => { engineRef.current?.setSoundFxEnabled(!s); return !s; }); }}
                className="rounded-xl bg-white/8 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/15"
              >
                {soundOn ? "🔊 Звук вкл" : "🔇 Звук выкл"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build palette quick bar */}
      {!menuOpen && !won && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/45 p-2 backdrop-blur-sm">
          <div className="flex gap-1">
            {PALETTE.slice(0, 8).map((p) => (
              <button key={p.hex} type="button" onClick={() => setBuildColor(p.hex)} className="h-6 w-6 rounded-md ring-1 ring-white/10 hover:scale-110"
                style={{ background: `#${p.hex.toString(16).padStart(6, "0")}` }} />
            ))}
          </div>
          <div className="flex gap-1">
            {(["plastic", "neon", "metal", "wood", "brick", "ice"] as PartMaterial[]).map((m) => (
              <button key={m} type="button" onClick={() => setBuildMaterial(m)} className="rounded-md bg-white/8 px-1.5 py-1 text-[9px] font-bold uppercase text-white/80 hover:bg-[#1ed760] hover:text-[#05210e]">
                {m}
              </button>
            ))}
          </div>
          <button type="button" onClick={toggleBuild} className="rounded-md bg-[#1ed760]/15 px-2 py-1 text-[10px] font-extrabold text-[#2ae06c] hover:bg-[#1ed760]/25">
            B — постройка
          </button>
        </div>
      )}

      {/* Win screen */}
      {won && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-4 text-6xl">🏆</div>
            <h1 className="mb-2 text-[34px] font-black text-white">Победа!</h1>
            {stats && <p className="mb-6 text-[15px] text-white/70">Монеты: {stats.coins} · Смерти: {stats.deaths} · Время: {stats.time.toFixed(1)} с</p>}
            <button type="button" onClick={restart} className="rounded-xl bg-[#1ed760] px-8 py-3 text-[15px] font-extrabold text-[#05210e] hover:bg-[#2ae06c]">
              Играть снова
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
