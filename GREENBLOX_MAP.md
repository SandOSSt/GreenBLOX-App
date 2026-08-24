# GreenBlox — карта проекта

Для нейросетей и разработчиков. Читай этот файл ПЕРВЫМ, затем `GREENBLOX_DEVLOG.md`.
Здесь: что за проект, из чего состоит, что где лежит, как всё связано, какие команды запускать, где что менять.

---

## 1. Обзор

    GreenBlox — клон Roblox. Состоит из четырёх приложений:

| Папка | Что это | Стек | Порт dev |
|---|---|---|---|
| `greenblox launcher/` | Лаунчер: вход, каталог игр, профиль, друзья, чат, запуск игр, мультиплеер | Vite + React 19 + three | 5173/5174/5175 |
| `greenblox-studio/` | Студия: 3D-редактор миров (ECS), публикация проектов, весь бэкенд/API + БД | Next.js + three + PostgreSQL (Drizzle) | 3001 |
| `GreenBloxENGINE/` | Автономный движок: отдельная демо-игра/песочница | Vite + React 19 + three | 5173+ (авто) |
| `greenblox-profile-page-development (1)/` | Выносная копия страницы профиля (справочно, отдельный проект) | Vite + React | — |

> **ВАЖНО**: движок игры существует в ДВУХ копиях — `greenblox launcher/src/game/` и `GreenBloxENGINE/src/game/`.
> Они должны оставаться синхронными по фичам и багфиксам. Любая правка физики/движка делается в ОБОИХ.
> Исключение: `RemotePlayers` (мультиплеер) есть только в лаунчере.

> **ВАЖНО**: `preview/` в корне — удалённый мусор, в списках выше его нет.

---

## 2. Быстрые команды

Запуск из корня репозитория (`c:/Users/vanus/Downloads/greenbloxapp`):

```bash
npm run dev            # студия (3001) + лаунчер (5173) параллельно
npm run dev:studio     # только студия, порт 3001
npm run dev:launcher   # только лаунчер, порт 5173
npm run dev:engine     # GreenBloxENGINE (порт подберётся сам: 5173/5174/5175...)
```

Сборка и проверка типов:

```bash
npm run build --prefix "greenblox launcher"   # сборка лаунчера в один HTML
npm run build --prefix GreenBloxENGINE        # сборка автономного движка
npm run typecheck --prefix greenblox-studio   # tsc студии
npm run build --prefix greenblox-studio       # next build студии
```

Порты dev заняты → Vite сам берёт следующий свободный (5174, 5175…). Смотри вывод терминала.

---

## 3. Движок игры (общие принципы)

Файлы движка (одинаковые в обоих приложениях):

| Файл | Назначение |
|---|---|
| `src/game/RobloxEngine.ts` | Ядро: рендер (three.js), игровой цикл, физика персонажа, коллизии, камера, зоны (монеты/смерть/чекпоинт/победа), постройка, звук, dispose |
| `src/game/WorldBuilder.ts` | Генерация дефолтного обби (`buildObby`), `shapeGeometry` (block/sphere/cylinder/wedge), `BuiltWorld` |
| `src/game/types.ts` | Типы `Part` (pos/size/color/material/shape/kind), `GameStats`, `MATERIAL_PROPS`, палитра |
| `src/game/Avatar.ts` | Роблокс-подобный персонаж (6 частей: head/torso/arms/legs), `AvatarColors`, анимация ходьбы |
| `src/game/RemotePlayers.ts` | ТОЛЬКО в лаунчере: рендер удалённых игроков, sync позиций/аватара, name-спрайты |
| `src/game/studioConverter.ts` | ТОЛЬКО в лаунчере: конвертация проекта студии (ECS) → мир движка (`studioProjectToWorld`) |
| `src/game/ExplorerTree.tsx` | ТОЛЬКО в GreenBloxENGINE: дерево частей для панели Explorer |
| `src/game/imports/` | Модули импорта: Lua-модуль (NPC), 1C-модуль (монеты/магазин), реестр |

