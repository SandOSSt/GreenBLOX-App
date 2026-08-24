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
"[project]/greenblox-studio/src/app/api/projects/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/greenblox-studio/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// Allow the GreenBlox launcher (dev server on localhost:5173) to read published
// projects cross-origin so its "Из Студии" section can list playable games.
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};
async function OPTIONS() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: 204,
        headers: corsHeaders
    });
}
async function GET() {
    try {
        const list = await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"]).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"].viewsCount), (0, __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"].createdAt));
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(list, {
            headers: corsHeaders
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500,
            headers: corsHeaders
        });
    }
}
async function POST(req) {
    try {
        const body = await req.json();
        const newProject = await __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["projects"]).values({
            title: body.title || "Untitled GreenBlox Experience",
            description: body.description || "A custom sandbox creation built in GreenBlox Engine.",
            author: body.author || "Engine Developer",
            thumbnail: body.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
            version: body.version || "0.1.0",
            isPublished: body.isPublished || false,
            genre: body.genre || "Sandbox",
            sceneData: body.sceneData || {
                rootEntities: [
                    {
                        id: "ent_base_plate",
                        name: "Baseplate",
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
                                    x: 100,
                                    y: 1,
                                    z: 100
                                },
                                parentEntityId: null
                            },
                            {
                                type: "Mesh",
                                enabled: true,
                                geometry: "plane",
                                color: "#334155",
                                metalness: 0.3,
                                roughness: 0.7,
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
                    }
                ],
                environment: {
                    skybox: "SciFi",
                    ambientColor: "#38bdf8",
                    ambientIntensity: 0.6,
                    sunColor: "#ffffff",
                    sunIntensity: 1.8,
                    sunDirection: {
                        x: 15,
                        y: 35,
                        z: 25
                    },
                    fogColor: "#0f172a",
                    fogDensity: 0.015,
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
                    airResistance: 0.01
                }
            },
            luaScripts: body.luaScripts || [
                {
                    id: "script_init",
                    name: "MainGameScript.lua",
                    type: "Script",
                    code: `print("[GreenBlox] Welcome to your new engine project!")\nlocal Workspace = game:GetService("Workspace")\n`,
                    description: "Default initializing entrypoint"
                }
            ],
            uiCanvases: body.uiCanvases || [],
            animationsData: body.animationsData || [],
            lightingData: {},
            physicsConfig: body.sceneData?.physics || {},
            multiplayerConfig: body.multiplayerConfig || {
                tickRate: 60,
                dedicatedServer: true,
                p2pFallback: true,
                maxPlayers: 16
            },
            installedPackages: [
                "@greenblox/character-controller"
            ],
            installedPlugins: [
                "Material Painter Pro (PBR + Neon Glass)"
            ],
            viewsCount: 1,
            likesCount: 0
        }).returning();
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(newProject[0]);
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$greenblox$2d$studio$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03umc8v._.js.map