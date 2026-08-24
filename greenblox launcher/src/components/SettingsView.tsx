import { useEffect, useState, type CSSProperties } from "react";
import type { ProfileData } from "./types";
import {
  IconCheck,
  IconLogout,
  IconMail,
  IconMonitor,
  IconPalette,
  IconShield,
  IconUser,
  IconVolume,
} from "./Icons";

export type SettingsTab = "profile" | "appearance" | "audio" | "graphics" | "privacy";

type Props = {
  profile: ProfileData;
  userEmail: string;
  theme: string;
  setTheme: (t: string) => void;
  density: string;
  setDensity: (d: string) => void;
  volume: number;
  setVolume: (v: number) => void;
  soundFx: boolean;
  setSoundFx: (v: boolean) => void;
  notifFriends: boolean;
  setNotifFriends: (v: boolean) => void;
  notifGames: boolean;
  setNotifGames: (v: boolean) => void;
  quality: string;
  setQuality: (q: string) => void;
  fpsLimit: string;
  setFpsLimit: (f: string) => void;
  displayMode: string;
  setDisplayMode: (m: string) => void;
  hardwareAccel: boolean;
  setHardwareAccel: (v: boolean) => void;
  privacyPrivacy: string;
  setPrivacyPrivacy: (p: string) => void;
  showActivity: boolean;
  setShowActivity: (v: boolean) => void;
  activeTab: SettingsTab;
  setActiveTab: (t: SettingsTab) => void;
  onSaveProfile: (updated: ProfileData) => void;
  onClearData: () => void;
  onLogout: () => void;
};

