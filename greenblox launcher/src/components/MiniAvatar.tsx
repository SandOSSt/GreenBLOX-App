// Tiny circular letter-avatar used across the in-game menu (players/chat).

export function MiniAvatar({
  name,
  color,
  size = 36,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const letter = (name.trim()[0] || "?").toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(150deg, ${color}, ${color}55 60%, #141414)`,
      }}
    >
      {letter}
    </span>
  );
}
