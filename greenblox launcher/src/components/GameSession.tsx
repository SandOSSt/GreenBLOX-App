import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvatarColors, avatarColorsToHex, DEFAULT_AVATAR } from "../game/Avatar";
import { RobloxEngine, SceneSettings } from "../game/RobloxEngine";
import { BuiltWorld } from "../game/WorldBuilder";
import { GameStats } from "../game/types";
import "../game/imports";
import { socialApi, type RemotePlayer, type SessionInfo, type SessionChatMessage } from "../social/api";
import { GameMenu, type GameMenuSettings, type MenuPlayer } from "./GameMenu";
import { buildExplorer, type ExplorerNode } from "./ExplorerPanel";
import { LogoMark } from "./MenuIcons";
import {
  getLoaded,
  ImportInstance,
  ImportLanguage,
  loadImport,
  subscribe as subscribeImports,
  unloadImport,
} from "../game/imports";

export type GameSessionPayload = {
  coins: number;
  deaths: number;
  time: number;
  stage: number;
  won: boolean;
};

type GameSessionProps = {
  title: string;
  subtitle?: string;
  world?: BuiltWorld;
  settings?: SceneSettings;
  colors?: AvatarColors;
  /** Stable place identifier: numeric studio project id or "catalog:<slug>". */
  placeId?: string;
  /** Join an existing live session by 6-char code. */
  joinCode?: string;
  /** When true, create/join a multiplayer session for this place (host). */
  multiplayer?: boolean;
  /** Current user id — used to avoid rendering our own avatar as a remote player. */
  myUserId?: number | null;
  /** Called when the player changes their avatar inside the session. */
  onAvatarChange?: (colors: AvatarColors) => void;
  /** Master volume (0..100) from launcher settings; applied to in-game SFX. */
  soundVolume?: number;
  /** Whether launcher sound effects are enabled; gates in-game SFX. */
  soundFxEnabled?: boolean;
  onExit: () => void;
  onSessionEnd?: (outcome: GameSessionPayload) => void;
};

function FpsBadge({ stats }: { stats: GameStats | null }) {
  if (!stats) return null;
  const color = stats.fps >= 50 ? "text-emerald-300" : stats.fps >= 25 ? "text-yellow-300" : "text-rose-300";
  return (
    <div className="absolute bottom-4 left-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-mono backdrop-blur-lg border border-white/10">
      <span className={`font-bold ${color}`}>{stats.fps}</span> <span className="text-white/40">FPS</span>
    </div>
  );
}

function WinScreen({ stats, onRestart, onExit }: { stats: GameStats; onRestart: () => void; onExit: () => void }) {
  const m = Math.floor(stats.time / 60);
  const s = Math.floor(stats.time % 60);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg">
      <div className="w-[400px] max-w-[92vw] rounded-[28px] bg-[#121212]/95 p-7 text-center shadow-2xl border border-[#2a2a2a]">
        <div className="mb-3 text-5xl">🏆</div>
        <div className="text-[30px] font-black text-yellow-300">Победа!</div>
        <div className="mt-1 text-[13px] text-[#999]">Ты прошёл {stats.totalStages} этапов</div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/5 p-3 border border-white/8">
            <div className="text-[20px] font-black text-yellow-300">{stats.coins}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40 font-bold">Монет</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-white/8">
            <div className="text-[20px] font-black text-white">{m}:{s.toString().padStart(2, "0")}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40 font-bold">Время</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-white/8">
            <div className="text-[20px] font-black text-rose-300">{stats.deaths}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40 font-bold">Смертей</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 rounded-full bg-[#1ed760] py-3 text-[14px] font-extrabold text-[#05210e] hover:bg-[#2ae06c]"
          >
            Играть снова
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 rounded-full bg-white/8 py-3 text-[14px] font-extrabold text-white hover:bg-white/15"
          >
            В лаунчер
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[86px] z-30 -translate-x-1/2">
      <div className="rounded-full bg-[#1ed760]/95 px-5 py-2 text-[13px] font-bold text-[#05210e] shadow-xl border border-[#2ae06c]/40">
        {msg}
      </div>
    </div>
  );
}

