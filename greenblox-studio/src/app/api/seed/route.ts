import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, assets, packagesRegistry, enginePlugins, multiplayerSessions } from "@/db/schema";
import { generateDefaultProjects, DEFAULT_PACKAGES, DEFAULT_PLUGINS, DEFAULT_ASSETS } from "@/engine/defaultSeed";
import { count } from "drizzle-orm";

export async function POST() {
  try {
    const projectCount = await db.select({ value: count() }).from(projects);
    if (projectCount[0].value > 0) {
      return NextResponse.json({ status: "already_seeded", message: "Database already contains projects." });
    }

    const initialProjects = generateDefaultProjects();
    for (const proj of initialProjects) {
      await db.insert(projects).values({
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
        multiplayerConfig: { tickRate: 60, dedicatedServer: true, p2pFallback: true },
        installedPackages: proj.installedPackages || [],
        installedPlugins: proj.installedPlugins || [],
        viewsCount: proj.viewsCount || 0,
        likesCount: proj.likesCount || 0
      });
    }

    for (const pkg of DEFAULT_PACKAGES) {
      await db.insert(packagesRegistry).values({
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

    for (const plugin of DEFAULT_PLUGINS) {
      await db.insert(enginePlugins).values({
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

    for (const asset of DEFAULT_ASSETS) {
      await db.insert(assets).values({
        name: asset.name,
        type: asset.type,
        category: asset.category,
        thumbnail: asset.thumbnail,
        author: asset.author,
        fileSize: asset.fileSize,
        data: { generated: true, url: asset.thumbnail },
        isOptimized: true,
        hasLODs: true
      });
    }

    // Default multiplayer sessions
    await db.insert(multiplayerSessions).values([
      { projectId: 1, serverName: "US-East (Virginia) #01", maxPlayers: 16, currentPlayers: 14, tickRate: 60, region: "US-East", serverType: "Dedicated", status: "In-Game" },
      { projectId: 1, serverName: "EU-West (Frankfurt) #02", maxPlayers: 16, currentPlayers: 9, tickRate: 60, region: "EU-West", serverType: "Dedicated", status: "Online" },
      { projectId: 2, serverName: "Asia (Tokyo) #01", maxPlayers: 32, currentPlayers: 28, tickRate: 60, region: "AP-East", serverType: "Dedicated", status: "In-Game" }
    ]);

    return NextResponse.json({ status: "success", message: "GreenBlox database seeded successfully!" });
  } catch (err: any) {
    console.error("Seeding error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
