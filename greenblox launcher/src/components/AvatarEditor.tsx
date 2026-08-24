// Reusable avatar editor body (body-part chips + color palette).
// Used inside the standalone AvatarPanel overlay and inside the GameMenu.
// Keeps a single source of truth for the R6 look editing UI.

import { useState } from "react";
import type { AvatarColors } from "../game/Avatar";

const AVATAR_PARTS: { key: keyof AvatarColors; label: string }[] = [
  { key: "head", label: "Голова" },
  { key: "torso", label: "Торс" },
  { key: "shirt", label: "Рубашка" },
  { key: "leftArm", label: "Л. рука" },
  { key: "rightArm", label: "П. рука" },
  { key: "leftLeg", label: "Л. нога" },
  { key: "rightLeg", label: "П. нога" },
];

const PALETTE: { name: string; hex: number }[] = [
  { name: "Ярко-красный", hex: 0xc4281c },
  { name: "Ярко-синий", hex: 0x0a52a0 },
  { name: "Ярко-жёлтый", hex: 0xf5cd30 },
  { name: "Ярко-зелёный", hex: 0x4b974b },
  { name: "Оранжевый", hex: 0xd87c3b },
  { name: "Фиолетовый", hex: 0x6b327c },
  { name: "Лайм", hex: 0xa1c823 },
  { name: "Бирюза", hex: 0x12a89d },
  { name: "Розовый", hex: 0xe8a1c4 },
  { name: "Белый", hex: 0xf2f3f3 },
  { name: "Серый", hex: 0xa3a2a5 },
  { name: "Чёрный", hex: 0x1b2a35 },
];

function hex(n: number) {
  return "#" + n.toString(16).padStart(6, "0");
}

export function AvatarEditor({
  colors,
  onChange,
}: {
  colors: AvatarColors;
  onChange: (c: AvatarColors) => void;
}) {
  const [selected, setSelected] = useState<keyof AvatarColors>("torso");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {AVATAR_PARTS.map((part) => (
          <button
            key={part.key}
            type="button"
            onClick={() => setSelected(part.key)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-all ${
              selected === part.key
                ? "bg-[#1ed760] text-[#05210e]"
                : "bg-white/6 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded" style={{ background: hex(colors[part.key]) }} />
            {part.label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-6 gap-2">
        {PALETTE.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            onClick={() => onChange({ ...colors, [selected]: c.hex })}
            className={`aspect-square rounded-2xl border-2 transition-all hover:scale-105 ${
              colors[selected] === c.hex ? "border-white ring-2 ring-[#1ed760]/40" : "border-white/5"
            }`}
            style={{ background: hex(c.hex) }}
          />
        ))}
      </div>
    </div>
  );
}