export default function GameSession({ title, subtitle, world, settings, colors, placeId, joinCode, multiplayer, myUserId, onAvatarChange, soundVolume, soundFxEnabled, onExit, onSessionEnd }: GameSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RobloxEngine | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [won, setWon] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [muted, setMuted] = useState(false);
  const [menuSettings, setMenuSettings] = useState<GameMenuSettings>({
    sensitivity: 0.0018,
    quality: 2,
    clouds: true,
  });
  const [explorerRoot, setExplorerRoot] = useState<ExplorerNode | null>(null);
  /** Latest roster from sync — applied to React state at most every 500ms so
   *  the 20 Hz sync loop doesn't re-render the whole component 20×/sec. */
  const playersRef = useRef<RemotePlayer[]>([]);
  const lastSessionInfoAtRef = useRef(0);
  /** Last serialized avatar colors actually sent to the server — sync sends
   *  colors only when they change (server preserves the last sent look). */
  const lastSentColorsRef = useRef("");
  const [avatarColors, setAvatarColors] = useState<AvatarColors>(colors ?? DEFAULT_AVATAR);
  const [loadedImports, setLoadedImports] = useState<ImportInstance[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionChat, setSessionChat] = useState<SessionChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const toastTimerRef = useRef(0);
  const sessionRef = useRef<SessionInfo | null>(null);
  const joinCodeRef = useRef(joinCode ?? null);
  joinCodeRef.current = joinCode ?? null;
  const myUserIdRef = useRef(myUserId);
  myUserIdRef.current = myUserId;
  /** True while the multiplayer effect is mounted. React 19 StrictMode double-
   *  mounts effects in dev (mount → unmount → mount): the dead first run must
   *  NEVER tear the session down, because the second run reuses the SAME
   *  session (createSession is idempotent, joinSession re-adds us). Leaving
   *  from the dead run would delete the host's session / drop the guest from
   *  the roster → syncFull returns [] → "сессия закрыта" bounce, and friends
   *  see "online" instead of "in_game". */
  const multiplayerMountedRef = useRef(false);
  const onSessionEndRef = useRef(onSessionEnd);
  onSessionEndRef.current = onSessionEnd;
  /** Защита от двойного вызова onSessionEnd (победа → exit/WinScreen). */
  const sessionEndedRef = useRef(false);
  /** Детект «мёртвой сессии» срабатывает на каждом sync-тике (20 Гц). Без
   *  гарда тост «Хост покинул игру» мигал бы ~32 раза за 1.6 с до возврата. */
  const deathDetectedRef = useRef(false);
  const reportEnd = useCallback((e: RobloxEngine, wonFlag: boolean) => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;
    onSessionEndRef.current?.({
      coins: e.coins,
      deaths: e.deaths,
      time: e.elapsed,
      stage: e.stage,
      won: wonFlag,
    });
  }, []);

  const onAvatarChangeRef = useRef(onAvatarChange);
  onAvatarChangeRef.current = onAvatarChange;
  /** Latest custom avatar colors, read by the sync loop without restarting it. */
  const avatarColorsRef = useRef<AvatarColors>(colors ?? DEFAULT_AVATAR);
  avatarColorsRef.current = avatarColors;

  const flash = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  // Создаём движок ОДИН раз на сессию. Смена цвета аватара (avatarColors)
  // НЕ должна пересоздавать движок — иначе сбросятся позиция, стадия, монеты
  // и оборвётся мультиплеерный sync. Цвета применяются отдельным эффектом ниже.
  const engineDepsKey = useMemo(
    () => (world ? `world:${world.parts.length}:${world.spawnPos.toArray().join(",")}` : "obby") + (settings ? `:${settings.skyColor ?? ""}:${settings.voidLevel ?? ""}` : ""),
    [world, settings]
  );
  useEffect(() => {
    if (!containerRef.current) return;
    const engine = new RobloxEngine(
      containerRef.current,
      {
        onStats: setStats,
        onCheckpoint: (stage) => flash(`✓ Этап ${stage} пройден`),
        onCoin: (coins) => flash(`🪙 ${coins} монет`),
        onDeath: () => flash("💀 Ой..."),
        onWin: () => {
          setWon(true);
          if (engineRef.current) reportEnd(engineRef.current, true);
        },
        onLocked: () => {},
      },
      colors ?? DEFAULT_AVATAR,
      world,
      settings
    );
    engineRef.current = engine;

    try {
      loadImport("Lua", engine);
    } catch {
      /* optional module */
    }
    setLoadedImports(getLoaded());
    setAvatarColors(colors ?? DEFAULT_AVATAR);
    return () => {
      clearTimeout(toastTimerRef.current);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineDepsKey]);

  useEffect(() => {
    const sync = () => setLoadedImports(getLoaded());
    sync();
    const unsubscribe = subscribeImports(sync);
    const timer = window.setInterval(sync, 400);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setAvatarColors(avatarColors);
    // Persist custom look so it survives leaving and re-entering a game.
    onAvatarChangeRef.current?.(avatarColors);
  }, [avatarColors]);

  // Keep engine settings in sync with the in-game menu (sensitivity, quality, clouds).
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.cameraSensitivity = menuSettings.sensitivity;
    engine.setGraphicsQuality(menuSettings.quality);
    engine.setCloudsVisible(menuSettings.clouds);
  }, [menuSettings]);

  // Apply launcher sound settings (master volume + SFX toggle) to the engine.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.sfx.enabled = soundFxEnabled !== false;
    engine.sfx.volume = Math.max(0, Math.min(1, (soundVolume ?? 80) / 100));
  }, [soundFxEnabled, soundVolume]);

  // In-game menu mute toggle also gates sound, and vice versa.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.sfx.enabled = !muted && soundFxEnabled !== false;
  }, [muted, soundFxEnabled]);

  // Escape toggles the Roblox-style menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Escape") return;
      // Don't toggle the menu while typing in the chat input.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      setShowMenu((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pause the world while the menu is open.
  useEffect(() => {
    const engine = engineRef.current;
    if (engine) engine.paused = showMenu;
  }, [showMenu]);

  // Rebuild the Explorer tree only while the menu (with the Explorer tab) is
  // open. Before, a 500ms timer rebuilt and setState'd the whole tree even
  // while playing — a steady re-render cost on big Studio worlds.
  useEffect(() => {
    if (!showMenu) return;
    const e = engineRef.current;
    if (e) setExplorerRoot(buildExplorer(e.parts));
    const timer = window.setInterval(() => {
      const ee = engineRef.current;
      if (ee) setExplorerRoot(buildExplorer(ee.parts));
    }, 500);
    return () => clearInterval(timer);
  }, [showMenu]);

  // --- Multiplayer: create/join session + position sync loop ---
  const multiplayerEnabled = Boolean(joinCode) || Boolean(multiplayer);
  useEffect(() => {
    if (!multiplayerEnabled) return;
    let cancelled = false;
    let syncTimer = 0;
    let chatTimer = 0;
    // Prevents overlapping sync requests: on a slow network the 100ms tick can
    // fire while a previous POST is still in flight, stacking a fan of parallel
    // requests and hammering the backend. Only one request may be in flight.
    let syncInFlight = false;

    // StrictMode remount guard (React 19 dev): effects are mounted twice in
    // development (mount → unmount → mount). The first run's cleanup and any
    // in-flight create/join promise must NOT tear the session down — the second
    // run reuses the SAME idempotent server-side session (createSession reuses
    // by host+placeId, joinSession re-adds us). Closing it from the dead run
    // would:
    //   - delete the host's session → syncFull returns [] → "сессия закрыта";
    //   - drop the guest from the roster → same bounce;
    //   - flip our presence to "online" → friends see "в сети" not "в игре".
    // We defer the leave by one macrotask: if by then the effect was remounted,
    // the new run has taken over the session and we must NOT leave it. A real
    // unmount (player exited the game) still leaves the session as before.
    const leaveIfStillDead = (sessionId: string) => {
      window.setTimeout(() => {
        if (!multiplayerMountedRef.current) {
          socialApi.leaveSession(sessionId).catch(() => {});
        }
      }, 0);
    };
    multiplayerMountedRef.current = true;

    const startSync = (session: SessionInfo) => {
      sessionRef.current = session;
      setSessionInfo(session);

      const tick = async () => {
        const engine = engineRef.current;
        if (!engine || !sessionRef.current) return;
        // Skip this tick if the previous request hasn't finished yet — the
        // interval keeps firing every 100ms regardless of network latency.
        if (syncInFlight) return;
        syncInFlight = true;
        try {
          // Avatar colors are part of the look, not of the position: send them
          // ONLY when they change (the server keeps the last sent colors for the
          // other players). Previously every 50ms sync carried 7 hex strings.
          const colorsHex = avatarColorsToHex(avatarColorsRef.current);
          const colorsKey = colorsHex
            ? `${colorsHex.head}:${colorsHex.torso}:${colorsHex.leftArm}:${colorsHex.rightArm}:${colorsHex.leftLeg}:${colorsHex.rightLeg}:${colorsHex.shirt}`
            : "";
          const colorsChanged = colorsKey !== lastSentColorsRef.current;
          if (colorsChanged) lastSentColorsRef.current = colorsKey;
          const players = await socialApi.syncSession(
            sessionRef.current.id,
            {
              x: engine.pos.x,
              y: engine.pos.y,
              z: engine.pos.z,
            },
            {
              face: engine.facing,
              grounded: engine.grounded,
              coins: engine.coins,
              deaths: engine.deaths,
              stage: engine.stage,
              won: engine.won,
              ...(colorsChanged ? { avatarColors: colorsHex } : {}),
            }
          );
          if (!cancelled) {
            // The server returns the full roster (including ourselves); only
            // render other users as remote avatars, but keep the full list
            // in sessionInfo so the "N игроков" badge shows the real count.
            const selfId = myUserIdRef.current;
            const remote = selfId != null ? players.filter((p) => p.userId !== selfId) : players;
            engine.remotePlayers.update(remote);
            // Throttle the React state update: keep the latest roster in a ref
            // and flush it to state at most every 500ms. The 20 Hz sync loop
            // keeps the remote avatars (three.js) moving; only the badge/list
            // re-renders at ~2 Hz.
            playersRef.current = players;
            if (Date.now() - lastSessionInfoAtRef.current >= 500) {
              lastSessionInfoAtRef.current = Date.now();
              setSessionInfo((prev) => (prev ? { ...prev, players } : prev));
            }

            // Session-death detection: syncFull silently returns [] when the
            // underlying session no longer exists (host left, server restarted,
            // TTL-pruned). If our own user is missing from the roster, we are
            // inside a dead session — leaving the player stuck in an empty game
            // with a stale join code that nobody else can use. Report and exit.
            // NOTE: this branch re-fires on EVERY sync tick (20 Hz). The toast
            // and exit timeout must be one-shot — otherwise the toast blinks
            // ~32 times during the 1.6s wait and the exit runs repeatedly.
            if (selfId != null && !players.some((p) => p.userId === selfId)) {
              if (deathDetectedRef.current) return;
              deathDetectedRef.current = true;
              const wasGuest = Boolean(joinCodeRef.current);
              flash(wasGuest ? "👋 Хост покинул игру — сессия закрыта" : "🕒 Сессия закрыта — возврат в лаунчер");
              window.setTimeout(() => {
                if (!cancelled && engineRef.current && !sessionEndedRef.current) {
                  reportEnd(engineRef.current, false);
                  onExit();
                }
              }, 1600);
              return;
            }
          }
        } catch {
          /* transient sync error — retry next tick */
        } finally {
          syncInFlight = false;
        }
      };

      const refreshChat = async () => {
        if (!sessionRef.current) return;
        try {
          const messages = await socialApi.getSessionChat(sessionRef.current.id);
          if (!cancelled) setSessionChat(messages);
        } catch {
          /* transient — retry later */
        }
      };

      // NOTE: there is deliberately NO separate getSessionInfo poll here.
      // The 20 Hz sync tick already returns the full roster every 50 ms
      // (players + our own death detection), so a second GET /api/sessions?code=
      // every 2 s would only duplicate the same data — and could even overwrite
      // a fresher roster from sync with a stale one from the GET.
      tick();
      refreshChat();
      // 20 Hz position sync (50 ms) — matched by RemotePlayers constant-speed
      // arrival, so remote movement is uniform instead of rubber-banding.
      syncTimer = window.setInterval(tick, 1000 / 20);
      chatTimer = window.setInterval(refreshChat, 2500);
      flash(multiplayer ? `🌐 Сессия создана · код ${session.code}` : `🌐 Подключено · ${session.hostName}`);
    };

    const boot = async () => {
      try {
        if (joinCode) {
          const session = await socialApi.joinSession(joinCode);
          // Player left while the join request was in flight — the session we
          // just joined must not linger with us as a ghost player. Deferred so
          // a StrictMode remount (same idempotent server session) doesn't
          // destroy the session the remounted run is now using.
          if (cancelled) {
            if (session) leaveIfStillDead(session.id);
            return;
          }
          if (!session) {
            flash("❌ Сессия не найдена по коду");
            onExit();
            return;
          }
          startSync(session);
        } else if (multiplayer) {
          const session = await socialApi.createSession(placeId || `catalog:${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title);
          // Same guard: unmount during createSession must close the session
          // instead of leaving it hanging until the server's TTL prune.
          // Deferred so a StrictMode remount (same idempotent server session)
          // doesn't destroy the session the remounted run is now using.
          if (cancelled) {
            if (session) leaveIfStillDead(session.id);
            return;
          }
          startSync(session);
        }
      } catch (err: any) {
        flash(err?.message ?? "Не удалось подключиться к мультиплееру");
      }
    };
    boot();

    return () => {
      cancelled = true;
      multiplayerMountedRef.current = false;
      clearInterval(syncTimer);
      clearInterval(chatTimer);
      const session = sessionRef.current;
      sessionRef.current = null;
      // Deferred leave: StrictMode remounts the effect immediately after
      // cleanup — by the time this timeout fires, the remount will have set
      // multiplayerMountedRef back to true and we must NOT tear the session
      // down. A real unmount leaves multiplayerMountedRef false, so the
      // session is closed exactly as before.
      if (session) leaveIfStillDead(session.id);
      engineRef.current?.remotePlayers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiplayerEnabled, joinCode, multiplayer, title]);

  const handleLoad = useCallback(
    (lang: ImportLanguage) => {
      const engine = engineRef.current;
      if (!engine) return;
      loadImport(lang, engine);
      setLoadedImports(getLoaded());
      flash(`${lang} · загружен`);
    },
    [flash]
  );

  const handleUnload = useCallback(
    (lang: ImportLanguage) => {
      unloadImport(lang);
      setLoadedImports(getLoaded());
      flash(`${lang} · выгружен`);
    },
    [flash]
  );

  /** Send a friend request from the in-game players panel. */
  const handleAddFriend = useCallback(
    async (userId: number) => {
      try {
        await socialApi.sendFriendRequest(userId);
        flash("✓ Заявка в друзья отправлена");
      } catch (err: any) {
        flash(err?.message ?? "Не удалось отправить заявку");
      }
    },
    [flash]
  );

  const handleBuy = useCallback(
    (itemId: string) => {
      const instance = getLoaded().find((l) => l.language === "1C") as (ImportInstance & { buy?: (id: string) => boolean }) | undefined;
      if (!instance?.buy) return;
      if (instance.buy(itemId)) {
        flash("✓ Покупка совершена");
        setLoadedImports(getLoaded());
      }
    },
    [flash]
  );

  const restart = useCallback(() => {
    engineRef.current?.fullReset();
    setWon(false);
    flash("🔄 Новый забег");
  }, [flash]);

  const handleExit = useCallback(() => {
    // Если игрок уже победил, onSessionEnd уже был вызван с won=true.
    if (engineRef.current && !won) reportEnd(engineRef.current, false);
    onExit();
  }, [onExit, reportEnd, won]);

  // Players list rendered inside the GameMenu (Roblox-style "Люди" tab).
  const menuPlayers: MenuPlayer[] = useMemo(() => {
    if (!sessionInfo) return [];
    return [...sessionInfo.players]
      .sort((a, b) => {
        if (a.userId === myUserId) return -1;
        if (b.userId === myUserId) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((p) => ({
        userId: p.userId,
        name: p.name,
        avatarColor: p.avatarColor,
        coins: p.coins,
        deaths: p.deaths,
        stage: p.stage,
        won: p.won,
        isMe: p.userId === myUserId,
        isHost: sessionInfo.hostUserId === p.userId,
      }));
  }, [sessionInfo, myUserId]);

  return (
    <div className="relative h-screen w-full select-none overflow-hidden bg-[#0b0d10] text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* GreenBlox favicon menu button — top-left, Roblox-style */}
      <div className="absolute left-4 top-4 z-30">
        <button
          type="button"
          onClick={() => setShowMenu(true)}
          className="group relative flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[#16181c]/85 shadow-[0_6px_24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-200 hover:bg-[#1d2026] hover:shadow-[0_6px_28px_rgba(30,215,96,0.35),0_0_0_1px_rgba(42,224,108,0.4)] active:scale-95"
          title="Меню (Esc)"
        >
          <LogoMark className="h-8 w-8" rounded="rounded-[11px]" />
          <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-black/85 px-3 py-1.5 text-[10.5px] font-bold text-white/90 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100">
            Меню · Esc
          </span>
        </button>
      </div>

      <FpsBadge stats={stats} />

      {sessionInfo && (
        <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2.5 rounded-[16px] bg-[#16181c]/80 px-4 py-2 shadow-lg backdrop-blur-xl border border-white/10">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#2ae06c]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ae06c]" />
            {sessionInfo.players.length} игрок{sessionInfo.players.length === 1 ? "" : sessionInfo.players.length < 5 ? "а" : "ов"}
          </span>
          <span className="h-4 w-px bg-white/15" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white/85">Код: {sessionInfo.code}</span>
        </div>
      )}

      {subtitle && !won && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 max-w-[260px] rounded-2xl bg-black/45 px-3.5 py-2.5 text-right backdrop-blur-lg border border-white/8">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/35">{subtitle}</div>
        </div>
      )}

      {/* Roblox-style in-game menu */}
      {showMenu && (
        <GameMenu
          stats={stats}
          title={title}
          players={menuPlayers}
          joinCode={sessionInfo?.code}
          avatarColors={avatarColors}
          settings={menuSettings}
          explorerRoot={explorerRoot}
          loadedImports={loadedImports}
          chatMessages={sessionChat}
          chatDraft={chatDraft}
          onChatDraftChange={setChatDraft}
          onSendChat={(text) => {
            if (!sessionInfo) return;
            socialApi
              .sendSessionChat(sessionInfo.id, text)
              .then(() => {
                setChatDraft("");
                return socialApi.getSessionChat(sessionInfo.id);
              })
              .then((messages) => setSessionChat(messages))
              .catch((err: any) => flash(err?.message ?? "Не удалось отправить"));
          }}
          onAvatarChange={setAvatarColors}
          onSettingsChange={setMenuSettings}
          onLoadImport={handleLoad}
          onUnloadImport={handleUnload}
          on1CBuy={handleBuy}
          onTeleport={(x, y, z) => {
            const e = engineRef.current;
            if (!e) return;
            e.pos.set(x, y, z);
            e.vel.set(0, 0, 0);
            flash(`→ Телепорт (${x.toFixed(0)}, ${y.toFixed(0)}, ${z.toFixed(0)})`);
          }}
          onRespawn={() => {
            engineRef.current?.respawn(false);
            flash("↺ Возрождение");
          }}
          onRestart={() => {
            restart();
            setShowMenu(false);
          }}
          onLeave={handleExit}
          onClose={() => setShowMenu(false)}
          muted={muted}
          onToggleMute={() => setMuted((v) => !v)}
          myUserId={myUserId ?? null}
          onAddFriend={handleAddFriend}
        />
      )}

      <Toast msg={toast} />
      {won && stats && <WinScreen stats={stats} onRestart={restart} onExit={handleExit} />}
    </div>
  );
}
