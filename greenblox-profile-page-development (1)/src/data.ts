export type Game = {
  id: string;
  title: string;
  creator: string;
  creatorId?: string;
  genre: string;
  image: string;
  playing: number;
  visits: string;
  rating: number;
  description: string;
};

export type WearItem = {
  id: string;
  name: string;
  type: string;
  tone: string;
};

export type Badge = {
  id: string;
  name: string;
  desc: string;
  tone: string;
  glyph: string;
};

export type Group = {
  id: string;
  name: string;
  role: string;
  members: string;
  letter: string;
  tone: string;
};

export type User = {
  id: string;
  displayName: string;
  username: string;
  letter: string;
  letterClass: string;
  avatar?: string;
  about: string;
  joinDate: string;
  isOnline: boolean;
  activity?: string;
  isPremium: boolean;
  isVerified: boolean;
  followers: number;
  following: number;
  placeVisits: string;
  friendIds: string[];
  createdGameIds: string[];
  favoriteGameIds: string[];
  wearing: WearItem[];
  badges: Badge[];
  groups: Group[];
  forumPosts: number;
  lastOnline: string;
};

export const GAMES: Game[] = [
  {
    id: "fruits",
    title: "Фрукты Силы",
    creator: "Gamer Robot",
    genre: "Приключения",
    image: "/images/game-fruits.png",
    playing: 184320,
    visits: "912M",
    rating: 94,
    description:
      "Охоться за легендарными фруктами, прокачивай стиль боя и стань королём морей.",
  },
  {
    id: "city",
    title: "GreenBlox City",
    creator: "GB Studios",
    creatorId: "aether",
    genre: "RP",
    image: "/images/game-city.png",
    playing: 42110,
    visits: "128M",
    rating: 91,
    description:
      "Живи свою историю в неоновом мегаполисе: работа, дома, банды и ночные гонки.",
  },
  {
    id: "obby",
    title: "Башня Хаоса",
    creator: "ObbyLab",
    creatorId: "pixel",
    genre: "Obby",
    image: "/images/game-obby.png",
    playing: 9804,
    visits: "54M",
    rating: 88,
    description: "200 этажей паркура над облаками. Один промах — и ты снова внизу.",
  },
  {
    id: "doors",
    title: "Двери",
    creator: "LSPLASH",
    genre: "Хоррор",
    image: "/images/game-doors.png",
    playing: 67340,
    visits: "410M",
    rating: 96,
    description: "Не открывай не ту дверь. Отель помнит каждого гостя.",
  },
  {
    id: "pets",
    title: "Мир Питомцев",
    creator: "DreamCraft",
    creatorId: "luna",
    genre: "Симулятор",
    image: "/images/game-pets.png",
    playing: 110220,
    visits: "760M",
    rating: 90,
    description: "Собирай редких питомцев, прокачивай яйца и торгуй на площади.",
  },
  {
    id: "arsenal",
    title: "Арсенал",
    creator: "ROLVe",
    genre: "Шутер",
    image: "/images/game-arsenal.png",
    playing: 55890,
    visits: "2.1B",
    rating: 93,
    description: "Меняй оружие после каждого убийства. Кто первый до золотого ножа?",
  },
];

const premium: Badge = {
  id: "prem",
  name: "GreenBlox Premium",
  desc: "Подписка активна",
  tone: "from-emerald-400 to-lime-300",
  glyph: "◆",
};

const veteran: Badge = {
  id: "vet",
  name: "Ветеран 2021",
  desc: "В игре больше 4 лет",
  tone: "from-amber-400 to-orange-500",
  glyph: "★",
};

const social: Badge = {
  id: "soc",
  name: "Душа пати",
  desc: "50+ друзей",
  tone: "from-sky-400 to-indigo-400",
  glyph: "☺",
};

const builder: Badge = {
  id: "bld",
  name: "Архитектор",
  desc: "Опубликовал свою игру",
  tone: "from-violet-400 to-fuchsia-400",
  glyph: "▣",
};

const night: Badge = {
  id: "ngt",
  name: "Ночной страж",
  desc: "Часто в сети после полуночи",
  tone: "from-slate-300 to-zinc-500",
  glyph: "☾",
};

const hunter: Badge = {
  id: "hnt",
  name: "Охотник морей",
  desc: "Топ-1% во Фруктах Силы",
  tone: "from-yellow-300 to-amber-500",
  glyph: "⚔",
};

