import { type Game } from "../data";
import { IconPlay, IconUsers } from "./Icons";

type Props = {
  game: Game;
  plays?: number;
  onOpen: (game: Game) => void;
  onPlay: (game: Game) => void;
  onPlayMultiplayer?: (game: Game) => void;
  compact?: boolean;
};

function metaLabel(game: Game, plays?: number): string {
  if (game.players) return game.players;
  if (plays && plays > 0) return `${plays} игр.`;
  return `Обновлено · ${game.updated}`;
}

/**
 * GreenBlox Roblox-style card: full-width tile with genre chip, hover
 * play button (#1ed760) and a meta row (creator / players or updated).
 */
export default function GameCard({ game, plays, onOpen, onPlay, onPlayMultiplayer, compact }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(game)}
      className={`group flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-[#1c1c1c] text-left ring-1 ring-white/5 transition duration-200 hover:bg-[#222] hover:ring-white/10 ${
        compact ? "w-[180px]" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[16/10]"} bg-[#111]`}>
        <img
          src={game.image}
          alt={game.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white uppercase backdrop-blur-sm">
          {game.category}
        </span>
        {onPlayMultiplayer && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayMultiplayer(game);
            }}
            className="absolute top-2 right-2 z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] opacity-0 shadow-lg shadow-black/40 transition group-hover:opacity-100 hover:scale-105"
            title="Играть вместе"
          >
            <IconUsers className="h-4 w-4" />
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(game);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] shadow-lg shadow-black/40 transition hover:scale-110"
          >
            <IconPlay className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-[14px] font-bold text-white">{game.title}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-[11.5px] text-zinc-500">{game.creator}</span>
          <span className="shrink-0 text-[11px] font-semibold text-zinc-400">
            {metaLabel(game, plays)}
          </span>
        </div>
      </div>
    </button>
  );
}
