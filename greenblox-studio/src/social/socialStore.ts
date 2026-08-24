// In-memory social runtime: online presence + live game sessions.
// Survives across API calls within one Next.js process.
// Persistence for users/friends lives in PostgreSQL (see db/schema.ts).

// IMPORTANT: the live state lives on globalThis, NOT as module-level consts.
// Next.js dev recompiles route handlers on hot reload; without this, each
// module graph can end up with its OWN copy of the players/sessions maps —
// a presence ping written by one route becomes invisible to another one
// (friends stay "offline", sessions never appear). That is exactly what
// happened after the change that touched this file: presence and sessions
// split across HMR module instances and friends "disappeared".
// The globalThis singleton (same pattern as the db pool in db/index.ts)
// guarantees every route handler in one process shares ONE runtime state.

export type LiveStatus = "online" | "in_game" | "in_studio";

/** Full avatar colors (hex strings like "#f5cd30") so friends see your
 *  customized look, not just the account accent color. */
export type AvatarColorsHex = {
  head: string;
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
  shirt: string;
};

export interface LivePlayer {
  userId: number;
  name: string;
  avatarColor: string;
  status: LiveStatus;
  lastSeen: number;
}

/** Player sync data. `face` is the yaw the avatar is looking at (radians). */
export interface SessionPlayer {
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
  avatarColors?: AvatarColorsHex;
}

export interface GameSession {
  id: string;
  code: string;
  placeId: string;
  placeTitle: string;
  hostUserId: number;
  hostName: string;
  createdAt: number;
  maxPlayers: number;
  players: Map<number, SessionPlayer>;
}

export interface SessionChatMessage {
  id: string;
  sessionId: string;
  userId: number;
  name: string;
  avatarColor: string;
  text: string;
  createdAt: number;
}

// 20s TTL vs a 10s client heartbeat leaves a comfortable margin so a single
// dropped heartbeat (network jitter) doesn't flip a player to "offline".
const PRESENCE_TTL = 20_000; // ms before a player is considered offline
const DEFAULT_MAX_PLAYERS = 16;
const SESSION_CHAT_LIMIT = 100; // messages kept per session

// Priority order for live status. A user can be in the Launcher AND in Studio
// at the same time (separate browser tabs, same GreenBlox account). Both tabs
// send heartbeats: the launcher pings "online" (or "in_game"), Studio pings
// "in_studio". Without priorities the last heartbeat wins, so the launcher's
// 10s "online" ping silently downgrades the Studio presence and the blue
// hammer badge flickers back to a plain green dot.
//
// A LOWER-priority ping never overwrites a FRESH higher-priority status; it
// only refreshes `lastSeen` so the player stays alive. When the higher-status
// tab closes, the status expires after PRESENCE_TTL and the next launcher ping
// naturally becomes "online".
const STATUS_PRIORITY: Record<LiveStatus, number> = {
  online: 1,
  in_studio: 2,
  in_game: 3,
};

interface SocialRuntimeState {
  players: Map<number, LivePlayer>;
  sessions: Map<string, GameSession>;
  sessionChat: Map<string, SessionChatMessage[]>;
}

const GLOBAL_KEY = "__greenbloxSocialState";

function getState(): SocialRuntimeState {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: SocialRuntimeState;
  };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      players: new Map<number, LivePlayer>(),
      sessions: new Map<string, GameSession>(),
      sessionChat: new Map<string, SessionChatMessage[]>(),
    };
  }
  return g[GLOBAL_KEY];
}

function randomCode(sessions: Map<string, GameSession>): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (sessions.has(code));
  return code;
}

function prune(state: SocialRuntimeState) {
  const t = Date.now();
  for (const [id, p] of state.players) {
    if (t - p.lastSeen > PRESENCE_TTL) state.players.delete(id);
  }
  for (const [sid, s] of state.sessions) {
    const t2 = Date.now();
    for (const [uid, p] of s.players) {
      const live = state.players.get(uid);
      if (!live || t2 - live.lastSeen > PRESENCE_TTL) s.players.delete(uid);
    }
    if (s.players.size === 0) state.sessions.delete(sid);
  }
}

