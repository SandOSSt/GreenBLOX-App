export type Game = {
  id: string;
  title: string;
  creator: string;
  image: string;
  category: string;
  description: string;
  tags: string[];
  updated: string;
  /** Like-count label shown on cards, e.g. "184.3K игроков". */
  players?: string;
};

export type Friend = {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  bio?: string;
  joinedDate?: string;
};

export type NotificationItem = {
  id: string;
  type: "friend" | "game" | "system";
  title: string;
  text: string;
  time: string;
  unread: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: string;
  rarity: "Обычный" | "Редкий" | "Эпический" | "Легендарный";
  color: string;
};

export type ChatMessage = { from: "me" | "them"; text: string; time: string };

export type ChatThread = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  color: string;
  messages: ChatMessage[];
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
};

export const games: Game[] = [
  {
    id: "city",
    title: "GreenBlox City",
    creator: "GB Studios",
    image: "/images/games/blox-city.jpg",
    category: "RP",
    description:
      "Живи своей жизнью в огромном неоновом мегаполисе. Работай, строй дом, гоняй по ночным улицам и встречай друзей.",
    tags: ["RP", "Открытый мир", "Социальное"],
    updated: "Сегодня",
  },
  {
    id: "tower",
    title: "Башня Хаоса",
    creator: "ObbyLab",
    image: "/images/games/obby-tower.jpg",
    category: "Obby",
    description:
      "Поднимись на вершину бесконечной башни. Сотни этапов, ловушки и гонки с друзьями на скорость.",
    tags: ["Obby", "Платформер"],
    updated: "Вчера",
  },
  {
    id: "doors",
    title: "Двери",
    creator: "LSPLASH",
    image: "/images/games/doors-horror.jpg",
    category: "Хоррор",
    description:
      "Пробирайся по отелю, полном сущностей. Не открывай не ту дверь — и не оборачивайся.",
    tags: ["Хоррор", "Кооп"],
    updated: "2 дня назад",
  },
  {
    id: "pets",
    title: "Мир Питомцев",
    creator: "DreamCraft",
    image: "/images/games/pet-world.jpg",
    category: "Симулятор",
    description:
      "Коллекционируй редких питомцев, прокачивай их и торгуйся на огромном рынке.",
    tags: ["Питомцы", "Коллекция"],
    updated: "Сегодня",
  },
  {
    id: "arsenal",
    title: "Арсенал",
    creator: "ROLVe",
    image: "/images/games/arsenal.jpg",
    category: "Шутер",
    description:
      "Быстрые раунды, случайное оружие каждый килл. Стань последним выжившим на арене.",
    tags: ["PvP", "Шутер"],
    updated: "Сегодня",
  },
  {
    id: "fruits",
    title: "Фрукты Силы",
    creator: "Gamer Robot",
    image: "/images/games/fruits.jpg",
    category: "Приключения",
    description:
      "Охоться за легендарными фруктами, прокачивай стиль боя и стань королём морей.",
    tags: ["RPG", "Пираты", "PvP"],
    updated: "Сегодня",
  },
  {
    id: "royale",
    title: "Королевская Академия",
    creator: "callmehbob",
    image: "/images/games/royale.jpg",
    category: "RP",
    description:
      "Учись магии, собирай наряды и живи жизнью студента самой модной академии.",
    tags: ["RP", "Мода", "Школа"],
    updated: "3 дня назад",
  },
  {
    id: "bedwars",
    title: "BedWars",
    creator: "Easy.gg",
    image: "/images/games/bedwars.jpg",
    category: "PvP",
    description:
      "Защищай кровать, ломай чужие и захватывай острова. Классика командных битв.",
    tags: ["PvP", "Команды"],
    updated: "Сегодня",
  },
  {
    id: "mystery",
    title: "Тайна Особняка",
    creator: "Nikilis",
    image: "/images/games/mystery.jpg",
    category: "Хоррор",
    description:
      "Кто убийца? Собирай улики, прячься и разоблачи предателя до полуночи.",
    tags: ["Детектив", "Социальное"],
    updated: "Вчера",
  },
  {
    id: "garden",
    title: "Гигантский Сад",
    creator: "Do Big Studios",
    image: "/images/games/garden.jpg",
    category: "Симулятор",
    description:
      "Выращивай гигантские овощи, продавай урожай и строй самую безумную ферму.",
    tags: ["Ферма", "Казуал"],
    updated: "Сегодня",
  },
  {
    id: "race",
    title: "Неоновые Гонки",
    creator: "NightShift",
    image:
      "https://images.pexels.com/photos/25637489/pexels-photo-25637489.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Гонки",
    description:
      "Уличные заезды по ночному городу. Тюнинг, нитро и ставки между заездами.",
    tags: ["Гонки", "Открытый мир"],
    updated: "4 дня назад",
  },
  {
    id: "space",
    title: "Космос: Выход",
    creator: "OrbitWorks",
    image:
      "https://images.pexels.com/photos/7662943/pexels-photo-7662943.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Приключения",
    description:
      "Исследуй заброшенные станции, собирай кислород и не потеряйся в тишине.",
    tags: ["Выживание", "Космос"],
    updated: "Неделю назад",
  },
  {
    id: "jail",
    title: "Побег",
    creator: "Badimo",
    image:
      "https://images.pexels.com/photos/38903944/pexels-photo-38903944.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "RP",
    description:
      "Криминал или закон? Грабь банки, уходи от погони или стань лучшим копом города.",
    tags: ["RP", "Криминал"],
    updated: "Вчера",
  },
  {
    id: "pizza",
    title: "Пиццерия",
    creator: "Dued1",
    image:
      "https://images.pexels.com/photos/33610441/pexels-photo-33610441.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Симулятор",
    description:
      "Работай в пиццерии: принимай заказы, готовь, доставляй и копи на повышение.",
    tags: ["Работа", "Казуал"],
    updated: "5 дней назад",
  },
  {
    id: "fish",
    title: "Рыбалка",
    creator: "Fisch",
    image:
      "https://images.pexels.com/photos/36340127/pexels-photo-36340127.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Симулятор",
    description:
      "Лови легендарных рыб на рассвете, улучшай снасти и торгуй уловом.",
    tags: ["Казуал", "Коллекция"],
    updated: "Сегодня",
  },
  {
    id: "arena",
    title: "Арена Чемпионов",
    creator: "ProCircuit",
    image:
      "https://images.pexels.com/photos/14266493/pexels-photo-14266493.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Шутер",
    description:
      "Киберспортивные матчи 5 на 5. Ранги, турниры и слава на большой сцене.",
    tags: ["Киберспорт", "Команды"],
    updated: "2 дня назад",
  },
  {
    id: "castle",
    title: "Замок Теней",
    creator: "MythForge",
    image:
      "https://images.pexels.com/photos/37945451/pexels-photo-37945451.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Приключения",
    description:
      "Исследуй древний замок, разгадывай загадки и сражайся с боссами в коопе.",
    tags: ["RPG", "Кооп"],
    updated: "Неделю назад",
  },
  {
    id: "neon",
    title: "Красный Район",
    creator: "VoidPixel",
    image:
      "https://images.pexels.com/photos/18545016/pexels-photo-18545016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    category: "Хоррор",
    description:
      "Неоновый район, из которого нельзя выйти. Следуй правилам — или стань частью декораций.",
    tags: ["Хоррор", "Атмосфера"],
    updated: "3 дня назад",
  },
];

export const categories = [
  "Все",
  "RP",
  "Obby",
  "Шутер",
  "Хоррор",
  "Симулятор",
  "Приключения",
  "PvP",
  "Гонки",
];

export const inventory: InventoryItem[] = [
  { id: "i1", name: "Классическая кепка", type: "Голова", rarity: "Обычный", color: "#9ca3af" },
  { id: "i2", name: "Плащ леса", type: "Спина", rarity: "Редкий", color: "#1ed760" },
  { id: "i3", name: "Зелёные очки GBX", type: "Лицо", rarity: "Эпический", color: "#2ae06c" },
];

const avatarColors = [
  "#1ed760",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#84cc16",
  "#38bdf8",
  "#c084fc",
];

export function colorFromName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return avatarColors[h % avatarColors.length];
}
