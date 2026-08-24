import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectLikes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { resolveToken } from "@/social/accountHelpers";

// Allow the GreenBlox launcher (localhost:5173) to like/unlike Studio projects
// cross-origin. A like is one row in project_likes (userId, projectId) — the
// unique index prevents spamming likes by clicking the button repeatedly.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-gbtoken",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/** POST /api/projects/:id/like — поставить/снять лайк (toggle).
 *  Требует авторизации: каждый лайк привязан к аккаунту (project_likes),
 *  накрутка повторными кликами невозможна.
 *  Ответ: { liked: boolean, likesCount: number }. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await resolveToken(req);
    if (!me) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401, headers: corsHeaders });
    }

    const { id } = await params;
    const projId = parseInt(id, 10);
    if (isNaN(projId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400, headers: corsHeaders });
    }

    const existing = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
    const project = existing[0];
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }

    const likeRows = await db
      .select({ id: projectLikes.id })
      .from(projectLikes)
      .where(and(eq(projectLikes.userId, me.id), eq(projectLikes.projectId, projId)))
      .limit(1);

    let liked: boolean;
    if (likeRows.length > 0) {
      // Убрать лайк.
      await db.delete(projectLikes).where(eq(projectLikes.id, likeRows[0].id));
      await db
        .update(projects)
        .set({ likesCount: sql`GREATEST(0, ${projects.likesCount} - 1)` })
        .where(eq(projects.id, projId));
      liked = false;
    } else {
      // Поставить лайк.
      await db.insert(projectLikes).values({ userId: me.id, projectId: projId });
      await db
        .update(projects)
        .set({ likesCount: sql`${projects.likesCount} + 1` })
        .where(eq(projects.id, projId));
      liked = true;
    }

    const refreshed = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
    return NextResponse.json(
      { liked, likesCount: refreshed[0]?.likesCount ?? project.likesCount },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
