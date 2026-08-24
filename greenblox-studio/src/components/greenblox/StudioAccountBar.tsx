"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { applyStudioAvatarColors, type AvatarHexColors } from "@/engine/runtime/StudioAvatar";

/** Тип пользователя GreenBlox с сервера (/api/social/me). */
export type StudioAccount = {
  id: number;
  name: string;
  email: string;
  avatarColor: string;
};

const TOKEN_KEY = "greenblox-token";
const HEARTBEAT_MS = 10_000;

/** Токен GreenBlox аккаунта для студии (page.tsx шлёт его в x-gbtoken при
 *  создании/сохранении проектов — именно так проекты привязываются к аккаунту).
 *  Читается из localStorage в момент вызова, поэтому после входа прямо в
 *  студии следующий Save уже будет авторизованным. */
export function getStudioToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
/**
 * Vite (лаунчер) по умолчанию стартует на 5173 и при занятости порта
 * автоматически уходит на 5174, 5175 и т.д. (см. devlog: лаунчер поднимался
 * и на :5174, и на :5175, и на :5176). Раньше здесь был жёсткий
 * `http://<host>:5173` — если лаунчер сидел на другом порту, его postMessage
 * с токеном отклонялся, студия оставалась неавторизованной и не слала
 * heartbeat "in_studio" (молоток «Создаёт миры» никогда не появлялся у друзей).
 * Теперь проверяем весь стандартный диапазон Vite: 5173–5199.
 */
function isLauncherOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
    return port >= 5173 && port <= 5199;
  } catch {
    return false;
  }
}

/**
 * Реальный origin открывшего нас лаунчера. Когда студия открыта ИЗ лаунчера
 * (window.open без noopener), `window.opener.origin` указывает точно на его
 * порт (5173/5174/5175…) — используем его как targetOrigin для обратного
 * канала. Если окно открыто отдельно — fallback на стандартный порт Vite.
 */
