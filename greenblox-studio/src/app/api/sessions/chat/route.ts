import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** POST /api/sessions/chat — { sessionId, text } отправить сообщение в чат сессии. */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId ?? "");
  const text = String(body.text ?? "").trim();
  if (!sessionId) return apiJson({ error: "sessionId обязателен" }, { status: 400 });
  if (!text) return apiJson({ error: "Сообщение пустое" }, { status: 400 });

  const session = socialStore.getSessionById(sessionId);
  if (!session) return apiJson({ error: "Сессия не найдена" }, { status: 404 });
  if (!session.players.has(me.id)) {
    return apiJson({ error: "Ты не в этой сессии" }, { status: 403 });
  }

  const message = socialStore.addChatMessage(
    { id: me.id, name: me.name, avatarColor: me.avatarColor },
    sessionId,
    text
  );
  return apiJson({ message }, { status: 201 });
}

/** GET /api/sessions/chat?sessionId= — все сообщения сессии. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId") ?? "";
  if (!sessionId) return apiJson({ error: "sessionId обязателен" }, { status: 400 });
  const messages = socialStore.getChatMessages(sessionId);
  return apiJson({ messages });
}
