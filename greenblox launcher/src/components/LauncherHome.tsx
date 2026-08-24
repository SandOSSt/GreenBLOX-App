import { useMemo, useState } from "react";
import type { Game } from "../data";
import { Avatar } from "./Avatar";
import { IconChevronRight, IconHeart, IconPlay, IconUsers } from "./Icons";
import GameCard from "./GameCard";

const CATEGORIES = ["Все", "RP", "Obby", "Шутер", "Хоррор", "Симулятор", "Приключения", "PvP", "Гонки"];

type Props = {
  allGames: Game[];
  recents: Game[];
  featured: Game;
  favorites: string[];
  onlineFriends: { id: string; name: string; color: string; activity?: string }[];
  onPlay: (game: Game) => void;
  onOpenGame: (game: Game) => void;
  onOpenFriend: (friend: { id: string; name: string; color: string }) => void;
  onOpenCreator: (creator: { name: string; games: Game[] }) => void;
  onOpenRecommendations?: () => void;
  onOpenStudio?: () => void;
};

function sortByPlayers(list: Game[]): Game[] {
  return [...list].sort((a, b) => {
    const pa = parseInt((a.players ?? "0").replace(/\D/g, ""), 10) || 0;
    const pb = parseInt((b.players ?? "0").replace(/\D/g, ""), 10) || 0;
    return pb - pa;
  });
}

