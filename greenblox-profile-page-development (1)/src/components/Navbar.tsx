import {
  Backpack,
  Bell,
  Box,
  CircleCheck,
  Home,
  MessageCircle,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GAMES, USERS, type Game, type User } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";

type Tab = "home" | "profile" | "friends";

export function Navbar({
  me,
  tab,
  onHome,
  onProfile,
  onFriends,
  onOpenUser,
  onOpenGame,
  onSoon,
}: {
  me: User;
  tab: Tab;
  onHome: () => void;
  onProfile: () => void;
  onFriends: () => void;
  onOpenUser: (id: string) => void;
  onOpenGame: (game: Game) => void;
  onSoon: (label: string) => void;
}) {
  const [mode, setMode] = useState<"games" | "people">("games");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { games: GAMES.slice(0, 4), people: USERS.slice(0, 5) };
    return {
      games: GAMES.filter(
        (g) =>
          g.title.toLowerCase().includes(s) ||
          g.creator.toLowerCase().includes(s) ||
          g.genre.toLowerCase().includes(s),
      ),
      people: USERS.filter(
        (u) =>
          u.displayName.toLowerCase().includes(s) ||
          u.username.toLowerCase().includes(s),
      ),
    };
  }, [q]);

  const iconBtn = (active: boolean) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-full transition",
      active
        ? "bg-[#1ed760] text-black"
        : "bg-[#2a2a2a] text-zinc-300 hover:bg-[#333] hover:text-white",
    );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 bg-[#141414] px-3">
      <button
        type="button"
        onClick={onHome}
        className="mr-1 flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-white/5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1ed760] text-black shadow-[0_0_20px_rgba(30,215,96,0.35)]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M8 5.5v13l12-6.5L8 5.5z" />
          </svg>
        </span>
        <span className="hidden leading-none sm:block">
          <span className="block text-[15px] font-extrabold tracking-tight text-white">
            GreenBlox
          </span>
          <span className="block text-[9px] font-bold tracking-[0.18em] text-zinc-500 uppercase">
            Launcher
          </span>
        </span>
      </button>

      <nav className="flex items-center gap-1.5">
        <button type="button" className={iconBtn(tab === "home")} onClick={onHome} title="Главная">
          <Home className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className={iconBtn(false)}
          onClick={onHome}
          title="Рекомендации"
        >
          <CircleCheck className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className={iconBtn(tab === "friends")}
          onClick={onFriends}
          title="Друзья"
        >
          <Users className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className={iconBtn(false)} onClick={() => onSoon("Магазин")} title="Магазин">
          <ShoppingBag className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className={iconBtn(false)} onClick={() => onSoon("Инвентарь")} title="Создание">
          <Box className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className={iconBtn(false)} onClick={() => onSoon("Чаты")} title="Чаты">
          <MessageCircle className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className={iconBtn(false)} onClick={() => onSoon("Рюкзак")} title="Рюкзак">
          <Backpack className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          onClick={() => onSoon("Студия")}
          className="ml-1 hidden h-10 items-center rounded-full bg-[#1ed760] px-4 text-sm font-bold text-black hover:bg-[#2ae06c] md:flex"
        >
          Студия
        </button>
      </nav>

      <div className="flex-1" />

      <div ref={wrap} className="relative w-full max-w-[420px]">
        <div className="flex h-10 items-center rounded-full bg-[#1c1c1c] pr-3 ring-1 ring-white/5 focus-within:ring-[#1ed760]/40">
          <button
            type="button"
            onClick={() => {
              setMode("games");
              setOpen(true);
            }}
            className={cn(
              "ml-1 rounded-full px-3 py-1 text-xs font-bold",
              mode === "games" ? "bg-[#1ed760] text-black" : "text-zinc-400 hover:text-white",
            )}
          >
            Игры
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("people");
              setOpen(true);
            }}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              mode === "people" ? "bg-[#1ed760] text-black" : "text-zinc-400 hover:text-white",
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Люди
          </button>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={mode === "games" ? "Поиск игр..." : "Поиск людей..."}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-zinc-600"
          />
          <Search className="h-4 w-4 text-zinc-500" />
        </div>

        {open && (
          <div className="anim-pop absolute top-[calc(100%+8px)] right-0 left-0 overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-2xl shadow-black/50">
            {mode === "games" ? (
              <div className="py-1.5">
                {results.games.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-zinc-500">Игр не найдено</div>
                )}
                {results.games.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      onOpenGame(g);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/5"
                  >
                    <img src={g.image} alt="" className="h-10 w-16 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{g.title}</div>
                      <div className="text-xs text-zinc-500">{g.genre} · {g.creator}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-1.5">
                {results.people.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-zinc-500">Никого не нашли</div>
                )}
                {results.people.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onOpenUser(u.id);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/5"
                  >
                    <Avatar user={u} size="sm" showOnline cropped />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{u.displayName}</div>
                      <div className="text-xs text-zinc-500">@{u.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button type="button" onClick={onProfile} className="ml-1" title="Профиль">
        <Avatar user={me} size="sm" className={tab === "profile" ? "ring-2 ring-[#1ed760]" : ""} cropped />
      </button>
      <button
        type="button"
        className={iconBtn(false)}
        onClick={() => onSoon("Настройки")}
        title="Настройки"
      >
        <Settings className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        className={iconBtn(false)}
        onClick={() => onSoon("Уведомления")}
        title="Уведомления"
      >
        <Bell className="h-[18px] w-[18px]" />
      </button>
    </header>
  );
}
