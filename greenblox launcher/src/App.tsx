import { useCallback, useEffect, useState } from "react";
import Launcher from "./components/Launcher";
import LoginScreen from "./components/LoginScreen";
import GameSession, { type GameSessionPayload } from "./components/GameSession";
import { studioProjectToWorld, type StudioProject } from "./game/studioConverter";
import type { BuiltWorld } from "./game/WorldBuilder";
import type { SceneSettings } from "./game/RobloxEngine";
import type { AvatarColors } from "./game/Avatar";
import { avatarColorsToHex } from "./game/Avatar";
import { type Game } from "./data";
import { socialApi, clearToken, getToken, setToken, AUTH_FAIL_EVENT } from "./social/api";
import { useSocial } from "./social/useSocial";
import { useChat } from "./social/useChat";

export type Session = {
  name: string;
  email: string;
  userId?: number;
  avatarColor?: string;
  handle?: string;
  bio?: string;
  coverStyle?: string;
  statusQuote?: string;
  /** Custom in-game avatar colors, persisted between game sessions. */
  colors?: AvatarColors;
};

type ActiveGame = {
  game: Game;
  world?: BuiltWorld;
  settings?: SceneSettings;
  subtitle?: string;
  /** Custom avatar colors persisted on the user session. */
  colors?: AvatarColors;
  /** Stable place identifier: numeric studio project id or "catalog:<slug>". */
  placeId?: string;
  /** Host a multiplayer session for this game (creates join code). Every launch is online. */
  multiplayer: boolean;
  /** Join a live session by its 6-char code. */
  joinCode?: string;
};

// The studio backend runs on the same host as the launcher, port 3001.
// Deriving it from the page URL lets a friend on another computer reach
// http://<your-ip>:3001 instead of their own localhost.
const STUDIO_API = `http://${window.location.hostname || "localhost"}:3001/api/projects`;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

