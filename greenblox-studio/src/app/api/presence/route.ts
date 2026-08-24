import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** POST /api/presence — heartbeat. { status: "online" | "in_game" | "in_studio" } */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const status =
    body.status === "in_game" ? "in_game" : body.status === "in_studio" ? "in_studio" : "online";
  const live = socialStore.ping({ id: me.id, name: me.name, avatarColor: me.avatarColor }, status);
  return apiJson({ ok: true, lastSeen: live.lastSeen });
}
