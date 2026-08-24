import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { User } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";

export function FriendsModal({
  owner,
  friends,
  onClose,
  onOpenUser,
}: {
  owner: User;
  friends: User[];
  onClose: () => void;
  onOpenUser: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "online">("all");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return friends
      .filter((f) => (tab === "online" ? f.isOnline : true))
      .filter(
        (f) =>
          !s ||
          f.displayName.toLowerCase().includes(s) ||
          f.username.toLowerCase().includes(s),
      )
      .sort((a, b) => Number(b.isOnline) - Number(a.isOnline));
  }, [friends, q, tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="anim-pop flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#161616] shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-xl font-bold">Друзья {owner.displayName}</h2>
            <p className="text-sm text-zinc-500">{friends.length} в списке</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 pb-4">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[#1f1f1f] px-3 ring-1 ring-white/5">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Найти друга"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
            />
          </div>
          <div className="flex rounded-full bg-[#1f1f1f] p-1">
            {(
              [
                ["all", "Все"],
                ["online", "В сети"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  tab === id ? "bg-[#1ed760] text-black" : "text-zinc-400",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 overflow-y-auto px-6 pb-6 sm:grid-cols-3">
          {list.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-zinc-500">Пусто</div>
          )}
          {list.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onOpenUser(f.id)}
              className="flex items-center gap-3 rounded-2xl bg-[#1f1f1f] p-3 text-left hover:bg-[#262626]"
            >
              <Avatar user={f} size="md" showOnline cropped />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{f.displayName}</div>
                <div className="truncate text-[11px] text-zinc-500">
                  {f.isOnline ? f.activity || "В сети" : f.lastOnline}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
