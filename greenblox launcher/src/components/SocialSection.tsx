import { useEffect, useMemo, useRef, useState } from "react";
import { socialApi, type SearchResult, type FriendEntry } from "../social/api";
import type { SocialState } from "../social/useSocial";
import { statusLabel } from "../social/useSocial";
import { Avatar } from "./Avatar";
import { IconSearch, IconUsers, IconX, IconPlus, IconCheck, IconPlay, IconChat } from "./Icons";

type Props = {
  social: SocialState;
  myName: string;
  onJoinGame: (code: string, placeTitle: string) => void;
  onMessage?: (friend: { id: number; name: string; avatarColor: string }) => void;
  onOpenProfile?: (friend: FriendEntry) => void;
};

function StatusDot({ status }: { status: string }) {
  const color =
    status === "in_game" ? "#2ae06c" : status === "in_studio" ? "#4d9fff" : status === "online" ? "#34d399" : "#555";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: color, boxShadow: status !== "offline" ? `0 0 8px ${color}` : "none" }}
    />
  );
}

function FriendRowCard({
  friend,
  onJoin,
  onMessage,
  onRemove,
  onOpenProfile,
}: {
  friend: FriendEntry;
  onJoin: (f: FriendEntry) => void;
  onMessage?: (f: FriendEntry) => void;
  onRemove: (f: FriendEntry) => void;
  onOpenProfile?: (f: FriendEntry) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-[#191919] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <Avatar
            name={friend.name}
            color={friend.avatarColor}
            size="md"
            showOnline
            online={friend.status !== "offline"}
            status={friend.status}
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-white">{friend.name}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
            <StatusDot status={friend.status} />
            {statusLabel(friend.status)}
          </div>
          {friend.session && (
            <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-[#1ed760]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#2ae06c]">
              <IconPlay className="h-3 w-3" />
              <span className="max-w-[140px] truncate">{friend.session.placeTitle || "GreenBlox Place"}</span>
              <span className="font-mono text-[#1ed760]">#{friend.session.code}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {friend.session && (
          <button
            type="button"
            onClick={() => onJoin(friend)}
            className="rounded-full bg-[#1ed760] px-3 py-1.5 text-[12px] font-extrabold text-[#05210e] hover:bg-[#2ae06c]"
            title={`Присоединиться к ${friend.session.placeTitle || "игре"}`}
          >
            Играть
          </button>
        )}
        {onOpenProfile && (
          <button
            type="button"
            onClick={() => onOpenProfile(friend)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-[#1ed760]/20 hover:text-[#2ae06c]"
            title="Открыть профиль"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5 19.2c.8-3.4 3.3-5 7-5s6.2 1.6 7 5" />
            </svg>
          </button>
        )}
        {onMessage && (
          <button
            type="button"
            onClick={() => onMessage(friend)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-[#1ed760]/20 hover:text-[#2ae06c]"
            title="Написать сообщение"
          >
            <IconChat className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(friend)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-red-500/20 hover:text-red-300"
          title="Удалить из друзей"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SocialSection({ social, myName, onJoinGame, onMessage, onOpenProfile }: Props) {
  const [tab, setTab] = useState<"friends" | "incoming" | "outgoing">("friends");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);

  const friendIds = useMemo(() => new Set(social.friends.map((f) => f.id)), [social.friends]);
  const outgoingIds = useMemo(() => new Set(social.outgoing.map((r) => r.id)), [social.outgoing]);
  const incomingIds = useMemo(() => new Set(social.incoming.map((r) => r.id)), [social.incoming]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const found = await socialApi.search(q);
        setResults(found.filter((r) => r.name.toLowerCase() !== myName.toLowerCase()));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, myName]);

  const flash = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const handleSend = async (userId: number) => {
    setBusyUserId(userId);
    try {
      await social.sendRequest(userId);
      flash("Заявка в друзья отправлена");
    } catch (err: any) {
      flash(err?.message ?? "Не удалось отправить заявку");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleAccept = async (requestId: number) => {
    setBusyUserId(requestId);
    try {
      await social.acceptRequest(requestId);
      flash("Заявка принята");
    } catch (err: any) {
      flash(err?.message ?? "Ошибка");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    setBusyUserId(requestId);
    try {
      await social.declineRequest(requestId);
      flash("Заявка отклонена");
    } catch (err: any) {
      flash(err?.message ?? "Ошибка");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCancel = async (requestId: number) => {
    setBusyUserId(requestId);
    try {
      await social.cancelRequest(requestId);
      flash("Заявка отменена");
    } catch (err: any) {
      flash(err?.message ?? "Ошибка");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (friend: FriendEntry) => {
    try {
      await social.removeFriend(friend.id);
      flash(`${friend.name} удалён из друзей`);
    } catch (err: any) {
      flash(err?.message ?? "Ошибка");
    }
  };

  const handleJoin = (friend: FriendEntry) => {
    if (!friend.session) return;
    onJoinGame(friend.session.code, friend.session.placeTitle || "GreenBlox Place");
  };

  const handleMessage = (friend: FriendEntry) => {
    onMessage?.({ id: friend.id, name: friend.name, avatarColor: friend.avatarColor });
  };

  const handleOpenProfile = (friend: FriendEntry) => {
    onOpenProfile?.(friend);
  };

  const renderUserActions = (user: { id: number; name: string; avatarColor: string }) => {
    if (friendIds.has(user.id)) {
      return (
        <span className="rounded-full bg-[#1ed760]/15 px-3 py-1.5 text-[11px] font-bold text-[#2ae06c]">
          ✓ В друзьях
        </span>
      );
    }
    if (outgoingIds.has(user.id)) {
      const req = social.outgoing.find((r) => r.id === user.id);
      return (
        <button
          type="button"
          disabled={busyUserId === user.id}
          onClick={() => req && handleCancel(req.requestId)}
          className="rounded-full bg-white/6 px-3 py-1.5 text-[11.5px] font-bold text-[#aaa] hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
        >
          Отменить заявку
        </button>
      );
    }
    if (incomingIds.has(user.id)) {
      const req = social.incoming.find((r) => r.id === user.id);
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busyUserId === user.id}
            onClick={() => req && handleAccept(req.requestId)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] hover:bg-[#2ae06c] disabled:opacity-50"
            title="Принять"
          >
            <IconCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={busyUserId === user.id}
            onClick={() => req && handleDecline(req.requestId)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
            title="Отклонить"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        disabled={busyUserId === user.id}
        onClick={() => handleSend(user.id)}
        className="rounded-full bg-white/8 px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-[#1ed760] hover:text-[#05210e] disabled:opacity-50"
      >
        <IconPlus className="mr-1 inline h-3.5 w-3.5" />
        В друзья
      </button>
    );
  };

  const tabs: { id: "friends" | "incoming" | "outgoing"; label: string; count: number }[] = [
    { id: "friends", label: "Друзья", count: social.friends.length },
    { id: "incoming", label: "Входящие", count: social.incoming.length },
    { id: "outgoing", label: "Исходящие", count: social.outgoing.length },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
          <IconUsers className="h-5 w-5 text-[#1ed760]" />
          Друзья и заявки
        </h2>
      </div>

      {/* Поиск игроков */}
      <div className="mb-5 rounded-[24px] border border-white/8 bg-[#191919] p-4">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#ccc]">
          <IconSearch className="h-4 w-4 text-[#1ed760]" />
          Найти игрока
        </div>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введи ник игрока, чтобы отправить заявку..."
            className="h-11 w-full rounded-full border border-white/8 bg-[#111] px-4 pr-11 text-[13px] text-white placeholder:text-[#6b6b6b] focus:border-[#1ed760]/70"
          />
          {searching && (
            <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#1ed760] border-t-transparent" />
          )}
        </div>
        {results.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {results.map((user) => {
              // Живой статус/сессия: предпочитаем свежий список друзей (пулл 5с),
              // fallback на то, что вернул поиск.
              const liveFriend = social.friends.find((f) => f.id === user.id);
              const liveStatus = liveFriend?.status ?? user.status ?? "offline";
              return (
              <div key={user.id} className="flex items-center justify-between rounded-[16px] bg-white/4 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={user.name}
                    color={user.avatarColor}
                    size="sm"
                    showOnline
                    online={liveStatus !== "offline"}
                    status={liveStatus}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-[#888]">Игрок GreenBlox</div>
                  </div>
                </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {renderUserActions(user)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {query.trim() && !searching && results.length === 0 && (
          <div className="mt-3 rounded-[16px] bg-white/3 px-3 py-4 text-center text-[12.5px] text-[#888]">
            По запросу «{query.trim()}» никого не найдено
          </div>
        )}
      </div>

      {/* Вкладки */}
      <div className="mb-4 flex gap-2 border-b border-white/8 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition-all ${
              tab === t.id
                ? "bg-[#1ed760] text-[#05210e] shadow-[0_0_16px_rgba(30,215,96,0.35)]"
                : "bg-[#191919] text-[#aaa] hover:bg-[#242424] hover:text-white"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  tab === t.id ? "bg-[#05210e]/20 text-[#05210e]" : "bg-[#1ed760]/20 text-[#2ae06c]"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {social.error && (
        <div className="mb-3 rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[12.5px] font-bold text-red-300">
          {social.error} — убедись, что сервер GreenBlox Studio запущен на :3001
        </div>
      )}

      {tab === "friends" && (
        <div>
          {social.loading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[#141414] py-16 text-center text-[13px] text-[#888]">
              Загрузка друзей...
            </div>
          ) : social.friends.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[#141414] py-16 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-[#1ed760]">
                <IconUsers className="h-7 w-7" />
              </div>
              <div className="text-[15px] font-bold">У тебя пока нет друзей</div>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-[#888]">
                Найди игрока по нику выше и отправь заявку в друзья.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {social.friends.map((friend) => (
                <FriendRowCard
                  key={friend.id}
                  friend={friend}
                  onJoin={handleJoin}
                  onMessage={onMessage ? handleMessage : undefined}
                  onOpenProfile={onOpenProfile ? handleOpenProfile : undefined}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "incoming" && (
        <div>
          {social.incoming.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[#141414] py-16 text-center text-[13px] text-[#888]">
              Входящих заявок нет
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {social.incoming.map((req) => (
                <div key={req.requestId} className="flex items-center justify-between rounded-[20px] border border-white/8 bg-[#191919] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={req.name} color={req.avatarColor} size="md" />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold text-white">{req.name}</div>
                      <div className="text-[11.5px] text-[#1ed760]">хочет дружить</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyUserId === req.requestId}
                      onClick={() => handleAccept(req.requestId)}
                      className="rounded-full bg-[#1ed760] px-3.5 py-1.5 text-[12px] font-extrabold text-[#05210e] hover:bg-[#2ae06c] disabled:opacity-50"
                    >
                      Принять
                    </button>
                    <button
                      type="button"
                      disabled={busyUserId === req.requestId}
                      onClick={() => handleDecline(req.requestId)}
                      className="rounded-full bg-white/6 px-3 py-1.5 text-[12px] font-bold text-[#aaa] hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "outgoing" && (
        <div>
          {social.outgoing.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[#141414] py-16 text-center text-[13px] text-[#888]">
              Исходящих заявок нет
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {social.outgoing.map((req) => (
                <div key={req.requestId} className="flex items-center justify-between rounded-[20px] border border-white/8 bg-[#191919] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={req.name} color={req.avatarColor} size="md" />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold text-white">{req.name}</div>
                      <div className="text-[11.5px] text-[#888]">ждёт ответа</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyUserId === req.requestId}
                    onClick={() => handleCancel(req.requestId)}
                    className="rounded-full bg-white/6 px-3 py-1.5 text-[12px] font-bold text-[#aaa] hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
                  >
                    Отменить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#1ed760]/40 bg-[#111] px-4 py-2 text-[13px] font-bold shadow-[0_0_20px_rgba(30,215,96,0.25)] md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}
