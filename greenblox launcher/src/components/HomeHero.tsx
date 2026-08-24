import { type Game } from "../data";
import { IconPlay } from "./Icons";

type Props = {
  game: Game;
  onPlay: (game: Game) => void;
};

export default function HomeHero({ game, onPlay }: Props) {
  return (
    <button
      type="button"
      onClick={() => onPlay(game)}
      className="group relative block w-full overflow-hidden rounded-[28px] border border-[#2a2a2a] text-left shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
    >
      <img
        src={game.image}
        alt={game.title}
        className="h-[240px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[300px]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#1ed760] px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.14em] text-[#05210e]">
            Стоит попробовать
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
            {game.category}
          </span>
        </div>
        <div className="text-[30px] font-black leading-none text-white sm:text-[42px]">{game.title}</div>
        <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-[#d8d8d8] sm:text-[14px]">
          {game.description}
        </p>
        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#1ed760] px-6 py-2.5 text-[14px] font-extrabold text-[#05210e] shadow-[0_0_26px_rgba(30,215,96,0.45)] transition-transform duration-200 group-hover:scale-105">
          <IconPlay className="h-4 w-4" />
          Играть
        </span>
      </div>
    </button>
  );
}