async function fetchStudioProjects(): Promise<StudioProject[]> {
  try {
    const res = await fetch(STUDIO_API);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Fetch a single studio project by numeric id (cross-origin). Used when a
 *  guest joins a session whose placeId is a project created after the launcher
 *  loaded its list — the guest must load the exact world the host is playing. */
async function fetchStudioProject(id: string): Promise<StudioProject | null> {
  try {
    const res = await fetch(`${STUDIO_API}/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as StudioProject;
  } catch {
    return null;
  }
}

function studioProjectToGame(project: StudioProject): Game {
  return {
    id: `studio-${project.id ?? project.title}`,
    title: project.title,
    creator: project.author ?? "GreenBlox Studio",
    image:
      project.thumbnail ??
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
    category: project.genre ?? "Студия",
    description: project.description ?? "Эксперимент, созданный в GreenBlox Studio.",
    tags: ["Студия", "Кастом"],
    updated: project.version ?? "1.0.0",
  };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [studioGames, setStudioGames] = useState<Game[]>([]);
  const [studioProjects, setStudioProjects] = useState<StudioProject[]>([]);

  // Restore local session + validate against backend token.
  // A stored token that no longer exists on the server (e.g. DB was reset)
  // must NOT enable the social layer — otherwise every API call fails with 401
  // and friends/search/chat look completely broken.
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        const raw = localStorage.getItem("greenblox-session");
        const token = getToken();
        if (token) {
          const me = await socialApi.me().catch(() => null);
          if (!cancelled && me) {
            const saved = raw ? (JSON.parse(raw) as Session) : null;
            if (saved && saved.userId === me.id) {
              setSession({
                ...saved,
                name: me.name,
                email: me.email,
                userId: me.id,
                avatarColor: me.avatarColor,
              });
            } else {
              setSession({
                name: me.name,
                email: me.email,
                userId: me.id,
                avatarColor: me.avatarColor,
                handle: `@${me.name.toLowerCase().replace(/\s+/g, "_")}`,
                bio: "Геймер и исследователь миров GreenBlox 🚀",
                coverStyle: "emerald",
                statusQuote: "В сети и готов играть",
              });
            }
            setReady(true);
            return;
          }
          // Token is stale/invalid — wipe it so we never authenticate with it again.
          clearToken();
        }
        // No valid backend session. A local-only session (guest profile) is
        // fine — but a saved session that CLAIMS a userId without a working
        // token must NOT become a "half-authenticated" launcher. That state
        // broke multiplayer (every launch posted 401) and looked logged-in
        // while every social API call failed. Clean it up: go to login.
        if (!cancelled && raw) {
          const saved = JSON.parse(raw) as Session;
          if (saved.userId) {
            localStorage.removeItem("greenblox-session");
          } else {
            const localOnly: Session = { name: saved.name, email: saved.email };
            setSession(localOnly);
          }
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    };
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  // Social + chat hooks — active only when logged in with a real backend account.
  const socialEnabled = Boolean(session?.userId);
  const social = useSocial(socialEnabled, Boolean(activeGame));
  const chat = useChat(socialEnabled);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchStudioProjects().then((projects) => {
      if (cancelled) return;
      setStudioProjects(projects);
      setStudioGames(projects.map(studioProjectToGame));
    });
    return () => {
      cancelled = true;
    };
    // Список студийных проектов грузим один раз на сессию пользователя, а не на
    // каждое изменение объекта session. Иначе любое обновление профиля (имя/цвет
    // аватара → updateProfile) отправляло бы лишний GET /api/projects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, session?.email]);

  async function login(name: string, email: string): Promise<void> {
    const data = await socialApi.auth(email, name);
    const next: Session = {
      name: data.user.name,
      email: data.user.email,
      userId: data.user.id,
      avatarColor: data.user.avatarColor,
      handle: `@${data.user.name.toLowerCase().replace(/\s+/g, "_")}`,
      bio: "Геймер и исследователь миров GreenBlox 🚀",
      coverStyle: "emerald",
      statusQuote: "В сети и готов играть",
    };
    setSession(next);
    localStorage.setItem("greenblox-session", JSON.stringify(next));
  }

  function logout() {
    clearToken();
    setSession(null);
    localStorage.removeItem("greenblox-session");
  }

  function updateProfile(updated: Partial<Session>) {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, ...updated };
      localStorage.setItem("greenblox-session", JSON.stringify(next));
      // Публичные поля профиля (био, handle, статус-квота, цвет аватара)
      // синхронизируем на сервер — друзья видят их на странице профиля.
      if (
        socialEnabled &&
        (updated.bio !== undefined ||
          updated.handle !== undefined ||
          updated.statusQuote !== undefined ||
          updated.avatarColor !== undefined)
      ) {
        socialApi
          .updatePublicProfile({
            bio: updated.bio ?? current.bio,
            handle: updated.handle ?? current.handle,
            statusQuote: updated.statusQuote ?? current.statusQuote,
            avatarColor: updated.avatarColor ?? current.avatarColor,
          })
          .catch(() => {});
      }
      return next;
    });
  }

  // Every launch is online: creates a joinable session (Roblox-style place) —
  // but ONLY when the player has a real backend account. Multiplayer endpoints
  // (/api/sessions, sync) require an auth token; a local-only session (user
  // hasn't logged in yet) has no userId/token, so forcing multiplayer there
  // makes every game fail with 401 and the player can't play at all.
  const handlePlayGame = useCallback(
    (game: Game) => {
      const online = Boolean(session?.userId);
      const project = studioProjects.find((p) => `studio-${p.id ?? p.title}` === game.id);
      if (project) {
        const converted = studioProjectToWorld(project);
        setActiveGame({
          game,
          world: converted.world,
          settings: converted.settings,
          subtitle: project.author ?? "GreenBlox Studio",
          colors: session?.colors,
          placeId: String(project.id),
          multiplayer: online,
        });
        return;
      }
      setActiveGame({ game, colors: session?.colors, placeId: `catalog:${game.id}`, multiplayer: online });
    },
    [studioProjects, session?.colors, session?.userId]
  );

  /** Запустить студийный проект по id (карта из профиля другого игрока).
   *  Проект может отсутствовать в локальном списке лаунчера (создан на
   *  другой машине/после загрузки списка) — догружаем его с сервера и
   *  конвертируем в мир движка. Так другие игроки могут играть в чужие
   *  карты прямо из профиля создателя. */
  const handlePlayStudioProject = useCallback(
    (projectId: number, title: string, subtitle?: string) => {
      const apply = (project: StudioProject | null) => {
        const converted = project ? studioProjectToWorld(project) : null;
        const fallbackGame: Game = {
          id: `studio-${projectId}`,
          title: title || "GreenBlox Studio Project",
          creator: subtitle || project?.author || "GreenBlox Studio",
          image:
            project?.thumbnail ??
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
          category: project?.genre ?? "Студия",
          description: project?.description ?? "Эксперимент, созданный в GreenBlox Studio.",
          tags: ["Студия", "Кастом"],
          updated: project?.version ?? "1.0.0",
        };
        setActiveGame({
          game: fallbackGame,
          world: converted?.world,
          settings: converted?.settings,
          subtitle: subtitle || project?.author || "GreenBlox Studio",
          colors: session?.colors,
          placeId: String(projectId),
          multiplayer: Boolean(session?.userId),
        });
      };
      // Сначала ищем в локальном списке (уже загружен с сервера), иначе
      // догружаем по числовому id — проект мог быть создан другим игроком.
      const local = studioProjects.find((p) => Number(p.id) === projectId);
      if (local) {
        apply(local);
        return;
      }
      fetchStudioProject(String(projectId))
        .then((remote) => apply(remote))
        .catch(() => apply(null));
    },
    [studioProjects, session?.colors, session?.userId]
  );

  /** Join a live session by 6-char code (from friend list / enter-code dialog). */
  const handleJoinByCode = useCallback((code: string) => {
    // We must NOT resolve the world by title — the friend may be in a Studio
    // project whose title differs. Ask the backend for the session's placeId
    // first, then load the exact same world the host is playing.
    socialApi
      .getSessionInfo(code)
      .then((info) => {
        if (!info) {
          // Session is gone (host left / server restarted / TTL-pruned).
          // Do NOT mount a fake "Сессия не найдена" screen where the player
          // gets stuck. Instead start GameSession with the join code: it will
          // attempt the join, show "❌ Сессия не найдена по коду" and return
          // to the launcher automatically.
          const missingGame: Game = {
            id: `join-${code}`,
            title: "GreenBlox Place",
            creator: "GreenBlox",
            image:
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
            category: "Мультиплеер",
            description: `Игровая сессия ${code}`,
            tags: ["Мультиплеер"],
            updated: "Сейчас",
          };
          setActiveGame({
            game: missingGame,
            placeId: `catalog:join:${code}`,
            multiplayer: false,
            joinCode: code,
          });
          return;
        }
        const placeId = info.placeId || "";
        // The project may NOT be in the launcher's list (created after the
        // launcher loaded). Fall back to fetching it by id so the guest lands
        // in exactly the world the host is playing.
        const fetchWorld = async (): Promise<{
          project: StudioProject | null;
          converted: ReturnType<typeof studioProjectToWorld> | null;
        }> => {
          const local = studioProjects.find((p) => String(p.id) === placeId);
          if (local) return { project: local, converted: studioProjectToWorld(local) };
          // Catalog places are built locally — never try to load them from the
          // studio API (the backend would return 400 for "catalog:doors").
          // Only numeric studio project ids live on the server.
          if (placeId && !placeId.startsWith("catalog:")) {
            const remote = await fetchStudioProject(placeId);
            if (remote) return { project: remote, converted: studioProjectToWorld(remote) };
          }
          return { project: null, converted: null };
        };

        void fetchWorld().then(({ project, converted }) => {
          const game = project
            ? studioProjectToGame(project)
            : {
                id: `join-${code}`,
                title: info.placeTitle || "GreenBlox Place",
                creator: info.hostName || "GreenBlox",
                image:
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
                category: "Мультиплеер",
                description: `Игровая сессия ${code} — ${info.placeTitle || "плейс"}`,
                tags: ["Мультиплеер"],
                updated: "Сейчас",
              };
          setActiveGame({
            game,
            world: converted?.world,
            settings: converted?.settings,
            subtitle: project?.author ?? info.hostName,
            colors: session?.colors,
            placeId: placeId || `catalog:join:${code}`,
            multiplayer: false,
            joinCode: code,
          });
        });
      })
      .catch(() => {
        // Backend offline — fall back to the default obby so the code can
        // still be attempted; GameSession will show the error toast.
        const fallbackGame: Game = {
          id: `join-${code}`,
          title: "GreenBlox Place",
          creator: "GreenBlox",
          image:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
          category: "Мультиплеер",
          description: `Игровая сессия ${code}`,
          tags: ["Мультиплеер"],
          updated: "Сейчас",
        };
        setActiveGame({
          game: fallbackGame,
          placeId: `catalog:join:${code}`,
          multiplayer: false,
          joinCode: code,
        });
      });
  }, [studioProjects, session?.colors]);

  /** Сохранить итоги забега: статистика игр (launcher) + серверная копия
   *  для профиля друга. */
  const handleSessionEnd = useCallback(
    (outcome: GameSessionPayload) => {
      const game = activeGame?.game;
      const statKey = game?.id ?? "default";
      const payload = {
        coins: outcome.coins,
        deaths: outcome.deaths,
        time: outcome.time,
        stage: outcome.stage,
        won: outcome.won,
      };
      const statsKey = "gb-plays";
      try {
        const raw = localStorage.getItem(statsKey);
        const current: Record<string, { count?: number; last?: number; [k: string]: unknown }> = raw
          ? JSON.parse(raw)
          : {};
        const prev = current[statKey] ?? {};
        current[statKey] = {
          count: (prev.count ?? 0) + 1,
          last: Date.now(),
          ...payload,
        };
        localStorage.setItem(statsKey, JSON.stringify(current));
      } catch {
        /* localStorage недоступен — статистика не сохранится, но игра не сломается */
      }
      // Синхронизируем итоги забега на сервер, чтобы друзья видели их в профиле.
      if (socialEnabled) {
        socialApi
          .syncGameStats([
            {
              gameId: statKey,
              lastPlayedAt: Date.now(),
              coins: payload.coins,
              deaths: payload.deaths,
              timeSec: payload.time,
              stage: payload.stage,
              won: payload.won,
            },
          ])
          .catch(() => {});
      }
    },
    [activeGame?.game, socialEnabled]
  );

  const openStudio = useCallback(() => {
    // Pass the GreenBlox auth token to Studio so it can link the same account.
    // Studio and launcher are different origins (:3001 vs :5173), so we can't
    // share localStorage directly — the token travels via the URL AND via a
    // postMessage (the named window "greenblox-studio" is reused if already
    // open, so the URL ?token= effect with [] deps would never re-run).
    const token = getToken();
    const base = `http://${window.location.hostname || "localhost"}:3001`;
    const studioUrl = token ? `${base}?token=${encodeURIComponent(token)}` : base;
    // NOTE: без `noopener` — намеренно. Студия читает `window.opener` как
    // обратный канал (вход прямо в студии синхронизируется в лаунчер).
    // Именованное окно "greenblox-studio" переиспользует открытую вкладку,
    // поэтому postMessage-канал работает даже при повторном клике.
    const studio = window.open(studioUrl, "greenblox-studio");
    if (token && studio) {
      try {
        // Вместе с токеном передаём и кастомные цвета персонажа (R6, 7 частей):
        // Play-режим студии рисует аватара в тех же цветах, что и лаунчер.
        const avatarColors = session?.colors ? avatarColorsToHex(session.colors) : undefined;
        studio.postMessage(
          {
            source: "greenblox-launcher",
            type: "gb-token",
            token,
            avatarColors,
          },
          base
        );
      } catch {
        /* окно ещё грузится — URL-канал доставит токен */
      }
    }
  }, [session?.colors]);

  // Глобальный сброс авторизации: любой API-вызов получил 401 (токен протух
  // на сервере, БД пересоздана и т.п.). request() уже стёр токен — здесь
  // чисто сбрасываем сессию, закрываем активную игру и показываем логин.
  useEffect(() => {
    const onAuthFail = () => {
      setActiveGame(null);
      setSession(null);
      localStorage.removeItem("greenblox-session");
    };
    window.addEventListener(AUTH_FAIL_EVENT, onAuthFail);
    return () => window.removeEventListener(AUTH_FAIL_EVENT, onAuthFail);
  }, []);

  // Приём обратного канала из студии: если пользователь вошёл прямо в студии
  // (без лаунчера), студия шлёт нам токен + аккаунт. Сохраняем единый вход
  // и сразу подхватываем тот же аккаунт в лаунчере (Roblox-подобная привязка
  // в обе стороны).
  useEffect(() => {
    const studioOrigin = `http://${window.location.hostname || "localhost"}:3001`;
    const onStudioMessage = (e: MessageEvent) => {
      if (e.origin !== studioOrigin) return;
      const data = e.data;
      if (!data || data.source !== "greenblox-studio") return;

      if (data.type === "gb-account-sync" && typeof data.token === "string") {
        setToken(data.token);
        socialApi
          .me()
          .then((me) => {
            // Сохраняем поля текущей сессии (bio/handle/cover/квесты), если они
            // уже были, а имя/цвет/email обновляем из студии.
            setSession((current) => {
              const next: Session = {
                ...(current ?? {}),
                name: typeof data.name === "string" ? data.name : me.name,
                email: typeof data.email === "string" ? data.email : me.email,
                userId: me.id,
                avatarColor: me.avatarColor,
              };
              localStorage.setItem("greenblox-session", JSON.stringify(next));
              return next;
            });
            return null;
          })
          .catch(() => {
            // Токен из студии невалиден — игнорируем, остаёмся на текущей сессии.
          });
        return;
      }
    };
    window.addEventListener("message", onStudioMessage);
    return () => window.removeEventListener("message", onStudioMessage);
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#050805]" />;
  }

  if (!session) {
    return <LoginScreen onLogin={login} />;
  }

  if (activeGame) {
    return (
      <GameSession
        title={activeGame.game.title}
        subtitle={activeGame.subtitle}
        world={activeGame.world}
        settings={activeGame.settings}
        colors={activeGame.colors}
        placeId={activeGame.placeId}
        joinCode={activeGame.joinCode}
        multiplayer={activeGame.multiplayer}
        myUserId={socialEnabled ? session.userId : null}
        soundVolume={readJSON<number>("gb-volume", 80)}
        soundFxEnabled={readJSON<boolean>("gb-soundfx", true)}
        onAvatarChange={(colors) => updateProfile({ colors })}
        onExit={() => setActiveGame(null)}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <Launcher
      userName={session.name}
      userEmail={session.email}
      userHandle={session.handle}
      userBio={session.bio}
      userAvatarColor={session.avatarColor}
      userCoverStyle={session.coverStyle}
      userStatusQuote={session.statusQuote}
      studioGames={studioGames}
      social={socialEnabled ? social : undefined}
      chat={chat}
      myUserId={session.userId ?? null}
      onJoinByCode={(code) => handleJoinByCode(code)}
      onUpdateProfile={updateProfile}
      onLogout={logout}
      onPlayGame={handlePlayGame}
      onPlayMultiplayer={handlePlayGame}
      onOpenStudio={openStudio}
      onPlayCreatorProject={(project) => handlePlayStudioProject(project.id, project.title)}
    />
  );
}
