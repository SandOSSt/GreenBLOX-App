import { Plus } from "lucide-react";
import { getUser, type User } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";

export function AccountBar({
  me,
  altId,
  onSwitch,
  onAdd,
}: {
  me: User;
  altId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
}) {
  const alt = getUser(altId);
  const accounts = me.id === alt.id ? [me] : [me, alt];

  return (
    <div className="flex items-center gap-5 bg-[#101010] px-5 py-3">
      <button type="button" onClick={onAdd} className="flex flex-col items-center gap-1.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]">
          <Plus className="h-6 w-6" />
        </span>
        <span className="text-[11px] text-zinc-500">Добавить</span>
      </button>
      {accounts.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => onSwitch(u.id)}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={cn(
              "rounded-full",
              u.id === me.id ? "ring-2 ring-[#1ed760] ring-offset-2 ring-offset-[#101010]" : "",
            )}
          >
            <Avatar user={u} size="md" cropped />
          </span>
          <span className="max-w-16 truncate text-[11px] text-zinc-400">{u.displayName}</span>
        </button>
      ))}
    </div>
  );
}
