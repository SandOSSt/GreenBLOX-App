import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  /** Id аккаунта-владельца (users.id). NULL = официальные/сидовые проекты
   *  или проекты, созданные без входа. Позволяет показывать «карты игрока»
   *  на странице его профиля и запускать их оттуда. */
  ownerId: integer("owner_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  author: text("author").notNull().default("Engine Engineer"),
  thumbnail: text("thumbnail").notNull(),
  version: text("version").notNull().default("1.0.0"),
  isPublished: boolean("is_published").notNull().default(false),
  genre: text("genre").notNull().default("Sandbox"),
  sceneData: jsonb("scene_data").notNull(),
  luaScripts: jsonb("lua_scripts").notNull(),
  uiCanvases: jsonb("ui_canvases").notNull(),
  animationsData: jsonb("animations_data").notNull(),
  lightingData: jsonb("lighting_data").notNull(),
  physicsConfig: jsonb("physics_config").notNull(),
  multiplayerConfig: jsonb("multiplayer_config").notNull(),
  installedPackages: jsonb("installed_packages").notNull().default([]),
  installedPlugins: jsonb("installed_plugins").notNull().default([]),
  viewsCount: integer("views_count").notNull().default(0),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Один лайк = одна строка (пользователь, проект). Уникальность пары
 *  не даёт накрутить лайки повторными кликами — в отличие от старого
 *  `increment_likes` (просто +1 к счётчику без учёта пользователя). */
export const projectLikes = pgTable("project_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'model', 'texture', 'material', 'audio', 'prefab', 'script', 'ui', 'animation'
  category: text("category").notNull().default("General"),
  thumbnail: text("thumbnail").notNull(),
  data: jsonb("data").notNull(), // vertex data, color, material specs, audio URL, or code
  author: text("author").notNull().default("GreenBlox Official"),
  fileSize: integer("file_size").notNull().default(1024),
  isOptimized: boolean("is_optimized").notNull().default(true),
  hasLODs: boolean("has_lods").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const packagesRegistry = pgTable("packages_registry", {
  id: serial("id").primaryKey(),
  packageName: text("package_name").notNull().unique(), // e.g., @greenblox/character-controller
  displayName: text("display_name").notNull(),
  version: text("version").notNull().default("1.2.0"),
  description: text("description").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(), // 'Physics', 'UI', 'Networking', 'AI', 'VFX', 'Audio'
  downloads: integer("downloads").notNull().default(0),
  sourceCode: text("source_code").notNull(),
  documentation: text("documentation").notNull(),
  dependencies: jsonb("dependencies").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const enginePlugins = pgTable("engine_plugins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull().default("2.1.0"),
  author: text("author").notNull(),
  targetSystem: text("target_system").notNull(), // 'Editor', 'Terrain', 'Physics', 'Lua', 'Networking', 'Rendering'
  isActiveByDefault: boolean("is_active_by_default").notNull().default(false),
  uiHooks: jsonb("ui_hooks").notNull(),
  executionCode: text("execution_code").notNull(),
  icon: text("icon").notNull().default("Wrench"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const multiplayerSessions = pgTable("multiplayer_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  serverName: text("server_name").notNull(),
  maxPlayers: integer("max_players").notNull().default(16),
  currentPlayers: integer("current_players").notNull().default(0),
  tickRate: integer("tick_rate").notNull().default(60),
  region: text("region").notNull().default("US-East"),
  serverType: text("server_type").notNull().default("Dedicated"), // Dedicated or P2P
  status: text("status").notNull().default("Online"), // 'Online', 'In-Game', 'Starting'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarColor: text("avatar_color").notNull().default("#00b06f"),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Расширенный публичный профиль пользователя (bio, handle, статус-квота).
 *  То, что видно друзьям на странице профиля друга. */
export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id").primaryKey(),
  handle: text("handle").notNull().default(""),
  bio: text("bio").notNull().default(""),
  coverStyle: text("cover_style").notNull().default("emerald"),
  statusQuote: text("status_quote").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Итоги игровых сессий: одна строка на игру на пользователя.
 *  Серверная копия localStorage-статистики — чтобы друзья видели
 *  «Запусков / Последняя игра» на странице профиля друга. */
export const userGameStats = pgTable("user_game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: text("game_id").notNull(),
  count: integer("count").notNull().default(0),
  lastPlayedAt: integer("last_played_at").notNull().default(0),
  totalCoins: integer("total_coins").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  totalTimeSec: integer("total_time_sec").notNull().default(0),
  bestStage: integer("best_stage").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  status: text("status").notNull().default("pending"), // pending | accepted | declined
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  text: text("text").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  userAId: integer("user_a_id").notNull(),
  userBId: integer("user_b_id").notNull(),
  lastMessage: text("last_message").notNull().default(""),
  lastAt: timestamp("last_at").notNull().defaultNow(),
});
