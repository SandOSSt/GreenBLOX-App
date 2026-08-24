import { db } from "@/db";
import { userGameStats } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";

export async function OPTIONS() {
  return corsOptionsHandler();
}

type StatsPayload = {
  gameId: string;
  count?: number;
  lastPlayedAt?: number;
  coins?: number;
  deaths?: number;
  timeSec?: number;
  stage?: number;
  won?: boolean;
};

function clampInt(v: unknown, min: number, max: number): number | undefined {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** POST /api/profile/stats — синхронизация итогов забега на сервер.
 *  Лаунчер шлёт результат каждой сыгранной сессии; агрегаты копятся в
 *  user_game_stats и показываются друзьям на странице профиля. */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const payloads: StatsPayload[] = Array.isArray(body.stats)
    ? body.stats
    : body.gameId
      ? [body]
      : [];

  if (payloads.length === 0) return apiJson({ error: "Нет данных" }, { status: 400 });

  const now = Date.now();
  for (const p of payloads) {
    const gameId = String(p.gameId ?? "").trim().slice(0, 120);
    if (!gameId) continue;

    const existing = await db
      .select()
      .from(userGameStats)
      .where(and(eq(userGameStats.userId, me.id), eq(userGameStats.gameId, gameId)))
      .limit(1);

    const countInc = clampInt(p.count, 0, 10_000) ?? 1;
    const lastAt = clampInt(p.lastPlayedAt, 0, Number.MAX_SAFE_INTEGER) ?? now;
    const coinsInc = clampInt(p.coins, 0, 10_000_000) ?? 0;
    const deathsInc = clampInt(p.deaths, 0, 1_000_000) ?? 0;
    const timeInc = clampInt(p.timeSec, 0, 10_000_000) ?? 0;
    const stage = clampInt(p.stage, 0, 10_000) ?? 0;
    const won = Boolean(p.won);

    if (existing.length > 0) {
      const row = existing[0];
      await db
        .update(userGameStats)
        .set({
          count: row.count + countInc,
          lastPlayedAt: Math.max(row.lastPlayedAt, lastAt),
          totalCoins: row.totalCoins + coinsInc,
          totalDeaths: row.totalDeaths + deathsInc,
          totalTimeSec: row.totalTimeSec + timeInc,
          bestStage: Math.max(row.bestStage, stage),
          wins: row.wins + (won ? 1 : 0),
          updatedAt: new Date(),
        })
        .where(eq(userGameStats.id, row.id));
    } else {
      await db.insert(userGameStats).values({
        userId: me.id,
        gameId,
        count: Math.max(1, countInc),
        lastPlayedAt: lastAt,
        totalCoins: coinsInc,
        totalDeaths: deathsInc,
        totalTimeSec: timeInc,
        bestStage: stage,
        wins: won ? 1 : 0,
      });
    }
  }

  return apiJson({ ok: true, synced: payloads.length });
}
