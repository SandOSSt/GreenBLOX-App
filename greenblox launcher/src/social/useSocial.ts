import { useCallback, useEffect, useState } from "react";
import { socialApi, type FriendEntry, type FriendRequestEntry } from "./api";

export interface SocialState {
  friends: FriendEntry[];
  incoming: FriendRequestEntry[];
  outgoing: FriendRequestEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sendRequest: (userId: number) => Promise<void>;
  acceptRequest: (requestId: number) => Promise<void>;
  declineRequest: (requestId: number) => Promise<void>;
  cancelRequest: (requestId: number) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
}

const FRIENDS_POLL_MS = 5000;
const PRESENCE_POLL_MS = 10000;

/** Roblox-style friend ordering: playing friends always come first, then
 *  builders (Studio), then online, then offline. Applied whenever the friends
 *  list is refreshed. */
function sortFriends(list: FriendEntry[]): FriendEntry[] {
  const rank = (status: string) =>
    status === "in_game" ? 0 : status === "in_studio" ? 1 : status === "online" ? 2 : 3;
  return [...list].sort((a, b) => rank(a.status) - rank(b.status) || a.name.localeCompare(b.name));
}

export function useSocial(enabled: boolean, inGame = false): SocialState {
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestEntry[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await socialApi.getFriends();
      setFriends(sortFriends(data.friends));
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Не удалось загрузить друзей");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(refresh, FRIENDS_POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, refresh, version]);

  // Presence heartbeat: tell the backend we are online.
  useEffect(() => {
    if (!enabled) return;
    const status = inGame ? "in_game" : "online";
    socialApi.pingPresence(status).catch(() => {});
    const timer = setInterval(() => {
      socialApi.pingPresence(status).catch(() => {});
    }, PRESENCE_POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, inGame]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const sendRequest = useCallback(async (userId: number) => {
    await socialApi.sendFriendRequest(userId);
    bump();
    await refresh();
  }, [bump, refresh]);

  const acceptRequest = useCallback(async (requestId: number) => {
    await socialApi.friendAction("accept", { requestId });
    bump();
    await refresh();
  }, [bump, refresh]);

  const declineRequest = useCallback(async (requestId: number) => {
    await socialApi.friendAction("decline", { requestId });
    bump();
    await refresh();
  }, [bump, refresh]);

  const cancelRequest = useCallback(async (requestId: number) => {
    await socialApi.friendAction("cancel", { requestId });
    bump();
    await refresh();
  }, [bump, refresh]);

  const removeFriend = useCallback(async (userId: number) => {
    await socialApi.friendAction("remove", { userId });
    bump();
    await refresh();
  }, [bump, refresh]);

  return {
    friends,
    incoming,
    outgoing,
    loading,
    error,
    refresh,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
  };
}

export function statusLabel(status: string): string {
  switch (status) {
    case "in_game":
      return "В игре";
    case "in_studio":
      return "Создаёт миры";
    case "online":
      return "В сети";
    default:
      return "Не в сети";
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "in_game":
      return "#2ae06c";
    case "in_studio":
      return "#4d9fff";
    case "online":
      return "#34d399";
    default:
      return "#555";
  }
}
