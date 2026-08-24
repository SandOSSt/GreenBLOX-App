import { useEffect, useMemo, useState } from "react";
import {
  colorFromName,
  games,
  type ChatThread,
  type Friend,
  type Game,
  type NotificationItem,
} from "../data";
import LauncherHome from "./LauncherHome";
import LibraryView from "./LibraryView";
import SearchBar from "./SearchBar";
import AvatarCircle from "./AvatarCircle";
import { SocialSection } from "./SocialSection";
import OnlineChat from "./OnlineChat";
import SocialProfileView, { UserAvatar } from "./SocialProfileView";
import FriendProfileView from "./FriendProfileView";
import type { CreatorProjectCardInfo } from "./CreatorProjectCard";
import SettingsView, { type SettingsTab } from "./SettingsView";
import type { ProfileData, PlayStat, Badge, ProfileStats, UserLevel } from "./types";
import type { SocialState } from "../social/useSocial";
import { statusLabel } from "../social/useSocial";
import type { ChatState } from "../social/useChat";
import { socialApi, type FriendEntry, type PublicProfile, type SearchResult } from "../social/api";
import {
  IconBell,
  IconBox,
  IconChat,
  IconCompass,
  IconGamepad,
  IconHeart,
  IconHome,
  IconLock,
  IconPlay,
  IconPlus,
  IconSend,
  IconSettings,
  IconShop,
  IconStar,
  IconUsers,
  IconX,
  LogoMark,
} from "./Icons";

type View = "home" | "recs" | "shop" | "friends" | "friendProfile" | "profile" | "settings";
type Overlay = "none" | "notify" | "chat" | "friendProfile" | "addFriend" | "joinCode" | "game";

type Props = {
  userName: string;
  userEmail: string;
  userHandle?: string;
  userBio?: string;
  userAvatarColor?: string;
  userCoverStyle?: string;
  userStatusQuote?: string;
  studioGames?: Game[];
  social?: SocialState;
  chat?: ChatState;
  myUserId?: number | null;
  onJoinByCode?: (code: string, placeTitle: string) => void;
  onUpdateProfile: (updated: Partial<ProfileData>) => void;
  onLogout: () => void;
  onPlayGame?: (game: Game) => void;
  onPlayMultiplayer?: (game: Game) => void;
  onOpenStudio?: () => void;
  /** Запустить студийную карту по id (из профиля создателя). */
  onPlayCreatorProject?: (project: CreatorProjectCardInfo) => void;
};

type FriendCard = { id: string; name: string; color: string; activity?: string };

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

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

