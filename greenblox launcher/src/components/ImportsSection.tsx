// Embeddable "Модули движка" section for the in-game menu.
// Shows the import registry and lets the player load/unload modules live.

import { useMemo } from "react";
import { ImportInstance, ImportLanguage, listImports } from "../game/imports";
import { IconCoin } from "./MenuIcons";

function CoinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <IconCoin className={className} />;
}

function OneCShop({ instance, onBuy }: { instance: ImportInstance; onBuy: (id: string) => void }) {
  const data = instance.data as { balance: number; items: { id: string; name: string; price: number; description: string; owned?: boolean }[] };
  return (
    <div className="border-t border-white/8 bg-black/20 px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-300/80">Магазин</div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-300">
          <CoinIcon className="h-3.5 w-3.5" />
          {data.balance}
        </div>
      </div>
      <div className="space-y-1.5">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-bold text-white">{item.name}</div>
              <div className="truncate text-[10px] text-white/40">{item.description}</div>
            </div>
            <button
              type="button"
              disabled={item.owned || data.balance < item.price}
              onClick={() => onBuy(item.id)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                item.owned
                  ? "cursor-default bg-emerald-500/30 text-emerald-200"
                  : data.balance < item.price
                    ? "cursor-not-allowed bg-white/5 text-white/25"
                    : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
              }`}
            >
              {item.owned ? "✓ Куплено" : `${item.price} 🪙`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportsSection({
  loaded,
  onLoad,
  onUnload,
  on1CBuy,
}: {
  loaded: ImportInstance[];
  onLoad: (lang: ImportLanguage) => void;
  onUnload: (lang: ImportLanguage) => void;
  on1CBuy: (itemId: string) => void;
}) {
  const all = useMemo(() => listImports(), []);
  const oneC = loaded.find((l) => l.language === "1C");

  return (
    <div className="space-y-3">
      {all.map((m) => {
        const inst = loaded.find((l) => l.language === m.language);
        const on = !!inst;
        return (
          <div key={m.language} className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-start gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black" style={{ background: m.color, color: "#0b0d10" }}>
                {m.language}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <div className="truncate text-[13px] font-bold text-white">{m.name}</div>
                  <div className="text-[10px] font-mono text-white/30">v{m.version}</div>
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">{m.description}</div>
              </div>
              <button
                type="button"
                onClick={() => (on ? onUnload(m.language) : onLoad(m.language))}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                  on ? "bg-rose-500/80 text-white hover:bg-rose-500" : "bg-[#1ed760]/90 text-[#05210e] hover:bg-[#1ed760]"
                }`}
              >
                {on ? "Выгрузить" : "Загрузить"}
              </button>
            </div>
            {on && inst && inst.logs.length > 0 && (
              <div className="max-h-[110px] space-y-0.5 overflow-y-auto border-t border-white/8 bg-black/30 px-3 py-2 font-mono text-[10px] leading-[14px]">
                {inst.logs.slice(-8).map((l, i) => (
                  <div key={i} className={l.level === "ok" ? "text-emerald-300" : l.level === "warn" ? "text-amber-300" : "text-white/55"}>
                    <span className="text-white/25">[{l.t.toFixed(1)}s]</span> {l.msg}
                  </div>
                ))}
              </div>
            )}
            {on && m.language === "1C" && oneC && (
              <OneCShop instance={oneC} onBuy={on1CBuy} />
            )}
          </div>
        );
      })}
      <div className="rounded-xl border border-white/5 bg-black/20 p-2.5 font-mono text-[10px] leading-relaxed text-white/30">
        <span className="text-violet-300/80">// подсказка</span>
        <br />
        <span className="text-white/60">Lua</span> — NPC-проводник у спавна
        <br />
        <span className="text-white/60">1C</span> — бухгалтерия монет + магазин
        <br />
        <span className="text-white/60">Esc</span> — закрыть меню
      </div>
    </div>
  );
}
