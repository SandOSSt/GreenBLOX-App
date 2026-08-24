import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { resolveToken } from "@/social/accountHelpers";

// Allow the GreenBlox launcher (dev server on localhost:5173) to read published
// projects cross-origin so its "Из Студии" section can list playable games.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-gbtoken",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const list = await db.select().from(projects).orderBy(desc(projects.viewsCount), desc(projects.createdAt));
    return NextResponse.json(list, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Привязка к аккаунту: если студия/лаунчер авторизованы (x-gbtoken),
    // проект получает владельца. Без токена (гость) ownerId остаётся NULL.
    const me = await resolveToken(req);
    const newProject = await db.insert(projects).values({
      ownerId: me?.id ?? null,
      title: body.title || "Untitled GreenBlox Experience",
      description: body.description || "A custom sandbox creation built in GreenBlox Engine.",
      author: me?.name || body.author || "Engine Developer",
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
              { type: "Transform", enabled: true, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 100, y: 1, z: 100 }, parentEntityId: null },
              { type: "Mesh", enabled: true, geometry: "plane", color: "#334155", metalness: 0.3, roughness: 0.7, castShadows: true, receiveShadows: true },
              { type: "RigidBody", enabled: true, mass: 0, friction: 0.8, bounciness: 0.1, collisionLayer: "Terrain", isTrigger: false, useGravity: false, buoyancyFactor: 0 }
            ],
            children: []
          }
        ],
        environment: { skybox: "SciFi", ambientColor: "#38bdf8", ambientIntensity: 0.6, sunColor: "#ffffff", sunIntensity: 1.8, sunDirection: { x: 15, y: 35, z: 25 }, fogColor: "#0f172a", fogDensity: 0.015, waterLevel: -100, waterColor: "#0284c7", enableBloom: true, enableSSAO: true, enableHDR: true },
        physics: { gravity: { x: 0, y: -19.62, z: 0 }, timeScale: 1.0, enableSubStepping: true, airResistance: 0.01 }
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
      multiplayerConfig: body.multiplayerConfig || { tickRate: 60, dedicatedServer: true, p2pFallback: true, maxPlayers: 16 },
      installedPackages: ["@greenblox/character-controller"],
      installedPlugins: ["Material Painter Pro (PBR + Neon Glass)"],
      viewsCount: 1,
      likesCount: 0
    }).returning();

    return NextResponse.json(newProject[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
