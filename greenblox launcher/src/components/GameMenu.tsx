// GreenBlox-style in-game menu, opened from the favicon button (top-left).
// Left rail navigation with tabs: Люди, Образ, Мир, Модули, Чат, Настройки, Помощь.
// Footer: Leave / Respawn / Restart / Resume — just like the classic Roblox menu.

import { useState, type ReactNode } from "react";
import type { AvatarColors } from "../game/Avatar";
import type { ImportInstance, ImportLanguage } from "../game/imports";
import type { GameStats } from "../game/types";
import type { SessionChatMessage } from "../social/api";
import { AvatarEditor } from "./AvatarEditor";
import { ChatSection } from "./ChatSection";
import { ExplorerTree, type ExplorerNode } from "./ExplorerPanel";
import { ImportsSection } from "./ImportsSection";
import { MiniAvatar } from "./MiniAvatar";
import {
  IconAvatar,
  IconChat,
  IconCpu,
  IconGear,
  IconHelp,
  IconLeave,
  IconRespawn,
  IconRestart,
  IconResume,
  IconUsers,
  IconWorld,
  IconX,
  LogoMark,
} from "./MenuIcons";

export type GameMenuSettings = {
  sensitivity: number;
  quality: 1 | 2 | 3;
  clouds: boolean;
};

export type MenuPlayer = {
  userId: number;
  name: string;
  avatarColor: string;
  coins?: number;
  deaths?: number;
  stage?: number;
  won?: boolean;
  isMe?: boolean;
  isHost?: boolean;
};

export type MenuTabId =
  | "people"
  | "look"
  | "world"
  | "modules"
  | "chat"
  | "settings"
  | "help";

