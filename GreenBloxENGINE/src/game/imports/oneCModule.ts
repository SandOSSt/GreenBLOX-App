// `import 1C` — adds a coin shop / economy ledger.
// 1C is famous for accounting software, so this module gives GreenBlox
// a tiny accounting-style economy: every coin you collect is recorded into
// a ledger ("проводка"), and a Shop button lets you spend coins on perks.
//
// Hooks into the engine's coin events and exposes shop API for the UI.

import { registerImport, pushLog } from "./registry";
import type { RobloxEngine } from "../RobloxEngine";

export interface LedgerEntry {
  t: number;        // game time
  delta: number;    // + income, - expense
  balance: number;
  note: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  apply: (engine: RobloxEngine) => void;
  owned?: boolean;
}

registerImport({
  language: "1C",
  name: "Buhgalteriya.1c",
  description: "Coin ledger and in-game shop powered by 1C accounting.",
  version: "8.3.21",
  color: "#f5cd30",
  install: (engine: RobloxEngine) => {
    // --- Shop catalog (perks that tweak engine constants live) ---
    const items: ShopItem[] = [
      {
        id: "speed_boost",
        name: "Speed Boots",
        price: 3,
        description: "+25% walk speed forever.",
        apply: (e) => {
          (e as any).__walkSpeedMult = ((e as any).__walkSpeedMult ?? 1) * 1.25;
        },
      },
      {
        id: "jump_boost",
        name: "Jump Spring",
        price: 4,
        description: "+20% jump height.",
        apply: (e) => {
          (e as any).__jumpMult = ((e as any).__jumpMult ?? 1) * 1.2;
        },
      },
      {
        id: "gravity_low",
        name: "Helium Backpack",
        price: 6,
        description: "Reduce gravity by 20% (floatier jumps).",
        apply: (e) => {
          (e as any).__gravMult = ((e as any).__gravMult ?? 1) * 0.8;
        },
      },
    ];

    const state = {
      balance: 0,
      ledger: [] as LedgerEntry[],
      items,
      lastCoinCount: engine.coins,
    };

    const inst: any = {
      id: "1C_Buhgalteriya",
      language: "1C" as const,
      name: "Buhgalteriya.1c",
      description: "Coin ledger and in-game shop powered by 1C accounting.",
      version: "8.3.21",
      color: "#f5cd30",
      logs: [],
      data: state,
      detach: () => {
        const arr = (engine as any).__userUpdaters as Array<(dt: number) => void> | undefined;
        if (arr) {
          const i = arr.indexOf(coinWatcher);
          if (i >= 0) arr.splice(i, 1);
        }
        // Reset gameplay multipliers
        (engine as any).__walkSpeedMult = 1;
        (engine as any).__jumpMult = 1;
        (engine as any).__gravMult = 1;
      },
    };

    pushLog(inst, "Конфигурация загружена · 'Бухгалтерия' v8.3.21", "ok");
    pushLog(inst, "Счёт 50.01 (Касса) открыт · баланс = 0", "info");

    // Watch coin pickups and post them to the ledger.
    const coinWatcher = (_dt: number) => {
      if (engine.coins > state.lastCoinCount) {
        const delta = engine.coins - state.lastCoinCount;
        state.lastCoinCount = engine.coins;
        state.balance += delta;
        const entry: LedgerEntry = {
          t: engine["elapsed"] ?? 0,
          delta,
          balance: state.balance,
          note: `Дт 50.01 Кт 90.01 · поступление монет`,
        };
        state.ledger.push(entry);
        if (state.ledger.length > 40) state.ledger.shift();
        pushLog(inst, `+${delta} монет · баланс = ${state.balance}`, "ok");
      } else if (engine.coins < state.lastCoinCount) {
        // Player reset; sync silently
        state.lastCoinCount = engine.coins;
      }
    };

    const arr = ((engine as any).__userUpdaters ||= []) as Array<(dt: number) => void>;
    arr.push(coinWatcher);

    // Public shop API used by the React UI.
    (inst as any).buy = (itemId: string) => {
      const it = state.items.find((x) => x.id === itemId);
      if (!it || it.owned) return false;
      if (state.balance < it.price) {
        pushLog(inst, `Недостаточно средств для "${it.name}"`, "warn");
        return false;
      }
      state.balance -= it.price;
      it.owned = true;
      state.ledger.push({
        t: engine["elapsed"] ?? 0,
        delta: -it.price,
        balance: state.balance,
        note: `Дт 41 Кт 50.01 · покупка "${it.name}"`,
      });
      it.apply(engine);
      pushLog(inst, `Куплено: "${it.name}" за ${it.price} монет`, "ok");
      return true;
    };

    return inst;
  },
});
