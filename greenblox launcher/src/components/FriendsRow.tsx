import { type FriendEntry } from "../social/api";
import AvatarCircle from "./AvatarCircle";
import { IconGamepad, IconPlay, IconHammer } from "./Icons";

type Props = {
  friends: FriendEntry[];
  onSelect: (friend: FriendEntry) => void;
  onJoin: (friend: FriendEntry) => void;
};

function statusText(friend: FriendEntry): string {
  if (friend.status === "in_game") {
    return `Играет в ${friend.session?.placeTitle || "GreenBlox Place"}`;
  }
  if (friend.status === "in_studio") return "Создаёт миры в Studio";
  if (friend.status === "online") return "В лаунчере";
  return "Не в сети";
}

export default function FriendsRow({ friends, onSelect, onJoin }: Props) {
  const online = friends.filter((f) => f.status !== "offline");
  if (online.length === 0) return null;

  return (
    <section className="mb-2">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold">Друзья в игре</h2>
          <p className="mt-0.5 text-[12px] text-[#777]">Зайди к ним — они уже внутри</p>
        </div>
      </div>
      <div className="gb-hide-scroll flex items-start gap-4 overflow-x-auto pb-1">
        {online.slice(0, 12).map((friend) => (
          <button
            key={friend.id}
            type="button"
            onClick={() => (friend.session ? onJoin(friend) : onSelect(friend))}
            className="group flex w-[96px] shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <span className="relative transition-transform duration-200 group-hover:scale-105">
              <AvatarCircle
                name={friend.name}
                color={friend.avatarColor}
                size={76}
                status={friend.status}
              />
              {friend.status === "in_game" && (
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] shadow-[0_0_10px_rgba(30,215,96,0.6)]">
                  <IconGamepad className="h-3 w-3" />
                </span>
              )}
              {friend.status === "in_studio" && (
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#4d9fff] text-white shadow-[0_0_10px_rgba(77,159,255,0.6)]">
                  <IconHammer className="h-3 w-3" />
                </span>
              )}
            </span>
            <span className="w-full truncate text-[12.5px] font-extrabold text-white">
              {friend.name}
            </span>
            <span
              className={`flex w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                friend.status === "in_game"
                  ? "bg-[#1ed760]/15 text-[#2ae06c]"
                  : friend.status === "in_studio"
                    ? "bg-[#4d9fff]/15 text-[#7db8ff]"
                    : friend.status === "online"
                      ? "bg-white/6 text-[#9fd8c2]"
                      : "bg-white/4 text-[#777]"
              }`}
            >
              {friend.status === "in_game" && <IconPlay className="h-2.5 w-2.5 shrink-0" />}
              {friend.status === "in_studio" && <IconHammer className="h-2.5 w-2.5 shrink-0" />}
              <span className="truncate">{statusText(friend)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
