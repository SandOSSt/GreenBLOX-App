import { db } from "@/db";
import { users, friendRequests } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** POST /api/friends/action — { action, requestId?, userId? } accept|decline|cancel|remove */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action === "accept" || action === "decline") {
    const requestId = Number(body.requestId);
    if (!Number.isInteger(requestId)) return apiJson({ error: "requestId обязателен" }, { status: 400 });
    const rows = await db
      .select()
      .from(friendRequests)
      .where(and(eq(friendRequests.id, requestId), eq(friendRequests.toId, me.id)))
      .limit(1);
    if (rows.length === 0) return apiJson({ error: "Заявка не найдена" }, { status: 404 });
    const status = action === "accept" ? "accepted" : "declined";
    await db.update(friendRequests).set({ status }).where(eq(friendRequests.id, requestId));
    return apiJson({ ok: true });
  }

  if (action === "cancel") {
    const requestId = Number(body.requestId);
    if (!Number.isInteger(requestId)) return apiJson({ error: "requestId обязателен" }, { status: 400 });
    const rows = await db
      .select()
      .from(friendRequests)
      .where(and(eq(friendRequests.id, requestId), eq(friendRequests.fromId, me.id)))
      .limit(1);
    if (rows.length === 0) return apiJson({ error: "Заявка не найдена" }, { status: 404 });
    await db.delete(friendRequests).where(eq(friendRequests.id, requestId));
    return apiJson({ ok: true });
  }

  if (action === "remove") {
    const userId = Number(body.userId);
    if (!Number.isInteger(userId)) return apiJson({ error: "userId обязателен" }, { status: 400 });
    const rows = await db
      .select()
      .from(friendRequests)
      .where(
        or(
          and(eq(friendRequests.fromId, me.id), eq(friendRequests.toId, userId), eq(friendRequests.status, "accepted")),
          and(eq(friendRequests.fromId, userId), eq(friendRequests.toId, me.id), eq(friendRequests.status, "accepted"))
        )
      )
      .limit(1);
    if (rows.length === 0) return apiJson({ error: "Не найден такой друг" }, { status: 404 });
    await db.delete(friendRequests).where(eq(friendRequests.id, rows[0].id));
    return apiJson({ ok: true });
  }

  return apiJson({ error: "Неизвестное действие" }, { status: 400 });
}

/** GET /api/friends/action?userId= — lookup a peer profile. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("userId"));
  if (!Number.isInteger(userId) || userId <= 0) return apiJson({ error: "userId обязателен" }, { status: 400 });
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (rows.length === 0) return apiJson({ error: "Игрок не найден" }, { status: 404 });
  const u = rows[0];
  return apiJson({ user: { id: u.id, name: u.name, avatarColor: u.avatarColor } });
}
