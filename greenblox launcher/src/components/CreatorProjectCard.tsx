import { IconHeart, IconPlay, IconUsers } from "./Icons";

export type CreatorProjectCardInfo = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  viewsCount: number;
  likesCount: number;
  likedByMe: boolean;
};

type Props = {
  project: CreatorProjectCardInfo;
  canLike: boolean;
  onPlay: (project: CreatorProjectCardInfo) => void;
  onToggleLike: (project: CreatorProjectCardInfo) => void;
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n || 0);

/**
 * Карточка карты, созданной игроком в студии (секция «Карты создателя» на
 * странице профиля). Как Roblox: превью-обложка, жанр, счётчик просмотров,
 * кнопка лайка (только для вошедших) и запуск по hover.
 */
export default function CreatorProjectCard({ project, canLike, onPlay, onToggleLike }: Props) {
  return (
    <div className="group flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-[#1c1c1c] text-left ring-1 ring-white/5 transition duration-200 hover:bg-[#222] hover:ring-white/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white uppercase backdrop-blur-sm">
          {project.genre || "Плейс"}
        </span>
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
          <IconUsers className="h-3 w-3" />
          {fmt(project.viewsCount)}
        </span>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onPlay(project)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-[#05210e] shadow-lg shadow-black/40 transition hover:scale-110"
            title={`Играть в ${project.title}`}
          >
            <IconPlay className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-[14px] font-bold text-white">{project.title}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-[11.5px] text-zinc-500">
            {project.description || "Создано в GreenBlox Studio"}
          </span>
          <button
            type="button"
            onClick={() => onToggleLike(project)}
            disabled={!canLike}
            title={canLike ? (project.likedByMe ? "Убрать лайк" : "Лайкнуть карту") : "Войди в аккаунт, чтобы лайкнуть"}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold transition ${
              project.likedByMe
                ? "bg-[#1ed760]/15 text-[#2ae06c]"
                : "bg-white/6 text-zinc-400 hover:bg-white/10 hover:text-white"
            } ${!canLike ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <IconHeart className={`h-3.5 w-3.5 ${project.likedByMe ? "fill-[#2ae06c]" : ""}`} />
            {fmt(project.likesCount)}
          </button>
        </div>
      </div>
    </div>
  );
}