export const socialStore = {
  readonlyTTL: PRESENCE_TTL,

  ping(user: { id: number; name: string; avatarColor: string }, status: LiveStatus): LivePlayer {
    const state = getState();
    prune(state);
    const now = Date.now();
    const prev = state.players.get(user.id);

    // Keep the higher-priority status alive instead of downgrading it.
    //
    // IMPORTANT: we must NOT refresh `prev.lastSeen` here. Each ping is a
    // heartbeat for the status that SENT it, not for the status currently
    // stored. If the launcher (low-priority "online") refreshed lastSeen for
    // the Studio presence ("in_studio"), then while the launcher stays open
    // the hammer badge would NEVER expire — friends would keep seeing
    // "Создаёт миры" long after the Studio tab was closed.
    //
    // Every higher-priority status has its own heartbeat with its own TTL:
    //  - Studio pings "in_studio" every 10s while the tab is open;
    //  - the game pings "in_game" on every sync tick (≈5/s);
    // both refresh `lastSeen` directly through the paths below/above this
    // branch. When the higher-status source stops (tab closed), its status
    // expires after PRESENCE_TTL and the next launcher ping naturally
    // becomes "online" again.
    if (
      prev &&
      STATUS_PRIORITY[status] < STATUS_PRIORITY[prev.status] &&
      now - prev.lastSeen < PRESENCE_TTL
    ) {
      prev.name = user.name;
      prev.avatarColor = user.avatarColor;
      return prev;
    }

    const entry: LivePlayer = {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      status,
      lastSeen: now,
    };
    state.players.set(user.id, entry);
    return entry;
  },

  getPresence(userId: number): LivePlayer | undefined {
    const state = getState();
    prune(state);
    return state.players.get(userId);
  },

  snapshot(): LivePlayer[] {
    const state = getState();
    prune(state);
    return [...state.players.values()];
  },

  /** Return a lightweight summary of all live sessions (for active player counts). */
  allSessions(): { placeId: string; playerCount: number }[] {
    const state = getState();
    prune(state);
    const result: { placeId: string; playerCount: number }[] = [];
    for (const s of state.sessions.values()) {
      result.push({ placeId: s.placeId, playerCount: s.players.size });
    }
    return result;
  },

  createSession(
    user: { id: number; name: string; avatarColor: string },
    place: { id: string; title: string }
  ): GameSession {
    const state = getState();
    prune(state);
    // If the user already hosts a session for this place, reuse it.
    for (const s of state.sessions.values()) {
      if (s.hostUserId === user.id && s.placeId === place.id) {
        s.players.set(user.id, {
          userId: user.id,
          name: user.name,
          avatarColor: user.avatarColor,
          pos: { x: 0, y: 3.5, z: 0 },
        });
        return s;
      }
    }
    const session: GameSession = {
      id: `sess_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`,
      code: randomCode(state.sessions),
      placeId: place.id,
      placeTitle: place.title,
      hostUserId: user.id,
      hostName: user.name,
      createdAt: Date.now(),
      maxPlayers: DEFAULT_MAX_PLAYERS,
      players: new Map([
        [user.id, { userId: user.id, name: user.name, avatarColor: user.avatarColor, pos: { x: 0, y: 3.5, z: 0 } }],
      ]),
    };
    state.sessions.set(session.id, session);
    state.players.set(user.id, {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      status: "in_game",
      lastSeen: Date.now(),
    });
    return session;
  },

  getSessionById(id: string): GameSession | undefined {
    const state = getState();
    prune(state);
    return state.sessions.get(id);
  },

  /** Return the live session a user is currently in, if any. */
  getSessionForUser(userId: number): GameSession | undefined {
    const state = getState();
    prune(state);
    for (const s of state.sessions.values()) {
      if (s.players.has(userId)) return s;
    }
    return undefined;
  },

  getSessionsByPlace(placeId: string): GameSession[] {
    const state = getState();
    prune(state);
    return [...state.sessions.values()].filter((s) => s.placeId === placeId);
  },

  getSessionByCode(code: string): GameSession | undefined {
    const state = getState();
    prune(state);
    const upper = code.trim().toUpperCase();
    for (const s of state.sessions.values()) if (s.code === upper) return s;
    return undefined;
  },

  /** Join a session; `players` controls whether joining fills a slot (false for
   *  host re-join / info lookups). Returns null when not found, "full" when
   *  the session has reached its capacity. */
  joinSession(
    user: { id: number; name: string; avatarColor: string },
    code: string
  ): GameSession | null | "full" {
    const state = getState();
    prune(state);
    const session = this.getSessionByCode(code);
    if (!session) return null;
    const existing = session.players.get(user.id);
    if (!existing && session.players.size >= session.maxPlayers) return "full";
    session.players.set(user.id, {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      pos: existing?.pos ?? { x: 0, y: 3.5, z: 8 },
    });
    state.players.set(user.id, {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      status: "in_game",
      lastSeen: Date.now(),
    });
    return session;
  },

  /** Remove a player from a session. If the HOST leaves, the whole session
   *  closes (Roblox-style: no relaying) and its in-memory chat is cleared. */
  leaveSession(userId: number, sessionId: string) {
    const state = getState();
    const session = state.sessions.get(sessionId);
    if (!session) return;
    const isHost = session.hostUserId === userId;
    session.players.delete(userId);
    const live = state.players.get(userId);
    if (live) {
      live.status = "online";
      live.lastSeen = Date.now();
    }
    if (isHost || session.players.size === 0) {
      // Host left or everyone left: tear the session down entirely.
      state.sessions.delete(sessionId);
      state.sessionChat.delete(sessionId);
      // Everyone else becomes "online" again.
      for (const uid of session.players.keys()) {
        const p = state.players.get(uid);
        if (p) {
          p.status = "online";
          p.lastSeen = Date.now();
        }
      }
    }
  },

  /** Record the caller's position; return a snapshot of the other players. */
  sync(
    user: { id: number; name: string; avatarColor: string },
    sessionId: string,
    pos: { x: number; y: number; z: number }
  ): SessionPlayer[] {
    const state = getState();
    prune(state);
    const session = state.sessions.get(sessionId);
    if (!session) return [];
    session.players.set(user.id, {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      pos,
    });
    const live = state.players.get(user.id);
    if (live) live.lastSeen = Date.now();
    const others: SessionPlayer[] = [];
    for (const [uid, p] of session.players) {
      if (uid !== user.id) others.push(p);
    }
    return others;
  },

  /** Record the caller's position + state; return the FULL roster including the
   *  caller. Clients use their own userId to filter out themselves for rendering.
   *
   *  Avatar colors are preserved when the request omits them: the client sends
   *  the full custom look only ONCE when it changes (20 Hz position ticks
   *  otherwise carry no avatar payload). Overwriting with `undefined` on every
   *  tick would wipe the saved colors after the first change. */
  syncFull(
    user: { id: number; name: string; avatarColor: string },
    sessionId: string,
    pos: { x: number; y: number; z: number },
    state: Partial<Pick<SessionPlayer, "face" | "grounded" | "coins" | "deaths" | "stage" | "won" | "avatarColors">> = {}
  ): SessionPlayer[] {
    const rt = getState();
    prune(rt);
    const session = rt.sessions.get(sessionId);
    if (!session) return [];
    const existing = session.players.get(user.id);
    const prevColors = existing?.avatarColors;
    session.players.set(user.id, {
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      pos,
      face: state.face,
      grounded: state.grounded,
      coins: state.coins,
      deaths: state.deaths,
      stage: state.stage,
      won: state.won,
      // Preserve the last known custom look when this tick doesn't carry one —
      // position-only syncs must not erase the other players' avatar colors.
      avatarColors: state.avatarColors ?? prevColors,
    });
    const live = rt.players.get(user.id);
    if (live) {
      live.status = "in_game";
      live.lastSeen = Date.now();
    }
    return [...session.players.values()];
  },

  // ===== Session chat (in-memory, per live session) =====

  addChatMessage(
    user: { id: number; name: string; avatarColor: string },
    sessionId: string,
    text: string
  ): SessionChatMessage | null {
    const state = getState();
    prune(state);
    const session = state.sessions.get(sessionId);
    if (!session) return null;
    const message: SessionChatMessage = {
      id: `m_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000)}`,
      sessionId,
      userId: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
      text: text.slice(0, 200),
      createdAt: Date.now(),
    };
    const list = state.sessionChat.get(sessionId) ?? [];
    list.push(message);
    if (list.length > SESSION_CHAT_LIMIT) list.splice(0, list.length - SESSION_CHAT_LIMIT);
    state.sessionChat.set(sessionId, list);
    return message;
  },

  getChatMessages(sessionId: string): SessionChatMessage[] {
    const state = getState();
    prune(state);
    return state.sessionChat.get(sessionId) ?? [];
  },

  serializeSession(session: GameSession) {
    return {
      id: session.id,
      code: session.code,
      placeId: session.placeId,
      placeTitle: session.placeTitle,
      hostName: session.hostName,
      hostUserId: session.hostUserId,
      createdAt: session.createdAt,
      maxPlayers: session.maxPlayers,
      players: [...session.players.values()],
    };
  },
};
