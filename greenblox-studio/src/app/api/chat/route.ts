import { db } from "@/db";
import { users, friendRequests, chatMessages } from "@/db/schema";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken, type Account } from "@/social/accountHelpers";

export async function OPTIONS() {
  return corsOptionsHandler();
}

async function loadPeople(ids: number[]): Promise<Map<number, { id: number; name: string; avatarColor: string }>> {
  const map = new Map<number, { id: number; name: string; avatarColor: string }>();
  if (ids.length === 0) return map;
  const rows = await db.select().from(users).where(inArray(users.id, ids));
  for (const u of rows) map.set(u.id, { id: u.id, name: u.name, avatarColor: u.avatarColor });
  return map;
}

async function isMutualFriend(a: number, b: number): Promise<boolean> {
  const rows = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(eq(friendRequests.fromId, a), eq(friendRequests.toId, b), eq(friendRequests.status, "accepted")),
        and(eq(friendRequests.fromId, b), eq(friendRequests.toId, a), eq(friendRequests.status, "accepted"))
      )
    )
    .limit(1);
  return rows.length > 0;
}

/** GET /api/chat — список диалогов; GET /api/chat?peer=123 — переписка с другом. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const url = new URL(req.url);
  const peerId = Number(url.searchParams.get("peer"));

  if (peerId) {
    if (!Number.isInteger(peerId) || peerId <= 0) return apiJson({ error: "peer обязателен" }, { status: 400 });
    const rows = await db
      .select()
      .from(chatMessages)
      .where(
        or(
          and(eq(chatMessages.fromId, me.id), eq(chatMessages.toId, peerId)),
          and(eq(chatMessages.fromId, peerId), eq(chatMessages.toId, me.id))
        )
      )
      .orderBy(chatMessages.createdAt)
      .limit(200);
    // Mark incoming messages as read.
    await db
      .update(chatMessages)
      .set({ read: true })
      .where(and(eq(chatMessages.fromId, peerId), eq(chatMessages.toId, me.id), eq(chatMessages.read, false)));
    return apiJson({ messages: rows });
  }

  // Thread list: all users we have a chat with, joined with last message info.
  const mine = await db.select().from(chatMessages).where(or(eq(chatMessages.fromId, me.id), eq(chatMessages.toId, me.id)));
  const peerIds = new Set<number>();
  for (const m of mine) peerIds.add(m.fromId === me.id ? m.toId : m.fromId);

  const people = await loadPeople([...peerIds]);
  const unreadCounts = new Map<number, number>();
  for (const m of mine) {
    if (m.fromId !== me.id && !m.read) unreadCounts.set(m.fromId, (unreadCounts.get(m.fromId) ?? 0) + 1);
  }
  const lastByPeer = new Map<number, typeof mine[number]>();
  for (const m of mine) {
    const peer = m.fromId === me.id ? m.toId : m.fromId;
    const prev = lastByPeer.get(peer);
    if (!prev || m.createdAt > prev.createdAt) lastByPeer.set(peer, m);
  }

  const threads = [...peerIds]
    .map((peerId) => {
      const peer = people.get(peerId);
      const last = lastByPeer.get(peerId);
      if (!peer || !last) return null;
      return {
        peerId,
        name: peer.name,
        avatarColor: peer.avatarColor,
        lastMessage: last.text,
        lastAt: last.createdAt,
        unread: unreadCounts.get(peerId) ?? 0,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

  return apiJson({ threads });
}

type ChatMessageRow = typeof chatMessages.$inferSelect;

/** POST /api/chat — { toId, text } отправить сообщение (только друзьям). */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const toId = Number(body.toId);
  const text = String(body.text ?? "").trim().slice(0, 500);
  if (!Number.isInteger(toId) || toId <= 0) return apiJson({ error: "toId обязателен" }, { status: 400 });
  if (toId === me.id) return apiJson({ error: "Нельзя написать самому себе" }, { status: 400 });
  if (!text) return apiJson({ error: "Сообщение пустое" }, { status: 400 });

  const target = await db.select().from(users).where(eq(users.id, toId)).limit(1);
  if (target.length === 0) return apiJson({ error: "Игрок не найден" }, { status: 404 });

  if (!(await isMutualFriend(me.id, toId))) {
    return apiJson({ error: "Можно писать только друзьям" }, { status: 403 });
  }

  const inserted = await db
    .insert(chatMessages)
    .values({ fromId: me.id, toId, text })
    .returning();
  return apiJson({ message: inserted[0] }, { status: 201 });
}

/** DELETE /api/chat?peer=123 — удалить переписку с другом. */
export async function DELETE(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const peerId = Number(url.searchParams.get("peer"));
  if (!Number.isInteger(peerId) || peerId <= 0) return apiJson({ error: "peer обязателен" }, { status: 400 });
  await db
    .delete(chatMessages)
    .where(
      or(
        and(eq(chatMessages.fromId, me.id), eq(chatMessages.toId, peerId)),
        and(eq(chatMessages.fromId, peerId), eq(chatMessages.toId, me.id))
      )
    );
  return apiJson({ ok: true });
}

export type { Account, ChatMessageRow };
