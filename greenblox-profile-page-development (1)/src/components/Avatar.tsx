import { cn } from "../utils/cn";
import type { User } from "../data";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const sizes: Record<Size, string> = {
  xs: "h-8 w-8 text-[11px]",
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
  hero: "h-full w-full text-6xl",
};

export function Avatar({
  user,
  size = "md",
  className,
  showOnline,
  cropped,
}: {
  user: User;
  size?: Size;
  className?: string;
  showOnline?: boolean;
  cropped?: boolean;
}) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-gradient-to-br",
          user.letterClass,
          sizes[size],
          size === "hero" && "rounded-none",
        )}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName}
            className={cn(
              "h-full w-full object-cover",
              cropped ? "object-[center_12%]" : "object-top",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-white">
            {user.letter}
          </div>
        )}
      </div>
      {showOnline && (
        <span
          className={cn(
            "absolute right-0 bottom-0 rounded-full ring-2 ring-[#191919]",
            size === "xs" || size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
            user.isOnline ? "bg-[#1ed760]" : "bg-zinc-500",
          )}
        />
      )}
    </div>
  );
}
