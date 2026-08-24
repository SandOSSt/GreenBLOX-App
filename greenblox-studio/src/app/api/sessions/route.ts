import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function OPTIONS() {
  return corsOptionsHandler();
}

function isCatalogPlace(placeId: string): boolean {
  return /^catalog:.+$/i.test(placeId);
}

/** POST /api/sessions — создать сессию { placeId, placeTitle? } или войти { code }.
 *  placeId — числовой id студийного проекта (проверяется в БД) или "catalog:<slug>"
 *  для игр каталога лаунчера (название берётся от клиента). */
export async function POST(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();

  if (code) {
    const session = socialStore.joinSession({ id: me.id, name: me.name, avatarColor: me.avatarColor }, code);
    if (session === null) return apiJson({ error: "Сессия не найдена" }, { status: 404 });
    if (session === "full") return apiJson({ error: "Сессия заполнена" }, { status: 409 });
    return apiJson({ session: socialStore.serializeSession(session), joined: true });
  }

  const placeId = String(body.placeId ?? "").trim();
  if (!placeId) return apiJson({ error: "placeId обязателен" }, { status: 400 });

  let placeTitle = String(body.placeTitle ?? "").trim().slice(0, 60);

  if (isCatalogPlace(placeId)) {
    if (!placeTitle) placeTitle = "GreenBlox Play";
  } else {
    const numeric = Number(placeId);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      return apiJson({ error: "Некорректный placeId" }, { status: 400 });
    }
    const project = await db.select().from(projects).where(eq(projects.id, numeric)).limit(1);
    if (project.length === 0) return apiJson({ error: "Плейс не найден" }, { status: 404 });
    placeTitle = project[0].title;
  }

  const session = socialStore.createSession(
    { id: me.id, name: me.name, avatarColor: me.avatarColor },
    { id: placeId, title: placeTitle }
  );
  return apiJson({ session: socialStore.serializeSession(session), joined: false });
}

/** GET /api/sessions?code= — инфо о сессии. */
export async function GET(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  if (!code) return apiJson({ error: "code обязателен" }, { status: 400 });
  const session = socialStore.getSessionByCode(code);
  if (!session) return apiJson({ error: "Сессия не найдена" }, { status: 404 });
  return apiJson({ session: socialStore.serializeSession(session) });
}

/** DELETE /api/sessions?id= — выйти из сессии. */
export async function DELETE(req: Request) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  socialStore.leaveSession(me.id, id);
  return apiJson({ ok: true });
}