### 3.1 Ключевые соглашения движка

- **Единицы**: персонаж высотой 2.4, радиус 0.45. Платформы/части — парт `pos` = центр, `size` = габариты (AABB = `pos ± size/2`).
- **Формы**: `block`, `sphere`, `cylinder`, `wedge`. Клинья ЦЕНТРИРОВАНЫ (`y` от `-h/2` до `+h/2`), склон поднимается от -X к +X. Физика склона: `surfaceHeightAt()`.
- **Физика в `RobloxEngine.moveAxis(axis, amount)`** — самое важное место, туда смотрели в последних багфиксах:
  - посадка (вниз) ищет самую высокую поверхность ПОД ногами среди всех пересечений (не первую!) через `COLLISION_EPS = 0.001`;
  - потолок (вверх) гасит `vel.y` без движения;
  - горизонтальное движение ПРОПУСКАЕТ опоры (поверхность ≤ ног + EPS), иначе персонаж «залипает»;
  - подъём по клину происходит в горизонтальном проходе, спуск — через вертикальный проход того же кадра.
- **Игровые роли частей** (`Part.kind`): `platform`, `spawn`, `checkpoint` (+`meta.stage`), `coin` (+`meta.baseY`), `kill` (лава), `win`, `decor`, `user` (постройка), `baseplate`.
- **Материалы** (`Part.material`): plastic, neon, metal, grass, wood, brick, ice (скольжение!), lava (как kill-зона).
- **Сцена-настройки** (`SceneSettings`): `skyColor`, `fogColor`, `fogNear/Far`, `voidLevel`. Передаются в конструктор движка для студийных миров.
- **Звук**: класс `Sfx` (WebAudio, без ассетов): событие монеты/смерти/чекпоинта/победы. Управление `setSoundFxEnabled` / `setSoundVolume`.
- **dispose()**: полная очистка GPU-ресурсов (сеты `freed`/`freedMats`, текстуры), снятие DOM-листенеров, `remotePlayers.dispose()`, `sfx.dispose()`. Обязательно вызывать при выходе из игры.

### 3.2 Синхронизация двух движков — чек-лист

Если правил что-то в `greenblox launcher/src/game/RobloxEngine.ts` или `WorldBuilder.ts` →
повтори то же самое в `GreenBloxENGINE/src/game/`. Проверяй после правок:

- [ ] `npm run build --prefix "greenblox launcher"`
- [ ] `npm run build --prefix GreenBloxENGINE`
- [ ] визуальный прогон (открой dev-сервер движка)

---

## 4. Лаунчер (`greenblox launcher/`)

### 4.1 Структура

| Файл/папка | Назначение |
|---|---|
| `src/App.tsx` | Корневой компонент: навигация, вход в игру, join-by-code (мультиплеер), session-logic, сохранение статистики `gb-plays` |
| `src/components/Launcher.tsx` | Шапка/каркас лаунчера |
| `src/components/LauncherHome.tsx` | Главный экран |
| `src/components/LoginScreen.tsx` | Вход/регистрация (почта). ВАЖНО: поля пустые, только placeholders |
| `src/components/GameSession.tsx` | Обёртка над движком: создание движка ОДИН раз на сессию (ключ — мир, не цвета!), `onSessionEnd` ровно один раз, звук/настроки |
| `src/components/GameMenu.tsx` | Меню в игре: аватар, люди/друзья, настройки, выход |
| `src/components/AvatarEditor.tsx` | Редактор цветов аватара (внутри GameMenu) |
| `src/components/ExplorerPanel.tsx` | Панель Explorer (телепорт к частям) |
| `src/social/` | API-клиент и хуки: `api.ts`, `useSocial.ts`, `useChat.ts` |
| `src/data.ts` | Каталог игр, обложки |
| `src/game/` | Движок (см. раздел 3) |
| `src/utils/cn.ts` | Утилита классов |

### 4.2 Вход в игру и мультиплеер (важно для «поломок»)

