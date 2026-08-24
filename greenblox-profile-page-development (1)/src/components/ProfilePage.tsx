import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Copy,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Share2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { getGame, getUser, type Game, type User } from "../data";
import { cn } from "../utils/cn";
import { GameCard } from "./GameCard";

function fmt(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function Card({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-[#191919] p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfilePage({
  user,
  me,
  isFriend,
  onOpenUser,
  onOpenFriends,
  onOpenGame,
  onToggleFriend,
  onToast,
  onEdit,
}: {
  user: User;
  me: User;
  isFriend: boolean;
  onOpenUser: (id: string) => void;
  onOpenFriends: () => void;
  onOpenGame: (game: Game) => void;
  onToggleFriend: () => void;
  onToast: (msg: string) => void;
  onEdit: () => void;
}) {
  const mine = user.id === me.id;
  const [menu, setMenu] = useState(false);

  const friends = useMemo(
    () => user.friendIds.map(getUser).sort((a, b) => Number(b.isOnline) - Number(a.isOnline)),
    [user],
  );
  const mutual = useMemo(
    () => (mine ? [] : friends.filter((f) => me.friendIds.includes(f.id) || f.id === me.id)),
    [friends, me, mine],
  );
  const creations = user.createdGameIds.map(getGame).filter(Boolean) as Game[];
  const favorites = user.favoriteGameIds.map(getGame).filter(Boolean) as Game[];

  return (
    <div key={user.id} className="anim-fade-up mx-auto max-w-[1440px] px-5 py-6 pb-20">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl bg-[#191919]">
          <div className="relative flex h-[420px] items-end justify-center bg-[radial-gradient(ellipse_at_50%_40%,rgba(30,215,96,0.16),transparent_58%),linear-gradient(180deg,#151515_0%,#101010_100%)]">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px]" />
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="relative z-[1] h-[92%] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)]"
              />
            ) : (
              <div
                className={cn(
                  "relative z-[1] mb-10 flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br text-7xl font-extrabold text-white shadow-2xl",
                  user.letterClass,
                )}
              >
                {user.letter}
              </div>
            )}
            <button
              type="button"
              onClick={() => onToast("Поворот аватара — скоро в студии")}
              className="absolute right-3 bottom-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-zinc-200 backdrop-blur hover:bg-black/60"
              title="Повернуть"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="border-t border-white/5 p-4">
            <button
              type="button"
              onClick={mine ? onEdit : () => onToast("Примерка будет в редакторе аватара")}
              className="w-full rounded-xl bg-[#242424] py-2.5 text-sm font-semibold text-zinc-200 hover:bg-[#2c2c2c]"
            >
              {mine ? "Настроить аватар" : "Примерить образ"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[#191919] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{user.displayName}</h1>
                {user.isVerified && (
                  <span title="Подтверждён">
                    <BadgeCheck className="h-6 w-6 fill-[#1ed760] text-black" />
                  </span>
                )}
                {user.isPremium && (
                  <span className="rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black uppercase">
                    Premium
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-zinc-500">@{user.username}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {user.isOnline ? (
                  <span className="inline-flex items-center gap-1.5 text-[#1ed760]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#1ed760]" />
                    {user.activity || "В сети"}
                  </span>
                ) : (
                  <span className="text-zinc-500">Был(а) {user.lastOnline}</span>
                )}
                {!mine && mutual.length > 0 && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="text-zinc-400">{mutual.length} общих друзей</span>
                  </>
                )}
              </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-2">
              {mine ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-4 py-2 text-sm font-semibold hover:bg-[#333]"
                >
                  <Pencil className="h-4 w-4" />
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onToggleFriend}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold",
                      isFriend
                        ? "bg-[#2a2a2a] text-white hover:bg-[#333]"
                        : "bg-[#1ed760] text-black hover:bg-[#2ae06c]",
                    )}
                  >
                    {isFriend ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {isFriend ? "В друзьях" : "Добавить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast(`Чат с ${user.displayName} скоро откроется`)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-4 py-2 text-sm font-semibold hover:bg-[#333]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Сообщение
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(`greenblox.gg/users/${user.username}`);
                  onToast("Ссылка на профиль скопирована");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#333]"
                title="Поделиться"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#333]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menu && (
                <div className="anim-pop absolute top-12 right-0 z-10 w-52 overflow-hidden rounded-xl border border-white/8 bg-[#222] py-1 shadow-xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
                    onClick={() => {
                      void navigator.clipboard?.writeText(`greenblox.gg/users/${user.username}`);
                      onToast("Ссылка скопирована");
                      setMenu(false);
                    }}
                  >
                    <Copy className="h-4 w-4" /> Копировать ссылку
                  </button>
                  {!mine && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5"
                      onClick={() => {
                        onToast("Жалоба отправлена модераторам");
                        setMenu(false);
                      }}
                    >
                      <Flag className="h-4 w-4" /> Пожаловаться
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Друзья", value: fmt(friends.length), onClick: onOpenFriends },
              { label: "Подписчики", value: fmt(user.followers) },
              { label: "Подписки", value: fmt(user.following) },
              { label: "Посещения", value: user.placeVisits },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="rounded-xl bg-[#121212] px-3 py-3 text-left hover:bg-[#161616]"
              >
                <div className="text-lg font-extrabold">{s.value}</div>
                <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                  {s.label}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">О себе</div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
              {user.about || "Пользователь ничего о себе не написал."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card
            title={`Друзья (${friends.length})`}
            action={
              <button
                type="button"
                onClick={onOpenFriends}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Смотреть всех <ChevronRight className="h-4 w-4" />
              </button>
            }
          >
            {friends.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">Пока нет друзей</div>
            ) : (
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onOpenUser(f.id)}
                    className="w-[118px] shrink-0 overflow-hidden rounded-xl bg-[#121212] text-left hover:bg-[#1c1c1c]"
                  >
                    <div className="relative h-[118px] bg-[#0d0d0d]">
                      {f.avatar ? (
                        <img src={f.avatar} alt="" className="h-full w-full object-cover object-top" />
                      ) : (
                        <div
                          className={cn(
                            "flex h-full items-center justify-center bg-gradient-to-br text-3xl font-bold text-white",
                            f.letterClass,
                          )}
                        >
                          {f.letter}
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute right-2 bottom-2 h-2.5 w-2.5 rounded-full ring-2 ring-[#121212]",
                          f.isOnline ? "bg-[#1ed760]" : "bg-zinc-500",
                        )}
                      />
                    </div>
                    <div className="px-2 py-2">
                      <div className="truncate text-xs font-semibold">{f.displayName}</div>
                      <div className="truncate text-[10px] text-zinc-500">
                        {f.isOnline ? f.activity || "В сети" : f.lastOnline}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card title="Создания">
            {creations.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">
                {mine ? "Опубликуй первую игру в Студии" : "У игрока пока нет своих игр"}
              </div>
            ) : (
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
                {creations.map((g) => (
                  <GameCard key={g.id} game={g} onOpen={onOpenGame} />
                ))}
              </div>
            )}
          </Card>

          <Card title="Избранное">
            {favorites.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">Список избранного пуст</div>
            ) : (
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
                {favorites.map((g) => (
                  <GameCard key={g.id} game={g} onOpen={onOpenGame} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Сейчас носит">
            <div className="grid grid-cols-2 gap-2">
              {user.wearing.map((item) => (
                <div key={item.id} className="rounded-xl bg-[#121212] p-3">
                  <div
                    className={cn(
                      "mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold",
                      item.tone,
                    )}
                  >
                    {item.name.slice(0, 1)}
                  </div>
                  <div className="truncate text-xs font-semibold">{item.name}</div>
                  <div className="text-[10px] text-zinc-500">{item.type}</div>
                </div>
              ))}
              {user.wearing.length === 0 && (
                <div className="col-span-2 py-6 text-center text-sm text-zinc-500">Пусто</div>
              )}
            </div>
          </Card>

          <Card title="Группы">
            {user.groups.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">Не состоит в группах</div>
            ) : (
              <div className="space-y-2">
                {user.groups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onToast(`Группа «${g.name}» откроется позже`)}
                    className="flex w-full items-center gap-3 rounded-xl bg-[#121212] p-2.5 text-left hover:bg-[#1c1c1c]"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-extrabold text-white",
                        g.tone,
                      )}
                    >
                      {g.letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{g.name}</div>
                      <div className="text-[11px] text-zinc-500">
                        {g.role} · {g.members}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card title="Статистика">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-zinc-500">
                  <Calendar className="h-4 w-4" /> Регистрация
                </span>
                <span className="font-semibold">{user.joinDate}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-zinc-500">
                  <Users className="h-4 w-4" /> Друзья
                </span>
                <span className="font-semibold">{friends.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Посещения мест</span>
                <span className="font-semibold">{user.placeVisits}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Посты</span>
                <span className="font-semibold">{user.forumPosts}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Последний онлайн</span>
                <span className="font-semibold">{user.lastOnline}</span>
              </div>
            </div>
          </Card>

          <Card title="Значки">
            {user.badges.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">Значков пока нет</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {user.badges.map((b) => (
                  <div
                    key={b.id}
                    title={b.desc}
                    className="flex flex-col items-center rounded-xl bg-[#121212] px-2 py-3 text-center"
                  >
                    <div
                      className={cn(
                        "mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-black",
                        b.tone,
                      )}
                    >
                      {b.glyph}
                    </div>
                    <div className="text-[10px] leading-tight font-semibold">{b.name}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
