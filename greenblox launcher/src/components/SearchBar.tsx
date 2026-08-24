import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "../data";
import { socialApi, type SearchResult } from "../social/api";
import { statusLabel, type SocialState } from "../social/useSocial";
import { Avatar } from "./Avatar";
import { IconSearch, IconUsers, IconX } from "./Icons";

type Props = {
  games: Game[];
  myName: string;
  /** Live social state — lets the people results show realtime online status and session. */
  social?: SocialState;
  onOpenGame: (game: Game) => void;
  onOpenUser: (user: SearchResult) => void;
};

type Tab = "games" | "people";

/**
 * GreenBlox quick search: filters the game catalog by title / creator /
 * category / tags and looks up players via the social backend.
 */
export default function SearchBar({ games, myName, social, onOpenGame, onOpenUser }: Props) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("games");
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<SearchResult[]>([]);
  const [searchingPeople, setSearchingPeople] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const gamesResults = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return games.filter(
      (g) =>
        g.title.toLowerCase().includes(s) ||
        g.creator.toLowerCase().includes(s) ||
        g.category.toLowerCase().includes(s) ||
        g.tags.some((t) => t.toLowerCase().includes(s))
    );
  }, [games, q]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const s = q.trim();
    if (!s) {
      setPeople([]);
      setSearchingPeople(false);
      return;
    }
    setSearchingPeople(true);
    const timer = window.setTimeout(async () => {
      try {
        const found = await socialApi.search(s);
        setPeople(found.filter((r) => r.name.toLowerCase() !== myName.toLowerCase()));
      } catch {
        setPeople([]);
      } finally {
        setSearchingPeople(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, myName]);

  const hasQuery = q.trim().length > 0;
  const showDropdown = open && hasQuery;
  const showGames = tab === "games";
  const showPeople = tab === "people";

  return (
    <div ref={rootRef} className="relative hidden w-full max-w-[460px] md:block">
      <div className="flex h-10 items-center gap-1 rounded-full bg-[#1c1c1c] p-1 pr-2 ring-1 ring-white/5 focus-within:ring-[#1ed760]/40">
        <div className="flex items-center gap-1.5 text-zinc-500">
          {showGames ? <IconSearch className="h-4 w-4" /> : <IconUsers className="h-4 w-4" />}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Поиск: игры, создатели, люди..."
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-zinc-600"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-white/8 hover:text-white"
            title="Очистить"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex shrink-0 rounded-full bg-[#161616] p-0.5">
          <button
            type="button"
            onClick={() => setTab("games")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              showGames ? "bg-[#1ed760] text-[#05210e]" : "text-zinc-400 hover:text-white"
            }`}
          >
            Игры
          </button>
          <button
            type="button"
            onClick={() => setTab("people")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              showPeople ? "bg-[#1ed760] text-[#05210e]" : "text-zinc-400 hover:text-white"
            }`}
          >
            Люди
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className="animate-scale-in absolute top-12 right-0 left-0 z-50 overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-2xl">
          {showGames && (
            <div className="gb-scroll max-h-[320px] overflow-y-auto p-1.5">
              {gamesResults.length === 0 && (
                <div className="px-3 py-4 text-center text-[12px] text-zinc-500">
                  Ничего не найдено
                </div>
              )}
              {gamesResults.slice(0, 8).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    onOpenGame(g);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                >
                  <img src={g.image} alt="" className="h-11 w-[68px] shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold">{g.title}</div>
                    <div className="truncate text-[11px] text-zinc-500">
                      {g.creator} · {g.category}
                    </div>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full bg-[#1ed760]/15 px-2 py-0.5 text-[10px] font-bold text-[#2ae06c]">
                    {g.players ?? "Играть"}
                  </span>
                </button>
              ))}
            </div>
          )}
          {showPeople && (
            <div className="gb-scroll max-h-[320px] overflow-y-auto p-1.5">
              {searchingPeople && people.length === 0 && (
                <div className="px-3 py-4 text-center text-[12px] text-zinc-500">
                  Ищем людей...
                </div>
              )}
              {people.length === 0 && !searchingPeople && (
                <div className="px-3 py-4 text-center text-[12px] text-zinc-500">
                  Никого не найдено
                </div>
              )}
              {people.slice(0, 8).map((user) => {
                // Live status/session: prefer the polled friends list (always
                // fresh), fall back to what the search API returned.
                const friend = social?.friends.find((f) => f.id === user.id);
                const status = friend?.status ?? user.status ?? "offline";
                const session = friend?.session ?? user.session;
                const online = status !== "offline";
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      onOpenUser(user);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                  >
                    <Avatar
                      name={user.name}
                      color={user.avatarColor}
                      size="sm"
                      showOnline
                      online={online}
                      status={status}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{user.name}</div>
                      <div className="truncate text-[11px]">
                        {session ? (
                          <span className="text-[#2ae06c]">Играет в {session.placeTitle || "GreenBlox Place"}</span>
                        ) : status === "in_studio" ? (
                          <span className="text-[#7db8ff]">{statusLabel(status)}</span>
                        ) : online ? (
                          <span className={status === "in_game" ? "text-[#2ae06c]" : "text-emerald-300/90"}>{statusLabel(status)}</span>
                        ) : (
                          <span className="text-zinc-500">{statusLabel(status)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
