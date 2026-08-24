import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { resolveToken } from "@/social/accountHelpers";

// Allow the GreenBlox launcher (localhost:5173) to fetch a single project
// cross-origin. Used when a guest joins a session by code: the host's placeId
// may point to a project that was created after the launcher loaded its list,
// so the guest must be able to fetch it on demand.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-gbtoken",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projId = parseInt(id, 10);
    if (isNaN(projId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400, headers: corsHeaders });

    const item = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
    if (item.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json(item[0], { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projId = parseInt(id, 10);
    if (isNaN(projId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400, headers: corsHeaders });

    const body = await req.json();
    const me = await resolveToken(req);

    // Кто владелец? Правку разрешаем владельцу, либо (пока ownerId пуст)
    // первому авторизованному, кто сохраняет проект — это «момент привязки
    // карты к игроку». Если проект уже принадлежит другому аккаунту — чужой
    // проект нельзя перезаписать или присвоить себе.
    const existing = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
    const project = existing[0];
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    const canEdit = !project.ownerId || (me && project.ownerId === me.id) || (!me && !project.ownerId);
    if (!canEdit) {
      return NextResponse.json({ error: "Этот проект принадлежит другому игроку" }, { status: 403, headers: corsHeaders });
    }
    const effectiveOwner = !project.ownerId && me ? me.id : undefined;

    // Support incrementing views or likes
    if (body.action === "increment_views") {
      await db.update(projects).set({ viewsCount: sql`${projects.viewsCount} + 1` }).where(eq(projects.id, projId));
      return NextResponse.json({ status: "views updated" }, { headers: corsHeaders });
    }
    if (body.action === "increment_likes") {
      await db.update(projects).set({ likesCount: sql`${projects.likesCount} + 1` }).where(eq(projects.id, projId));
      return NextResponse.json({ status: "likes updated" }, { headers: corsHeaders });
    }

    // Обложка плейса (thumbnail) приходит из студии (Settings → Cover image) и
    // из лаунчера. Берём её в обновление, чтобы UI студии/лаунчера видел
    // свежую картинку карточки.
    const updated = await db.update(projects).set({
      ownerId: effectiveOwner ?? undefined,
      title: body.title,
      description: body.description,
      author: me?.name || body.author,
      thumbnail: body.thumbnail ?? undefined,
      genre: body.genre,
      version: body.version,
      isPublished: body.isPublished,
      sceneData: body.sceneData,
      luaScripts: body.luaScripts,
      uiCanvases: body.uiCanvases,
      animationsData: body.animationsData,
      lightingData: body.sceneData?.environment || body.lightingData,
      physicsConfig: body.sceneData?.physics || body.physicsConfig,
      multiplayerConfig: body.multiplayerConfig,
      installedPackages: body.installedPackages,
      installedPlugins: body.installedPlugins,
      updatedAt: new Date()
    }).where(eq(projects.id, projId)).returning();

    return NextResponse.json(updated[0] || { status: "saved" }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projId = parseInt(id, 10);
    if (isNaN(projId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400, headers: corsHeaders });

    // Удаление разрешено только владельцу проекта. Проект без владельца
    // (сидовый/гостевой) удалить нельзя — чужую карту или официальный
    // сид-проект не должен сносить никто (привязка к аккаунту).
    const me = await resolveToken(req);
    const existing = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
    const project = existing[0];
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    const isOwner = project.ownerId ? me?.id === project.ownerId : false;
    if (!isOwner) {
      return NextResponse.json({ error: "Этот проект принадлежит другому игроку" }, { status: 403, headers: corsHeaders });
    }

    await db.delete(projects).where(eq(projects.id, projId));
    return NextResponse.json({ status: "deleted" }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