function friendStatusText(friend: FriendEntry): string {
  if (friend.status === "in_game") {
    return `Играет в ${friend.session?.placeTitle || "GreenBlox Place"}`;
  }
  if (friend.status === "in_studio") return "Создаёт миры в GreenBlox Studio";
  if (friend.status === "online") return "В лаунчере";
  return "Не в сети";
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function Launcher({
  userName,
  userEmail,
  userHandle,
  userBio,
  userAvatarColor,
  userCoverStyle,
  userStatusQuote,
  studioGames = [],
  social,
  chat,
  myUserId,
  onJoinByCode,
  onUpdateProfile,
  onLogout,
  onPlayGame,
  onPlayMultiplayer,
  onOpenStudio,
  onPlayCreatorProject,
}: Props) {
  const [view, setView] = useState<View>("home");
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Theme & settings
  const [theme, setTheme] = useState<string>(() => loadJSON("gb-theme", "greenblox"));
  const [density, setDensity] = useState<string>(() => loadJSON("gb-density", "normal"));
  const [volume, setVolume] = useState<number>(() => loadJSON("gb-volume", 80));
  const [soundFx, setSoundFx] = useState<boolean>(() => loadJSON("gb-soundfx", true));
  const [notifFriends, setNotifFriends] = useState<boolean>(() => loadJSON("gb-n-friends", true));
  const [notifGames, setNotifGames] = useState<boolean>(() => loadJSON("gb-n-games", true));
  const [quality, setQuality] = useState<string>(() => loadJSON("gb-quality", "Высокое"));
  const [fpsLimit, setFpsLimit] = useState<string>(() => loadJSON("gb-fps", "60 FPS"));
  const [displayMode, setDisplayMode] = useState<string>(() => loadJSON("gb-display", "В окне"));
  const [hardwareAccel, setHardwareAccel] = useState<boolean>(() => loadJSON("gb-hwaccel", true));
  const [privacyPrivacy, setPrivacyPrivacy] = useState<string>(() => loadJSON("gb-privacy-msg", "Все"));
  const [showActivity, setShowActivity] = useState<boolean>(() => loadJSON("gb-activity", true));

  // User state
  const [favorites, setFavorites] = useState<string[]>(() => loadJSON("gb-favorites", []));
  const [friendList, setFriendList] = useState<Friend[]>(() => loadJSON("gb-friends", []));
  const [threads, setThreads] = useState<ChatThread[]>(() => loadJSON("gb-threads", []));
  const [notes, setNotes] = useState<NotificationItem[]>(() =>
    loadJSON<NotificationItem[] | null>("gb-notes", null) ?? [
      {
        id: "welcome",
        type: "system",
        title: "Добро пожаловать в GreenBlox",
        text: "Твой идеальный игровой клиент готов.",
        time: nowTime(),
        unread: true,
      },
    ]
  );
  const [playStats, setPlayStats] = useState<Record<string, PlayStat>>(() => loadJSON("gb-plays", {}));
  const [joinedAt] = useState<number>(() => {
    const existing = loadJSON<number | null>("gb-joined", null);
    if (existing) return existing;
    const now = Date.now();
    localStorage.setItem("gb-joined", JSON.stringify(now));
    return now;
  });

  const [profile, setProfile] = useState<ProfileData>(() => ({
    name: userName,
    handle: userHandle || `@${userName.toLowerCase().replace(/\s+/g, "_")}`,
    bio: userBio || "Геймер и исследователь миров GreenBlox 🚀",
    avatarColor: userAvatarColor || colorFromName(userName || userEmail),
    coverStyle: userCoverStyle || "emerald",
    statusQuote: userStatusQuote || "В сети и готов играть",
  }));

  // Keep the local profile draft in sync when the parent session changes
  // (e.g. after the server returns a fresh user object on boot).
  useEffect(() => {
    setProfile((current) => ({
      ...current,
      name: userName || current.name,
      avatarColor: userAvatarColor || current.avatarColor,
    }));
  }, [userName, userAvatarColor]);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [viewingFriend, setViewingFriend] = useState<FriendEntry | null>(null);
  const [viewingFriendProfile, setViewingFriendProfile] = useState<PublicProfile | null>(null);
  const [viewingFriendLoading, setViewingFriendLoading] = useState(false);
  /** Создатель, чьи игры показываем в модалке (из секции «Создатели рядом»). */
  const [viewingCreator, setViewingCreator] = useState<{ name: string; games: Game[] } | null>(null);
  /** Куда вернуться после закрытия профиля друга («Назад» не всегда ведёт на главную). */
  const [friendProfileFrom, setFriendProfileFrom] = useState<View>("home");
  const [launching, setLaunching] = useState<Game | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  /** Опубликованные карты текущего игрока (секция «Карты создателя»). */
  const [myCreatorProjects, setMyCreatorProjects] = useState<CreatorProjectCardInfo[]>([]);

  const userColor = profile.avatarColor;
  const unread = notes.filter((n) => n.unread).length;
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;
  const socialEnabled = Boolean(social);

  // Свои опубликованные карты + серверная статистика: /api/profile/:id отдаёт
  // проекты владельца (isPublished = true) и агрегаты user_game_stats.
  // Статистику мёрджим в playStats по максимуму на игру — уровень не
  // «откатывается» после перезагрузки лаунчера или при входе с другого
  // устройства (сервер уже накопил запуски, которых нет в localStorage).
  useEffect(() => {
    if (!socialEnabled || !myUserId) {
      setMyCreatorProjects([]);
      return;
    }
    let cancelled = false;
    socialApi
      .getPublicProfile(myUserId)
      .then((p) => {
        if (cancelled) return;
        setMyCreatorProjects(p.creatorProjects ?? []);
        const serverStats = p.stats?.playedGames ?? [];
        if (serverStats.length > 0) {
          setPlayStats((prev) => {
            const next = { ...prev };
            for (const g of serverStats) {
              const existing = next[g.gameId] ?? { count: 0, last: 0 };
              next[g.gameId] = {
                count: Math.max(existing.count ?? 0, g.count ?? 0),
                last: Math.max(existing.last ?? 0, g.lastPlayedAt ?? 0),
              };
            }
            return next;
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [socialEnabled, myUserId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gb-theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => localStorage.setItem("gb-density", JSON.stringify(density)), [density]);
  useEffect(() => localStorage.setItem("gb-volume", JSON.stringify(volume)), [volume]);
  useEffect(() => localStorage.setItem("gb-soundfx", JSON.stringify(soundFx)), [soundFx]);
  useEffect(() => localStorage.setItem("gb-n-friends", JSON.stringify(notifFriends)), [notifFriends]);
  useEffect(() => localStorage.setItem("gb-n-games", JSON.stringify(notifGames)), [notifGames]);
  useEffect(() => localStorage.setItem("gb-quality", JSON.stringify(quality)), [quality]);
  useEffect(() => localStorage.setItem("gb-fps", JSON.stringify(fpsLimit)), [fpsLimit]);
  useEffect(() => localStorage.setItem("gb-display", JSON.stringify(displayMode)), [displayMode]);
  useEffect(() => localStorage.setItem("gb-hwaccel", JSON.stringify(hardwareAccel)), [hardwareAccel]);
  useEffect(() => localStorage.setItem("gb-privacy-msg", JSON.stringify(privacyPrivacy)), [privacyPrivacy]);
  useEffect(() => localStorage.setItem("gb-activity", JSON.stringify(showActivity)), [showActivity]);
  useEffect(() => localStorage.setItem("gb-favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("gb-friends", JSON.stringify(friendList)), [friendList]);
  useEffect(() => localStorage.setItem("gb-threads", JSON.stringify(threads)), [threads]);
  useEffect(() => localStorage.setItem("gb-notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem("gb-plays", JSON.stringify(playStats)), [playStats]);

  const totalPlays = useMemo(
    () => Object.values(playStats).reduce((s, p) => s + p.count, 0),
    [playStats]
  );

  const popularGames = useMemo(
    () =>
      games
        .filter((g) => (playStats[g.id]?.count ?? 0) > 0)
        .sort((a, b) => (playStats[b.id]?.count ?? 0) - (playStats[a.id]?.count ?? 0)),
    [playStats]
  );

  const recentGames = useMemo(
    () =>
      games
        .filter((g) => (playStats[g.id]?.last ?? 0) > 0)
        .sort((a, b) => (playStats[b.id]?.last ?? 0) - (playStats[a.id]?.last ?? 0)),
    [playStats]
  );

  // Hero-баннер: предпочитаем КАТАЛОГОВУЮ игру (у них есть обложки, описание,
  // счётчик игроков). Студийная игра с заглушкой-картинкой попадает в баннер
  // только если каталог пуст — иначе «стоит попробовать» показывает битое
  // изображение вместо флагмана.
  const featuredGame = useMemo(() => {
    const catalogIds = new Set(games.map((g) => g.id));
    const playedCatalog = popularGames.find((g) => catalogIds.has(g.id));
    const popularCatalog = studioGames.find((g) => catalogIds.has(g.id));
    return playedCatalog ?? popularCatalog ?? popularGames[0] ?? studioGames[0] ?? games[0];
  }, [popularGames, studioGames]);

  /** Friends shown in the profile: live social friends when connected, otherwise
   *  the local list. Without this the profile/level/badges would show "0 друзей"
   *  for logged-in users even though the backend list is full. */
  const effectiveFriends: Friend[] = useMemo(() => {
    if (social) {
      return social.friends.map((f) => ({ id: String(f.id), name: f.name, color: f.avatarColor }));
    }
    return friendList;
  }, [social, friendList]);

  const userLevel: UserLevel = useMemo(() => {
    // Единая формула с сервером (/api/profile/:id): без favorites — они
    // локальные и не существуют на бэкенде, поэтому уровень был бы разным
    // в лаунчере и на странице профиля друга.
    const xp = totalPlays * 120 + effectiveFriends.length * 150;
    const level = Math.floor(xp / 500) + 1;
    const currentXp = xp % 500;
    return { level, currentXp, maxXp: 500, xp };
  }, [totalPlays, effectiveFriends.length]);

  const badges: Badge[] = useMemo(() => {
    // Онлайн-чат живёт БЕЗ local threads (useChat/OnlineChat), поэтому считаем
    // и его: каждый онлайн-тред с содержимым — как минимум одно сообщение.
    const localSent = threads.reduce((acc, t) => acc + t.messages.length, 0);
    const onlineThreadsWithContent = chat ? chat.threads.filter((t) => t.lastMessage).length : 0;
    const totalSentMessages = localSent + onlineThreadsWithContent;
    return [
      { id: "founder", title: "Основатель", description: "Зарегистрирован в GreenBlox", icon: "🛡️", color: "#1ed760", unlocked: true },
      { id: "first_launch", title: "Первопроходец", description: "Запустил свою первую игру", icon: "🚀", color: "#3b82f6", unlocked: totalPlays >= 1 },
      { id: "gamer", title: "Игроман", description: "Запустил 5+ игр в клиенте", icon: "🎮", color: "#a855f7", unlocked: totalPlays >= 5 },
      { id: "social", title: "Общительный", description: "Добавил первого друга", icon: "🤝", color: "#f59e0b", unlocked: effectiveFriends.length >= 1 },
      { id: "collector", title: "Коллекционер", description: "Добавил игру в избранное", icon: "⭐", color: "#ec4899", unlocked: favorites.length >= 1 },
      { id: "messenger", title: "Собеседник", description: "Отправил сообщение в чате", icon: "💬", color: "#14b8a6", unlocked: totalSentMessages >= 1 },
    ];
  }, [totalPlays, effectiveFriends.length, favorites.length, threads, chat]);

  const allGames = useMemo(() => {
    const seen = new Set(games.map((g) => g.id));
    const extras = studioGames.filter((g) => !seen.has(g.id));
    return [...games, ...extras];
  }, [studioGames]);

  const onlineFriends: FriendCard[] = useMemo(() => {
    if (social) {
      return social.friends
        .filter((f) => f.status !== "offline")
        .slice(0, 12)
        .map((f) => ({
          id: String(f.id),
          name: f.name,
          color: f.avatarColor,
          activity: f.session
            ? `Играет в ${f.session.placeTitle || "GreenBlox Place"}`
            : f.status === "in_studio"
              ? "Создаёт миры в Studio"
              : "В лаунчере",
        }));
    }
    return friendList.map((f) => ({ id: f.id, name: f.name, color: f.color, activity: "В лаунчере" }));
  }, [social, friendList]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!launching) return;
    setLaunchProgress(8);
    const id = window.setInterval(() => {
      setLaunchProgress((p) => (p >= 100 ? 100 : p + Math.random() * 14 + 6));
    }, 180);
    return () => window.clearInterval(id);
  }, [launching]);

  useEffect(() => {
    if (launching && launchProgress >= 100) {
      const g = launching;
      const t = window.setTimeout(() => {
        setLaunching(null);
        setLaunchProgress(0);
        setPlayStats((prev) => ({
          ...prev,
          [g.id]: { count: (prev[g.id]?.count ?? 0) + 1, last: Date.now() },
        }));
        setToast(`${g.title} запущена`);
        pushNote({ type: "game", title: g.title, text: "Игра успешно запущена." });
      }, 500);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchProgress, launching]);

  function pushNote(n: { type: NotificationItem["type"]; title: string; text: string }) {
    setNotes((prev) => [
      { id: `${Date.now()}-${Math.random()}`, time: nowTime(), unread: true, ...n },
      ...prev,
    ]);
  }

  function openGame(game: Game) {
    setActiveGame(game);
    setOverlay("game");
  }

  function playGame(game: Game) {
    setOverlay("none");
    setActiveGame(null);
    if (onPlayGame) {
      onPlayGame(game);
      return;
    }
    setLaunching(game);
    setLaunchProgress(0);
  }

  function playMultiplayer(game: Game) {
    setOverlay("none");
    setActiveGame(null);
    if (onPlayMultiplayer) {
      onPlayMultiplayer(game);
      return;
    }
    if (onPlayGame) {
      onPlayGame(game);
      return;
    }
    setLaunching(game);
    setLaunchProgress(0);
  }

  function toggleFav(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addFriend() {
    const name = newFriendName.trim();
    if (!name) return;
    setNewFriendName("");

    if (social) {
      socialApi
        .search(name)
        .then(async (results) => {
          const exact = results.find((r) => r.name.toLowerCase() === name.toLowerCase());
          if (!exact) {
            setOverlay("none");
            setToast(`Игрок «${name}» не найден — проверь ник`);
            return;
          }
          if (social.friends.some((f) => f.id === exact.id)) {
            setOverlay("none");
            setToast(`${exact.name} уже в друзьях`);
            return;
          }
          await social.sendRequest(exact.id);
          setOverlay("none");
          setToast(`Заявка в друзья отправлена: ${exact.name}`);
        })
        .catch((err: any) => {
          setOverlay("none");
          setToast(err?.message ?? "Не удалось отправить заявку");
        });
      return;
    }

    if (friendList.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setToast("Такой друг уже добавлен");
      return;
    }
    const friend: Friend = { id: `f-${Date.now()}`, name, color: colorFromName(name) };
    setFriendList((prev) => [friend, ...prev]);
    pushNote({ type: "friend", title: "Новый друг", text: `${name} добавлен в список друзей.` });
    setOverlay("none");
    setToast(`${name} добавлен в друзья`);
  }

  function joinByCode() {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setToast("Код сессии — 6 символов (буквы и цифры)");
      return;
    }
    if (!onJoinByCode) return;
    setOverlay("none");
    setJoinCodeInput("");
    onJoinByCode(code, "");
  }

  function removeFriend(id: string) {
    setFriendList((prev) => prev.filter((f) => f.id !== id));
    setThreads((prev) => prev.filter((t) => t.friendId !== id));
    if (activeThread?.friendId === id) setActiveThreadId(null);
    setSelectedFriend(null);
  }

  function openChatWith(friend: Friend) {
    let thread = threads.find((t) => t.friendId === friend.id);
    if (!thread) {
      thread = {
        id: `t-${friend.id}`,
        friendId: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        color: friend.color,
        messages: [],
      };
      setThreads((prev) => [thread as ChatThread, ...prev]);
    }
    setActiveThreadId(thread.id);
    setOverlay("chat");
  }

  function sendChat() {
    const text = chatText.trim();
    if (!text || !activeThread) return;
    const msg = { from: "me" as const, text, time: nowTime() };
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThread.id ? { ...t, messages: [...t.messages, msg] } : t))
    );
    setChatText("");
  }

  function saveProfileChanges(updated: ProfileData) {
    setProfile(updated);
    onUpdateProfile(updated);
    setToast("Профиль успешно обновлён");
  }

  function openFriendCard(friend: FriendCard) {
    if (social) {
      const entry = social.friends.find((f) => String(f.id) === friend.id);
      if (entry?.session) {
        onJoinByCode?.(entry.session.code, entry.session.placeTitle || "GreenBlox Place");
        return;
      }
    }
    const local: Friend = { id: friend.id, name: friend.name, color: friend.color };
    setSelectedFriend(local);
  }

  /** Открыть модалку с играми создателя (клик по карточке «Создатели рядом»). */
  function openCreatorGames(creator: { name: string; games: Game[] }) {
    setViewingCreator(creator);
  }

  /** Open the online chat with a backend friend (creates a thread on demand). */
  function openSocialChat(peerId: number, name: string, avatarColor: string) {
    if (chat && myUserId != null) {
      chat.openThread(peerId, name, avatarColor).catch(() => {});
      setOverlay("chat");
    }
  }

  /** Загрузить публичный профиль игрока (био, статистика, уровень) с сервера.
   *  fromView — куда вернуться по кнопке «Назад» (главная, друзья, поиск…). */
  function openFriendProfile(friend: FriendEntry, fromView: View = view) {
    setFriendProfileFrom(fromView);
    setViewingFriend(friend);
    setViewingFriendProfile(null);
    setViewingFriendLoading(true);
    setOverlay("none");
    setView("friendProfile");
    socialApi
      .getPublicProfile(friend.id)
      .then((p) => {
        setViewingFriendProfile(p);
        setViewingFriendLoading(false);
      })
      .catch(() => {
        setViewingFriendProfile(null);
        setViewingFriendLoading(false);
      });
  }

  /** Открыть профиль любого игрока из поиска (не только друга): создаём
   *  FriendEntry и открываем полноценную страницу профиля. */
  function openSearchUserProfile(user: SearchResult) {
    if (user.id === (myUserId ?? 0)) {
      setView("profile");
      setOverlay("none");
      return;
    }
    openFriendProfile(
      {
        id: user.id,
        name: user.name,
        avatarColor: user.avatarColor,
        status: user.status ?? "offline",
        session: user.session,
      },
      view
    );
  }

  /** Запустить студийную карту из профиля создателя (свою или чужую).
   *  Пробрасываем в App.handlePlayStudioProject → мир догружается с сервера
   *  (даже если проект создан на другой машине) и стартует в движке.
   *  Заодно инкрементируем счётчик просмотров карты. */
  function playCreatorProject(project: CreatorProjectCardInfo) {
    onPlayCreatorProject?.(project);
    socialApi.incrementProjectViews(project.id).catch(() => {});
  }

  /** Поставить/снять лайк на карте создателя (своей или чужой).
   *  Требует входа — кнопка в карточке и так disabled для гостей.
   *  Счётчик лайков и состояние likedByMe обновляются сразу и в своём
   *  профиле, и в профиле просматриваемого друга. */
  function toggleCreatorProjectLike(project: CreatorProjectCardInfo) {
    if (!socialEnabled || !myUserId) return;
    socialApi
      .toggleProjectLike(project.id)
      .then(({ liked, likesCount }) => {
        setMyCreatorProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, likedByMe: liked, likesCount } : p))
        );
        setViewingFriendProfile((prev) =>
          prev
            ? {
                ...prev,
                creatorProjects: prev.creatorProjects.map((p) =>
                  p.id === project.id ? { ...p, likedByMe: liked, likesCount } : p
                ),
              }
            : prev
        );
        setToast(liked ? "Лайк поставлен" : "Лайк убран");
      })
      .catch(() => setToast("Не удалось обновить лайк"));
  }

  const stats: ProfileStats = {
    totalPlays,
    gamesPlayed: Object.keys(playStats).length,
    friends: effectiveFriends.length,
    favorites: favorites.length,
    joinedAt,
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0e0e0e] text-white">
      {/* Navbar (from the profile-page-development design) */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-[#141414] px-3">
        <button
          type="button"
          onClick={() => {
            setView("home");
            setOverlay("none");
          }}
          className="mr-1 flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-white/5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1ed760] text-black shadow-[0_0_20px_rgba(30,215,96,0.35)]">
            <img src="/favicon.svg" alt="GreenBlox" className="h-8 w-8 rounded-lg" />
          </span>
          <span className="hidden text-[15px] font-extrabold tracking-tight text-white sm:block">GreenBlox</span>
        </button>

        <nav className="flex items-center gap-1.5">
          <button
            type="button"
            className={`nav-btn ${view === "home" ? "active" : ""}`}
            onClick={() => {
              setView("home");
              setOverlay("none");
            }}
            title="Главная"
          >
            <IconHome className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className={`nav-btn ${view === "recs" ? "active" : ""}`}
            onClick={() => {
              setView("recs");
              setOverlay("none");
            }}
            title="Рекомендации"
          >
            <IconCompass className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className={`nav-btn ${view === "friends" ? "active" : ""}`}
            onClick={() => {
              setView("friends");
              setOverlay("none");
            }}
            title="Друзья"
          >
            <IconUsers className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className={`nav-btn ${view === "shop" ? "active" : ""}`}
            onClick={() => {
              setView("shop");
              setOverlay("none");
            }}
            title="Магазин"
          >
            <IconShop className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => {
              if (onOpenStudio) {
                onOpenStudio();
              } else {
                setToast("GreenBlox Studio недоступен");
              }
            }}
            title="Создание"
          >
            <IconBox className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => setOverlay((o) => (o === "chat" ? "none" : "chat"))}
            title="Чаты"
          >
            <IconChat className="h-[18px] w-[18px]" />
          </button>
          {onOpenStudio && (
            <button
              type="button"
              onClick={onOpenStudio}
              className="ml-1 hidden h-10 items-center rounded-full bg-[#1ed760] px-4 text-sm font-bold text-black hover:bg-[#2ae06c] md:flex"
            >
              Студия
            </button>
          )}
        </nav>

        <div className="flex-1" />

        {/* Search (games + people) */}
        <SearchBar
          games={allGames}
          myName={profile.name}
          social={social}
          onOpenGame={openGame}
          onOpenUser={openSearchUserProfile}
        />
        <button
          type="button"
          onClick={() => setOverlay("joinCode")}
          className="ml-1 flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/5 px-3 text-xs font-bold text-white/70 ring-1 ring-white/8 hover:bg-white/10 hover:text-white"
          title="Войти в игру по коду сессии"
        >
          <IconLock className="h-3.5 w-3.5 text-[#1ed760]" />
          <span className="hidden lg:inline">По коду</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setView("profile");
            setOverlay("none");
          }}
          className="ml-1"
          title="Мой профиль"
        >
          <UserAvatar name={profile.name} color={userColor} size={40} />
        </button>
        <button
          type="button"
          className="nav-btn"
          onClick={() => {
            setSettingsTab("appearance");
            setView("settings");
          }}
          title="Настройки"
        >
          <IconSettings className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className="nav-btn relative"
          onClick={() => {
            setOverlay((o) => (o === "notify" ? "none" : "notify"));
            setNotes((n) => n.map((x) => ({ ...x, unread: false })));
          }}
          title="Уведомления"
        >
          <IconBell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#1ed760] shadow-[0_0_8px_#1ed760]" />
          )}
        </button>
      </header>

      {/* AccountBar */}
      <div className="flex shrink-0 items-center gap-5 bg-[#101010] px-5 py-3">
        <button
          type="button"
          onClick={() => setOverlay("addFriend")}
          className="flex flex-col items-center gap-1.5"
          title="Добавить друга"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]">
            <IconPlus className="h-6 w-6" />
          </span>
          <span className="text-[11px] text-zinc-500">Добавить</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setView("profile");
            setOverlay("none");
          }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="rounded-full ring-2 ring-[#1ed760] ring-offset-2 ring-offset-[#101010]">
            <UserAvatar name={profile.name} color={userColor} size={48} />
          </span>
          <span className="max-w-16 truncate text-[11px] text-zinc-400">{profile.name}</span>
        </button>
        {social && social.friends.length > 0 && (
          <>
            {social.friends.slice(0, 5).map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => {
                  setViewingFriend(friend);
                  setOverlay("friendProfile");
                }}
                className="flex w-16 flex-col items-center gap-1.5"
                title={`${friend.name} — ${friendStatusText(friend)}`}
              >
                <span className="transition-transform duration-200 hover:scale-105">
                  <AvatarCircle
                    name={friend.name}
                    color={friend.avatarColor}
                    size={44}
                    status={friend.status}
                  />
                </span>
                <span className="w-full truncate text-center text-[11px] text-zinc-400">
                  {friend.name}
                </span>
              </button>
            ))}
            {social.friends.length > 5 && (
              <button
                type="button"
                onClick={() => {
                  setView("friends");
                  setOverlay("none");
                }}
                className="flex w-16 flex-col items-center gap-1.5"
                title="Все друзья"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2a2a2a] text-[13px] font-extrabold text-white transition hover:bg-[#333]">
                  +{social.friends.length - 5}
                </span>
                <span className="w-full truncate text-center text-[11px] text-zinc-400">Ещё</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="gb-scroll min-h-0 flex-1 overflow-y-auto">
        {view === "home" && (
          <LauncherHome
            allGames={allGames}
            recents={recentGames}
            featured={featuredGame}
            favorites={favorites}
            onlineFriends={onlineFriends}
            onPlay={playMultiplayer}
            onOpenGame={openGame}
            onOpenFriend={openFriendCard}
            onOpenCreator={openCreatorGames}
            onOpenRecommendations={() => {
              setView("recs");
              setOverlay("none");
            }}
            onOpenStudio={onOpenStudio}
          />
        )}
        {view === "recs" && (
          <LibraryView
            title="Рекомендации"
            subtitle="Подборка игр GreenBlox — начни с того, что в тренде"
            games={allGames}
            onOpenGame={openGame}
            onPlay={playMultiplayer}
            onOpenStudio={onOpenStudio}
          />
        )}
        {view === "shop" && (
          <LibraryView
            title="Магазин"
            subtitle="Весь каталог GreenBlox — нажми на игру, чтобы посмотреть или запустить"
            games={allGames}
            onOpenGame={openGame}
            onPlay={playMultiplayer}
            onOpenStudio={onOpenStudio}
          />
        )}
        {view === "friends" && social && (
          <div className="mx-auto w-full max-w-[1200px] px-5 py-6 pb-20">
            <SocialSection
              social={social}
              myName={userName}
              onJoinGame={(code, placeTitle) => onJoinByCode?.(code, placeTitle)}
              onMessage={(friend) => openSocialChat(friend.id, friend.name, friend.avatarColor)}
              onOpenProfile={(friend) => openFriendProfile(friend, "friends")}
            />
          </div>
        )}
        {view === "friends" && !social && (
          <div className="mx-auto w-full max-w-[1200px] px-5 py-6 pb-20 text-center text-sm text-zinc-500">
            Войди в аккаунт, чтобы видеть друзей. Показываем локальный список:
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {friendList.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openChatWith(f)}
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
          </div>
        )}
        {view === "friendProfile" && viewingFriend && (
          <FriendProfileView
            friend={viewingFriend}
            profile={viewingFriendProfile}
            loading={viewingFriendLoading}
            myName={userName}
            social={social}
            canLike={socialEnabled}
            onPlayCreatorProject={playCreatorProject}
            onToggleCreatorProjectLike={toggleCreatorProjectLike}
            onBack={() => setView(friendProfileFrom)}
            onMessage={(friend) => openSocialChat(friend.id, friend.name, friend.avatarColor)}
            onJoin={(friend) =>
              friend.session &&
              onJoinByCode?.(friend.session.code, friend.session.placeTitle || "GreenBlox Place")
            }
            onRemove={(friend) => {
              social
                ?.removeFriend(friend.id)
                .then(() => {
                  setViewingFriend(null);
                  setView(friendProfileFrom);
                  setToast(`${friend.name} удалён из друзей`);
                })
                .catch(() => setToast("Не удалось удалить друга"));
            }}
            onSendRequest={async (userId) => {
              await social?.sendRequest(userId);
              setToast("Заявка в друзья отправлена");
            }}
            onCancelRequest={async (requestId) => {
              await social?.cancelRequest(requestId);
              setToast("Заявка отменена");
            }}
            onAcceptRequest={async (requestId) => {
              await social?.acceptRequest(requestId);
              setToast("Заявка принята");
            }}
            onDeclineRequest={async (requestId) => {
              await social?.declineRequest(requestId);
              setToast("Заявка отклонена");
            }}
            onOpenFriendProfile={(userId) => {
              const live = social?.friends.find((f) => f.id === userId);
              if (live) {
                openFriendProfile(live, "friendProfile");
                return;
              }
              socialApi
                .getPublicProfile(userId)
                .then((p) => {
                  openFriendProfile(
                    {
                      id: p.id,
                      name: p.name,
                      avatarColor: p.avatarColor,
                      status: p.status ?? "offline",
                      session: p.session ?? undefined,
                    },
                    "friendProfile"
                  );
                })
                .catch(() => {});
            }}
          />
        )}
        {view === "profile" && (
          <SocialProfileView
            profile={profile}
            email={userEmail}
            userLevel={userLevel}
            badges={badges}
            stats={stats}
            favoriteGame={popularGames[0] ?? null}
            recent={recentGames.slice(0, 4)}
            friends={effectiveFriends}
            playStats={playStats}
            creatorProjects={myCreatorProjects}
            canLike={socialEnabled}
            onPlayCreatorProject={playCreatorProject}
            onToggleCreatorProjectLike={toggleCreatorProjectLike}
            onOpenGame={openGame}
            onMessageFriend={(friend) => {
              const peerId = Number(friend.id);
              if (Number.isInteger(peerId) && peerId > 0) {
                openSocialChat(peerId, friend.name, friend.color);
                return;
              }
              openChatWith(friend);
            }}
            onOpenFriend={(friend) => {
              const peerId = Number(friend.id);
              const entry =
                social && Number.isInteger(peerId) && peerId > 0
                  ? social.friends.find((f) => f.id === peerId)
                  : undefined;
              if (entry) {
                openFriendProfile(entry, "profile");
                return;
              }
              // Локальный друг (без соцсети) — чат.
              openChatWith(friend);
            }}
            onEditInSettings={() => {
              setSettingsTab("profile");
              setView("settings");
            }}
            onCopyLink={() => setToast("Ссылка на профиль скопирована")}
          />
        )}
        {view === "settings" && (
          <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-20">
            <SettingsView
              profile={profile}
              userEmail={userEmail}
              theme={theme}
              setTheme={setTheme}
              density={density}
              setDensity={setDensity}
              volume={volume}
              setVolume={setVolume}
              soundFx={soundFx}
              setSoundFx={setSoundFx}
              notifFriends={notifFriends}
              setNotifFriends={setNotifFriends}
              notifGames={notifGames}
              setNotifGames={setNotifGames}
              quality={quality}
              setQuality={setQuality}
              fpsLimit={fpsLimit}
              setFpsLimit={setFpsLimit}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              hardwareAccel={hardwareAccel}
              setHardwareAccel={setHardwareAccel}
              privacyPrivacy={privacyPrivacy}
              setPrivacyPrivacy={setPrivacyPrivacy}
              showActivity={showActivity}
              setShowActivity={setShowActivity}
              activeTab={settingsTab}
              setActiveTab={setSettingsTab}
              onSaveProfile={saveProfileChanges}
              onClearData={() => {
                if (confirm("Очистить статистику и сохранённые данные?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>

      {/* Overlays */}
      {(overlay === "notify" || overlay === "chat" || overlay === "friendProfile" || overlay === "joinCode") && (
        <button
          type="button"
          aria-label="Закрыть"
          className="absolute inset-0 z-20 cursor-default bg-black/30"
          onClick={() => setOverlay("none")}
        />
      )}

      {overlay === "notify" && (
        <aside className="animate-fade-in absolute top-16 right-3 z-30 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl glass-panel p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-[15px] font-bold">Уведомления</h3>
            {notes.length > 0 && (
              <button
                type="button"
                className="text-[12px] font-semibold text-[#1ed760]"
                onClick={() => setNotes([])}
              >
                Очистить
              </button>
            )}
          </div>
          {notes.length === 0 ? (
            <div className="px-2 py-10 text-center text-[13px] text-zinc-500">Нет уведомлений</div>
          ) : (
            <div className="gb-scroll max-h-[60vh] space-y-1.5 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl bg-white/3 px-3 py-2.5">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      n.type === "friend"
                        ? "bg-[#1ed760]/15 text-[#1ed760]"
                        : n.type === "game"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {n.type === "friend" ? (
                      <IconUsers className="h-4 w-4" />
                    ) : n.type === "game" ? (
                      <IconGamepad className="h-4 w-4" />
                    ) : (
                      <IconStar className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{n.title}</p>
                    <p className="text-[12px] text-zinc-500">{n.text}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}

      {overlay === "chat" && chat && myUserId != null && (
        <OnlineChat chat={chat} myUserId={myUserId} onClose={() => setOverlay("none")} />
      )}
      {overlay === "chat" && (!chat || myUserId == null) && (
        <aside className="animate-scale-in absolute right-4 bottom-4 z-30 flex h-[520px] w-[440px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-96px)] overflow-hidden rounded-2xl glass-panel shadow-2xl">
          <div className="flex w-[40%] flex-col border-r border-white/6 p-2">
            <div className="px-2 pb-2 pt-1 text-[13px] font-bold">Сообщения</div>
            <div className="gb-scroll flex-1 overflow-y-auto">
              {threads.length === 0 && (
                <div className="px-2 py-8 text-center text-[12px] text-zinc-500">
                  Нет чатов. Напиши другу со вкладки «Друзья».
                </div>
              )}
              {threads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreadId(t.id)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left ${
                    activeThreadId === t.id ? "bg-white/8" : "hover:bg-white/4"
                  }`}
                >
                  <UserAvatar name={t.name} color={t.color} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">{t.name}</div>
                    <div className="truncate text-[11px] text-zinc-500">
                      {t.messages.length ? t.messages[t.messages.length - 1].text : "Нет сообщений"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {activeThread && <UserAvatar name={activeThread.name} color={activeThread.color} size={32} />}
                <span className="truncate text-[13px] font-semibold">
                  {activeThread ? activeThread.name : "Выбери чат"}
                </span>
              </div>
              <button type="button" onClick={() => setOverlay("none")} className="text-zinc-500 hover:text-white">
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="gb-scroll flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {!activeThread && <div className="pt-16 text-center text-[12px] text-zinc-500">Выбери чат слева</div>}
              {activeThread && activeThread.messages.length === 0 && (
                <div className="pt-16 text-center text-[12px] text-zinc-500">
                  Начни диалог с {activeThread.name}
                </div>
              )}
              {activeThread?.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] ${
                      m.from === "me" ? "bg-[#1ed760] text-black" : "bg-white/8 text-white"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-white/6 p-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                sendChat();
              }}
            >
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                disabled={!activeThread}
                placeholder={activeThread ? "Сообщение..." : "Выбери чат"}
                className="gb-input h-10 flex-1 rounded-full px-3 text-[13px] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!activeThread}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-black disabled:opacity-50"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      )}

      {overlay === "joinCode" && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay("none")}
        >
          <div
            className="anim-pop w-full max-w-md rounded-3xl glass-panel p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Войти по коду</h3>
              <button type="button" onClick={() => setOverlay("none")}>
                <IconX className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <p className="mb-3 text-[13px] text-zinc-500">Введи 6-значный код сессии, который показывает хост игры.</p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                joinByCode();
              }}
            >
              <input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                autoFocus
                placeholder="Например: ABC123"
                className="gb-input h-11 flex-1 rounded-full px-4 font-mono text-[15px] font-bold uppercase tracking-[0.2em]"
              />
              <button
                type="submit"
                disabled={joinCodeInput.length !== 6}
                className="gb-action-btn gb-primary rounded-full px-5 text-[13px] disabled:opacity-40"
              >
                Играть
              </button>
            </form>
          </div>
        </div>
      )}

      {overlay === "addFriend" && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay("none")}
        >
          <div
            className="anim-pop w-full max-w-md rounded-3xl glass-panel p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Добавить друга</h3>
              <button type="button" onClick={() => setOverlay("none")}>
                <IconX className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <p className="mb-3 text-[13px] text-zinc-500">Введи ник игрока, чтобы добавить его в список друзей.</p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addFriend();
              }}
            >
              <input
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                autoFocus
                placeholder="Ник игрока"
                className="gb-input h-11 flex-1 rounded-full px-4 text-[14px]"
              />
              <button type="submit" className="gb-action-btn gb-primary rounded-full px-5 text-[13px]">
                Добавить
              </button>
            </form>
          </div>
        </div>
      )}

      {overlay === "friendProfile" && viewingFriend && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOverlay("none")}
        >
          <div
            className="anim-pop w-full max-w-md rounded-3xl glass-panel p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AvatarCircle
                  name={viewingFriend.name}
                  color={viewingFriend.avatarColor}
                  size={72}
                  status={viewingFriend.status}
                />
                <div className="min-w-0">
                  <div className="truncate text-[18px] font-bold">{viewingFriend.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[#888]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          viewingFriend.status === "in_game"
                            ? "#2ae06c"
                            : viewingFriend.status === "in_studio"
                              ? "#4d9fff"
                              : viewingFriend.status === "online"
                                ? "#34d399"
                                : "#555",
                      }}
                    />
                    {statusLabel(viewingFriend.status)}
                  </div>
                  <div className="mt-1 truncate text-[12px] text-[#2ae06c]">
                    {friendStatusText(viewingFriend)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOverlay("none")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-white/10 hover:text-white"
                title="Закрыть"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  const friend = viewingFriend;
                  setOverlay("none");
                  setViewingFriend(null);
                  openSocialChat(friend.id, friend.name, friend.avatarColor);
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-4 text-[13px] font-extrabold text-[#05210e] transition hover:bg-[#2ae06c]"
              >
                <IconChat className="h-4 w-4" />
                Написать сообщение
              </button>
              {viewingFriend.session && (
                <button
                  type="button"
                  onClick={() => {
                    const session = viewingFriend.session!;
                    setOverlay("none");
                    setViewingFriend(null);
                    onJoinByCode?.(session.code, session.placeTitle || "GreenBlox Place");
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/8 px-4 text-[13px] font-bold text-white transition hover:bg-white/12"
                >
                  <IconPlay className="h-4 w-4" />
                  Играть в {viewingFriend.session.placeTitle || "GreenBlox Place"}
                </button>
              )}
              <button
                type="button"
                onClick={() => openFriendProfile(viewingFriend)}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/6 px-4 text-[13px] font-semibold text-white transition hover:bg-white/10"
              >
                <IconUsers className="h-4 w-4" />
                Открыть профиль
              </button>
              <button
                type="button"
                onClick={() => {
                  const friend = viewingFriend;
                  social
                    ?.removeFriend(friend.id)
                    .then(() => {
                      setOverlay("none");
                      setViewingFriend(null);
                      setToast(`${friend.name} удалён из друзей`);
                    })
                    .catch(() => setToast("Не удалось удалить друга"));
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/6 px-4 text-[13px] font-semibold text-red-300 transition hover:bg-red-500/15"
              >
                <IconX className="h-4 w-4" />
                Удалить из друзей
              </button>
            </div>
          </div>
        </div>
      )}

      {overlay === "game" && activeGame && (
        <GameModal
          game={activeGame}
          stat={playStats[activeGame.id]}
          favored={favorites.includes(activeGame.id)}
          onClose={() => {
            setOverlay("none");
            setActiveGame(null);
          }}
          onPlay={() => playGame(activeGame)}
          onFav={() => toggleFav(activeGame.id)}
        />
      )}

      {viewingCreator && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setViewingCreator(null)}
        >
          <div
            className="anim-pop w-full max-w-lg overflow-hidden rounded-3xl border border-white/8 bg-[#161616] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-[16px] font-extrabold text-white">{viewingCreator.name}</h3>
                <p className="text-[12px] text-zinc-500">
                  {viewingCreator.games.length} игр в каталоге
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCreator(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/6 text-[#999] hover:bg-white/10 hover:text-white"
                title="Закрыть"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="gb-scroll max-h-[50vh] space-y-1.5 overflow-y-auto p-4">
              {viewingCreator.games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setViewingCreator(null);
                    openGame(g);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/4 p-2.5 text-left transition hover:bg-[#1ed760]/10"
                >
                  <img src={g.image} alt="" className="h-12 w-[76px] shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-white">{g.title}</div>
                    <div className="truncate text-[11px] text-zinc-500">
                      {g.category} · {g.players ?? "GreenBlox"}
                    </div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e]">
                    <IconPlay className="h-4 w-4 fill-current" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedFriend && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedFriend(null)}
        >
          <div
            className="anim-pop w-full max-w-sm rounded-3xl glass-panel p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <UserAvatar name={selectedFriend.name} color={selectedFriend.color} size={64} />
              <div className="min-w-0">
                <div className="truncate text-[18px] font-bold">{selectedFriend.name}</div>
                <div className="text-[13px] text-zinc-500">{social ? "Друг GreenBlox" : "В друзьях"}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const friend = selectedFriend;
                  setSelectedFriend(null);
                  const peerId = Number(friend.id);
                  if (Number.isInteger(peerId) && peerId > 0) {
                    openSocialChat(peerId, friend.name, friend.color);
                    return;
                  }
                  openChatWith(friend);
                }}
                className="gb-action-btn gb-primary flex-1 py-2.5 text-[13px]"
              >
                Написать
              </button>
              {!social && (
                <button
                  type="button"
                  onClick={() => removeFriend(selectedFriend.id)}
                  className="flex-1 rounded-full bg-white/8 py-2.5 text-[13px] font-semibold text-red-300 hover:bg-red-500/15"
                >
                  Удалить
                </button>
              )}
            </div>
            {social && selectedFriend && (
              <button
                type="button"
                onClick={() => {
                  const userId = Number(selectedFriend.id);
                  if (Number.isInteger(userId) && userId > 0) {
                    social
                      .removeFriend(userId)
                      .then(() => {
                        setSelectedFriend(null);
                        setToast(`${selectedFriend.name} удалён из друзей`);
                      })
                      .catch(() => setToast("Не удалось удалить друга"));
                  }
                }}
                className="mt-2 w-full rounded-full bg-white/8 py-2.5 text-[13px] font-semibold text-red-300 hover:bg-red-500/15"
              >
                Удалить из друзей
              </button>
            )}
          </div>
        </div>
      )}

      {launching && (
        <div className="animate-fade-in absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-[420px] max-w-[90vw] text-center">
            <LogoMark className="animate-logo-pulse mx-auto mb-5 h-16 w-16" />
            <div className="text-[22px] font-extrabold tracking-tight">Запуск {launching.title}</div>
            <div className="mt-1 text-[13px] text-zinc-500">Подготовка игрового клиента...</div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#1ed760] transition-all duration-200"
                style={{ width: `${Math.min(launchProgress, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[12px] text-zinc-500">{Math.min(Math.round(launchProgress), 100)}%</div>
          </div>
        </div>
      )}

      {toast && (
        <div className="anim-pop fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#1c1c1c] px-4 py-2 text-[13px] font-semibold shadow-xl md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

function GameModal({
  game,
  stat,
  favored,
  onClose,
  onPlay,
  onFav,
}: {
  game: Game;
  stat?: PlayStat;
  favored: boolean;
  onClose: () => void;
  onPlay: () => void;
  onFav: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="anim-pop w-full max-w-2xl overflow-hidden rounded-3xl border border-white/8 bg-[#161616] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56">
          <img src={game.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <IconX className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5">
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white uppercase">
              {game.category}
            </span>
            <h2 className="mt-1 text-3xl font-extrabold">{game.title}</h2>
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <IconUsers className="h-4 w-4 text-[#1ed760]" />
              {game.players ?? `${stat?.count ?? 0} запусков`}
            </span>
            <span>обновлено: {game.updated}</span>
            {stat?.last && <span>играл(а) {timeAgo(stat.last)}</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{game.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ae06c]"
            >
              <IconPlay className="h-4 w-4 fill-current" />
              Играть
            </button>
            <button
              type="button"
              onClick={onFav}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                favored ? "bg-[#1ed760]/15 text-[#1ed760]" : "bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]"
              }`}
              title="В избранное"
            >
              <IconHeart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
