import { Play } from "lucide-react";
import { GAMES, getUser, type Game, type User } from "../data";
import { GameCard } from "./GameCard";
import { Avatar } from "./Avatar";

export function HomePage({
  friends,
  onOpenGame,
  onOpenUser,
}: {
  friends: User[];
  onOpenGame: (game: Game) => void;
  onOpenUser: (id: string) => void;
}) {
  const featured = GAMES[0];
  const onlineFriends = friends.filter((f) => f.isOnline && f.activity);

  return (
    <div className="anim-fade-up mx-auto max-w-[1440px] space-y-8 px-5 py-5 pb-16">
      <section className="relative overflow-hidden rounded-[22px]">
        <img src={featured.image} alt="" className="h-[340px] w-full object-cover md:h-[380px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-lg p-8 md:p-10">
          <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#1ed760] uppercase">
            Стоит попробовать
          </div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {featured.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-200/90">{featured.description}</p>
          <button
            type="button"
            onClick={() => onOpenGame(featured)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#2ae06c]"
          >
            <Play className="h-4 w-4 fill-current" />
            Играть
          </button>
        </div>
      </section>

      {onlineFriends.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-bold">Друзья в игре</h2>
          <p className="mb-4 text-sm text-zinc-500">Зайди к ним — они уже внутри</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {onlineFriends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onOpenUser(f.id)}
                className="flex min-w-[260px] items-center gap-3 rounded-2xl bg-[#191919] p-3 text-left hover:bg-[#222]"
              >
                <Avatar user={f} size="lg" showOnline cropped />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{f.displayName}</div>
                  <div className="truncate text-xs text-[#1ed760]">{f.activity}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-lg font-bold">Ты ещё не играл</h2>
        <p className="mb-4 text-sm text-zinc-500">Игры, которые ты пока не запускал</p>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {GAMES.map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">Популярное сегодня</h2>
        <p className="mb-4 text-sm text-zinc-500">То, во что заходят чаще всего</p>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {[...GAMES].sort((a, b) => b.playing - a.playing).map((g) => (
            <GameCard key={g.id} game={g} onOpen={onOpenGame} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">Создатели рядом</h2>
        <p className="mb-4 text-sm text-zinc-500">Загляни на их профили</p>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {["luna", "pixel", "aether", "cube"].map((id) => {
            const u = getUser(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onOpenUser(id)}
                className="w-[160px] shrink-0 overflow-hidden rounded-2xl bg-[#191919] text-left hover:bg-[#222]"
              >
                <div className="relative h-36 bg-[#111]">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className={`flex h-full items-center justify-center bg-gradient-to-br text-4xl font-bold ${u.letterClass}`}>
                      {u.letter}
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <div className="truncate text-sm font-semibold">{u.displayName}</div>
                  <div className="text-[11px] text-zinc-500">@{u.username}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
