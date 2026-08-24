import { useState, type ReactNode } from "react";
import type { Badge, Game, Friend, PlayStat, ProfileData, ProfileStats, UserLevel } from "./types";
import {
  IconActivity,
  IconBox,
  IconClock,
  IconEdit,
  IconMail,
  IconShare,
  IconShield,
  IconTrophy,
  IconUsers,
} from "./Icons";
import GameCard from "./GameCard";
import CreatorProjectCard, { type CreatorProjectCardInfo } from "./CreatorProjectCard";
import { coverStyleOf } from "./coverStyles";

type Tab = "overview" | "badges" | "friends" | "inventory";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

export function UserAvatar({
  name,
  color,
  size = 64,
  className,
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(150deg, ${color}, ${color}66 60%, #141414)`,
      }}
    >
      {(name.trim()[0] || "?").toUpperCase()}
    </span>
  );
}

type Props = {
  profile: ProfileData;
  email: string;
  userLevel: UserLevel;
  badges: Badge[];
  stats: ProfileStats;
  favoriteGame: Game | null;
  recent: Game[];
  friends: Friend[];
  playStats: Record<string, PlayStat>;
  /** Карты, созданные этим игроком в студии (секция «Карты создателя»). */
  creatorProjects?: CreatorProjectCardInfo[];
  /** Может ли текущий зритель ставить лайки (нужен вход). */
  canLike?: boolean;
  onOpenGame: (g: Game) => void;
  onMessageFriend: (f: Friend) => void;
  onEditInSettings: () => void;
  onCopyLink: () => void;
  onOpenFriend: (f: Friend) => void;
  onPlayCreatorProject?: (project: CreatorProjectCardInfo) => void;
  onToggleCreatorProjectLike?: (project: CreatorProjectCardInfo) => void;
};

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-[#191919] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function SocialProfileView({
  profile,
  email,
  userLevel,
  badges,
  stats,
  favoriteGame,
  recent,
  friends,
  playStats,
  creatorProjects = [],
  canLike = false,
  onOpenGame,
  onEditInSettings,
  onCopyLink,
  onOpenFriend,
  onPlayCreatorProject,
  onToggleCreatorProjectLike,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [menu, setMenu] = useState(false);

  const joinedDate = new Date(stats.joinedAt).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

  const levelPct =
    userLevel.maxXp > 0 ? Math.min(100, Math.round((userLevel.currentXp / userLevel.maxXp) * 100)) : 0;

  return (
    <div key={profile.name} className="anim-fade-up mx-auto max-w-[1440px] px-5 py-6 pb-20">
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left: avatar column */}
        <div className="overflow-hidden rounded-2xl bg-[#191919]">
          <div
            className="relative flex h-[420px] items-end justify-center"
            style={{ background: coverStyleOf(profile.coverStyle) }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative z-[1] mb-10 flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br text-7xl font-extrabold text-white shadow-2xl">
              <UserAvatar name={profile.name} color={profile.avatarColor} size={176} />
            </div>
          </div>
          <div className="border-t border-white/5 p-4">
            <button
              type="button"
              onClick={onEditInSettings}
              className="w-full rounded-xl bg-[#242424] py-2.5 text-sm font-semibold text-zinc-200 hover:bg-[#2c2c2c]"
            >
              Настроить профиль
            </button>
          </div>
        </div>

        {/* Right: info column */}
        <div className="rounded-2xl bg-[#191919] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">{profile.name || "Без имени"}</h1>
                <span title="Подтверждён">
                  <IconShield className="h-6 w-6 fill-[#1ed760] text-black" />
                </span>
                <span className="rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black uppercase">
                  Premium
                </span>
              </div>
              <div className="mt-1 text-sm text-zinc-500">{profile.handle || "@user"}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-[#1ed760]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#1ed760]" />
                  {profile.statusQuote || "В сети"}
                </span>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-400">Уровень {userLevel.level}</span>
              </div>

              {/* XP-бар уровня, как на странице профиля друга */}
              <div className="mt-3 w-full max-w-[280px]">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#1ed760]">Уровень {userLevel.level}</span>
                  <span className="text-zinc-500">{fmt(userLevel.xp)} XP</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                    style={{ width: `${levelPct}%` }}
                  />
                </div>
                <div className="mt-0.5 text-right text-[10px] text-zinc-600">
                  {fmt(userLevel.currentXp)} / {fmt(userLevel.maxXp)} XP
                </div>
              </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onEditInSettings}
                className="inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-4 py-2 text-sm font-semibold hover:bg-[#333]"
              >
                <IconEdit className="h-4 w-4" />
                Редактировать
              </button>
              <button
                type="button"
                onClick={onCopyLink}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#333]"
                title="Поделиться"
              >
                <IconShare className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#333]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <circle cx="5" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="19" cy="12" r="1.6" />
                </svg>
              </button>
              {menu && (
                <div className="anim-pop absolute top-12 right-0 z-10 w-52 overflow-hidden rounded-xl border border-white/8 bg-[#222] py-1 shadow-xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
                    onClick={onCopyLink}
                  >
                    <IconShare className="h-4 w-4" /> Копировать ссылку
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Друзья", value: fmt(stats.friends), onClick: () => setActiveTab("friends") },
              { label: "Запусков игр", value: fmt(stats.totalPlays) },
              { label: "Игр опробовано", value: fmt(stats.gamesPlayed) },
              { label: "В избранном", value: fmt(stats.favorites) },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="rounded-xl bg-[#121212] px-3 py-3 text-left hover:bg-[#161616]"
              >
                <div className="text-lg font-extrabold">{s.value}</div>
                <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{s.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">О себе</div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
              {profile.bio || "Пользователь ничего о себе не написал."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <IconMail className="h-3.5 w-3.5" /> {email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" /> В GreenBlox с {joinedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconTrophy className="h-3.5 w-3.5" /> XP {fmt(userLevel.xp)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mb-4 mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "overview" as Tab, label: "Обзор", Icon: IconActivity },
          { id: "badges" as Tab, label: `Значки (${badges.filter((b) => b.unlocked).length})`, Icon: IconTrophy },
          { id: "friends" as Tab, label: `Друзья (${friends.length})`, Icon: IconUsers },
          { id: "inventory" as Tab, label: "Инвентарь", Icon: IconBox },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-[#1ed760] text-black" : "bg-[#2a2a2a] text-zinc-300 hover:bg-[#333] hover:text-white"
              }`}
            >
              <tab.Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Card
              title={`Друзья (${friends.length})`}
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab("friends")}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Смотреть всех →
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
                      onClick={() => onOpenFriend(f)}
                      className="w-[118px] shrink-0 overflow-hidden rounded-xl bg-[#121212] text-left hover:bg-[#1c1c1c]"
                    >
                      <div className="relative flex h-[118px] items-center justify-center bg-[#0d0d0d]">
                        <UserAvatar name={f.name} color={f.color} size={64} />
                      </div>
                      <div className="px-2 py-2">
                        <div className="truncate text-xs font-semibold">{f.name}</div>
                        <div className="truncate text-[10px] text-zinc-500">В друзьях</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Недавняя активность">
              {recent.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">Нет истории игр</div>
              ) : (
                <div className="space-y-2">
                  {recent.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onOpenGame(g)}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-[#121212] p-3 hover:bg-[#161616]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img src={g.image} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{g.title}</div>
                          <div className="text-xs text-zinc-500">{g.creator}</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-bold text-[#1ed760]">{playStats[g.id]?.count ?? 0} запусков</div>
                        <div className="text-[11px] text-zinc-600">
                          {playStats[g.id]?.last ? timeAgo(playStats[g.id].last) : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Любимые места">
              {favoriteGame ? (
                <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
                  <GameCard game={favoriteGame} compact plays={playStats[favoriteGame.id]?.count} onOpen={onOpenGame} onPlay={onOpenGame} />
                  {recent.slice(0, 3).filter((g) => g.id !== favoriteGame.id).map((g) => (
                    <GameCard key={g.id} game={g} compact plays={playStats[g.id]?.count} onOpen={onOpenGame} onPlay={onOpenGame} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-zinc-500">Список избранного пуст</div>
              )}
            </Card>

            {creatorProjects.length > 0 && (
              <Card title={`Карты создателя (${creatorProjects.length})`}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {creatorProjects.slice(0, 6).map((project) => (
                    <CreatorProjectCard
                      key={project.id}
                      project={project}
                      canLike={canLike}
                      onPlay={onPlayCreatorProject ?? (() => {})}
                      onToggleLike={onToggleCreatorProjectLike ?? (() => {})}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card title="Сейчас носит">
              <div className="grid grid-cols-2 gap-2">
                {badges.length === 0 ? (
                  <div className="col-span-2 py-6 text-center text-sm text-zinc-500">Пусто</div>
                ) : (
                  badges.slice(0, 6).map((b) => (
                    <div key={b.id} className="rounded-xl bg-[#121212] p-3">
                      <div
                        className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                        style={{ background: `${b.color}33`, color: b.color }}
                      >
                        {b.icon}
                      </div>
                      <div className="truncate text-xs font-semibold">{b.title}</div>
                      <div className="text-[10px] text-zinc-500">Значок</div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Группы">
              <div className="py-6 text-center text-sm text-zinc-500">Группы появятся позже</div>
            </Card>

            <Card title="Статистика">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-zinc-500">
                    <IconClock className="h-4 w-4" /> Регистрация
                  </span>
                  <span className="font-semibold">{joinedDate}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-zinc-500">
                    <IconUsers className="h-4 w-4" /> Друзья
                  </span>
                  <span className="font-semibold">{friends.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">Запусков</span>
                  <span className="font-semibold">{stats.totalPlays}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">XP</span>
                  <span className="font-semibold">{fmt(userLevel.xp)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">Уровень</span>
                  <span className="font-semibold">{userLevel.level}</span>
                </div>
              </div>
            </Card>

            <Card title="Значки">
              {badges.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-500">Значков пока нет</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      title={b.description}
                      className={`flex flex-col items-center rounded-xl px-2 py-3 text-center ${
                        b.unlocked ? "bg-[#121212]" : "bg-[#121212] opacity-40 grayscale"
                      }`}
                    >
                      <div
                        className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-black"
                        style={{ background: b.color }}
                      >
                        {b.icon}
                      </div>
                      <div className="text-[10px] leading-tight font-semibold">{b.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "badges" && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {badges.map((b) => (
            <div
              key={b.id}
              title={b.description}
              className={`flex flex-col items-center rounded-2xl bg-[#191919] px-2 py-4 text-center ${
                b.unlocked ? "" : "opacity-40 grayscale"
              }`}
            >
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-black"
                style={{ background: b.color }}
              >
                {b.icon}
              </div>
              <div className="text-xs font-semibold">{b.title}</div>
              <div className="mt-1 text-[10px] text-zinc-500">{b.description}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "friends" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {friends.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-zinc-500">Пока нет друзей</div>
          )}
          {friends.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onOpenFriend(f)}
              className="flex items-center gap-3 rounded-2xl bg-[#191919] p-3 text-left hover:bg-[#222]"
            >
              <UserAvatar name={f.name} color={f.color} size={48} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{f.name}</div>
                <div className="truncate text-[11px] text-zinc-500">В друзьях</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="rounded-2xl bg-[#191919] py-14 text-center text-sm text-zinc-500">
          Инвентарь появится в ближайшем обновлении
        </div>
      )}
    </div>
  );
}
