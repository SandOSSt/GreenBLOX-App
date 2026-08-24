import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** PUT /api/profile — обновление своего публичного профиля (bio, handle,
 *  статус-квота, coverStyle) и акцентного цвета аватара. Данные сразу видны
 *  друзьям на странице профиля. */
export async function PUT(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 300) : undefined;
  const handle = typeof body.handle === "string" ? body.handle.trim().slice(0, 40) : undefined;
  const statusQuote = typeof body.statusQuote === "string" ? body.statusQuote.trim().slice(0, 80) : undefined;
  const coverStyle = typeof body.coverStyle === "string" ? body.coverStyle.slice(0, 20) : undefined;
  const avatarColor = typeof body.avatarColor === "string" ? body.avatarColor.slice(0, 20) : undefined;

  // Новые поля пересекаются со старыми значениями формы, поэтому читаем
  // текущую строку профиля, что изменилось — пишем.
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, me.id)).limit(1);

  if (existing.length > 0) {
    await db
      .update(userProfiles)
      .set({
        ...(bio !== undefined ? { bio } : {}),
        ...(handle !== undefined ? { handle } : {}),
        ...(statusQuote !== undefined ? { statusQuote } : {}),
        ...(coverStyle !== undefined ? { coverStyle } : {}),
      })
      .where(eq(userProfiles.userId, me.id));
  } else {
    await db.insert(userProfiles).values({
      userId: me.id,
      bio: bio ?? "",
      handle: handle ?? `@${me.name.toLowerCase().replace(/\s+/g, "_")}`,
      statusQuote: statusQuote ?? "",
      coverStyle: coverStyle ?? "emerald",
    });
  }

  if (avatarColor && /^#[0-9a-fA-F]{6}$/.test(avatarColor)) {
    await db.update(users).set({ avatarColor }).where(eq(users.id, me.id));
  }

  const refreshed = await db.select().from(userProfiles).where(eq(userProfiles.userId, me.id)).limit(1);
  const p = refreshed[0];

  return apiJson({
    profile: {
      id: me.id,
      name: me.name,
      email: me.email,
      avatarColor: avatarColor && /^#[0-9a-fA-F]{6}$/.test(avatarColor) ? avatarColor : me.avatarColor,
      handle: p?.handle || handle || `@${me.name.toLowerCase().replace(/\s+/g, "_")}`,
      bio: p?.bio || bio || "",
      coverStyle: p?.coverStyle || coverStyle || "emerald",
      statusQuote: p?.statusQuote || statusQuote || "",
    },
  });
}
