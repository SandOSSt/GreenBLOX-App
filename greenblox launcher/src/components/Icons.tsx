import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconCompass = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 6-6 2 2-6z" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconChat = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 18.5 4 21v-5.2A8.5 8.5 0 1 1 12 20.5c-1.1 0-2.2-.2-3.2-.6z" />
  </svg>
);

export const IconShop = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.81 21H8.19a2 2 0 0 1-1.99-1.8z" />
    <path d="M8 8V7a4 4 0 0 1 8 0v1" />
  </svg>
);

export const IconBox = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 8.5 12 4l8.5 4.5v9L12 22l-8.5-4.5z" />
    <path d="M12 12.5 3.5 8.5M12 12.5V22M12 12.5l8.5-4" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9.5a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13.5 6 9.5" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconPlay = (p: IconProps) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 18.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16 14.2c2 .3 3.6 1.5 4.3 4.3" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.2.6a8 8 0 0 0-1.7-1L15.2 2h-6.4l-.4 2.8a8 8 0 0 0-1.7 1L4.5 6.4l-2 3.4 2 1.2a7.8 7.8 0 0 0 .1 2l-2 1.2 2 3.4 2.2-.6a8 8 0 0 0 1.7 1l.4 2.8h6.4l.4-2.8a8 8 0 0 0 1.7-1l2.2.6 2-3.4z" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
    <path d="M15 12H4m0 0 3-3M4 12l3 3" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 19.2c.8-3.4 3.3-5 7-5s6.2 1.6 7 5" />
  </svg>
);

export const IconX = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3.5 2.4 5.3 5.8.6-4.4 3.8 1.3 5.6L12 16.2 6.9 18.8l1.3-5.6L3.8 9.4l5.8-.6z" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.2 2" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconVolume = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10h3.2L12 6.5v11L7.2 14H4z" />
    <path d="M16 9.2a4 4 0 0 1 0 5.6M18.4 7a7 7 0 0 1 0 10" />
  </svg>
);

export const IconMonitor = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
    <path d="M8 20h8M12 16.5V20" />
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4 11 16-7-7 16-2.2-6.8z" />
  </svg>
);

export const IconGamepad = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 8h10a5 5 0 0 1 4.8 6.4l-.8 2.4A3 3 0 0 1 18.1 19h-1.6a2 2 0 0 1-1.8-1.1L14 16H10l-.7 1.9A2 2 0 0 1 7.5 19H5.9a3 3 0 0 1-2.9-2.2l-.8-2.4A5 5 0 0 1 7 8z" />
    <path d="M8.5 12h3M10 10.5v3" />
    <path d="M15.4 11.2h.1M17.2 13h.1" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5 19 6.2v5.6c0 4.4-3 7.3-7 8.7-4-1.4-7-4.3-7-8.7V6.2z" />
  </svg>
);

export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconPalette = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="8" cy="10" r="1.2" fill="currentColor" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
    <circle cx="16" cy="10" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="14.5" r="1.2" fill="currentColor" />
  </svg>
);

export const IconTrophy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" />
    <path d="M12 17v4M8 21h8" />
  </svg>
);

/** Молоток строителя (статус «Создаёт миры в Studio»). */
export const IconHammer = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 3 6 6-3.5 1.5-4-4z" />
    <path d="M13.5 9.5 4 19l1 1 9.5-9.5" />
    <path d="M9.5 16.5l-2.2-2.2" />
  </svg>
);

export const IconShare = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

export const IconSparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5 10.1 8.6Z" />
    <path d="m19 17 .9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z" />
  </svg>
);

export const IconActivity = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[14px] bg-[#1ed760] ${className}`}
    >
      <img src="/favicon.svg" alt="GreenBlox" className="h-full w-full object-cover" />
    </div>
  );
}
