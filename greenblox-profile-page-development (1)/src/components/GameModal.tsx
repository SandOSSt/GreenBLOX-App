import { Play, Star, Users, X } from "lucide-react";
import { getUser, playingLabel, type Game } from "../data";

export function GameModal({
  game,
  onClose,
  onPlay,
  onOpenCreator,
}: {
  game: Game;
  onClose: () => void;
  onPlay: () => void;
  onOpenCreator?: (id: string) => void;
}) {
  const creator = game.creatorId ? getUser(game.creatorId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="anim-pop w-full max-w-2xl overflow-hidden rounded-3xl border border-white/8 bg-[#161616] shadow-2xl">
        <div className="relative h-56">
          <img src={game.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5">
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white uppercase">
              {game.genre}
            </span>
            <h2 className="mt-1 text-3xl font-extrabold">{game.title}</h2>
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#1ed760]" />
              {playingLabel(game.playing)}
            </span>
            <span>{game.visits} посещений</span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {game.rating}%
            </span>
            {creator ? (
              <button
                type="button"
                onClick={() => onOpenCreator?.(creator.id)}
                className="text-zinc-300 hover:text-white"
              >
                от {creator.displayName}
              </button>
            ) : (
              <span>от {game.creator}</span>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{game.description}</p>
          <button
            type="button"
            onClick={onPlay}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ae06c]"
          >
            <Play className="h-4 w-4 fill-current" />
            Играть
          </button>
        </div>
      </div>
    </div>
  );
}
