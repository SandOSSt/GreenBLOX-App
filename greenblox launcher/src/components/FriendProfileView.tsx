import { type ReactNode, useMemo } from "react";
import type { FriendEntry, PublicProfile } from "../social/api";
import { statusLabel, type SocialState } from "../social/useSocial";
import { games } from "../data";
import { Avatar } from "./Avatar";
import { UserAvatar } from "./SocialProfileView";
import CreatorProjectCard, { type CreatorProjectCardInfo } from "./CreatorProjectCard";
import { coverStyleOf } from "./coverStyles";
import {
  IconActivity,
  IconChat,
  IconChevronLeft,
  IconClock,
  IconGamepad,
  IconPlus,
  IconPlay,
  IconTrophy,
  IconUsers,
  IconX,
} from "./Icons";

type Props = {
  friend: FriendEntry;
  profile: PublicProfile | null;
  loading: boolean;
  myName: string;
  social?: SocialState;
  onBack: () => void;
  onMessage: (friend: FriendEntry) => void;
  onJoin: (friend: FriendEntry) => void;
  onRemove: (friend: FriendEntry) => void;
  onSendRequest: (userId: number) => Promise<void> | void;
  onCancelRequest: (requestId: number) => Promise<void> | void;
  onAcceptRequest: (requestId: number) => Promise<void> | void;
  onDeclineRequest: (requestId: number) => Promise<void> | void;
  onOpenFriendProfile?: (userId: number) => void;
  /** Может ли зритель ставить лайки на картах (нужен вход). */
  canLike?: boolean;
  onPlayCreatorProject?: (project: CreatorProjectCardInfo) => void;
  onToggleCreatorProjectLike?: (project: CreatorProjectCardInfo) => void;
};

function timeAgo(ts: number) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

function friendActivity(friend: FriendEntry, profile: PublicProfile | null): string {
  const session = friend.session ?? profile?.session ?? null;
  if (friend.status === "in_game" || (profile && profile.status === "in_game")) {
    return `В игре: ${session?.placeTitle || "GreenBlox Place"}`;
  }
  if (friend.status === "in_studio" || profile?.status === "in_studio") {
    return "Создаёт миры в GreenBlox Studio";
  }
  if (friend.status === "online" || profile?.status === "online") return "В лаунчере";
  return "Не в сети";
}

/** Человеческое название игры по gameId: catalog-идентификатор, студийный
 *  проект или fallback на сам id. */
function gameTitleOf(gameId: string): string {
  if (!gameId) return "GreenBlox Place";
  const catalog = games.find((g) => g.id === gameId);
  if (catalog) return catalog.title;
  if (gameId.startsWith("catalog:")) {
    const slug = gameId.slice("catalog:".length);
    const bySlug = games.find((g) => g.id === slug || g.title === slug);
    if (bySlug) return bySlug.title;
  }
  if (gameId.startsWith("studio-")) return gameId.slice("studio-".length);
  return gameId;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n || 0);

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#191919] p-4">
      <div className="flex items-center gap-2 text-[12px] text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[14px] font-bold">{value}</div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#121212] px-3 py-3 text-left">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">{label}</div>
    </div>
  );
}