const avatarColors = ["#1ed760", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#ef4444"];

const themeOptions = [
  { id: "greenblox", name: "GreenBlox Classic", desc: "Тёмно-зелёная тема", accent: "#1ed760", bg: "#0e0e0e" },
  { id: "cyberpunk", name: "Cyberpunk Neon", desc: "Неоновый бирюзовый акцент", accent: "#00e5a3", bg: "#0a0914" },
  { id: "onyx", name: "Onyx Pitch", desc: "Глубокий минималистичный чёрный", accent: "#38bdf8", bg: "#050505" },
  { id: "emerald", name: "Emerald Mint", desc: "Богатый изумрудный градиент", accent: "#10b981", bg: "#0b1a14" },
];

export default function SettingsView({
  profile,
  userEmail,
  theme,
  setTheme,
  density,
  setDensity,
  volume,
  setVolume,
  soundFx,
  setSoundFx,
  notifFriends,
  setNotifFriends,
  notifGames,
  setNotifGames,
  quality,
  setQuality,
  fpsLimit,
  setFpsLimit,
  displayMode,
  setDisplayMode,
  hardwareAccel,
  setHardwareAccel,
  privacyPrivacy,
  setPrivacyPrivacy,
  showActivity,
  setShowActivity,
  activeTab,
  setActiveTab,
  onSaveProfile,
  onClearData,
  onLogout,
}: Props) {
  const [draft, setProfileDraft] = useState<ProfileData>(profile);

  useEffect(() => {
    setProfileDraft(profile);
  }, [profile]);

  return (
    <div className="anim-fade-up mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Настройки клиента</h1>
        <p className="mt-1 text-sm text-zinc-500">Персонализация профиля, интерфейса, звука и безопасности.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1 self-start rounded-2xl bg-[#191919] p-2">
          {[
            { id: "profile" as SettingsTab, label: "Профиль", Icon: IconUser },
            { id: "appearance" as SettingsTab, label: "Тема и вид", Icon: IconPalette },
            { id: "audio" as SettingsTab, label: "Звук и уведомления", Icon: IconVolume },
            { id: "graphics" as SettingsTab, label: "Графика и клиент", Icon: IconMonitor },
            { id: "privacy" as SettingsTab, label: "Безопасность", Icon: IconShield },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-all ${
                  active
                    ? "bg-[#1ed760] text-black"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-5">
          {activeTab === "profile" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveProfile(draft);
              }}
              className="space-y-4 rounded-2xl bg-[#191919] p-6"
            >
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <IconUser className="h-4 w-4 text-[#1ed760]" /> Редактирование профиля
              </h2>

              <div className="flex items-center justify-between rounded-xl bg-[#121212] p-3 text-[12.5px]">
                <span className="text-zinc-500">Привязанный Email:</span>
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <IconMail className="h-3.5 w-3.5 text-zinc-500" />
                  {userEmail}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-zinc-500">Отображаемое имя</span>
                  <input
                    value={draft.name}
                    maxLength={30}
                    onChange={(e) => setProfileDraft({ ...draft, name: e.target.value })}
                    className="gb-input h-11 w-full px-3.5 text-[13px]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-zinc-500">Ник (@handle)</span>
                  <input
                    value={draft.handle}
                    maxLength={30}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s/g, "");
                      setProfileDraft({ ...draft, handle: v.startsWith("@") ? v : `@${v}` });
                    }}
                    className="gb-input h-11 w-full px-3.5 text-[13px]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-zinc-500">Статус-цитата</span>
                <input
                  value={draft.statusQuote}
                  maxLength={50}
                  onChange={(e) => setProfileDraft({ ...draft, statusQuote: e.target.value })}
                  placeholder="Например: В сети и готов играть"
                  className="gb-input h-11 w-full px-3.5 text-[13px]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-zinc-500">О себе (Bio)</span>
                <textarea
                  value={draft.bio}
                  maxLength={180}
                  onChange={(e) => setProfileDraft({ ...draft, bio: e.target.value })}
                  className="gb-input min-h-[96px] w-full resize-none p-3 text-[13px]"
                />
              </label>

              <div>
                <span className="mb-2 block text-[12px] font-semibold text-zinc-500">Цвет аватара</span>
                <div className="flex items-center gap-3">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfileDraft({ ...draft, avatarColor: color })}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${
                        draft.avatarColor === color ? "ring-2 ring-white/70 ring-offset-2 ring-offset-[#191919]" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[12px] font-semibold text-zinc-500">Стиль обложки профиля</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { id: "emerald", label: "Изумруд" },
                    { id: "cyberpunk", label: "Киберпанк" },
                    { id: "sunset", label: "Закат" },
                    { id: "midnight", label: "Полночь" },
                    { id: "ruby", label: "Рубин" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setProfileDraft({ ...draft, coverStyle: style.id })}
                      className={`rounded-xl border p-2.5 text-[12.5px] font-semibold transition-all ${
                        draft.coverStyle === style.id
                          ? "border-[#1ed760] bg-[#1ed760]/10 text-[#1ed760]"
                          : "border-white/6 bg-[#121212] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ background: `linear-gradient(150deg, ${draft.avatarColor}, ${draft.avatarColor}66 60%, #141414)` }}
                >
                  {(draft.name.trim()[0] || "?").toUpperCase()}
                </span>
                <button type="submit" className="gb-action-btn gb-primary h-10 px-6 text-[13px]">
                  Сохранить профиль
                </button>
              </div>
            </form>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-5 rounded-2xl bg-[#191919] p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <IconPalette className="h-4 w-4 text-[#1ed760]" /> Темы интерфейса
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {themeOptions.map((item) => {
                  const active = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id)}
                      className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-[#1ed760] bg-[#1ed760]/10"
                          : "border-white/6 bg-[#121212] hover:border-white/14"
                      }`}
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20"
                        style={{ backgroundColor: item.accent }}
                      >
                        {active && <IconCheck className="h-3.5 w-3.5 text-black" />}
                      </span>
                      <div>
                        <div className="text-[14px] font-semibold text-white">{item.name}</div>
                        <div className="mt-0.5 text-[12px] text-zinc-500">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/6 pt-4">
                <h3 className="mb-2 text-[14px] font-bold">Плотность интерфейса</h3>
                <div className="flex gap-2">
                  {[
                    { id: "compact", label: "Компактный" },
                    { id: "normal", label: "Стандартный" },
                    { id: "spacious", label: "Просторный" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDensity(d.id)}
                      className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all ${
                        density === d.id
                          ? "bg-[#1ed760] text-black"
                          : "bg-[#2a2a2a] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-5 rounded-2xl bg-[#191919] p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <IconVolume className="h-4 w-4 text-[#1ed760]" /> Громкость и эффекты
              </h2>

              <div>
                <div className="flex justify-between text-[13px] font-semibold">
                  <span>Общая громкость</span>
                  <span className="text-[#1ed760]">{volume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="gb-range mt-2"
                  style={{ "--fill": `${volume}%` } as CSSProperties}
                  aria-label="Общая громкость"
                />
              </div>

              <ToggleOption title="Звуковые эффекты запуска" desc="Звук при клике на «Играть»" checked={soundFx} onChange={setSoundFx} />

              <div className="space-y-3 border-t border-white/6 pt-4">
                <h3 className="text-[14px] font-bold">Уведомления</h3>
                <ToggleOption title="Заявки и активности друзей" desc="Всплывающие плашки" checked={notifFriends} onChange={setNotifFriends} />
                <ToggleOption title="Обновления лаунчера" desc="Уведомлять о важных событиях" checked={notifGames} onChange={setNotifGames} />
              </div>
            </div>
          )}

          {activeTab === "graphics" && (
            <div className="space-y-5 rounded-2xl bg-[#191919] p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <IconMonitor className="h-4 w-4 text-[#1ed760]" /> Графика и клиент
              </h2>

              <OptionGroup label="Качество графики" options={["Низкое", "Среднее", "Высокое", "Ультра"]} value={quality} onChange={setQuality} />
              <OptionGroup label="Ограничение FPS" options={["30 FPS", "60 FPS", "120 FPS", "Без ограничений"]} value={fpsLimit} onChange={setFpsLimit} />
              <OptionGroup label="Режим отображения" options={["В окне", "Без рамок", "Полноэкранный"]} value={displayMode} onChange={setDisplayMode} />

              <ToggleOption title="Аппаратное ускорение (GPU)" desc="Использовать дискретную видеокарту" checked={hardwareAccel} onChange={setHardwareAccel} />
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-5 rounded-2xl bg-[#191919] p-6">
              <h2 className="flex items-center gap-2 text-[15px] font-bold">
                <IconShield className="h-4 w-4 text-[#1ed760]" /> Приватность и Безопасность
              </h2>

              <OptionGroup label="Кто может писать сообщения" options={["Все", "Только друзья", "Никто"]} value={privacyPrivacy} onChange={setPrivacyPrivacy} />

              <ToggleOption title="Отображать активность в профиле" desc="Друзья видят, во что ты играешь" checked={showActivity} onChange={setShowActivity} />

              <div className="space-y-3 border-t border-white/6 pt-4">
                <h3 className="text-[14px] font-bold">Текущий сеанс</h3>
                <div className="flex items-center justify-between rounded-xl bg-[#121212] p-3 text-[13px]">
                  <div>
                    <div className="font-semibold text-white">Windows PC · GreenBlox App v2.4</div>
                    <div className="text-[11.5px] text-zinc-500">Активно сейчас · IP: 127.0.0.1</div>
                  </div>
                  <span className="rounded-full bg-[#1ed760]/15 px-2.5 py-1 text-[11px] font-bold text-[#1ed760]">
                    Текущий
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-red-500/20 pt-4">
                <h3 className="text-[14px] font-bold text-red-400">Опасная зона</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onClearData}
                    className="rounded-full bg-red-500/10 px-4 py-2 text-[12.5px] font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    Сбросить данные локального хранилища
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-4 py-2 text-[12.5px] font-semibold text-red-400 hover:bg-red-500/25"
                  >
                    <IconLogout className="h-3.5 w-3.5" />
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13px] font-semibold text-white">{title}</div>
        <div className="text-[11.5px] text-zinc-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#1ed760]" : "bg-white/10"
        }`}
      >
        <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          // w-11 (44px) − ручка h-5/w-5 (20px) = 24px хода → translate-x-6.
          // Прежний translate-x-5.5 не существует в шкале Tailwind — ручка не двигалась.
          checked ? "translate-x-6 translate-y-0.5" : "translate-x-0.5 translate-y-0.5"
        }`}
        />
      </button>
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-[13px] font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all ${
              value === opt
                ? "bg-[#1ed760] text-black"
                : "bg-[#2a2a2a] text-zinc-400 hover:text-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
