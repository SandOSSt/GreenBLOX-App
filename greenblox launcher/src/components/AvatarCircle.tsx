import { statusColor } from "../social/useSocial";
import { IconHammer, IconGamepad } from "./Icons";

type Props = {
  name: string;
  color: string;
  size?: number;
  /** Green/grey status dot at bottom-right. */
  status?: string;
};

export default function AvatarCircle({ name, color, size = 44, status }: Props) {
  const letter = (name.trim()[0] || "?").toUpperCase();
  const dotSize = Math.max(10, size * 0.22);
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className="flex items-center justify-center rounded-full font-extrabold text-white"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          background: `linear-gradient(150deg, ${color}, ${color}55 60%, #141414)`,
          boxShadow: status && status !== "offline" ? `0 0 12px ${statusColor(status)}66` : "none",
        }}
      >
        {letter}
      </span>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-[#151515]"
          style={{
            width: dotSize,
            height: dotSize,
            background: statusColor(status),
            boxShadow: status !== "offline" ? `0 0 8px ${statusColor(status)}` : "none",
          }}
        >
          {/* Статус-бейдж, как в Roblox: строитель — синий молоток, игрок — геймпад. */}
          {status === "in_studio" && <IconHammer className="h-[62%] w-[62%] text-white" strokeWidth={2.6} />}
          {status === "in_game" && <IconGamepad className="h-[62%] w-[62%] text-black" strokeWidth={2.6} />}
        </span>
      )}
    </span>
  );
}