/** XP-прогресс уровня, как в Roblox: шкала с подсветкой. */
function LevelBar({ level }: { level: PublicProfile["level"] }) {
  const pct = level.maxXp > 0 ? Math.min(100, Math.round((level.currentXp / level.maxXp) * 100)) : 0;
  return (
    <div className="w-full max-w-[220px]">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-[#1ed760]">Уровень {level.level}</span>
        <span className="text-zinc-500">{fmt(level.xp)} XP</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-0.5 text-right text-[10px] text-zinc-600">
        {fmt(level.currentXp)} / {fmt(level.maxXp)} XP
      </div>
    </div>
  );
}

export default function FriendProfileView({
  friend,
  profile,
  loading,
  myName,
  social,
  onBack,
  onMessage,
  onJoin,
  onRemove,
  onSendRequest,
  onCancelRequest,
  onAcceptRequest,
  onDeclineRequest,
  onOpenFriendProfile,
  canLike = false,
  onPlayCreatorProject,
  onToggleCreatorProjectLike,
}: Props) {
  // Живой статус/сессия: страница живёт за счёт 5-секундного пулла friends,
  // поэтому берём свежую запись друга, а не ту, что была при открытии.
  const liveFriend = social?.friends.find((f) => f.id === friend.id) ?? friend;

  const avatarColor = profile?.avatarColor || liveFriend.avatarColor;

  // Статус и сессия приоритетно из живого списка друзей; для не-друзей
  // (открыты из поиска) — из свежего ответа /api/profile, который уже
  // содержит live presence ({ status, session }).
  const status = profile?.status && !social?.friends.some((f) => f.id === friend.id)
    ? profile.status
    : liveFriend.status;
  const session =
    profile?.session && !social?.friends.some((f) => f.id === friend.id)
      ? profile.session
      : liveFriend.session;

  const isFriend =
    profile !== null
      ? profile.isFriend
      : social?.friends.some((f) => f.id === liveFriend.id) ?? false;
  const friendRequest = isFriend
    ? "accepted"
    : (profile?.friendRequest ?? social?.incoming.some((r) => r.id === liveFriend.id)
        ? (profile?.friendRequest ?? "pending_in")
        : (profile?.friendRequest ?? "none"));

  const coverStyle = coverStyleOf(profile?.coverStyle);
  const canSendRequest = !isFriend && friendRequest === "none";

  const mutualFriends = useMemo(() => profile?.mutualFriends ?? [], [profile]);
  const friendsList = useMemo(() => profile?.friendsList ?? [], [profile]);
  const creatorProjects = profile?.creatorProjects ?? [];

  return (
    <div className="anim-fade-up mx-auto max-w-[1100px] px-5 py-6 pb-20">
      {/* Top bar */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/6 px-4 py-2 text-[13px] font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <IconChevronLeft className="h-4 w-4" />
        Назад
      </button>

      {/* Cover + identity */}
      <div className="overflow-hidden rounded-2xl bg-[#191919]">
        <div className="relative flex h-[220px] items-end justify-center" style={{ background: coverStyle }}>
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative z-[1] mb-8">
            <Avatar
              name={liveFriend.name}
              color={avatarColor}
              size="xl"
              showOnline
              online={status !== "offline"}
              status={status}
            />
          </div>
        </div>

        <div className="border-t border-white/5 p-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="text-[22px] font-extrabold tracking-tight">{liveFriend.name}</div>
            <span className="rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black uppercase">
              Premium
            </span>
          </div>
          <div className="mt-0.5 text-[13px] text-[#888]">
            {profile?.handle || `@${liveFriend.name.toLowerCase().replace(/\s+/g, "_")}`}
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#888]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    status === "in_game" ? "#2ae06c" : status === "in_studio" ? "#4d9fff" : status === "online" ? "#34d399" : "#555",
                  boxShadow:
                    status !== "offline"
                      ? `0 0 8px ${status === "in_game" ? "#2ae06c" : status === "in_studio" ? "#4d9fff" : "#34d399"}`
                      : "none",
                }}
              />
              {statusLabel(status)}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="inline-flex items-center gap-1 text-[#1ed760]">
              <IconTrophy className="h-3.5 w-3.5" />
              Уровень {loading ? "…" : (profile?.level.level ?? 1)}
            </span>
          </div>

          {!loading && profile?.level && <div className="mt-3 flex justify-center"><LevelBar level={profile.level} /></div>}

          {profile?.statusQuote ? (
            <div className="mt-2 text-[13px] font-semibold text-[#2ae06c]">{profile.statusQuote}</div>
          ) : (
            <div className="mt-2 text-[13px] font-semibold text-[#2ae06c]">{friendActivity(liveFriend, profile)}</div>
          )}

          {session && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1ed760]/15 px-3 py-1.5 text-[12px] font-bold text-[#2ae06c]">
              <IconGamepad className="h-3.5 w-3.5" />
              <span className="max-w-[220px] truncate">{session.placeTitle || "GreenBlox Place"}</span>
              <span className="font-mono text-[#1ed760]">#{session.code}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mx-auto mt-5 flex max-w-md flex-col gap-2">
            {isFriend ? (
              <>
                <button
                  type="button"
                  onClick={() => onMessage(liveFriend)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-5 text-[14px] font-extrabold text-[#05210e] transition hover:bg-[#2ae06c]"
                >
                  <IconChat className="h-4 w-4" />
                  Написать сообщение
                </button>
                {session && (
                  <button
                    type="button"
                    onClick={() => onJoin(liveFriend)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/8 px-5 text-[14px] font-bold text-white transition hover:bg-white/12"
                  >
                    <IconPlay className="h-4 w-4" />
                    Играть в {session.placeTitle || "GreenBlox Place"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(liveFriend)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/6 px-5 text-[14px] font-semibold text-red-300 transition hover:bg-red-500/15"
                >
                  <IconX className="h-4 w-4" />
                  Удалить из друзей
                </button>
              </>
            ) : (
              <>
                {friendRequest === "pending_out" && (
                  <>
                    <div className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760]/10 px-5 text-[14px] font-bold text-[#2ae06c]">
                      <IconPlus className="h-4 w-4" />
                      Заявка отправлена
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const req = social?.outgoing.find((r) => r.id === liveFriend.id);
                        if (req) {
                          try {
                            await onCancelRequest(req.requestId);
                            onBack();
                          } catch {}
                        }
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/6 px-5 text-[14px] font-semibold text-amber-300 transition hover:bg-amber-400/10"
                    >
                      <IconX className="h-4 w-4" />
                      Отменить заявку
                    </button>
                  </>
                )}
                {friendRequest === "pending_in" && (
                  <>
                    <div className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-400/10 px-5 text-[14px] font-bold text-amber-300">
                      {profile?.name || liveFriend.name} хочет дружить с тобой
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const req = social?.incoming.find((r) => r.id === liveFriend.id);
                          if (req) {
                            try {
                              await onAcceptRequest(req.requestId);
                              onBack();
                            } catch {}
                          }
                        }}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-5 text-[14px] font-extrabold text-[#05210e] transition hover:bg-[#2ae06c]"
                      >
                        <IconPlus className="h-4 w-4" />
                        Принять
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const req = social?.incoming.find((r) => r.id === liveFriend.id);
                          if (req) {
                            try {
                              await onDeclineRequest(req.requestId);
                              onBack();
                            } catch {}
                          }
                        }}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/6 px-5 text-[14px] font-semibold text-red-300 transition hover:bg-red-500/15"
                      >
                        <IconX className="h-4 w-4" />
                        Отклонить
                      </button>
                    </div>
                  </>
                )}
                {canSendRequest && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await onSendRequest(liveFriend.id);
                        onBack();
                      } catch {}
                    }}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-5 text-[14px] font-extrabold text-[#05210e] transition hover:bg-[#2ae06c]"
                  >
                    <IconPlus className="h-4 w-4" />
                    Добавить в друзья
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onMessage(liveFriend)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/8 px-5 text-[14px] font-bold text-white transition hover:bg-white/12"
                >
                  <IconChat className="h-4 w-4" />
                  Написать сообщение
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <InfoCard
          icon={<IconUsers className="h-4 w-4 text-[#1ed760]" />}
          label={isFriend ? "Друг" : "Игрок"}
          value={isFriend ? `В друзьях у ${myName}` : "Не в друзьях"}
        />
        <InfoCard icon={<IconActivity className="h-4 w-4 text-[#1ed760]" />} label="Статус" value={friendActivity(liveFriend, profile)} />
        <InfoCard
          icon={<IconClock className="h-4 w-4 text-[#1ed760]" />}
          label="В GreenBlox с"
          value={
            loading
              ? "…"
              : profile?.joinedAt
                ? new Date(profile.joinedAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
                : "—"
          }
        />
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Запусков игр" value={loading ? "…" : fmt(profile?.stats.totalPlays ?? 0)} />
        <StatTile label="Игр опробовано" value={loading ? "…" : fmt(profile?.stats.gamesPlayed ?? 0)} />
        <StatTile label="Друзей" value={loading ? "…" : fmt(profile?.stats.friends ?? 0)} />
        <StatTile label="Побед" value={loading ? "…" : fmt(profile?.stats.wins ?? 0)} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <StatTile label="Монет собрано" value={loading ? "…" : fmt(profile?.stats.totalCoins ?? 0)} />
        <StatTile label="Смертей" value={loading ? "…" : fmt(profile?.stats.totalDeaths ?? 0)} />
        <StatTile
          label="Всего в игре"
          value={
            loading
              ? "…"
              : profile && profile.stats.totalTimeSec > 0
                ? `${Math.floor(profile.stats.totalTimeSec / 60)} мин`
                : "0 мин"
          }
        />
      </div>

      {/* Bio */}
      <div className="mt-4 rounded-2xl bg-[#191919] p-5">
        <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">О себе</div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {loading ? "Загружаем профиль…" : profile?.bio || `${liveFriend.name} пока ничего не написал о себе.`}
        </p>
      </div>

      {/* Mutual friends */}
      {!isFriend && mutualFriends.length > 0 && (
        <div className="mt-4 rounded-2xl bg-[#191919] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Общие друзья ({mutualFriends.length})</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {mutualFriends.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onOpenFriendProfile?.(m.id)}
                className="flex w-[118px] items-center gap-2 rounded-xl bg-[#121212] p-2 text-left transition hover:bg-[#1c1c1c]"
              >
                <UserAvatar name={m.name} color={m.avatarColor} size={36} />
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{m.name}</div>
                  <div className="text-[10px] text-zinc-500">Общий друг</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {friendsList.length > 0 && (
        <div className="mt-4 rounded-2xl bg-[#191919] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Друзья ({friendsList.length})</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {friendsList.slice(0, 12).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onOpenFriendProfile?.(f.id)}
                className="flex items-center gap-2.5 rounded-xl bg-[#121212] p-2.5 text-left transition hover:bg-[#1c1c1c]"
              >
                <UserAvatar name={f.name} color={f.avatarColor} size={38} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">{f.name}</div>
                  <div className="text-[10.5px] text-zinc-500">Друг {liveFriend.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Creator maps (published Studio projects) */}
      {creatorProjects.length > 0 && (
        <div className="mt-4 rounded-2xl bg-[#191919] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Карты создателя ({creatorProjects.length})</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creatorProjects.map((project) => (
              <CreatorProjectCard
                key={project.id}
                project={project}
                canLike={canLike}
                onPlay={onPlayCreatorProject ?? (() => {})}
                onToggleLike={onToggleCreatorProjectLike ?? (() => {})}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent games */}
      <div className="mt-4 rounded-2xl bg-[#191919] p-5">

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold">Недавняя активность</h3>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-zinc-500">Загружаем игры…</div>
        ) : !profile || profile.stats.playedGames.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">Нет истории игр</div>
        ) : (
          <div className="space-y-2">
            {[...profile.stats.playedGames]
              .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
              .slice(0, 5)
              .map((g) => (
                <div
                  key={g.gameId}
                  className="flex items-center justify-between rounded-xl bg-[#121212] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{gameTitleOf(g.gameId)}</div>
                    <div className="text-xs text-zinc-500">{timeAgo(g.lastPlayedAt)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-bold text-[#1ed760]">
                      {fmt(g.count)} {g.count === 1 ? "запуск" : g.count < 5 ? "запуска" : "запусков"}
                    </div>
                    {g.bestStage > 0 && (
                      <div className="text-[11px] text-zinc-600">этап {g.bestStage}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
