import { useEffect, useMemo, useState } from "react";
import { AccountBar } from "./components/AccountBar";
import { FriendsModal } from "./components/FriendsModal";
import { GameModal } from "./components/GameModal";
import { HomePage } from "./components/HomePage";
import { Navbar } from "./components/Navbar";
import { ProfilePage } from "./components/ProfilePage";
import { ME_ID, getUser, type Game } from "./data";

type View = "home" | "profile";

export default function App() {
  const [meId, setMeId] = useState(ME_ID);
  const [view, setView] = useState<View>("profile");
  const [profileId, setProfileId] = useState(ME_ID);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [extraFriends, setExtraFriends] = useState<string[]>([]);
  const [removedFriends, setRemovedFriends] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");
  const [abouts, setAbouts] = useState<Record<string, string>>({});

  const meBase = getUser(meId);
  const profileBase = getUser(profileId);

  const me = useMemo(() => {
    const ids = meBase.friendIds
      .filter((id) => !removedFriends.includes(id))
      .concat(extraFriends.filter((id) => !meBase.friendIds.includes(id)));
    return { ...meBase, friendIds: Array.from(new Set(ids)), about: abouts[meId] ?? meBase.about };
  }, [meBase, extraFriends, removedFriends, abouts, meId]);

  const user = useMemo(() => {
    const base = profileBase;
    if (base.id !== me.id) {
      return { ...base, about: abouts[base.id] ?? base.about };
    }
    return { ...me, about: abouts[base.id] ?? me.about };
  }, [profileBase, me, abouts]);

  const isFriend =
    user.id === me.id ||
    (me.friendIds.includes(user.id) && !removedFriends.includes(user.id)) ||
    extraFriends.includes(user.id);

  const toast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  };

  const openUser = (id: string) => {
    setProfileId(id);
    setView("profile");
    setFriendsOpen(false);
    setGame(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFriendsOpen(false);
        setGame(null);
        setEditOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const friendsOfViewed = user.friendIds
    .map(getUser)
    .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));

  const myFriends = me.friendIds.map(getUser);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <Navbar
        me={me}
        tab={view === "home" ? "home" : profileId === me.id ? "profile" : "friends"}
        onHome={() => {
          setView("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onProfile={() => openUser(me.id)}
        onFriends={() => {
          setProfileId(me.id);
          setView("profile");
          setFriendsOpen(true);
        }}
        onOpenUser={openUser}
        onOpenGame={(g) => setGame(g)}
        onSoon={(label) => toast(`${label} — скоро в лаунчере`)}
      />
      <AccountBar
        me={me}
        altId={me.id === "sdfsdfds" ? "aether" : "sdfsdfds"}
        onSwitch={(id) => {
          setMeId(id);
          setProfileId(id);
          setView("profile");
          setExtraFriends([]);
          setRemovedFriends([]);
          toast(`Вход в аккаунт ${getUser(id).displayName}`);
        }}
        onAdd={() => toast("Добавление аккаунта скоро появится")}
      />

      {view === "home" ? (
        <HomePage friends={myFriends} onOpenGame={setGame} onOpenUser={openUser} />
      ) : (
        <ProfilePage
          user={user}
          me={me}
          isFriend={isFriend}
          onOpenUser={openUser}
          onOpenFriends={() => setFriendsOpen(true)}
          onOpenGame={setGame}
          onToggleFriend={() => {
            if (user.id === me.id) return;
            if (isFriend) {
              setRemovedFriends((x) => [...x, user.id]);
              setExtraFriends((x) => x.filter((id) => id !== user.id));
              toast(`${user.displayName} удалён из друзей`);
            } else {
              setExtraFriends((x) => [...x, user.id]);
              setRemovedFriends((x) => x.filter((id) => id !== user.id));
              toast(`Запрос в друзья отправлен: ${user.displayName}`);
            }
          }}
          onToast={toast}
          onEdit={() => {
            setAboutDraft(user.about);
            setEditOpen(true);
          }}
        />
      )}

      {friendsOpen && (
        <FriendsModal
          owner={user}
          friends={friendsOfViewed}
          onClose={() => setFriendsOpen(false)}
          onOpenUser={openUser}
        />
      )}

      {game && (
        <GameModal
          game={game}
          onClose={() => setGame(null)}
          onPlay={() => {
            toast(`Запуск «${game.title}»...`);
            setGame(null);
          }}
          onOpenCreator={(id) => {
            setGame(null);
            openUser(id);
          }}
        />
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="anim-pop w-full max-w-lg rounded-3xl border border-white/8 bg-[#161616] p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Редактировать профиль</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Имя и аватар меняются в студии. Здесь можно обновить «О себе».
            </p>
            <textarea
              value={aboutDraft}
              onChange={(e) => setAboutDraft(e.target.value.slice(0, 240))}
              rows={5}
              className="mt-4 w-full resize-none rounded-2xl bg-[#111] p-4 text-sm outline-none ring-1 ring-white/8 focus:ring-[#1ed760]/50"
            />
            <div className="mt-2 text-right text-[11px] text-zinc-600">{aboutDraft.length}/240</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full bg-[#2a2a2a] px-4 py-2 text-sm font-semibold hover:bg-[#333]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbouts((a) => ({ ...a, [me.id]: aboutDraft }));
                  setEditOpen(false);
                  toast("Профиль обновлён");
                }}
                className="rounded-full bg-[#1ed760] px-4 py-2 text-sm font-bold text-black hover:bg-[#2ae06c]"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(360px,calc(100%-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-pop pointer-events-auto rounded-2xl border border-white/8 bg-[#1c1c1c] px-4 py-3 text-sm shadow-xl"
          >
            {t.text}
          </div>
        ))}
      </div>

    </div>
  );
}
