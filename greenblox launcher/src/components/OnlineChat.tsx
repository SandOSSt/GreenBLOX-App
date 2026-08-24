import { type FormEvent, useEffect, useRef, useState } from "react";
import type { ChatState } from "../social/useChat";
import { Avatar } from "./Avatar";

type Props = {
  chat: ChatState;
  myUserId: number | null;
  onClose: () => void;
  onOpenFriendProfile?: (peerId: number) => void;
};

function bubbleTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function OnlineChat({ chat, myUserId, onClose }: Props) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  // Length from the PREVIOUS render, so auto-scroll fires only when the list
  // actually grew. A per-render variable would always equal the current length
  // inside the effect, and the scroll would never happen.
  const prevMessagesLenRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const prev = prevMessagesLenRef.current;
    prevMessagesLenRef.current = chat.messages.length;
    if (chat.messages.length !== prev) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chat.messages.length]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || chat.activePeerId === null) return;
    chat.sendMessage(text).catch(() => {});
    setDraft("");
  };

  return (
    <aside className="animate-scale-in absolute bottom-4 right-4 z-30 flex h-[520px] w-[440px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-96px)] overflow-hidden rounded-[22px] glass-panel shadow-2xl">
      <div className="flex w-[38%] flex-col border-r border-white/6 p-2">
        <div className="px-2 pb-2 pt-1 text-[13px] font-extrabold">Сообщения</div>
        <div className="gb-scroll flex-1 overflow-y-auto">
          {chat.threads.length === 0 && (
            <div className="px-2 py-8 text-center text-[12px] text-[#777]">
              Нет чатов. Напиши другу со вкладки «Друзья».
            </div>
          )}
          {chat.threads.map((t) => (
            <button
              key={t.peerId}
              type="button"
              onClick={() => chat.openThread(t.peerId, t.name, t.avatarColor).catch(() => {})}
              className={`mb-1 flex w-full items-center gap-2 rounded-[14px] px-2 py-2 text-left ${
                chat.activePeerId === t.peerId ? "bg-white/8" : "hover:bg-white/4"
              }`}
            >
              <Avatar name={t.name} color={t.avatarColor} size="sm" showOnline />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[12.5px] font-bold">{t.name}</span>
                  {t.unread > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1ed760] px-1 text-[9.5px] font-black text-black">
                      {t.unread}
                    </span>
                  )}
                </div>
                <div className="truncate text-[11px] text-[#888]">
                  {t.lastMessage || "Нет сообщений"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {chat.activePeerId !== null && (
              <Avatar name={chat.activeName} color={chat.activeColor} size="sm" />
            )}
            <span className="truncate text-[13px] font-extrabold">
              {chat.activePeerId !== null ? chat.activeName : "Выбери чат"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {chat.activePeerId !== null && (
              <button
                type="button"
                title="Удалить переписку"
                onClick={() => chat.deleteThread(chat.activePeerId!).catch(() => {})}
                className="rounded-full bg-white/5 px-2 py-1 text-[10.5px] font-bold text-red-300 hover:bg-red-500/15"
              >
                Очистить
              </button>
            )}
            <button type="button" onClick={onClose} className="text-[#888] hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="gb-scroll flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {chat.activePeerId === null && (
            <div className="pt-16 text-center text-[12px] text-[#777]">Выбери чат слева</div>
          )}
          {chat.activePeerId !== null && chat.messages.length === 0 && (
            <div className="pt-16 text-center text-[12px] text-[#777]">
              Начни диалог с {chat.activeName}
            </div>
          )}
          {chat.messages.map((m) => {
            const mine = m.fromId === myUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-[16px] px-3 py-2 text-[13px] ${
                    mine ? "bg-[#1ed760] text-black" : "bg-white/8 text-white"
                  }`}
                >
                  {m.text}
                  <div className={`mt-0.5 text-[9.5px] ${mine ? "text-black/50" : "text-white/35"}`}>
                    {bubbleTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex gap-2 border-t border-white/6 p-2.5"
          onSubmit={send}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={chat.activePeerId === null}
            placeholder={chat.activePeerId !== null ? "Сообщение..." : "Выбери чат"}
            className="h-10 flex-1 rounded-full border border-white/8 bg-[#111] px-3 text-[13px] text-white placeholder:text-[#6b6b6b] focus:border-[#1ed760]/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={chat.activePeerId === null || !draft.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] hover:bg-[#2ae06c] disabled:opacity-50"
            title="Отправить"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
