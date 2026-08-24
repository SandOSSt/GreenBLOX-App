import { Play } from "lucide-react";
import type { Game } from "../data";
import { playingLabel } from "../data";
import { cn } from "../utils/cn";

export function GameCard({
  game,
  onOpen,
  compact,
}: {
  game: Game;
  onOpen: (game: Game) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(game)}
      className={cn(
        "group flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl bg-[#191919] text-left transition hover:bg-[#222]",
        compact && "w-[180px]",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
          {game.genre}
        </span>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg shadow-black/40">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-sm font-semibold text-white">{game.title}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-zinc-500">{game.creator}</span>
          <span className="shrink-0 text-[11px] text-zinc-600">{playingLabel(game.playing)}</span>
        </div>
      </div>
    </button>
  );
}