- `App.handleJoinByCode(code)` → резолвит мир по `placeId` сессии:
  сначала локальные студийные проекты → если нет, догружает с сервера (`fetchStudioProject(placeId)`) → иначе дефолтный обби.
- Сессия создаётся на бэкенде студии (`/api/sessions`). Синхронизация позиций/аватара каждые ~200мс через `/api/sessions/sync`.
- При выходе хост закрывает сессию; `RemotePlayers` отрисовывает других игроков.

---

## 5. Студия (`greenblox-studio/`) — редактор + весь бэкенд

### 5.1 Структура

| Файл/папка | Назначение |
|---|---|
| `src/app/api/**` | ВСЕ REST-эндпоинты (Next route handlers): `social`, `friends`, `chat`, `sessions`, `presence`, `search`, `projects`, `multiplayer`, `seed`, `packages`, `plugins`, `assets`, `health` |
| `src/db/schema.ts` | Схема БД (Drizzle + PostgreSQL): users, friend_requests, chat_messages, chat_threads, projects… |
| `src/db/index.ts` | Подключение к БД |
| `src/engine/types/engine.ts` | ТИПЫ ECS-сущностей: `TransformComponent`, `MeshComponent` (geometry: cube/sphere/cylinder/plane/capsule/cone/custom/terrain), `RigidBodyComponent`, `SceneData`, `ProjectData` |
| `src/engine/core/ecs.ts` | ECS-мир (сущности/компоненты) |
| `src/engine/renderer/rendererScene.ts` | 3D-рендер студии (three.js) — отдельный от игрового движка! |
| `src/engine/physics/physicsWorld.ts` | Физика студии (отдельная от игрового движка: AABB + гравитация + player controller) |
| `src/engine/editor/` | Логика редактирования |
| `src/engine/lua/` | Lua-рантайм |
| `src/engine/multiplayer/` | Мультиплеер-логика |
| `src/engine/defaultSeed.ts` | Дефолтные проекты (pvpArena, rpgOdyssey, driftCircuit, obbyPro) |
| `src/components/greenblox/` | UI: `StudioEditorShell`, `StudioRibbon`, `StudioRightDock`, `ViewportCanvas`, `StudioHomeScreen`… |
| `src/social/` | Серверная социальная логика `socialStore.ts` + хелперы |

### 5.2 Важные нюансы студии

- **Два разных движка!** Студийный рендер/физика (`engine/renderer`, `engine/physics`) НЕ связан с движком игры (`launcher/src/game`). Связующее звено — `studioConverter.ts` в лаунчере: он переводит `SceneData`/`MeshComponent` в `Part`-мир игры.
- **Wedge**: `MeshComponent.geometry` включает `"wedge"` (16.08.2026), `createGeometry` в `rendererScene.ts` рендерит честный клин в единичных координатах (низ `y=-0.5`, верх `y=+0.5`, склон от -X к +X) — после `Transform.scale` совпадает с `shapeGeometry("wedge")` движка. В Properties студии выбора формы пока нет — задаётся в seed/API.
- **CORS**: лаунчер :5173 и API :3001 — разные origin. CORS настроен глобально через `corsMiddleware` (разрешённые origin в `GREENBLOX_ORIGINS`), заголовок `x-gbtoken`.
- **Аватар пользователя**: поле `avatar_color` в `users` (hex). Полный аватар (6 частей) хранится/передаётся в сессиях через `sessions/sync`.
- **БД**: PostgreSQL. Таблица `users` пересоздана точно по `schema.ts` (была чужая Soupy-схема). Бэкап старых записей — `user-backup.json` в корне.
- **`/api/projects/[id]`**: обязательные CORS-заголовки на все методы (не только на список).

### 5.3 Эндпоинты (шпаргалка)

