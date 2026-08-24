module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/greenblox-studio/src/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>db,
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/node-postgres/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/greenblox-studio/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}
const globalForDb = globalThis;
const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: databaseUrl
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
}
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(pool);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/greenblox-studio/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assets",
    ()=>assets,
    "chatMessages",
    ()=>chatMessages,
    "chatThreads",
    ()=>chatThreads,
    "enginePlugins",
    ()=>enginePlugins,
    "friendRequests",
    ()=>friendRequests,
    "multiplayerSessions",
    ()=>multiplayerSessions,
    "packagesRegistry",
    ()=>packagesRegistry,
    "projectLikes",
    ()=>projectLikes,
    "projects",
    ()=>projects,
    "userGameStats",
    ()=>userGameStats,
    "userProfiles",
    ()=>userProfiles,
    "users",
    ()=>users
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/serial.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/pg-core/columns/jsonb.js [app-route] (ecmascript)");
;
const projects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("projects", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    /** Id аккаунта-владельца (users.id). NULL = официальные/сидовые проекты
   *  или проекты, созданные без входа. Позволяет показывать «карты игрока»
   *  на странице его профиля и запускать их оттуда. */ ownerId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("owner_id"),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description").notNull(),
    author: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("author").notNull().default("Engine Engineer"),
    thumbnail: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("thumbnail").notNull(),
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("version").notNull().default("1.0.0"),
    isPublished: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_published").notNull().default(false),
    genre: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("genre").notNull().default("Sandbox"),
    sceneData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("scene_data").notNull(),
    luaScripts: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("lua_scripts").notNull(),
    uiCanvases: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("ui_canvases").notNull(),
    animationsData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("animations_data").notNull(),
    lightingData: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("lighting_data").notNull(),
    physicsConfig: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("physics_config").notNull(),
    multiplayerConfig: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("multiplayer_config").notNull(),
    installedPackages: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("installed_packages").notNull().default([]),
    installedPlugins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("installed_plugins").notNull().default([]),
    viewsCount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("views_count").notNull().default(0),
    likesCount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("likes_count").notNull().default(0),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").notNull().defaultNow()
});
const projectLikes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("project_likes", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("user_id").notNull(),
    projectId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("project_id").notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const assets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("assets", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    type: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("type").notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("category").notNull().default("General"),
    thumbnail: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("thumbnail").notNull(),
    data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("data").notNull(),
    author: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("author").notNull().default("GreenBlox Official"),
    fileSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("file_size").notNull().default(1024),
    isOptimized: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_optimized").notNull().default(true),
    hasLODs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("has_lods").notNull().default(true),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const packagesRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("packages_registry", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    packageName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("package_name").notNull().unique(),
    displayName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("display_name").notNull(),
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("version").notNull().default("1.2.0"),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description").notNull(),
    author: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("author").notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("category").notNull(),
    downloads: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("downloads").notNull().default(0),
    sourceCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("source_code").notNull(),
    documentation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("documentation").notNull(),
    dependencies: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("dependencies").notNull().default([]),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const enginePlugins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("engine_plugins", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("description").notNull(),
    version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("version").notNull().default("2.1.0"),
    author: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("author").notNull(),
    targetSystem: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("target_system").notNull(),
    isActiveByDefault: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("is_active_by_default").notNull().default(false),
    uiHooks: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$jsonb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsonb"])("ui_hooks").notNull(),
    executionCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("execution_code").notNull(),
    icon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("icon").notNull().default("Wrench"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const multiplayerSessions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("multiplayer_sessions", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    projectId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("project_id").notNull(),
    serverName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("server_name").notNull(),
    maxPlayers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("max_players").notNull().default(16),
    currentPlayers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("current_players").notNull().default(0),
    tickRate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("tick_rate").notNull().default(60),
    region: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("region").notNull().default("US-East"),
    serverType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("server_type").notNull().default("Dedicated"),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("Online"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("users", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("email").notNull().unique(),
    avatarColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("avatar_color").notNull().default("#00b06f"),
    token: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("token").notNull().unique(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const userProfiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("user_profiles", {
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("user_id").primaryKey(),
    handle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("handle").notNull().default(""),
    bio: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("bio").notNull().default(""),
    coverStyle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("cover_style").notNull().default("emerald"),
    statusQuote: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status_quote").notNull().default(""),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow(),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").notNull().defaultNow()
});
const userGameStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("user_game_stats", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("user_id").notNull(),
    gameId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("game_id").notNull(),
    count: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("count").notNull().default(0),
    lastPlayedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("last_played_at").notNull().default(0),
    totalCoins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("total_coins").notNull().default(0),
    totalDeaths: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("total_deaths").notNull().default(0),
    totalTimeSec: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("total_time_sec").notNull().default(0),
    bestStage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("best_stage").notNull().default(0),
    wins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("wins").notNull().default(0),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at").notNull().defaultNow()
});
const friendRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("friend_requests", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    fromId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("from_id").notNull(),
    toId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("to_id").notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("pending"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const chatMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("chat_messages", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    fromId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("from_id").notNull(),
    toId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("to_id").notNull(),
    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("text").notNull(),
    read: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("read").notNull().default(false),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at").notNull().defaultNow()
});
const chatThreads = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("chat_threads", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])("id").primaryKey(),
    userAId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("user_a_id").notNull(),
    userBId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("user_b_id").notNull(),
    lastMessage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("last_message").notNull().default(""),
    lastAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("last_at").notNull().defaultNow()
});
}),
"[project]/greenblox-studio/src/engine/defaultSeed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ASSETS",
    ()=>DEFAULT_ASSETS,
    "DEFAULT_PACKAGES",
    ()=>DEFAULT_PACKAGES,
    "DEFAULT_PLUGINS",
    ()=>DEFAULT_PLUGINS,
    "generateDefaultProjects",
    ()=>generateDefaultProjects
]);
const DEFAULT_PACKAGES = [
    {
        packageName: "@greenblox/character-controller",
        displayName: "AAA Character Controller",
        version: "2.4.1",
        description: "Production kinematic slope handling, variable jump heights, sprint inertia, and third-person orbital camera setup.",
        author: "GreenBlox Core Team",
        category: "Physics",
        downloads: 142850,
        sourceCode: `-- Character Controller package source\nlocal player = Workspace:FindFirstChild("Player")\nprint("[CharController] Initialized smoothly.")`,
        documentation: `# @greenblox/character-controller\nImport this module into any LocalScript to enable AAA player movement and air control.`
    },
    {
        packageName: "@greenblox/ragdoll-physics",
        displayName: "Ragdoll Physics & Break Constraints",
        version: "1.8.0",
        description: "Automatic joint disarticulation upon high velocity impacts, explosions, or fall triggers with buoyancy recovery.",
        author: "GreenBlox Labs",
        category: "Physics",
        downloads: 98400,
        sourceCode: `local function triggerRagdoll(part)\n  print("[Ragdoll] Simulating limb joint elasticity for " .. part.Name)\nend`,
        documentation: `# @greenblox/ragdoll-physics\nAttach to Humanoid models for dynamic physics collision feedback.`
    },
    {
        packageName: "@greenblox/tween-service-pro",
        displayName: "TweenService Pro & Bezier Easing",
        version: "3.1.0",
        description: "High performance interpolation for camera cinematic transitions, UI popups, and floating platform motion.",
        author: "Studio Pro FX",
        category: "VFX",
        downloads: 215000,
        sourceCode: `local tween = game:GetService("TweenService")\nprint("[TweenServicePro] Easing engines ready.")`,
        documentation: `# @greenblox/tween-service-pro\nSupports Elastic, Quad, Bounce, and Exponential interpolation curves.`
    },
    {
        packageName: "@greenblox/inventory-gui",
        displayName: "Responsive Flex Inventory UI",
        version: "1.5.2",
        description: "Grid-based item inventory with rarity color glows, icon badges, and drag-and-drop slots.",
        author: "UI Architects",
        category: "UI",
        downloads: 76300,
        sourceCode: `-- UI Module setup\nprint("[InventoryGUI] Mounted canvas to screen overlay.")`,
        documentation: `# @greenblox/inventory-gui\nConnects directly to RemoteEvents for verified server-side asset drops.`
    },
    {
        packageName: "@greenblox/pathfinding-astar",
        displayName: "NavMesh A* Pathfinding Agent",
        version: "2.0.4",
        description: "Real-time obstacle avoidance and behavior tree steering for RPG monsters and guards.",
        author: "AI Guild",
        category: "AI",
        downloads: 89120,
        sourceCode: `-- Pathfinding agent execution\nprint("[Pathfinding] NavMesh baked over terrain grid.")`,
        documentation: `# @greenblox/pathfinding-astar\nCall PathfindingService:CreatePath() to guide NPCs across platforms.`
    }
];
const DEFAULT_PLUGINS = [
    {
        name: "Procedural Dungeon & Arena Builder",
        description: "Generate randomized combat chambers, interconnecting halls, and loot spawners in 1 click.",
        version: "1.2.0",
        author: "GreenBlox Official",
        targetSystem: "Terrain",
        isActiveByDefault: true,
        executionCode: `print("[Plugin] Dungeon Builder tool registered to Level Design shelf.")`,
        icon: "Boxes",
        uiHooks: {
            buttonText: "Generate Arena",
            tooltip: "Build randomized combat map"
        }
    },
    {
        name: "Material Painter Pro (PBR + Neon Glass)",
        description: "Brush tool to instantly paint metallic surfaces, reflective water mirrors, and cyberpunk neon glow.",
        version: "2.1.0",
        author: "ShaderFX Studio",
        targetSystem: "Rendering",
        isActiveByDefault: true,
        executionCode: `print("[Plugin] Material Painter shaders loaded into Three.js pipeline.")`,
        icon: "Palette",
        uiHooks: {
            buttonText: "PBR Paint",
            tooltip: "Apply materials by clicking objects"
        }
    },
    {
        name: "NetLag & Ping Simulator 3000",
        description: "Simulate dedicated server lag compensation, 150ms latency jitter, and rollback interpolation in Editor Play Mode.",
        version: "3.0.0",
        author: "Network Architects",
        targetSystem: "Networking",
        isActiveByDefault: false,
        executionCode: `print("[Plugin] NetLag simulator active: injecting synthetic jitter.")`,
        icon: "Wifi",
        uiHooks: {
            buttonText: "Simulate 150ms",
            tooltip: "Test net lag & rollback"
        }
    },
    {
        name: "Lua Debugger & Memory Watcher",
        description: "Deep inspection tool for active coroutine yield counts, heap consumption, and variable expression watches.",
        version: "4.0.0",
        author: "DevTools Team",
        targetSystem: "Lua",
        isActiveByDefault: true,
        executionCode: `print("[Plugin] Live memory diagnostics engaged.")`,
        icon: "Cpu",
        uiHooks: {
            buttonText: "Inspect Stack",
            tooltip: "View active Lua frames"
        }
    }
];
const DEFAULT_ASSETS = [
    {
        name: "Cyber Armor Helmet (PBR)",
        type: "model",
        category: "Props",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop",
        author: "GreenBlox Official",
        fileSize: 480
    },
    {
        name: "Neon Plasma Rifle",
        type: "model",
        category: "Weapons",
        thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop",
        author: "Sci-Fi Foundry",
        fileSize: 320
    },
    {
        name: "Medieval Castle Tower",
        type: "prefab",
        category: "Architecture",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop",
        author: "World Builders",
        fileSize: 1240
    },
    {
        name: "Drift Supercar Frame",
        type: "model",
        category: "Vehicles",
        thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop",
        author: "Apex Racing",
        fileSize: 890
    },
    {
        name: "Spatial Reverb Ambient Audio",
        type: "audio",
        category: "Sound Effects",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop",
        author: "Audio Guild",
        fileSize: 640
    },
    {
        name: "Health Bar & Stamina UI Template",
        type: "ui",
        category: "GUI",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop",
        author: "UI Architects",
        fileSize: 45
    }
];
function generateDefaultProjects() {
    const pvpArena = {
        title: "Cyber-Strike PvP Arena [Multiplayer AAA]",
        description: "High-octane dedicated server tactical FPS arena featuring neon volumetric lighting, weapons remote events, and lag compensation rollback test arenas.",
        author: "GreenBlox Engine Lead",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",
        version: "2.1.0-RELEASE",
        isPublished: true,
        genre: "Action / FPS",
        installedPackages: [
            "@greenblox/character-controller",
            "@greenblox/inventory-gui",
            "@greenblox/tween-service-pro"
        ],
        installedPlugins: [
            "Procedural Dungeon & Arena Builder",
            "Material Painter Pro (PBR + Neon Glass)"
        ],
        viewsCount: 42910,
        likesCount: 8915,
        sceneData: {
            rootEntities: [
                {
                    id: "ent_base_floor",
                    name: "Arena_Baseplate",
                    className: "Part",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 80,
                                y: 1,
                                z: 80
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "plane",
                            color: "#1e293b",
                            metalness: 0.8,
                            roughness: 0.3,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.8,
                            bounciness: 0.1,
                            collisionLayer: "Terrain",
                            isTrigger: false,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_center_tower",
                    name: "Neon_Monolith_Core",
                    className: "Model",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 8,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0.785,
                                z: 0
                            },
                            scale: {
                                x: 8,
                                y: 16,
                                z: 8
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cube",
                            color: "#06b6d4",
                            metalness: 0.9,
                            roughness: 0.1,
                            emissive: "#06b6d4",
                            emissiveIntensity: 0.8,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.5,
                            bounciness: 0.3,
                            collisionLayer: "Default",
                            isTrigger: false,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_spawn_blue",
                    name: "Team_Spawn_Blue",
                    className: "SpawnLocation",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: -25,
                                y: 1,
                                z: -25
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 6,
                                y: 0.4,
                                z: 6
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cylinder",
                            color: "#3b82f6",
                            metalness: 0.5,
                            roughness: 0.5,
                            emissive: "#2563eb",
                            emissiveIntensity: 0.4,
                            castShadows: false,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.7,
                            bounciness: 0,
                            collisionLayer: "Trigger",
                            isTrigger: true,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_spawn_red",
                    name: "Team_Spawn_Red",
                    className: "SpawnLocation",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 25,
                                y: 1,
                                z: 25
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 6,
                                y: 0.4,
                                z: 6
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cylinder",
                            color: "#ef4444",
                            metalness: 0.5,
                            roughness: 0.5,
                            emissive: "#dc2626",
                            emissiveIntensity: 0.4,
                            castShadows: false,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.7,
                            bounciness: 0,
                            collisionLayer: "Trigger",
                            isTrigger: true,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_player_char",
                    name: "Player",
                    className: "Model",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: -20,
                                y: 3,
                                z: -20
                            },
                            rotation: {
                                x: 0,
                                y: 0.5,
                                z: 0
                            },
                            scale: {
                                x: 2,
                                y: 4,
                                z: 2
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "capsule",
                            color: "#10b981",
                            metalness: 0.3,
                            roughness: 0.4,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 75.0,
                            friction: 0.8,
                            bounciness: 0.1,
                            collisionLayer: "Player",
                            isTrigger: false,
                            useGravity: true,
                            buoyancyFactor: 1.0,
                            velocity: {
                                x: 0,
                                y: 0,
                                z: 0
                            }
                        }
                    ],
                    children: []
                }
            ],
            environment: {
                skybox: "SciFi",
                ambientColor: "#38bdf8",
                ambientIntensity: 0.5,
                sunColor: "#f472b6",
                sunIntensity: 1.6,
                sunDirection: {
                    x: 15,
                    y: 30,
                    z: 20
                },
                fogColor: "#0f172a",
                fogDensity: 0.015,
                waterLevel: -100,
                waterColor: "#0369a1",
                enableBloom: true,
                enableSSAO: true,
                enableHDR: true
            },
            physics: {
                gravity: {
                    x: 0,
                    y: -19.62,
                    z: 0
                },
                timeScale: 1.0,
                enableSubStepping: true,
                airResistance: 0.01
            }
        },
        luaScripts: [
            {
                id: "script_arena_manager",
                name: "ArenaGameLoop.lua",
                type: "Script",
                code: `-- GreenBlox Dedicated Server Game Loop & Scoring
local Workspace = game:GetService("Workspace")
local TweenService = game:GetService("TweenService")
local RemoteEvent = game:GetService("RemoteEvent")

print("[Server] Cyber-Strike Arena Session Online. Tick Rate: 60Hz.")

-- Find Core Monolith and animate rotating glowing tower
local core = Workspace:FindFirstChild("Neon_Monolith_Core")
if core then
  print("[Arena] Located Core Monolith. Initiating rotation effect.")
end

-- Create scoreboard RemoteEvent
local scoreEvent = RemoteEvent.new("OnTeamScore")
scoreEvent:FireAllClients("Blue", 10)

print("[Server] Ready for player matchmaking.")`,
                description: "Main server game mode loop"
            },
            {
                id: "script_weapon_controller",
                name: "WeaponCombat.lua",
                type: "LocalScript",
                code: `-- Client-Side Weapons Raycast & Muzzle FX
local player = Workspace:FindFirstChild("Player")
print("[Weapons] Mounted Pulse Rifle to Player armor right arm bone.")

local function fireWeapon(targetPos)
  print("[Raycasting] Projectile fired toward coordinate vector.")
end

fireWeapon(Vector3.new(0, 5, 0))`,
                description: "Client gun shooting logic"
            }
        ],
        uiCanvases: [
            {
                id: "ui_score",
                name: "ScoreHUD",
                elementType: "Frame",
                x: 20,
                y: 20,
                width: 240,
                height: 60,
                anchor: "top-left",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                text: "BLUE: 10  |  RED: 0",
                textColor: "#38bdf8",
                fontSize: 20,
                borderRadius: 8,
                opacity: 1,
                visible: true
            },
            {
                id: "ui_ammo",
                name: "AmmoCounter",
                elementType: "Frame",
                x: 20,
                y: 20,
                width: 180,
                height: 50,
                anchor: "bottom-right",
                backgroundColor: "rgba(6, 182, 212, 0.9)",
                text: "PLASMA: 45 / ∞",
                textColor: "#ffffff",
                fontSize: 18,
                borderRadius: 12,
                opacity: 1,
                visible: true
            }
        ],
        animationsData: [
            {
                id: "anim_rifle_idle",
                name: "Rifle_Combat_Idle",
                duration: 2.0,
                loop: true,
                keyframes: [
                    {
                        time: 0,
                        entityId: "ent_player_char",
                        position: {
                            x: -20,
                            y: 3,
                            z: -20
                        },
                        rotation: {
                            x: 0,
                            y: 0.5,
                            z: 0
                        },
                        scale: {
                            x: 2,
                            y: 4,
                            z: 2
                        }
                    },
                    {
                        time: 1.0,
                        entityId: "ent_player_char",
                        position: {
                            x: -20,
                            y: 3.15,
                            z: -20
                        },
                        rotation: {
                            x: 0.05,
                            y: 0.5,
                            z: 0
                        },
                        scale: {
                            x: 2,
                            y: 4,
                            z: 2
                        }
                    },
                    {
                        time: 2.0,
                        entityId: "ent_player_char",
                        position: {
                            x: -20,
                            y: 3,
                            z: -20
                        },
                        rotation: {
                            x: 0,
                            y: 0.5,
                            z: 0
                        },
                        scale: {
                            x: 2,
                            y: 4,
                            z: 2
                        }
                    }
                ]
            }
        ]
    };
    const rpgOdyssey = {
        title: "Open-World RPG Odyssey [Terrain & Quests]",
        description: "Vast exploration world with procedural water buoyancy simulation, NavMesh AI village monsters, quest dialog trees, and customizable RPG inventories.",
        author: "Fantasy Realm Guild",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
        version: "1.4.0",
        isPublished: true,
        genre: "Adventure / RPG",
        installedPackages: [
            "@greenblox/character-controller",
            "@greenblox/pathfinding-astar",
            "@greenblox/inventory-gui"
        ],
        installedPlugins: [
            "Procedural Dungeon & Arena Builder"
        ],
        viewsCount: 68140,
        likesCount: 15420,
        sceneData: {
            rootEntities: [
                {
                    id: "ent_rpg_floor",
                    name: "Meadow_Terrain",
                    className: "Part",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 120,
                                y: 2,
                                z: 120
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "plane",
                            color: "#15803d",
                            metalness: 0.1,
                            roughness: 0.9,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.9,
                            bounciness: 0.05,
                            collisionLayer: "Terrain",
                            isTrigger: false,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_npc_guard",
                    name: "Village_Guard_NPC",
                    className: "NPC",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 8,
                                y: 3,
                                z: -10
                            },
                            rotation: {
                                x: 0,
                                y: 3.14,
                                z: 0
                            },
                            scale: {
                                x: 2,
                                y: 4,
                                z: 2
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "capsule",
                            color: "#f59e0b",
                            metalness: 0.6,
                            roughness: 0.3,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 80,
                            friction: 0.8,
                            bounciness: 0.1,
                            collisionLayer: "Player",
                            isTrigger: false,
                            useGravity: true,
                            buoyancyFactor: 1.0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_magic_crystal",
                    name: "Ancient_Mana_Crystal",
                    className: "Model",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 5,
                                z: -25
                            },
                            rotation: {
                                x: 0.3,
                                y: 0.4,
                                z: 0.2
                            },
                            scale: {
                                x: 3,
                                y: 5,
                                z: 3
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cylinder",
                            color: "#a855f7",
                            metalness: 0.9,
                            roughness: 0.1,
                            emissive: "#9333ea",
                            emissiveIntensity: 0.9,
                            castShadows: true,
                            receiveShadows: true
                        }
                    ],
                    children: []
                }
            ],
            environment: {
                skybox: "Morning",
                ambientColor: "#fef08a",
                ambientIntensity: 0.7,
                sunColor: "#ffffff",
                sunIntensity: 2.0,
                sunDirection: {
                    x: 25,
                    y: 40,
                    z: -15
                },
                fogColor: "#dcfce7",
                fogDensity: 0.008,
                waterLevel: 0.5,
                waterColor: "#0284c7",
                enableBloom: true,
                enableSSAO: true,
                enableHDR: true
            },
            physics: {
                gravity: {
                    x: 0,
                    y: -19.62,
                    z: 0
                },
                timeScale: 1.0,
                enableSubStepping: true,
                airResistance: 0.02
            }
        },
        luaScripts: [
            {
                id: "script_quest_npc",
                name: "QuestGiverDialog.lua",
                type: "Script",
                code: `-- NPC Quest & Interactive Dialog Engine
local npc = Workspace:FindFirstChild("Village_Guard_NPC")
print("[QuestEngine] Registered Village Guard NPC interactivity.")
print("[Dialog] 'Greetings Traveler! Will you cleanse the Ancient Mana Crystal?'")`,
                description: "NPC dialogue tree trigger"
            }
        ],
        uiCanvases: [
            {
                id: "ui_quest",
                name: "QuestTracker",
                elementType: "Frame",
                x: 20,
                y: 90,
                width: 260,
                height: 75,
                anchor: "top-right",
                backgroundColor: "rgba(23, 23, 23, 0.85)",
                text: "QUEST: Examine Mana Crystal\nReward: 500 Gold & EXP",
                textColor: "#fbbf24",
                fontSize: 15,
                borderRadius: 10,
                opacity: 1,
                visible: true
            }
        ],
        animationsData: []
    };
    const driftCircuit = {
        title: "High-Speed Drift Circuit [Physics & Vehicles]",
        description: "Realistic vehicle suspension physics with impulse acceleration torque, check points, and lap timer leaderboard scripts.",
        author: "Apex Racing Team",
        thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
        version: "3.0.0",
        isPublished: true,
        genre: "Racing / Simulation",
        installedPackages: [
            "@greenblox/tween-service-pro"
        ],
        installedPlugins: [
            "Material Painter Pro (PBR + Neon Glass)"
        ],
        viewsCount: 31200,
        likesCount: 6110,
        sceneData: {
            rootEntities: [
                {
                    id: "ent_track_asphalt",
                    name: "Asphalt_Circuit",
                    className: "Part",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 150,
                                y: 1,
                                z: 150
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "plane",
                            color: "#334155",
                            metalness: 0.4,
                            roughness: 0.7,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.95,
                            bounciness: 0.05,
                            collisionLayer: "Terrain",
                            isTrigger: false,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_drift_car",
                    name: "Turbo_Drifter_Vehicle",
                    className: "Vehicle",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 2,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 4,
                                y: 2,
                                z: 8
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cube",
                            color: "#ea580c",
                            metalness: 0.8,
                            roughness: 0.2,
                            emissive: "#9a3412",
                            emissiveIntensity: 0.2,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 1200,
                            friction: 0.8,
                            bounciness: 0.15,
                            collisionLayer: "Vehicle",
                            isTrigger: false,
                            useGravity: true,
                            buoyancyFactor: 0.3
                        }
                    ],
                    children: []
                }
            ],
            environment: {
                skybox: "Sunset",
                ambientColor: "#fdba74",
                ambientIntensity: 0.6,
                sunColor: "#fb923c",
                sunIntensity: 2.2,
                sunDirection: {
                    x: -30,
                    y: 25,
                    z: -40
                },
                fogColor: "#7c2d12",
                fogDensity: 0.01,
                waterLevel: -100,
                waterColor: "#0284c7",
                enableBloom: true,
                enableSSAO: true,
                enableHDR: true
            },
            physics: {
                gravity: {
                    x: 0,
                    y: -19.62,
                    z: 0
                },
                timeScale: 1.0,
                enableSubStepping: true,
                airResistance: 0.03
            }
        },
        luaScripts: [
            {
                id: "script_lap_timer",
                name: "LapLeaderboard.lua",
                type: "Script",
                code: `-- Vehicle Telemetry & Lap Timer Engine
print("[VehicleEngine] Suspension springs calibrated at 4000N/m.")
print("[Leaderboard] Current Best Lap: 42.15 seconds.")`,
                description: "Lap checkpoint script"
            }
        ],
        uiCanvases: [
            {
                id: "ui_speedometer",
                name: "SpeedHUD",
                elementType: "Frame",
                x: 30,
                y: 30,
                width: 200,
                height: 70,
                anchor: "bottom-right",
                backgroundColor: "rgba(154, 52, 18, 0.9)",
                text: "SPEED: 142 MPH\nGEAR: 4th [TURBO]",
                textColor: "#ffffff",
                fontSize: 18,
                borderRadius: 16,
                opacity: 1,
                visible: true
            }
        ],
        animationsData: []
    };
    const obbyPro = {
        title: "Obby Master Pro [Ragdoll & Parkour]",
        description: "Roblox-inspired high agility obstacle course featuring spinning lasers, falling platforms, ragdoll trigger events, and triumph checkpoints.",
        author: "Obby Kings",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop",
        version: "1.1.0",
        isPublished: true,
        genre: "Obby / Platformer",
        installedPackages: [
            "@greenblox/ragdoll-physics",
            "@greenblox/character-controller"
        ],
        installedPlugins: [
            "Procedural Dungeon & Arena Builder"
        ],
        viewsCount: 95400,
        likesCount: 22100,
        sceneData: {
            rootEntities: [
                {
                    id: "ent_obby_start",
                    name: "Start_Platform",
                    className: "Part",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 5,
                                z: 0
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 12,
                                y: 2,
                                z: 12
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cube",
                            color: "#22c55e",
                            metalness: 0.2,
                            roughness: 0.6,
                            castShadows: true,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0.8,
                            bounciness: 0.1,
                            collisionLayer: "Terrain",
                            isTrigger: false,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_spinning_laser",
                    name: "Deadly_Spinning_Laser",
                    className: "Part",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 7.5,
                                z: -20
                            },
                            rotation: {
                                x: 0,
                                y: 0.78,
                                z: 0
                            },
                            scale: {
                                x: 18,
                                y: 0.5,
                                z: 0.5
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cylinder",
                            color: "#ef4444",
                            metalness: 0.9,
                            roughness: 0.1,
                            emissive: "#ff0000",
                            emissiveIntensity: 1.5,
                            castShadows: false,
                            receiveShadows: true
                        },
                        {
                            type: "RigidBody",
                            enabled: true,
                            mass: 0,
                            friction: 0,
                            bounciness: 0,
                            collisionLayer: "Trigger",
                            isTrigger: true,
                            useGravity: false,
                            buoyancyFactor: 0
                        }
                    ],
                    children: []
                },
                {
                    id: "ent_obby_goal",
                    name: "Triumph_Goal_Badge",
                    className: "SpawnLocation",
                    components: [
                        {
                            type: "Transform",
                            enabled: true,
                            position: {
                                x: 0,
                                y: 5,
                                z: -45
                            },
                            rotation: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            scale: {
                                x: 14,
                                y: 2,
                                z: 14
                            },
                            parentEntityId: null
                        },
                        {
                            type: "Mesh",
                            enabled: true,
                            geometry: "cube",
                            color: "#eab308",
                            metalness: 0.8,
                            roughness: 0.2,
                            emissive: "#ca8a04",
                            emissiveIntensity: 0.6,
                            castShadows: true,
                            receiveShadows: true
                        }
                    ],
                    children: []
                }
            ],
            environment: {
                skybox: "Cloudy",
                ambientColor: "#e2e8f0",
                ambientIntensity: 0.8,
                sunColor: "#f8fafc",
                sunIntensity: 1.5,
                sunDirection: {
                    x: 10,
                    y: 50,
                    z: 10
                },
                fogColor: "#64748b",
                fogDensity: 0.012,
                waterLevel: -30,
                waterColor: "#0284c7",
                enableBloom: true,
                enableSSAO: false,
                enableHDR: true
            },
            physics: {
                gravity: {
                    x: 0,
                    y: -19.62,
                    z: 0
                },
                timeScale: 1.0,
                enableSubStepping: true,
                airResistance: 0.005
            }
        },
        luaScripts: [
            {
                id: "script_laser_spin",
                name: "LaserRotateAndKill.lua",
                type: "Script",
                code: `-- Animate spinning obstacle laser and attach trigger kill event
local Workspace = game:GetService("Workspace")
local laser = Workspace:FindFirstChild("Deadly_Spinning_Laser")

if laser then
  print("[Obby Engine] Armed Spinning Laser obstacle.")
end

print("[Parkour] Ready for players to test reflexes!")`,
                description: "Obstacle collision handler"
            }
        ],
        uiCanvases: [
            {
                id: "ui_stage",
                name: "StageHUD",
                elementType: "Frame",
                x: 20,
                y: 20,
                width: 220,
                height: 50,
                anchor: "top-left",
                backgroundColor: "rgba(34, 197, 94, 0.9)",
                text: "STAGE 4 / 25 [Pro]",
                textColor: "#ffffff",
                fontSize: 18,
                borderRadius: 10,
                opacity: 1,
                visible: true
            }
        ],
        animationsData: []
    };
    return [
        pvpArena,
        rpgOdyssey,
        driftCircuit,
        obbyPro
    ];
}
}),
"[project]/greenblox-studio/src/app/api/seed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$engine$2f$defaultSeed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/engine/defaultSeed.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$functions$2f$aggregate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/sql/functions/aggregate.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function POST() {
    try {
        const projectCount = await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$functions$2f$aggregate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["count"])()
        }).from(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"]);
        if (projectCount[0].value > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                status: "already_seeded",
                message: "Database already contains projects."
            });
        }
        const initialProjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$engine$2f$defaultSeed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDefaultProjects"])();
        for (const proj of initialProjects){
            await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"]).values({
                title: proj.title,
                description: proj.description,
                author: proj.author,
                thumbnail: proj.thumbnail,
                version: proj.version,
                isPublished: proj.isPublished,
                genre: proj.genre,
                sceneData: proj.sceneData,
                luaScripts: proj.luaScripts,
                uiCanvases: proj.uiCanvases,
                animationsData: proj.animationsData || [],
                lightingData: proj.sceneData.environment || {},
                physicsConfig: proj.sceneData.physics || {},
                multiplayerConfig: {
                    tickRate: 60,
                    dedicatedServer: true,
                    p2pFallback: true
                },
                installedPackages: proj.installedPackages || [],
                installedPlugins: proj.installedPlugins || [],
                viewsCount: proj.viewsCount || 0,
                likesCount: proj.likesCount || 0
            });
        }
        for (const pkg of __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$engine$2f$defaultSeed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_PACKAGES"]){
            await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["packagesRegistry"]).values({
                packageName: pkg.packageName,
                displayName: pkg.displayName,
                version: pkg.version,
                description: pkg.description,
                author: pkg.author,
                category: pkg.category,
                downloads: pkg.downloads,
                sourceCode: pkg.sourceCode,
                documentation: pkg.documentation,
                dependencies: []
            });
        }
        for (const plugin of __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$engine$2f$defaultSeed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_PLUGINS"]){
            await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enginePlugins"]).values({
                name: plugin.name,
                description: plugin.description,
                version: plugin.version,
                author: plugin.author,
                targetSystem: plugin.targetSystem,
                isActiveByDefault: plugin.isActiveByDefault,
                uiHooks: plugin.uiHooks,
                executionCode: plugin.executionCode,
                icon: plugin.icon
            });
        }
        for (const asset of __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$engine$2f$defaultSeed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_ASSETS"]){
            await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assets"]).values({
                name: asset.name,
                type: asset.type,
                category: asset.category,
                thumbnail: asset.thumbnail,
                author: asset.author,
                fileSize: asset.fileSize,
                data: {
                    generated: true,
                    url: asset.thumbnail
                },
                isOptimized: true,
                hasLODs: true
            });
        }
        // Default multiplayer sessions
        await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["multiplayerSessions"]).values([
            {
                projectId: 1,
                serverName: "US-East (Virginia) #01",
                maxPlayers: 16,
                currentPlayers: 14,
                tickRate: 60,
                region: "US-East",
                serverType: "Dedicated",
                status: "In-Game"
            },
            {
                projectId: 1,
                serverName: "EU-West (Frankfurt) #02",
                maxPlayers: 16,
                currentPlayers: 9,
                tickRate: 60,
                region: "EU-West",
                serverType: "Dedicated",
                status: "Online"
            },
            {
                projectId: 2,
                serverName: "Asia (Tokyo) #01",
                maxPlayers: 32,
                currentPlayers: 28,
                tickRate: 60,
                region: "AP-East",
                serverType: "Dedicated",
                status: "In-Game"
            }
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: "success",
            message: "GreenBlox database seeded successfully!"
        });
    } catch (err) {
        console.error("Seeding error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status: "error",
            message: err.message
        }, {
            status: 500
        });
    }
}
async function GET() {
    return POST();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c19wrj._.js.map