export const USERS: User[] = [
  {
    id: "aether",
    displayName: "Aether",
    username: "aether",
    letter: "A",
    letterClass: "from-amber-400 to-orange-500",
    avatar: "/images/avatar-aether.png",
    about:
      "Строю и ломаю кубы с 2021. Капитан Green Squad. Если видишь меня во «Фруктах Силы» — зови в пати, всегда рад. Иногда делаю карты для города.",
    joinDate: "14 марта 2021",
    isOnline: true,
    activity: "Играет во Фрукты Силы",
    isPremium: true,
    isVerified: true,
    followers: 24890,
    following: 112,
    placeVisits: "1.2M",
    friendIds: ["luna", "void", "pixel", "sdfsdfds", "mira", "night", "cube", "kira", "retro"],
    createdGameIds: ["city"],
    favoriteGameIds: ["fruits", "doors", "arsenal"],
    wearing: [
      { id: "w1", name: "Капюшон Pulse", type: "Одежда", tone: "bg-emerald-500/20 text-emerald-300" },
      { id: "w2", name: "Кроссовки Volt", type: "Обувь", tone: "bg-lime-500/20 text-lime-300" },
      { id: "w3", name: "Spike Cut", type: "Волосы", tone: "bg-zinc-500/20 text-zinc-200" },
      { id: "w4", name: "Cool Grin", type: "Лицо", tone: "bg-amber-500/20 text-amber-200" },
      { id: "w5", name: "Клинок Куба", type: "Снаряжение", tone: "bg-green-500/20 text-green-300" },
      { id: "w6", name: "Подвеска GB", type: "Аксессуар", tone: "bg-teal-500/20 text-teal-200" },
      { id: "w7", name: "Чёрные джинсы", type: "Одежда", tone: "bg-neutral-500/20 text-neutral-200" },
      { id: "w8", name: "Серьга неоновая", type: "Аксессуар", tone: "bg-cyan-500/20 text-cyan-200" },
    ],
    badges: [premium, veteran, social, builder, hunter],
    groups: [
      { id: "g1", name: "Green Squad", role: "Владелец", members: "12.4K", letter: "G", tone: "from-emerald-400 to-green-700" },
      { id: "g2", name: "GB Official", role: "Участник", members: "2.1M", letter: "B", tone: "from-lime-300 to-emerald-700" },
      { id: "g3", name: "Sea Hunters", role: "Капитан", members: "88K", letter: "S", tone: "from-cyan-400 to-blue-700" },
    ],
    forumPosts: 128,
    lastOnline: "Сейчас",
  },
  {
    id: "sdfsdfds",
    displayName: "sdfsdfds",
    username: "sdfsdfds",
    letter: "S",
    letterClass: "from-sky-400 to-blue-600",
    about: "новый акк. ещё разбираюсь что тут к чему",
    joinDate: "2 апреля 2026",
    isOnline: true,
    activity: "В лаунчере",
    isPremium: false,
    isVerified: false,
    followers: 4,
    following: 9,
    placeVisits: "128",
    friendIds: ["aether", "pixel"],
    createdGameIds: [],
    favoriteGameIds: ["pets", "obby"],
    wearing: [
      { id: "d1", name: "Классическая голова", type: "Лицо", tone: "bg-yellow-500/20 text-yellow-200" },
      { id: "d2", name: "Зелёный торс", type: "Одежда", tone: "bg-green-500/20 text-green-300" },
      { id: "d3", name: "Синие ноги", type: "Одежда", tone: "bg-blue-500/20 text-blue-300" },
      { id: "d4", name: "Улыбка", type: "Лицо", tone: "bg-amber-500/20 text-amber-200" },
    ],
    badges: [],
    groups: [],
    forumPosts: 0,
    lastOnline: "Сейчас",
  },
  {
    id: "luna",
    displayName: "Luna",
    username: "luna_mia",
    letter: "L",
    letterClass: "from-pink-400 to-fuchsia-500",
    avatar: "/images/avatar-luna.png",
    about: "Делаю милые карты и коллекционирую питомцев. Мяу. Иногда рисую скины на заказ.",
    joinDate: "8 июля 2022",
    isOnline: true,
    activity: "Играет в Мир Питомцев",
    isPremium: true,
    isVerified: true,
    followers: 91020,
    following: 240,
    placeVisits: "18.4M",
    friendIds: ["aether", "pixel", "mira", "kira", "retro"],
    createdGameIds: ["pets"],
    favoriteGameIds: ["pets", "city", "fruits"],
    wearing: [
      { id: "l1", name: "Ушки кошки", type: "Голова", tone: "bg-pink-500/20 text-pink-300" },
      { id: "l2", name: "Розовые волосы", type: "Волосы", tone: "bg-fuchsia-500/20 text-fuchsia-200" },
      { id: "l3", name: "Белый худи", type: "Одежда", tone: "bg-zinc-200/20 text-zinc-100" },
      { id: "l4", name: "Лавандовая юбка", type: "Одежда", tone: "bg-violet-500/20 text-violet-200" },
      { id: "l5", name: "Платформы", type: "Обувь", tone: "bg-rose-500/20 text-rose-200" },
      { id: "l6", name: "Чокер сердце", type: "Аксессуар", tone: "bg-red-500/20 text-red-200" },
    ],
    badges: [premium, builder, social],
    groups: [
      { id: "g4", name: "DreamCraft", role: "Основатель", members: "540K", letter: "D", tone: "from-pink-400 to-violet-600" },
      { id: "g5", name: "Pet Club", role: "Админ", members: "210K", letter: "P", tone: "from-rose-300 to-orange-400" },
    ],
    forumPosts: 640,
    lastOnline: "Сейчас",
  },
  {
    id: "void",
    displayName: "Void",
    username: "voidrunner",
    letter: "V",
    letterClass: "from-violet-500 to-indigo-800",
    avatar: "/images/avatar-void.png",
    about: "Хоррор, пвп, ночные рейды. Не пиши после трёх ночи — возможно, это уже не я.",
    joinDate: "30 октября 2020",
    isOnline: false,
    isPremium: true,
    isVerified: false,
    followers: 15600,
    following: 44,
    placeVisits: "640K",
    friendIds: ["aether", "night", "cube"],
    createdGameIds: [],
    favoriteGameIds: ["doors", "arsenal", "fruits"],
    wearing: [
      { id: "v1", name: "Капюшон тени", type: "Голова", tone: "bg-violet-500/20 text-violet-200" },
      { id: "v2", name: "Маска Void", type: "Лицо", tone: "bg-purple-500/20 text-purple-200" },
      { id: "v3", name: "Плащ ночи", type: "Одежда", tone: "bg-zinc-600/20 text-zinc-200" },
      { id: "v4", name: "Ботинки рейда", type: "Обувь", tone: "bg-indigo-500/20 text-indigo-200" },
    ],
    badges: [premium, veteran, night],
    groups: [
      { id: "g6", name: "Horror Club", role: "Модератор", members: "77K", letter: "H", tone: "from-purple-400 to-zinc-800" },
    ],
    forumPosts: 91,
    lastOnline: "5 часов назад",
  },
  {
    id: "pixel",
    displayName: "Pixel",
    username: "pixelq",
    letter: "P",
    letterClass: "from-cyan-400 to-emerald-400",
    avatar: "/images/avatar-pixel.png",
    about: "Обби на скорость. Рекорд Башни Хаоса — 2:14. Побей — и я в друзья сам добавлюсь.",
    joinDate: "19 января 2023",
    isOnline: true,
    activity: "Играет в Башня Хаоса",
    isPremium: false,
    isVerified: true,
    followers: 33400,
    following: 301,
    placeVisits: "4.8M",
    friendIds: ["aether", "luna", "sdfsdfds", "mira", "retro"],
    createdGameIds: ["obby"],
    favoriteGameIds: ["obby", "arsenal", "city"],
    wearing: [
      { id: "p1", name: "Циан шипы", type: "Волосы", tone: "bg-cyan-500/20 text-cyan-200" },
      { id: "p2", name: "Очки round", type: "Лицо", tone: "bg-yellow-500/20 text-yellow-200" },
      { id: "p3", name: "Радужный худи", type: "Одежда", tone: "bg-fuchsia-500/20 text-fuchsia-200" },
      { id: "p4", name: "Рюкзак пиксель", type: "Снаряжение", tone: "bg-lime-500/20 text-lime-200" },
    ],
    badges: [builder, social],
    groups: [
      { id: "g7", name: "ObbyLab", role: "Владелец", members: "96K", letter: "O", tone: "from-cyan-300 to-blue-600" },
    ],
    forumPosts: 210,
    lastOnline: "Сейчас",
  },
  {
    id: "mira",
    displayName: "Mira",
    username: "mira_play",
    letter: "M",
    letterClass: "from-orange-400 to-rose-500",
    about: "RP в городе, иногда стримлю кастомные сервера. Чай и хаос.",
    joinDate: "3 мая 2022",
    isOnline: true,
    activity: "Играет в GreenBlox City",
    isPremium: true,
    isVerified: false,
    followers: 7800,
    following: 190,
    placeVisits: "220K",
    friendIds: ["aether", "luna", "pixel", "kira"],
    createdGameIds: [],
    favoriteGameIds: ["city", "pets"],
    wearing: [
      { id: "m1", name: "Рыжие локоны", type: "Волосы", tone: "bg-orange-500/20 text-orange-200" },
      { id: "m2", name: "Кожанка", type: "Одежда", tone: "bg-neutral-500/20 text-neutral-200" },
    ],
    badges: [premium],
    groups: [
      { id: "g1", name: "Green Squad", role: "Участник", members: "12.4K", letter: "G", tone: "from-emerald-400 to-green-700" },
    ],
    forumPosts: 44,
    lastOnline: "Сейчас",
  },
  {
    id: "night",
    displayName: "NightOwl",
    username: "nightowl",
    letter: "N",
    letterClass: "from-indigo-400 to-slate-700",
    about: "Только ночные сессии. Хоррор и тихие сервера.",
    joinDate: "12 декабря 2021",
    isOnline: false,
    isPremium: false,
    isVerified: false,
    followers: 2100,
    following: 80,
    placeVisits: "90K",
    friendIds: ["aether", "void", "cube"],
    createdGameIds: [],
    favoriteGameIds: ["doors"],
    wearing: [
      { id: "n1", name: "Совиные очки", type: "Лицо", tone: "bg-indigo-500/20 text-indigo-200" },
    ],
    badges: [night],
    groups: [
      { id: "g6", name: "Horror Club", role: "Участник", members: "77K", letter: "H", tone: "from-purple-400 to-zinc-800" },
    ],
    forumPosts: 17,
    lastOnline: "вчера",
  },
  {
    id: "cube",
    displayName: "CubeMaster",
    username: "cubemaster",
    letter: "C",
    letterClass: "from-lime-300 to-green-600",
    about: "Коллекционирую лимитированные кубы. Не продаю.",
    joinDate: "1 января 2020",
    isOnline: false,
    isPremium: true,
    isVerified: true,
    followers: 54000,
    following: 12,
    placeVisits: "3.1M",
    friendIds: ["aether", "void", "night", "kira"],
    createdGameIds: [],
    favoriteGameIds: ["fruits", "arsenal"],
    wearing: [
      { id: "c1", name: "Корона куба", type: "Голова", tone: "bg-lime-500/20 text-lime-200" },
      { id: "c2", name: "Плащ коллекционера", type: "Одежда", tone: "bg-emerald-500/20 text-emerald-200" },
    ],
    badges: [premium, veteran],
    groups: [
      { id: "g2", name: "GB Official", role: "Ветеран", members: "2.1M", letter: "B", tone: "from-lime-300 to-emerald-700" },
    ],
    forumPosts: 980,
    lastOnline: "3 дня назад",
  },
  {
    id: "kira",
    displayName: "Kira",
    username: "kiragb",
    letter: "K",
    letterClass: "from-red-400 to-rose-700",
    about: "Пвп. Только пвп. Если проиграл — реванш сразу.",
    joinDate: "22 августа 2023",
    isOnline: true,
    activity: "Играет в Арсенал",
    isPremium: false,
    isVerified: false,
    followers: 6400,
    following: 77,
    placeVisits: "510K",
    friendIds: ["aether", "luna", "mira", "cube"],
    createdGameIds: [],
    favoriteGameIds: ["arsenal", "fruits"],
    wearing: [
      { id: "k1", name: "Красная бандана", type: "Голова", tone: "bg-red-500/20 text-red-200" },
    ],
    badges: [hunter],
    groups: [
      { id: "g3", name: "Sea Hunters", role: "Боец", members: "88K", letter: "S", tone: "from-cyan-400 to-blue-700" },
    ],
    forumPosts: 55,
    lastOnline: "Сейчас",
  },
  {
    id: "retro",
    displayName: "RetroWave",
    username: "retrowave",
    letter: "R",
    letterClass: "from-fuchsia-400 to-cyan-400",
    about: "Синтетика, неон, гонки по ночному городу.",
    joinDate: "9 сентября 2022",
    isOnline: false,
    isPremium: true,
    isVerified: false,
    followers: 11200,
    following: 203,
    placeVisits: "770K",
    friendIds: ["aether", "luna", "pixel"],
    createdGameIds: [],
    favoriteGameIds: ["city", "arsenal"],
    wearing: [
      { id: "r1", name: "Неоновые очки", type: "Лицо", tone: "bg-cyan-500/20 text-cyan-200" },
      { id: "r2", name: "Розовый бомбер", type: "Одежда", tone: "bg-fuchsia-500/20 text-fuchsia-200" },
    ],
    badges: [premium],
    groups: [
      { id: "g1", name: "Green Squad", role: "DJ", members: "12.4K", letter: "G", tone: "from-emerald-400 to-green-700" },
    ],
    forumPosts: 73,
    lastOnline: "2 часа назад",
  },
];

export const ME_ID = "aether";

export function getUser(id: string) {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

export function getGame(id: string) {
  return GAMES.find((g) => g.id === id);
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

export function playingLabel(n: number) {
  return `${formatCount(n)} играют`;
}