export default function LauncherHome({
  allGames,
  recents,
  featured,
  favorites,
  onlineFriends,
  onPlay,
  onOpenGame,
  onOpenFriend,
  onOpenCreator,
  onOpenRecommendations,
  onOpenStudio,
}: Props) {
  const [category, setCategory] = useState("Все");

  const notPlayed = useMemo(() => {
    const played = new Set(recents.map((g) => g.id));
    return sortByPlayers(allGames.filter((g) => !played.has(g.id)));
  }, [allGames, recents]);

  const popular = useMemo(() => sortByPlayers(allGames), [allGames]);

  const favoriteGames = useMemo(() => {
    const favSet = new Set(favorites);
    return allGames.filter((g) => favSet.has(g.id));
  }, [allGames, favorites]);

  const byCategory = useMemo(() => {
    const list = category === "Все" ? allGames : allGames.filter((g) => g.category === category);
    return sortByPlayers(list);
  }, [allGames, category]);

  const creators = useMemo(() => {
    const seen = new Set<string>();
    const palette = ["#1ed760", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6"];
    const list: { id: string; name: string; color: string; games: Game[] }[] = [];
    for (const g of allGames) {
      if (list.length >= 4) break;
      if (!seen.has(g.creator)) {
        seen.add(g.creator);
        list.push({
          id: `creator-${g.creator}`,
          name: g.creator,
          color: palette[list.length % palette.length],
          games: allGames.filter((x) => x.creator === g.creator),
        });
      }
    }
    return list;
  }, [allGames]);

  return (
    <div className="anim-fade-up mx-auto max-w-[1240px] px-5 py-5 pb-20">
      {/* Hero */}
      <section className="relative mb-7 overflow-hidden rounded-3xl border border-white/8">
        <img src={featured.image} alt="" className="h-[300px] w-full object-cover md:h-[380px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-xl p-7 md:p-9">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-[#1ed760] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.14em] text-[#05210e] uppercase">
              Стоит попробовать
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-white/80 uppercase backdrop-blur-sm">
              {featured.category}
            </span>
          </div>
          <h1 className="text-[34px] leading-[1.04] font-extrabold tracking-tight text-white md:text-[46px]">
            {featured.title}
          </h1>
          <p className="mt-2 hidden max-w-md text-[14px] leading-relaxed text-white/80 sm:block">
            {featured.description}
          </p>
          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onPlay(featured)}
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#1ed760] px-7 text-[15px] font-extrabold text-[#05210e] shadow-[0_8px_24px_rgba(30,215,96,0.4)] transition hover:bg-[#2ae06c] active:scale-[0.98]"
            >
              <IconPlay className="h-5 w-5 fill-current" />
              Играть
            </button>
            <div className="flex items-center gap-2 text-[13px] font-bold text-white/75">
              <IconUsers className="h-4 w-4 text-[#1ed760]" />
              {featured.players ?? "Играй прямо сейчас"}
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <div className="no-scrollbar -mx-5 mb-7 flex items-center gap-2 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-xl px-4 py-2 text-[13px] font-bold transition ${
              category === c
                ? "bg-[#1ed760] text-[#05210e] shadow-[0_4px_16px_rgba(30,215,96,0.35)]"
                : "bg-white/6 text-white/60 ring-1 ring-white/8 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Друзья в игре */}
      {onlineFriends.length > 0 && (
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="text-[17px] font-extrabold">Друзья в игре</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Зайди к ним — они уже внутри</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {onlineFriends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onOpenFriend(f)}
                className="flex items-center gap-3 rounded-2xl bg-[#1c1c1c] p-3 text-left ring-1 ring-white/5 transition hover:bg-[#242424]"
              >
                <Avatar name={f.name} color={f.color} size="lg" showOnline online />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-bold">{f.name}</div>
                  <div className={`truncate text-[12px] ${f.activity?.includes("Studio") ? "text-[#7db8ff]" : "text-[#2ae06c]"}`}>
                    {f.activity || "В сети"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ты ещё не играл */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold">Ты ещё не играл</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Новое и популярное, что ждёт тебя</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {notPlayed.slice(0, 8).map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onOpenGame} />
          ))}
        </div>
      </section>

      {/* Продолжить играть */}
      {recents.length > 0 && (
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="text-[17px] font-extrabold">Продолжить играть</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Твои последние запуски</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recents.slice(0, 4).map((g) => (
              <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onOpenGame} />
            ))}
          </div>
        </section>
      )}

      {/* Избранное */}
      {favoriteGames.length > 0 && (
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="flex items-center gap-2 text-[17px] font-extrabold">
              <IconHeart className="h-4 w-4 text-[#1ed760]" />
              Избранное
            </h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Игры, которые ты отметил сердечком</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteGames.slice(0, 4).map((g) => (
              <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onOpenGame} />
            ))}
          </div>
        </section>
      )}

      {/* Популярно сейчас */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold">Популярно сейчас</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Во что играет вся GreenBlox</p>
          </div>
          {onOpenRecommendations && (
            <button
              type="button"
              onClick={onOpenRecommendations}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-[#1ed760] transition hover:text-[#2ae06c]"
            >
              Все игры
              <IconChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popular.slice(0, 8).map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onOpenGame} />
          ))}
        </div>
      </section>

      {/* Категория */}
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-[17px] font-extrabold">{category === "Все" ? "Весь каталог" : category}</h2>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {category === "Все" ? "Игры из каталога GreenBlox" : `Лучшее в категории «${category}»`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {byCategory.slice(0, 4).map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} onPlay={onOpenGame} />
          ))}
        </div>
      </section>

      {/* Создатели рядом */}
      {creators.length > 0 && (
        <section className="mb-8">
          <div className="mb-3">
            <h2 className="text-[17px] font-extrabold">Создатели рядом</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Загляни на их профили</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {creators.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpenCreator({ name: c.name, games: c.games })}
                className="group overflow-hidden rounded-2xl bg-[#1c1c1c] text-left ring-1 ring-white/5 transition hover:bg-[#242424]"
              >
                <div className="relative h-24 bg-[radial-gradient(ellipse_at_50%_30%,rgba(30,215,96,0.18),transparent_70%)] bg-[#121212]">
                  <Avatar
                    name={c.name}
                    color={c.color}
                    size="lg"
                    className="absolute bottom-0 left-4 translate-y-1/3"
                  />
                  <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-[#2ae06c] uppercase">
                    {c.games.length} игр
                  </span>
                </div>
                <div className="mt-5 px-3 pt-1 pb-3">
                  <div className="truncate text-sm font-bold">{c.name}</div>
                  <div className="truncate text-[11px] text-zinc-500">Создатель GreenBlox</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Studio CTA */}
      {onOpenStudio && (
        <section className="flex flex-col items-start justify-between gap-3 rounded-3xl bg-gradient-to-r from-[#1ed760]/15 to-transparent p-5 ring-1 ring-[#1ed760]/25 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold">Создай свою игру</h2>
            <p className="text-sm text-zinc-400">Открой GreenBlox Studio и опубликуй первое место.</p>
          </div>
          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1ed760] px-6 py-2.5 text-sm font-extrabold text-[#05210e] transition hover:bg-[#2ae06c]"
          >
            Открыть Studio
          </button>
        </section>
      )}
    </div>
  );
}
