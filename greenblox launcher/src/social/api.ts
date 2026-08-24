// GreenBlox Social API client.
// Talks to the GreenBlox Studio backend (Next.js, studio).
//
// The API runs on the SAME host as the launcher but on a different port
// (3001 vs 5173). We derive the host from the current page URL so a friend on
// another computer opening http://<your-ip>:5173 automatically talks to
// http://<your-ip>:3001 — and NOT to their own localhost.

const API_BASE = `http://${window.location.hostname || "localhost"}:3001`;

export type SocialUser = {
  id: number;
  name: string;
  email: string;
  avatarColor: string;
};

export type PlayerStatus = "online" | "in_game" | "in_studio" | "offline";

export type FriendSession = {
  id: string;
  code: string;
  placeId: string;
  placeTitle: string;
};

export type FriendEntry = {
  id: number;
  name: string;
  avatarColor: string;
  status: PlayerStatus;
  session?: FriendSession;
};

export type FriendRequestEntry = {
  requestId: number;
  id: number;
  name: string;
  avatarColor: string;
};

export type SearchResult = {
  id: number;
  name: string;
  avatarColor: string;
  status?: PlayerStatus;
  session?: FriendSession;
};

export type RemotePlayer = {
  userId: number;
  name: string;
  avatarColor: string;
  pos: { x: number; y: number; z: number };
  face?: number;
  grounded?: boolean;
  coins?: number;
  deaths?: number;
  stage?: number;
  won?: boolean;
  /** Custom avatar colors (hex strings per body part) from the remote player's panel. */
  avatarColors?: RemoteAvatarColors;
};

export type RemoteAvatarColors = {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
  shirt: string;
};

export type SessionChatMessage = {
  id: string;
  sessionId: string;
  userId: number;
  name: string;
  avatarColor: string;
  text: string;
  createdAt: number;
};

export type ChatMessage = {
  id: number;
  fromId: number;
  toId: number;
  text: string;
  read: boolean;
  createdAt: string;
};

export type ChatThread = {
  peerId: number;
  name: string;
  avatarColor: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

/** Карта, созданная игроком в студии (секция «Карты создателя» профиля). */
export type CreatorProject = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  version: string;
  viewsCount: number;
  likesCount: number;
  updatedAt: number;
  /** Лайкнул ли этот проект текущий зритель. */
  likedByMe: boolean;
};

export type SessionInfo = {
  id: string;
  code: string;
  placeId: string;
  placeTitle: string;
  hostName: string;
  hostUserId: number;
  createdAt: number;
  maxPlayers?: number;
  players: RemotePlayer[];
};

/** Публичная копия профиля пользователя, видимая друзьям. */
export type PublicProfile = {
  id: number;
  name: string;
  avatarColor: string;
  handle: string;
  bio: string;
  coverStyle: string;
  statusQuote: string;
  joinedAt: number;
  status: PlayerStatus;
  session?: FriendSession | null;
  stats: {
    totalPlays: number;
    gamesPlayed: number;
    friends: number;
    totalCoins: number;
    totalDeaths: number;
    totalTimeSec: number;
    wins: number;
    playedGames: {
      gameId: string;
      count: number;
      lastPlayedAt: number;
      totalCoins: number;
      totalDeaths: number;
      totalTimeSec: number;
      bestStage: number;
      wins: number;
    }[];
  };
  level: { level: number; xp: number; currentXp: number; maxXp: number };
  /** Является ли просматриваемый пользователь моим другом. */
  isFriend: boolean;
  /** Состояние заявки между мной и этим пользователем. */
  friendRequest: "none" | "pending_out" | "pending_in" | "accepted";
  /** Общие друзья (пересечение моих друзей и друзей профиля). */
  mutualFriends: { id: number; name: string; avatarColor: string }[];
  /** Полный список друзей профиля. */
  friendsList: { id: number; name: string; avatarColor: string }[];
  /** Карты, созданные игроком в студии (только опубликованные). */
  creatorProjects: CreatorProject[];
};

/** Итог одной игровой сессии для синхронизации на сервер. */
export type GameStatSync = {
  gameId: string;
  count?: number;
  lastPlayedAt?: number;
  coins?: number;
  deaths?: number;
  timeSec?: number;
  stage?: number;
  won?: boolean;
};

export type FriendsResponse = {
  friends: FriendEntry[];
  incoming: FriendRequestEntry[];
  outgoing: FriendRequestEntry[];
};

const TOKEN_KEY = "greenblox-token";

/** Событие, которое лаунчер слушает в App.tsx: «токен протух на сервере».
 *  request() диспатчит его при любом 401, после чего App делает чистый
 *  возврат на экран логина (session + token сбрасываются). */
export const AUTH_FAIL_EVENT = "gb-auth-fail";

/** Диспатчим событие не чаще одного раза за «эпоху» токена: если десятки
 *  параллельных запросов одновременно получают 401, они не спамят слушателя. */
let authFailNotified = false;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  // Новый токен — новая эпоха: следующая 401-волна снова оповестит.
  authFailNotified = false;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  authFailNotified = false;
}

function reportAuthFailure() {
  if (authFailNotified) return;
  authFailNotified = true;
  clearToken();
  try {
    window.dispatchEvent(new Event(AUTH_FAIL_EVENT));
  } catch {
    /* среда без window (SSR/тесты) — игнорируем */
  }
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["x-gbtoken"] = token;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    if (res.status === 401) reportAuthFailure();
    throw new ApiError(body?.error ?? `Ошибка API (${res.status})`, res.status);
  }
  return body as T;
}

