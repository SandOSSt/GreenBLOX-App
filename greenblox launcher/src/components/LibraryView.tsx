import { useMemo, useState } from "react";
import type { Game } from "../data";
import { IconPlus } from "./Icons";
import GameCard from "./GameCard";

const CATEGORIES = ["Все", "RP", "Obby", "Шутер", "Хоррор", "Симулятор", "Приключения", "PvP", "Гонки"];

type Props = {
  title: string;
  subtitle: string;
  games: Game[];
  onOpenGame: (game: Game) => void;
  onPlay: (game: Game) => void;
  onOpenStudio?: () => void;
};

/**
 * Full catalog grid with category chips — used by "Рекомендации" and
 * "Магазин" tabs in the launcher.
 */
export default function LibraryView({
  title,
  subtitle,
  games,
  onOpenGame,
  onPlay,
  onOpenStudio,
}: Props) {
  const [category, setCategory] = useState("Все");

  const filtered = useMemo(
    () => (category === "Все" ? games : games.filter((g) => g.category === category)),
    [games, category]
  );

  return (
    <div className="anim-fade-up mx-auto max-w-[1320px] px-5 py-6 pb-20">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>

      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-lg px-4 py-2 text-[13px] font-bold transition ${
              category === c
                ? "bg-[#1ed760] text-[#05210e]"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#141414] py-16 text-center text-[13px] text-zinc-500">
          В этой категории пока пусто
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onPlay} />
          ))}
        </div>
      )}

      {onOpenStudio && (
        <section className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#191919] p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold">Не нашёл нужную игру?</h2>
            <p className="text-sm text-zinc-500">
              Создай свой плейс в GreenBlox Studio и опубликуй его в каталоге.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1ed760] px-5 py-2.5 text-sm font-bold text-[#05210e] transition hover:bg-[#2ae06c]"
          >
            <IconPlus className="h-4 w-4" />
            Открыть Studio
          </button>
        </section>
      )}
    </div>
  );
}
