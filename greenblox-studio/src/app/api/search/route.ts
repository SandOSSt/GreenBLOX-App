import { pool } from "@/db";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** GET /api/search?q= — поиск игроков по нику (без себя), с живым статусом. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return apiJson({ results: [] });

  const like = `%${q.toLowerCase()}%`;
  const res = await pool.query(
    "SELECT id, name, avatar_color AS \"avatarColor\" FROM users WHERE lower(name) LIKE $1 AND id <> $2 LIMIT 8",
    [like, me.id]
  );
  const liveMap = new Map(socialStore.snapshot().map((p) => [p.userId, p]));
  const results = (res.rows ?? []).map((r) => {
    const live = liveMap.get(r.id);
    const inSession = socialStore.getSessionForUser(r.id);
    return {
      id: r.id,
      name: r.name,
      avatarColor: r.avatarColor,
      status: live?.status ?? "offline",
      session: inSession
        ? {
            id: inSession.id,
            code: inSession.code,
            placeId: inSession.placeId,
            placeTitle: inSession.placeTitle,
          }
        : undefined,
    };
  });
  return apiJson({ results });
}