type TabDef = {
  id: MenuTabId;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export function GameMenu({
  stats,
  title,
  players,
  joinCode,
  avatarColors,
  settings,
  explorerRoot,
  loadedImports,
  chatMessages,
  chatDraft,
  onChatDraftChange,
  onSendChat,
  onAvatarChange,
  onSettingsChange,
  onLoadImport,
  onUnloadImport,
  on1CBuy,
  onTeleport,
  onRespawn,
  onRestart,
  onLeave,
  onClose,
  muted,
  onToggleMute,
  myUserId,
  onAddFriend = () => {},
}: {
  stats: GameStats | null;
  title: string;
  players: MenuPlayer[];
  joinCode?: string;
  avatarColors: AvatarColors;
  settings: GameMenuSettings;
  explorerRoot: ExplorerNode | null;
  loadedImports: ImportInstance[];
  chatMessages: SessionChatMessage[];
  chatDraft: string;
  onChatDraftChange: (v: string) => void;
  onSendChat: (text: string) => void;
  onAvatarChange: (c: AvatarColors) => void;
  onSettingsChange: (s: GameMenuSettings) => void;
  onLoadImport: (lang: ImportLanguage) => void;
  onUnloadImport: (lang: ImportLanguage) => void;
  on1CBuy: (itemId: string) => void;
  onTeleport: (x: number, y: number, z: number) => void;
  onRespawn: () => void;
  onRestart: () => void;
  onLeave: () => void;
  onClose: () => void;
  muted: boolean;
  onToggleMute: () => void;
  myUserId: number | null;
  onAddFriend?: (userId: number) => void;
}) {
  const [tab, setTab] = useState<MenuTabId>("people");
  const m = Math.floor((stats?.time ?? 0) / 60);
  const s = Math.floor((stats?.time ?? 0) % 60);

  // Session chat must be reachable as soon as the host created/joined a
  // multiplayer session — even before any guest arrived or any message was
  // sent. Otherwise the host can't open the chat (or the join-code hint).
  const isMultiplayer = Boolean(joinCode) || chatMessages.length > 0 || players.length > 0;

  const TABS: TabDef[] = [
    { id: "people", label: "Люди", icon: <IconUsers className="h-[17px] w-[17px]" />, badge: players.length > 0 ? players.length : undefined },
    { id: "look", label: "Образ", icon: <IconAvatar className="h-[17px] w-[17px]" /> },
    { id: "world", label: "Мир", icon: <IconWorld className="h-[17px] w-[17px]" /> },
    { id: "modules", label: "Модули", icon: <IconCpu className="h-[17px] w-[17px]" />, badge: loadedImports.length },
  ];

  const qualityOptions: { id: 1 | 2 | 3; label: string }[] = [
    { id: 1, label: "Низкое" },
    { id: 2, label: "Среднее" },
    { id: 3, label: "Высокое" },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="flex h-[86vh] max-h-[86vh] w-[760px] max-w-[95vw] flex-col overflow-hidden rounded-[28px] border-2 border-[#2a2d33] bg-[#16181c]/97 shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(30,215,96,0.06)]">
        <div className="flex items-center gap-3 border-b border-white/8 bg-black/30 px-5 py-3.5">
          <LogoMark className="h-10 w-10" rounded="rounded-[14px]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-black tracking-tight text-white">{title}</div>
            <div className="text-[10.5px] font-semibold text-white/40">
              {joinCode ? `Сессия · код ${joinCode}` : "GreenBlox · игра"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
            title="Продолжить (Esc)"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav className="flex w-[168px] shrink-0 flex-col gap-1 border-r border-white/8 bg-black/25 p-2.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[12.5px] font-bold transition-all ${
                  tab === t.id
                    ? "bg-[#1ed760] text-[#05210e] shadow-[0_4px_14px_rgba(30,215,96,0.35)]"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="shrink-0">{t.icon}</span>
                <span className="truncate">{t.label}</span>
                {typeof t.badge === "number" && t.badge > 0 && (
                  <span
                    className={`ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black ${
                      tab === t.id ? "bg-[#05210e]/25 text-[#05210e]" : "bg-[#1ed760] text-[#05210e]"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}

            {isMultiplayer && (
              <button
                type="button"
                onClick={() => setTab("chat")}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[12.5px] font-bold transition-all ${
                  tab === "chat"
                    ? "bg-[#1ed760] text-[#05210e] shadow-[0_4px_14px_rgba(30,215,96,0.35)]"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <IconChat className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate">Чат</span>
              </button>
            )}

            <div className="space-y-1 border-t border-white/8 pt-2.5">
              <button
                type="button"
                onClick={() => setTab("settings")}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[12.5px] font-bold transition-all ${
                  tab === "settings"
                    ? "bg-[#1ed760] text-[#05210e] shadow-[0_4px_14px_rgba(30,215,96,0.35)]"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <IconGear className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate">Настройки</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("help")}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[12.5px] font-bold transition-all ${
                  tab === "help"
                    ? "bg-[#1ed760] text-[#05210e] shadow-[0_4px_14px_rgba(30,215,96,0.35)]"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <IconHelp className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate">Помощь</span>
              </button>
            </div>
          </nav>

          <div className="gb-scroll min-w-0 flex-1 overflow-y-auto px-5 py-5">
            {tab === "people" && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase tracking-wider text-white/40">
                    Игроки · {players.length}
                  </div>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                      muted ? "bg-rose-500/80 text-white" : "bg-white/8 text-white/60 hover:bg-white/14"
                    }`}
                  >
                    {muted ? "🔇 Выкл. звук" : "🔊 Звук вкл."}
                  </button>
                </div>
                <div className="space-y-1.5">
                  {players.map((p) => (
                    <div key={p.userId} className="flex items-center gap-2.5 rounded-[14px] bg-white/4 px-3 py-2">
                      <div className="relative">
                        <MiniAvatar name={p.name} color={p.avatarColor} size={36} />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#16181c] ${
                            p.isMe ? "bg-sky-400" : "bg-[#2ae06c]"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-bold text-white">{p.name}</span>
                          {p.isMe && <span className="shrink-0 rounded-full bg-sky-500/25 px-1.5 py-0.5 text-[9px] font-black text-sky-300">ТЫ</span>}
                          {p.isHost && <span className="shrink-0 rounded-full bg-amber-500/25 px-1.5 py-0.5 text-[9px] font-black text-amber-300">ХОСТ</span>}
                          {p.won && <span className="shrink-0 text-[12px]">🏆</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-white/45">
                          <span className="font-bold text-yellow-300/90">🪙 {p.coins ?? 0}</span>
                          <span className="text-white/15">·</span>
                          <span className="font-bold text-rose-300/90">💀 {p.deaths ?? 0}</span>
                          {typeof p.stage === "number" && p.stage > 0 && (
                            <>
                              <span className="text-white/15">·</span>
                              <span className="font-bold text-emerald-300/90">🚩 {p.stage}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={p.isMe}
                        onClick={() => {
                          if (p.isMe) return;
                          onAddFriend(p.userId);
                        }}
                        className="rounded-lg bg-white/8 px-2.5 py-1.5 text-[10px] font-bold text-white/50 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30"
                        title={p.isMe ? "Это ты" : "Добавить в друзья"}
                      >
                        ＋ Друг
                      </button>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <div className="rounded-2xl bg-white/4 px-5 py-10 text-center text-[12.5px] text-white/40">
                      Ты пока один в этом плейсе
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "look" && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <MiniAvatar name="G" color="#1ed760" size={52} />
                  <div>
                    <div className="text-[13px] font-black text-white">Твой персонаж</div>
                    <div className="text-[11px] text-white/40">Меняйся в реальном времени — видят все игроки сессии</div>
                  </div>
                </div>
                <AvatarEditor colors={avatarColors} onChange={onAvatarChange} />
              </div>
            )}

            {tab === "world" && (
              <div>
                <div className="mb-3 text-[11px] font-black uppercase tracking-wider text-white/40">Карта мира</div>
                {explorerRoot ? (
                  <ExplorerTree root={explorerRoot} onTeleport={onTeleport} />
                ) : (
                  <div className="rounded-2xl bg-white/4 px-5 py-10 text-center text-[12.5px] text-white/40">
                    Мир ещё не загружен
                  </div>
                )}
              </div>
            )}

            {tab === "modules" && (
              <div>
                <div className="mb-3 text-[11px] font-black uppercase tracking-wider text-white/40">Модули движка</div>
                <ImportsSection loaded={loadedImports} onLoad={onLoadImport} onUnload={onUnloadImport} on1CBuy={on1CBuy} />
              </div>
            )}

            {tab === "chat" && isMultiplayer && (
              <ChatSection
                myUserId={myUserId}
                placeTitle={title}
                messages={chatMessages}
                onSend={onSendChat}
                onClose={() => setTab("people")}
                chatDraft={chatDraft}
                setChatDraft={onChatDraftChange}
              />
            )}

            {tab === "settings" && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[12px] font-bold text-white/80">Чувствительность камеры</div>
                    <div className="font-mono text-[11px] font-bold text-[#2ae06c]">
                      {Math.round((settings.sensitivity / 0.0018) * 50)}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.0006}
                    max={0.0042}
                    step={0.0002}
                    value={settings.sensitivity}
                    onChange={(e) => onSettingsChange({ ...settings, sensitivity: Number(e.target.value) })}
                    className="w-full accent-[#1ed760]"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-white/30">
                    <span>Медленно</span>
                    <span>Быстро</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[12px] font-bold text-white/80">Качество графики</div>
                  <div className="grid grid-cols-3 gap-2">
                    {qualityOptions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => onSettingsChange({ ...settings, quality: q.id })}
                        className={`rounded-2xl px-3 py-2.5 text-[12px] font-bold transition-all ${
                          settings.quality === q.id
                            ? "bg-[#1ed760] text-[#05210e]"
                            : "bg-white/6 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/4 px-4 py-3">
                  <div>
                    <div className="text-[12.5px] font-bold text-white">Облака в небе</div>
                    <div className="text-[10.5px] text-white/40">Объёмные роблокс-облака поверх мира</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.clouds}
                    onClick={() => onSettingsChange({ ...settings, clouds: !settings.clouds })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      settings.clouds ? "bg-[#1ed760]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        settings.clouds ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>

                {stats && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white/4 p-3 text-center border border-white/6">
                      <div className="font-mono text-[15px] font-black text-emerald-300">{stats.fps}</div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/35">FPS</div>
                    </div>
                    <div className="rounded-2xl bg-white/4 p-3 text-center border border-white/6">
                      <div className="font-mono text-[15px] font-black text-white">{stats.parts}</div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/35">Частей</div>
                    </div>
                    <div className="rounded-2xl bg-white/4 p-3 text-center border border-white/6">
                      <div className="font-mono text-[15px] font-black text-sky-300">
                        {m}:{s.toString().padStart(2, "0")}
                      </div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/35">Время</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "help" && (
              <div>
                <div className="mb-3 text-[11px] font-black uppercase tracking-wider text-white/40">Управление</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "WASD", v: "Движение" },
                    { k: "Пробел", v: "Прыжок" },
                    { k: "Shift", v: "Бег" },
                    { k: "ПКМ", v: "Вращение камеры" },
                    { k: "Колесо", v: "Зум камеры" },
                    { k: "B", v: "Режим стройки" },
                    { k: "R", v: "На чекпоинт" },
                    { k: "Esc", v: "Меню" },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between rounded-2xl bg-white/4 px-3 py-2.5">
                      <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-[11px] font-bold text-[#2ae06c]">{row.k}</span>
                      <span className="text-[12px] font-semibold text-white/70">{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-[#1ed760]/25 bg-[#1ed760]/10 p-3.5">
                  <div className="text-[12px] font-bold text-[#2ae06c]">💡 Совет</div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-white/60">
                    Собирай монеты, проходи этапы и финишируй первым. Во вкладке «Мир» можно телепортироваться к любой детали, а «Модули» добавить Lua-скрипты и 1C-бухгалтерию прямо во время игры.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/8 bg-black/30 px-5 py-3">
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center gap-2 rounded-full bg-rose-500/85 px-4 py-2.5 text-[12.5px] font-bold text-white transition-all hover:bg-rose-500 active:scale-95"
          >
            <IconLeave className="h-4 w-4" />
            Выйти
          </button>
          <button
            type="button"
            onClick={onRespawn}
            className="flex items-center gap-2 rounded-full bg-white/8 px-4 py-2.5 text-[12.5px] font-bold text-white/80 transition-all hover:bg-white/14 hover:text-white active:scale-95"
          >
            <IconRespawn className="h-4 w-4" />
            Возродиться
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-2 rounded-full bg-white/8 px-4 py-2.5 text-[12.5px] font-bold text-white/80 transition-all hover:bg-white/14 hover:text-white active:scale-95"
          >
            <IconRestart className="h-4 w-4" />
            Заново
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center gap-2 rounded-full bg-[#1ed760] px-5 py-2.5 text-[12.5px] font-black text-[#05210e] transition-all hover:bg-[#2ae06c] active:scale-95"
          >
            <IconResume className="h-4 w-4" />
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
