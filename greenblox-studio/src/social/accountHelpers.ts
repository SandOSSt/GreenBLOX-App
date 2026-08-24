import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Account = { id: number; name: string; email: string; avatarColor: string };

export async function resolveToken(req: Request): Promise<Account | null> {
  const token = req.headers.get("x-gbtoken");
  if (!token) return null;
  const rows = await db.select().from(users).where(eq(users.token, token)).limit(1);
  if (rows.length === 0) return null;
  const u = rows[0];
  return { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor };
}
