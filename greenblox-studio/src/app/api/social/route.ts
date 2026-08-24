import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";

function makeToken(): string {
  const buffer = new Uint8Array(24);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
}

function colorFromName(name: string): string {
  const colors = ["#00b06f", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#ef4444", "#14b8a6", "#84cc16", "#38bdf8", "#c084fc"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

export async function OPTIONS() {
  return corsOptionsHandler();
}
/** POST /api/social — register or login by email+name. Returns { user, token }. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    if (!email || !email.includes("@")) return apiJson({ error: "Некорректный email" }, { status: 400 });

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      if (name && name !== existing[0].name && name.length <= 30) {
        const updated = await db
          .update(users)
          .set({ name, avatarColor: colorFromName(name) })
          .where(eq(users.email, email))
          .returning();
        const u = updated[0];
        return apiJson({ user: { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor }, token: u.token });
      }
      const u = existing[0];
      return apiJson({ user: { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor }, token: u.token });
    }

    if (!name) return apiJson({ error: "Укажи имя при регистрации" }, { status: 400 });
    const token = makeToken();
    const inserted = await db
      .insert(users)
      .values({ name: name.slice(0, 30), email, avatarColor: colorFromName(name), token })
      .returning();
    const u = inserted[0];
    return apiJson({ user: { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor }, token: u.token }, { status: 201 });
  } catch (err: any) {
    return apiJson({ error: err.message }, { status: 500 });
  }
}
/** GET /api/social/me — refresh current user by token. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  return apiJson({ user: me });
}