export const socialApi = {
  /** Register or login by email. Returns a session with a persistent token. */
  async auth(email: string, name?: string): Promise<{ user: SocialUser; token: string }> {
    const data = await request<{ user: SocialUser; token: string }>("/api/social", {
      method: "POST",
      body: JSON.stringify({ email, name: name?.trim() || undefined }),
    });
    if (data?.token) setToken(data.token);
    return data;
  },

  /** Refresh current user info by stored token. */
  async me(): Promise<SocialUser> {
    const data = await request<{ user: SocialUser }>("/api/social");
    return data.user;
  },

  async search(q: string): Promise<SearchResult[]> {
    const data = await request<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(q)}`);
    return data.results ?? [];
  },

  async getFriends(): Promise<FriendsResponse> {
    return request<FriendsResponse>("/api/friends");
  },

  async sendFriendRequest(userId: number): Promise<void> {
    await request("/api/friends", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  async friendAction(
    action: "accept" | "decline" | "cancel" | "remove",
    opts: { requestId?: number; userId?: number } = {}
  ): Promise<void> {
    await request("/api/friends/action", {
      method: "POST",
      body: JSON.stringify({ action, requestId: opts.requestId, userId: opts.userId }),
    });
  },

  async createSession(placeId: string, placeTitle: string): Promise<SessionInfo> {
    const data = await request<{ session: SessionInfo }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ placeId, placeTitle }),
    });
    return data.session;
  },

  async joinSession(code: string): Promise<SessionInfo | null> {
    try {
      const data = await request<{ session: SessionInfo }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      return data.session ?? null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async getSessionInfo(code: string): Promise<SessionInfo | null> {
    try {
      const data = await request<{ session: SessionInfo }>(`/api/sessions?code=${encodeURIComponent(code)}`);
      return data.session ?? null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async leaveSession(sessionId: string): Promise<void> {
    await request(`/api/sessions?id=${encodeURIComponent(sessionId)}`, { method: "DELETE" });
  },

  async syncSession(
    sessionId: string,
    pos: { x: number; y: number; z: number },
    state: Partial<Pick<RemotePlayer, "face" | "grounded" | "coins" | "deaths" | "stage" | "won" | "avatarColors">> = {}
  ): Promise<RemotePlayer[]> {
    const data = await request<{ players: RemotePlayer[] }>("/api/sessions/sync", {
      method: "POST",
      body: JSON.stringify({ sessionId, x: pos.x, y: pos.y, z: pos.z, ...state }),
    });
    return data.players ?? [];
  },

  async getSessionChat(sessionId: string): Promise<SessionChatMessage[]> {
    const data = await request<{ messages: SessionChatMessage[] }>(
      `/api/sessions/chat?sessionId=${encodeURIComponent(sessionId)}`
    );
    return data.messages ?? [];
  },

  async sendSessionChat(sessionId: string, text: string): Promise<SessionChatMessage> {
    const data = await request<{ message: SessionChatMessage }>("/api/sessions/chat", {
      method: "POST",
      body: JSON.stringify({ sessionId, text }),
    });
    return data.message;
  },

  async pingPresence(status: "online" | "in_game" | "in_studio"): Promise<void> {
    await request("/api/presence", {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  async getChatThreads(): Promise<ChatThread[]> {
    const data = await request<{ threads: ChatThread[] }>("/api/chat");
    return data.threads ?? [];
  },

  async getChatMessages(peerId: number): Promise<ChatMessage[]> {
    const data = await request<{ messages: ChatMessage[] }>(`/api/chat?peer=${peerId}`);
    return data.messages ?? [];
  },

  async sendChatMessage(peerId: number, text: string): Promise<ChatMessage> {
    const data = await request<{ message: ChatMessage }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ toId: peerId, text }),
    });
    return data.message;
  },

  async deleteChatThread(peerId: number): Promise<void> {
    await request(`/api/chat?peer=${peerId}`, { method: "DELETE" });
  },

  /** Публичный профиль пользователя (для страницы профиля друга). */
  async getPublicProfile(userId: number): Promise<PublicProfile> {
    const data = await request<{ profile: PublicProfile }>(`/api/profile/${userId}`);
    return data.profile;
  },

  /** Обновление своего публичного профиля (bio, handle, статус-квота, цвета). */
  async updatePublicProfile(
    fields: Partial<Pick<PublicProfile, "bio" | "handle" | "coverStyle" | "statusQuote" | "avatarColor">>
  ): Promise<PublicProfile> {
    const data = await request<{ profile: PublicProfile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(fields),
    });
    return data.profile;
  },

  /** Синхронизация итогов игровых сессий на сервер (видно друзьям). */
  async syncGameStats(stats: GameStatSync[]): Promise<void> {
    await request("/api/profile/stats", {
      method: "POST",
      body: JSON.stringify({ stats }),
    });
  },

  /** Поставить/снять лайк на студийном проекте (toggle).
   *  Требует входа: лайк привязывается к аккаунту (project_likes),
   *  повторными кликами накрутить невозможно. */
  async toggleProjectLike(projectId: number): Promise<{ liked: boolean; likesCount: number }> {
    return request<{ liked: boolean; likesCount: number }>(`/api/projects/${projectId}/like`, {
      method: "POST",
    });
  },

  /** Инкремент счётчика просмотров студийной карты (при запуске из профиля
   *  создателя или из лаунчера). Счётчик «N просмотров» в карточке
   *  CreatorProjectCard живёт за счёт этого вызова. */
  async incrementProjectViews(projectId: number): Promise<void> {
    await request(`/api/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({ action: "increment_views" }),
    });
  },

  /** Получить реальное количество активных игроков по placeId.
   *  Не требует авторизации. */
  async getActivePlayers(): Promise<{ counts: Record<string, number>; totalOnline: number }> {
    const res = await fetch(`${API_BASE}/api/sessions/active`);
    if (!res.ok) return { counts: {}, totalOnline: 0 };
    return res.json();
  },
};
