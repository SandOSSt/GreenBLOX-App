// Embeddable session chat for the in-game menu.

import { useEffect, useRef, type FormEvent } from "react";
import type { SessionChatMessage } from "../social/api";
import { MiniAvatar } from "./MiniAvatar";
import { IconSend } from "./MenuIcons";

export function ChatSection({
  myUserId,
  placeTitle,
  messages,
  onSend,
  onClose,
  chatDraft,
  setChatDraft,
}: {
  myUserId: number | null;
  placeTitle: string;
  messages: SessionChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
  chatDraft: string;
  setChatDraft: (v: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Length of the message list from the PREVIOUS render. A plain variable
  // re-created each render would always equal the current length by the time
  // the effect runs — the auto-scroll would never fire.
  const prevLenRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const prev = prevLenRef.current;
    prevLenRef.current = messages.length;
    if (messages.length !== prev) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    onSend(text);
  };

  return (
    <div className="flex h-[430px] flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0f1013]">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/4 px-3 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">Чат · {placeTitle}</div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          title="Закрыть чат"
        >
          ✕
        </button>
      </div>

      <div ref={scrollRef} className="gb-scroll flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="pt-14 text-center text-[12px] text-white/40">Сообщений пока нет — начни общение</div>
        )}
        {messages.map((m) => {
          const mine = m.userId === myUserId;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && <MiniAvatar name={m.name} color={m.avatarColor} size={26} />}
              <div className={`min-w-0 max-w-[80%] rounded-[14px] px-2.5 py-1.5 ${mine ? "bg-[#1ed760] text-[#05210e]" : "bg-white/8 text-white"}`}>
                {!mine && <div className="text-[10px] font-bold text-[#2ae06c]/90">{m.name}</div>}
                <div className="break-words text-[12.5px] leading-snug">{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="flex gap-2 border-t border-white/8 p-2.5" onSubmit={submit}>
        <input
          value={chatDraft}
          onChange={(e) => setChatDraft(e.target.value)}
          placeholder={`Сообщение в ${placeTitle}...`}
          className="h-10 min-w-0 flex-1 rounded-full border border-white/10 bg-black/40 px-3.5 text-[12.5px] text-white placeholder:text-white/30 focus:border-[#1ed760]/60"
        />
        <button
          type="submit"
          disabled={!chatDraft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] disabled:opacity-40"
          title="Отправить"
        >
          <IconSend className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