- `POST /api/social` — регистрация/вход (email+password → token)
- `GET /api/social/me` — профиль по токену (`x-gbtoken`)
- `GET /api/search?q=` — поиск игроков
- `GET/POST /api/friends`, `POST /api/friends/action` — заявки/списки
- `GET/POST /api/chat`, `GET /api/chat/threads` — личные сообщения
- `POST /api/sessions`, `POST /api/sessions/join`, `GET/POST /api/sessions/sync`, `POST /api/sessions/leave`, `POST /api/sessions/chat` — мультиплеер
- `GET /api/presence` — онлайн-статусы
- `GET /api/projects`, `GET/PUT/DELETE /api/projects/[id]` — проекты (публикация)

---

## 6. GreenBloxENGINE (автономный движок)

Та же игровая логика, что в лаунчере, + собственный UI:

| Файл | Назначение |
|---|---|
| `src/App.tsx` | HUD, Avatar-панель, Explorer, Imports, экран победы |
| `src/game/RobloxEngine.ts` | Движок (БЕЗ RemotePlayers и studioConverter) |
| `src/game/WorldBuilder.ts`, `types.ts`, `Avatar.ts` | См. раздел 3 |
| `src/game/ExplorerTree.tsx` | Дерево частей |
| `src/game/imports/` | Lua/1C модули |
| `public/favicon.ico` | Фавиконка (был 404 — добавлено) |

Держать синхронным с `greenblox launcher/src/game/` (см. 3.2).

---

## 7. Частые места правок по задачам

| Задача | Куда идти |
|---|---|
| Персонаж застревает / физика / коллизии | `moveAxis` + `surfaceHeightAt` в `RobloxEngine.ts` (ОБА движка) |
| Прыжок/гравитация/скорость/спринт | константы `WALK_SPEED`, `JUMP_POWER`, `GRAVITY`, `SPRINT_MULT` (Shift = ×1.45) в `physics(dt)` |
| Новые формы частей | `shapeGeometry` в `WorldBuilder.ts` (ОБА) + `surfaceHeightAt` + студийный рендерер при необходимости |
| Материалы/скольжение | `MATERIAL_PROPS` в `types.ts` + ветка `onIce` в `physics` |
| Мультиплеер: позиции/аватар/имена | `RemotePlayers.ts` + `sessions/sync` на бэкенде |
| Вход по коду | `App.handleJoinByCode` (лаунчер) |
| Звук | `Sfx` в `RobloxEngine.ts` + проброс настроек в `GameSession.tsx` + `App.tsx` |
| Студийные миры в игре | `studioConverter.ts` (лаунчер) |
| Рендер студии | `rendererScene.ts` (greenblox-studio) — отдельный рендерер! |
| Соцсеть/БД | `src/app/api/**`, `socialStore.ts`, `db/schema.ts` |
| Регистрация/логин | `LoginScreen.tsx` + `/api/social` + таблица `users` |
| Каталог игр/обложки | `src/data.ts` + `public/images/games/` |

---

## 8. Правила для нейросети (что важно помнить)

1. **Всегда читай `GREENBLOX_DEVLOG.md`** — там история изменений и известные баги. Новые правки записывай туда вверху.
2. **Движки дублируются** — правь оба, собирай оба.
3. **Не удаляй/не переименовывай** `preview/` и `greenblox-profile-page-development (1)/` без спроса (profile — отдельный живой проект).
4. **Не изобретай новые типы** — используй `Part`, `BuiltWorld`, `SceneSettings`, `EngineCallbacks` из `types.ts`/`RobloxEngine.ts`.
5. Перед правкой незнакомого файла — прочитай его, пойми импорты/экспорты.
6. После правок обязательны: сборка лаунчера, сборка GreenBloxENGINE, typecheck студии.
7. `execute_command` — только для команд (build/test/dev). Файлы менять через write/replace. Временные скрипты НЕ оставлять.
8. Спрашивай себя: «новая сущность достигается в рантайме?» — новый UI → привязать к навигации, новый эндпоинт → подключить клиент, новый модуль → экспорт из index.


{
  "name": "grep_search",
  "arguments": {
    "query": "console.error|console.warn|throw new Error"
  }
}