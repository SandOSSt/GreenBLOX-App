import { useCallback, useEffect, useRef, useState } from "react";
import { socialApi, type ChatMessage, type ChatThread } from "./api";

export interface ChatState {
  threads: ChatThread[];
  activePeerId: number | null;
  activeName: string;
  activeColor: string;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  openThread: (peerId: number, name: string, avatarColor: string) => Promise<void>;
  closeThread: () => void;
  sendMessage: (text: string) => Promise<void>;
  deleteThread: (peerId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const CHAT_POLL_MS = 3000;

export function useChat(enabled: boolean): ChatState {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activePeerId, setActivePeerId] = useState<number | null>(null);
  const [activeName, setActiveName] = useState("");
  const [activeColor, setActiveColor] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activePeerRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const next = await socialApi.getChatThreads();
      setThreads(next);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Не удалось загрузить чаты");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const reloadActive = useCallback(async () => {
    const peerId = activePeerRef.current;
    if (!peerId || !enabledRef.current) return;
    try {
      const msgs = await socialApi.getChatMessages(peerId);
      setMessages(msgs);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Не удалось загрузить сообщения");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(() => {
      refresh();
      reloadActive();
    }, CHAT_POLL_MS);
    return () => clearInterval(timer);
  }, [enabled, refresh, reloadActive]);

  const openThread = useCallback(
    async (peerId: number, name: string, avatarColor: string) => {
      activePeerRef.current = peerId;
      setActivePeerId(peerId);
      setActiveName(name);
      setActiveColor(avatarColor);
      try {
        const msgs = await socialApi.getChatMessages(peerId);
        setMessages(msgs);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? "Не удалось загрузить сообщения");
      }
      refresh();
    },
    [refresh]
  );

  const closeThread = useCallback(() => {
    activePeerRef.current = null;
    setActivePeerId(null);
    setActiveName("");
    setActiveColor("");
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const peerId = activePeerRef.current;
      if (!peerId) return;
      await socialApi.sendChatMessage(peerId, text);
      await reloadActive();
      refresh();
    },
    [reloadActive, refresh]
  );

  const deleteThread = useCallback(
    async (peerId: number) => {
      await socialApi.deleteChatThread(peerId);
      if (activePeerRef.current === peerId) closeThread();
      refresh();
    },
    [closeThread, refresh]
  );

  return {
    threads,
    activePeerId,
    activeName,
    activeColor,
    messages,
    loading,
    error,
    openThread,
    closeThread,
    sendMessage,
    deleteThread,
    refresh,
  };
}