function getLauncherOrigin(): string {
  try {
    const opener = window.opener as Window | null;
    if (opener && opener !== window && opener.location) {
      const origin = opener.origin;
      if (origin && isLauncherOrigin(origin)) return origin;
    }
  } catch {
    /* кросс-ориджин-ограничение — используем fallback ниже */
  }
  return `http://${window.location.hostname || "localhost"}:5173`;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchMe(token: string): Promise<StudioAccount | null> {
  try {
    const res = await fetch("/api/social", {
      headers: { "x-gbtoken": token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

async function pingStudio(token: string) {
  try {
    await fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-gbtoken": token },
      body: JSON.stringify({ status: "in_studio" }),
    });
  } catch {
    /* heartbeat is best-effort */
  }
}

function WalletAvatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const letter = (name.trim()[0] || "?").toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(150deg, ${color}, ${color}55 60%, #141414)`,
        boxShadow: `inset 0 -4px 10px rgba(0,0,0,0.35), 0 0 14px ${color}44`,
      }}
    >
      {letter}
    </span>
  );
}

/** Аватарка пользователя + выпадающее меню. Синхронизирует аккаунт
 *  GreenBlox с лаунчером через токен из URL (?token=...) и держит presence
 *  "in_studio", пока студия открыта (друзья видят синий молоточек). */
export default function StudioAccountBar() {
  const [account, setAccount] = useState<StudioAccount | null>(null);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tokenRef = useRef<string | null>(readToken());

  // Меню позиционируется через position:fixed по координатам кнопки —
  // в редакторе шапка имеет overflow-x-auto и обрезала бы absolute-меню.
  const toggleMenu = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) {
      setOpen((v) => !v);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const nextOpen = !open;
    if (nextOpen) {
      // Popup явно опущен вниз — зазор 48px, как в Roblox Studio: меню не
      // нависает над кнопкой «+ New» на главном экране. (Раньше было 8px,
      // меню перекрывало кнопку создания.)
      setMenuPos({ top: rect.bottom + 48, right: Math.max(8, window.innerWidth - rect.right) });
    } else {
      setMenuPos(null);
    }
    setOpen(nextOpen);
  }, [open]);

  // Поглощаем токен из URL РОВНО один раз: лаунчер открывает студию как
  // http://<host>:3001?token=... — кладём его в localStorage студии.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      storeToken(urlToken);
      tokenRef.current = urlToken;
      // Убираем токен из адресной строки, чтобы он не светился в истории.
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Прямой канал из лаунчера: он открывает студию как
  // window.open(studioUrl, "greenblox-studio") и дополнительно шлёт токен
  // postMessage'ом (надёжно даже при переиспользовании уже открытой вкладки,
  // когда URL-эффект с [] не перезапустится).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Не сверяемся с конкретным портом: лаунчер Vite может сидеть на
      // 5173/5174/5175/… Проверяем, что отправитель — GreenBlox Launcher.
      if (!isLauncherOrigin(e.origin)) return;
      const data = e.data;
      if (!data || data.source !== "greenblox-launcher" || data.type !== "gb-token") return;
      const token = typeof data.token === "string" ? data.token : null;
      if (!token) return;
      storeToken(token);
      tokenRef.current = token;
      // Игровой аватар (7 цветов R6) приходит от лаунчера вместе с токеном —
      // студия рисует персонажа Play в тех же цветах, что и в игре.
      if (data.avatarColors && typeof data.avatarColors === "object") {
        applyStudioAvatarColors(data.avatarColors as Partial<AvatarHexColors>);
      }
      fetchMe(token).then((me) => {
        if (!me) return;
        setAccount(me);
        pingStudio(token);
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Обратный канал: студия открыта ИЗ лаунчера (window.opener на него
  // указывает, т.к. window.open без noopener). Если пользователь вошёл прямо
  // в студии — сообщаем лаунчеру токен и аккаунт; он сохраняет токен в свой
  // localStorage и сразу подхватывает тот же аккаунт (единый вход везде).
  useEffect(() => {
    if (!account) return;
    const token = tokenRef.current;
    if (!token) return;
    const launcherOrigin = getLauncherOrigin();
    const t = window.setTimeout(() => {
      try {
        const opener = window.opener as Window | null;
        if (!opener || opener === window) return;
        opener.postMessage(
          {
            source: "greenblox-studio",
            type: "gb-account-sync",
            token,
            name: account.name,
            avatarColor: account.avatarColor,
            email: account.email,
          },
          launcherOrigin
        );
      } catch {
        /* окно закрыто/недоступно — не критично */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [account, account?.name, account?.avatarColor, account?.email]);

  // Загрузка профиля по токену.
  useEffect(() => {
    let cancelled = false;
    const token = tokenRef.current;
    if (!token) return;
    fetchMe(token).then((me) => {
      if (cancelled) return;
      if (me) {
        setAccount(me);
        pingStudio(token);
      } else {
        storeToken(null);
        tokenRef.current = null;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Heartbeat "in_studio" пока студия открыта (пока есть аккаунт).
  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !account) return;
    pingStudio(token);
    const timer = window.setInterval(() => pingStudio(token), HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, [account]);

  // Закрытие меню по клику вне и по Escape.
  useEffect(() => {
    if (!open) return;
    const onClickDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Вход/регистрация внутри студии (без пароля — как в лаунчере, email + имя). */
  const handleLogin = useCallback(async (email: string, name?: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name?.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data?.token) {
        throw new Error(data?.error ?? "Ошибка входа");
      }
      storeToken(data.token);
      tokenRef.current = data.token;
      setAccount(data.user);
      setOpen(false);
      pingStudio(data.token);
    } catch (err: any) {
      throw new Error(err?.message ?? "Не удалось войти");
    } finally {
      setBusy(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    storeToken(null);
    tokenRef.current = null;
    setAccount(null);
    setOpen(false);
  }, []);

  const handleOpenLauncherProfile = useCallback(() => {
    // Студия открыта ИЗ лаунчера (window.opener указывает на него): просто
    // фокусируем ту же вкладку вместо новой — как Roblox Studio↔App.
    try {
      const opener = window.opener as Window | null;
      if (opener && opener !== window) {
        opener.focus();
        setOpen(false);
        return;
      }
    } catch {
      /* кросс-ориджин-ограничение — открываем вкладку */
    }
    // Студия открыта отдельно: открываем лаунчер на том же хосте.
    // Origin знает реальный порт Vite (5173/5174/5175…) — не хардкодим.
    const launcherUrl = getLauncherOrigin();
    window.open(launcherUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pr-3 pl-1 transition hover:border-white/[0.16] hover:bg-white/[0.07]"
        title={account ? `Аккаунт: ${account.name}` : "Войти в GreenBlox"}
      >
        {account ? (
          <>
            <WalletAvatar name={account.name} color={account.avatarColor} size={30} />
            <span className="hidden max-w-[120px] truncate text-[12px] font-semibold text-white/85 sm:block">
              {account.name}
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4d9fff] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4d9fff]" />
            </span>
          </>
        ) : (
          <>
            <span className="flex h-[30px] items-center justify-center rounded-full bg-white/[0.07] px-3 text-[12px] font-bold text-white/80">
              Войти
            </span>
            <span className="hidden text-[12px] font-semibold text-white/60 sm:block">в GreenBlox</span>
          </>
        )}
      </button>

      {open && menuPos && (
        <div
          className="anim-pop fixed z-[100] w-[300px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171b24] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          {account ? (
            <>
              {/* Шапка профиля */}
              <div className="border-b border-white/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar name={account.name} color={account.avatarColor} size={52} />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-bold text-white">{account.name}</div>
                    <div className="truncate text-[11.5px] text-white/40">{account.email}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#4d9fff]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#7db8ff]">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 3 6 6-3.5 1.5-4-4z" />
                    <path d="M13.5 9.5 4 19l1 1 9.5-9.5" />
                    <path d="M9.5 16.5l-2.2-2.2" />
                  </svg>
                  Создаёт миры в GreenBlox Studio
                </div>
              </div>

              <div className="p-1.5">
                <MenuButton onClick={handleOpenLauncherProfile}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5 19.2c.8-3.4 3.3-5 7-5s6.2 1.6 7 5" />
                  </svg>
                  Открыть профиль в лаунчере
                </MenuButton>
                <MenuButton onClick={() => setOpen(false)}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                  {account.email}
                </MenuButton>
                <div className="mx-2 my-1 h-px bg-white/[0.06]" />
                <MenuButton danger onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
                    <path d="M15 12H4m0 0 3-3M4 12l3 3" />
                  </svg>
                  Выйти из аккаунта
                </MenuButton>
              </div>
            </>
          ) : (
            <LoginForm onLogin={handleLogin} busy={busy} />
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold transition ${
        danger ? "text-red-300 hover:bg-red-500/12" : "text-white/82 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function LoginForm({
  onLogin,
  busy,
}: {
  onLogin: (email: string, name?: string) => Promise<void>;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onLogin(email, name || undefined);
    } catch (err: any) {
      setError(err?.message ?? "Ошибка входа");
    }
  };

  return (
    <form onSubmit={submit} className="p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1ed760]/15 text-[#2ae06c]">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.81 21H8.19a2 2 0 0 1-1.99-1.8z" />
            <path d="M8 8V7a4 4 0 0 1 8 0v1" />
          </svg>
        </span>
        <div>
          <div className="text-[14px] font-bold text-white">Войти в GreenBlox</div>
          <div className="text-[11px] text-white/40">Привяжи аккаунт к студии</div>
        </div>
      </div>

      <label className="gb-label mb-1 block">Имя</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Твой ник"
        autoComplete="nickname"
        className="gb-input mb-2.5 h-9 w-full px-3 text-[12.5px]"
      />

      <label className="gb-label mb-1 block">Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@greenblox.io"
        autoComplete="email"
        required
        className="gb-input mb-3 h-9 w-full px-3 text-[12.5px]"
      />

      {error && <div className="mb-3 rounded-lg bg-red-500/12 px-3 py-2 text-[11.5px] font-semibold text-red-300">{error}</div>}

      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="gb-action-btn gb-primary h-9 w-full text-[12.5px] disabled:opacity-40"
      >
        {busy ? "Входим…" : "Войти / Создать"}
      </button>
      <p className="mt-2 text-center text-[10.5px] leading-4 text-white/34">
        Тот же аккаунт, что и в лаунчере GreenBlox. Друзья увидят, что ты создаёшь миры.
      </p>
    </form>
  );
}
