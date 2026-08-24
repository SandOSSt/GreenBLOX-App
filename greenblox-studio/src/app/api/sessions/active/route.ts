import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** GET /api/sessions/active — public endpoint (no auth required).
 *  Returns the number of players currently in live sessions, grouped by placeId.
 *  Used by the launcher to show real "N playing" counts on game cards. */
export async function GET() {
  const state = socialStore.snapshot();
  const sessions = socialStore.allSessions();
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    const n = s.playerCount;
    if (n > 0) {
      counts[s.placeId] = (counts[s.placeId] ?? 0) + n;
    }
  }
  const totalOnline = state.length;
  return apiJson({ counts, totalOnline });
}
