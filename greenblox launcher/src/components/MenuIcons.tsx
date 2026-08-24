// Shared icon set for the GreenBlox in-game menu.

import type { ReactNode } from "react";

type IconProps = { className?: string; strokeWidth?: number };

function Svg({
  className,
  children,
  filled = false,
  strokeWidth = 2.4,
}: IconProps & { children: ReactNode; filled?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconUsers({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 18.5c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M16 14.4c2 .3 3.6 1.6 4.3 4.1" />
    </Svg>
  );
}

export function IconAvatar({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function IconWorld({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </Svg>
  );
}

export function IconCpu({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </Svg>
  );
}

export function IconChat({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 18.5 4 21v-5.2A8.5 8.5 0 1 1 12 20.5c-1.1 0-2.2-.2-3.2-.6z" />
    </Svg>
  );
}

export function IconGear({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} strokeWidth={2.2}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
    </Svg>
  );
}

export function IconHelp({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9a2.8 2.8 0 0 1 5.6 0c0 1.7-2.8 2.1-2.8 3.9" />
      <circle cx="12" cy="17.4" r="0.7" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconLeave({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
      <path d="M15 12H4m0 0 3-3M4 12l3 3" />
    </Svg>
  );
}

export function IconRespawn({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  );
}

export function IconRestart({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Svg>
  );
}

export function IconResume({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className} filled>
      <path d="M6 4l14 8-14 8z" />
    </Svg>
  );
}

export function IconCoin({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" fill="rgba(250,204,21,0.2)" />
      <path d="M12 8v8M14.5 10.5H11a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3h-3.5" />
    </Svg>
  );
}

export function IconSkull({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM13 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0z" fill="currentColor" />
      <path d="M12 2a9 9 0 0 0-9 9c0 2 .5 3.5 1.5 5v3c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3c1-1.5 1.5-3 1.5-5a9 9 0 0 0-9-9z" fill="rgba(244,63,94,0.15)" />
    </Svg>
  );
}

export function IconClock({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function IconFlag({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="rgba(52,211,153,0.15)" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </Svg>
  );
}

export function IconSend({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m4 11 16-7-7 16-2.2-6.8z" />
    </Svg>
  );
}

export function IconX({ className = "h-4 w-4" }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Svg>
  );
}

/** GreenBlox logo mark: green rounded square with a white triangle. */
export function LogoMark({
  className = "h-9 w-9",
  rounded = "rounded-[10px]",
}: IconProps & { rounded?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#1ed760] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] ${rounded} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[52%] w-[52%] text-white" fill="currentColor">
        <path d="M12 5.2 19.4 18.2H4.6L12 5.2z" />
      </svg>
    </span>
  );
}
