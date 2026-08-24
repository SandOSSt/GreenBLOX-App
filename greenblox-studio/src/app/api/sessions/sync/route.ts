import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** POST /api/sessions/sync — передать позицию, вернуть позиции остальных. */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId ?? "");
  const x = Number(body.x ?? 0);
  const y = Number(body.y ?? 0);
  const z = Number(body.z ?? 0);
  if (!sessionId) return apiJson({ error: "sessionId обязателен" }, { status: 400 });
  const face = typeof body.face === "number" && Number.isFinite(body.face) ? Number(body.face) : undefined;
  const grounded = typeof body.grounded === "boolean" ? body.grounded : undefined;
  const coins = Number.isInteger(body.coins) ? Number(body.coins) : undefined;
  const deaths = Number.isInteger(body.deaths) ? Number(body.deaths) : undefined;
  const stage = Number.isInteger(body.stage) ? Number(body.stage) : undefined;
  const won = typeof body.won === "boolean" ? body.won : undefined;
  // Custom avatar colors (hex strings for each body part), forwarded as-is.
  const rawColors = body.avatarColors && typeof body.avatarColors === "object" ? body.avatarColors : undefined;
  const avatarColors =
    rawColors && ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg", "shirt"].every(
      (k) => typeof rawColors[k] === "string" && /^#[0-9a-fA-F]{6}$/.test(rawColors[k])
    )
      ? {
          head: rawColors.head,
          torso: rawColors.torso,
          leftArm: rawColors.leftArm,
          rightArm: rawColors.rightArm,
          leftLeg: rawColors.leftLeg,
          rightLeg: rawColors.rightLeg,
          shirt: rawColors.shirt,
        }
      : undefined;
  // Full roster including the caller, so clients can show the real player count.
  // Callers ignore their own userId when rendering remote avatars.
  const players = socialStore.syncFull(
    { id: me.id, name: me.name, avatarColor: me.avatarColor },
    sessionId,
    { x, y, z },
    { face, grounded, coins, deaths, stage, won, avatarColors }
  );
  socialStore.ping({ id: me.id, name: me.name, avatarColor: me.avatarColor }, "in_game");
  return apiJson({ players });
}
