import { cn } from "../utils/cn";
import { statusColor } from "../social/useSocial";
import { IconHammer, IconGamepad } from "./Icons";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const sizes: Record<Size, number> = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 64,
  xl: 96,
  hero: 256,
};

const textSizes: Record<Size, number> = {
  xs: 13,
  sm: 16,
  md: 19,
  lg: 26,
  xl: 38,
  hero: 96,
};

/**
 * GreenBlox profile-page-development avatar: rounded-full circle with a
 * two-tone gradient derived from the user's accent color, an optional
 * online dot, and an optional image overlay.
 */
export function Avatar({
  name,
  color = "#1ed760",
  size = "md",
  className,
  showOnline,
  online,
  image,
  status,
}: {
  name: string;
  color?: string;
  size?: Size;
  className?: string;
  showOnline?: boolean;
  online?: boolean;
  image?: string;
  /** Живой статус GreenBlox: рисует синий молоток (in_studio) или геймпад
   *  (in_game) в точке статуса, как в Roblox. */
  status?: string;
}) {
  const px = sizes[size];
  const letter = (name.trim()[0] || "?").toUpperCase();
  const withStatusBadge = status === "in_studio" || status === "in_game";
  const dotColor = status && status !== "offline" ? statusColor(status) : online ? "#1ed760" : "#52525b";
  const dotSizeCls =
    size === "xs" || size === "sm" ? "h-2.5 w-2.5" : size === "lg" || size === "xl" ? "h-4 w-4" : "h-3.5 w-3.5";
  const iconSizeCls =
    size === "xs" || size === "sm" ? "h-[68%] w-[68%]" : size === "lg" || size === "xl" ? "h-[72%] w-[72%]" : "h-[70%] w-[70%]";

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <span
        className="flex items-center justify-center overflow-hidden rounded-full font-extrabold text-white"
        style={{
          width: px,
          height: px,
          fontSize: textSizes[size],
          background: `linear-gradient(150deg, ${color}, ${color}55 60%, #141414)`,
          boxShadow: `inset 0 -6px 16px rgba(0,0,0,0.35)`,
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-[center_12%]"
          />
        ) : (
          letter
        )}
      </span>
      {showOnline && (
        <span
          className={cn(
            "absolute right-0 bottom-0 flex items-center justify-center rounded-full border-2 border-[#141414]",
            dotSizeCls
          )}
          style={{
            background: dotColor,
            boxShadow: online || (status && status !== "offline") ? `0 0 8px ${dotColor}` : "none",
          }}
        >
          {/* Статус-бейдж как в Roblox: строитель — синий молоток, игрок — геймпад. */}
          {withStatusBadge && status === "in_studio" && (
            <IconHammer className={`${iconSizeCls} text-white`} strokeWidth={2.6} />
          )}
          {withStatusBadge && status === "in_game" && (
            <IconGamepad className={`${iconSizeCls} text-black`} strokeWidth={2.6} />
          )}
        </span>
      )}
    </div>
  );
}
