import { db } from "@/db";
import { users, friendRequests } from "@/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

type Person = { id: number; name: string; avatarColor: string };

async function loadPeople(ids: number[]): Promise<Map<number, Person>> {
  const map = new Map<number, Person>();
  if (ids.length === 0) return map;
  const rows = await db.select().from(users).where(inArray(users.id, ids));
  for (const u of rows) map.set(u.id, { id: u.id, name: u.name, avatarColor: u.avatarColor });
  return map;
}

interface FriendRow {
  id: number;
  name: string;
  avatarColor: string;
  status: string;
  session?: {
    id: string;
    code: string;
    placeId: string;
    placeTitle: string;
  };
}

/** GET /api/friends — { friends, incoming, outgoing } with live presence. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const [acceptedA, acceptedB, incomingQ, outgoingQ] = await Promise.all([
    db.select().from(friendRequests).where(and(eq(friendRequests.fromId, me.id), eq(friendRequests.status, "accepted"))),
    db.select().from(friendRequests).where(and(eq(friendRequests.toId, me.id), eq(friendRequests.status, "accepted"))),
    db.select().from(friendRequests).where(and(eq(friendRequests.toId, me.id), eq(friendRequests.status, "pending"))),
    db.select().from(friendRequests).where(and(eq(friendRequests.fromId, me.id), eq(friendRequests.status, "pending"))),
  ]);

  const ids = new Set<number>();
  acceptedA.forEach((r) => ids.add(r.toId));
  acceptedB.forEach((r) => ids.add(r.fromId));
  incomingQ.forEach((r) => ids.add(r.fromId));
  outgoingQ.forEach((r) => ids.add(r.toId));
  const people = await loadPeople([...ids]);

  const liveMap = new Map(socialStore.snapshot().map((p) => [p.userId, p]));

  const friends: FriendRow[] = [];
  const seen = new Set<number>();
  const pushFriend = (peerId: number) => {
    if (seen.has(peerId)) return;
    seen.add(peerId);
    const peer = people.get(peerId);
    if (!peer) return;
    const live = liveMap.get(peerId);
    const session = socialStore.getSessionForUser(peerId);
    friends.push({
      id: peer.id,
      name: peer.name,
      avatarColor: peer.avatarColor,
      status: live?.status ?? "offline",
      session: session
        ? {
            id: session.id,
            code: session.code,
            placeId: session.placeId,
            placeTitle: session.placeTitle,
          }
        : undefined,
    });
  };
  acceptedA.forEach((r) => pushFriend(r.toId));
  acceptedB.forEach((r) => pushFriend(r.fromId));

  const incoming = incomingQ
    .map((r) => {
      const peer = people.get(r.fromId);
      return peer ? { requestId: r.id, id: peer.id, name: peer.name, avatarColor: peer.avatarColor } : null;
    })
    .filter((x): x is { requestId: number; id: number; name: string; avatarColor: string } => x !== null);

  const outgoing = outgoingQ
    .map((r) => {
      const peer = people.get(r.toId);
      return peer ? { requestId: r.id, id: peer.id, name: peer.name, avatarColor: peer.avatarColor } : null;
    })
    .filter((x): x is { requestId: number; id: number; name: string; avatarColor: string } => x !== null);

  return apiJson({ friends, incoming, outgoing });
}

/** POST /api/friends — send a friend request (auto-accept if mutual). */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const toId = Number(body.userId);
  if (!Number.isInteger(toId) || toId <= 0) return apiJson({ error: "userId обязателен" }, { status: 400 });
  if (toId === me.id) return apiJson({ error: "Нельзя добавить самого себя" }, { status: 400 });

  const target = await db.select().from(users).where(eq(users.id, toId)).limit(1);
  if (target.length === 0) return apiJson({ error: "Игрок не найден" }, { status: 404 });

  const existing = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(eq(friendRequests.fromId, me.id), eq(friendRequests.toId, toId)),
        and(eq(friendRequests.fromId, toId), eq(friendRequests.toId, me.id))
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const e = existing[0];
    if (e.status === "accepted") return apiJson({ error: "Вы уже друзья" }, { status: 400 });
    if (e.fromId === me.id) {
      if (e.status === "pending") return apiJson({ error: "Заявка уже отправлена" }, { status: 400 });
      // Повторная отправка после "declined" — удаляем старую и шлём новую.
      await db.delete(friendRequests).where(eq(friendRequests.id, e.id));
      const reinserted = await db
        .insert(friendRequests)
        .values({ fromId: me.id, toId, status: "pending" })
        .returning();
      return apiJson({ ok: true, requestId: reinserted[0].id, resent: true });
    }
    if (e.status === "declined") {
      return apiJson({ error: "Пользователь отклонил твою заявку ранее" }, { status: 400 });
    }
    // Встречная pending-заявка от получателя: принимаем её — вы оба хотели дружить.
    await db.update(friendRequests).set({ status: "accepted" }).where(eq(friendRequests.id, e.id));
    return apiJson({ ok: true, autoAccepted: true });
  }

  const inserted = await db
    .insert(friendRequests)
    .values({ fromId: me.id, toId, status: "pending" })
    .returning();
  return apiJson({ ok: true, requestId: inserted[0].id });
}
