import { db } from "@/db";
import { users, userProfiles, userGameStats, friendRequests, projects, projectLikes } from "@/db/schema";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { apiJson, corsOptionsHandler } from "@/social/helpers";
import { resolveToken } from "@/social/accountHelpers";
import { socialStore } from "@/social/socialStore";

export async function OPTIONS() {
  return corsOptionsHandler();
}

/** GET /api/profile/:id — публичный профиль пользователя: био, handle,
 *  статус-квота, живой статус/сессия, статистика игр, уровень, счёт друзей,
 *  общие друзья, состояние дружбы с текущим пользователем и карты, созданные
 *  игроком в студии (секция «Карты создателя» на его профиле).
 *  Приватные данные (email, token) не отдаются. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await resolveToken(req);
  if (!me) return apiJson({ error: "Не авторизован" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return apiJson({ error: "Некорректный id" }, { status: 400 });
  }

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userRows.length === 0) return apiJson({ error: "Игрок не найден" }, { status: 404 });
  const u = userRows[0];

  // Показываем в профиле, какие из этих карт уже лайкнул текущий зритель.
  // LAZ: likes без таблицы — старый счётчик likes_count мог расти без строк
  // project_likes (increment_likes). Поэтому сверяемся и по таблице лайков,
  // и по счётчику: likedByMe = строка в project_likes ИЛИ (у автора) свой
  // проект, которому он уже накручивал лайк старым способом.
  const myLikeRows = me
    ? await db
        .select({ projectId: projectLikes.projectId })
        .from(projectLikes)
        .where(and(eq(projectLikes.userId, me.id)))
    : [];
  const myLikedProjectIds = new Set(myLikeRows.map((r) => r.projectId));

  const [profileRows, statsRows, creatorProjectRows, friendAccepted, myFriends, relationRows] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
    db.select().from(userGameStats).where(eq(userGameStats.userId, userId)),
    // Карты, созданные этим игроком в студии — секция «Карты создателя».
    // Показываем только опубликованные (isPublished) — приватные черновики
    // не светим в профиле.
    db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        thumbnail: projects.thumbnail,
        genre: projects.genre,
        version: projects.version,
        viewsCount: projects.viewsCount,
        likesCount: projects.likesCount,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(and(eq(projects.ownerId, userId), eq(projects.isPublished, true)))
      .orderBy(desc(projects.updatedAt))
      .limit(50),
    db
      .select()
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "accepted"),
          or(eq(friendRequests.fromId, userId), eq(friendRequests.toId, userId))
        )
      ),
    // Друзья текущего пользователя — для подсчёта общих с профилем.
    db
      .select()
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "accepted"),
          or(eq(friendRequests.fromId, me.id), eq(friendRequests.toId, me.id))
        )
      ),
    // Заявки между мной и профилем — чтобы показать «В друзья/Заявка отправлена».
    db
      .select()
      .from(friendRequests)
      .where(
        or(
          and(eq(friendRequests.fromId, me.id), eq(friendRequests.toId, userId)),
          and(eq(friendRequests.fromId, userId), eq(friendRequests.toId, me.id))
        )
      )
      .limit(1),
  ]);

  const p = profileRows[0];
  const friendsCount = friendAccepted.length;
  const statsRowsCount = statsRows.length;

  const isSelf = me.id === userId;
  const relation = relationRows[0];
  let isFriend = isSelf;
  let friendRequest: "none" | "pending_out" | "pending_in" | "accepted" = "none";
  if (relation) {
    if (relation.status === "accepted") {
      isFriend = true;
      friendRequest = "accepted";
    } else if (relation.status === "pending") {
      friendRequest = relation.fromId === me.id ? "pending_out" : "pending_in";
    }
  }

  // Общие друзья = пересечение друзей профиля и моих друзей.
  const myFriendIds = new Set<number>();
  myFriends.forEach((r) => myFriendIds.add(r.fromId === me.id ? r.toId : r.fromId));
  const mutualIds = isSelf
    ? []
    : friendAccepted
        .map((r) => (r.fromId === userId ? r.toId : r.fromId))
        .filter((peerId) => myFriendIds.has(peerId));

  // Полный список друзей профиля (для таба «Друзья» на странице).
  const profileFriendIds = friendAccepted.map((r) => (r.fromId === userId ? r.toId : r.fromId));
  const profileFriendRows =
    profileFriendIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, profileFriendIds))
      : [];
  const profileFriendMap = new Map(profileFriendRows.map((row) => [row.id, row]));
  const friendsList = profileFriendIds
    .map((peerId) => profileFriendMap.get(peerId))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => ({ id: row.id, name: row.name, avatarColor: row.avatarColor }));

  const mutualRows =
    mutualIds.length > 0 ? await db.select().from(users).where(inArray(users.id, mutualIds)) : [];
  const mutualMap = new Map(mutualRows.map((row) => [row.id, row]));
  const mutualFriends = mutualIds
    .map((peerId) => mutualMap.get(peerId))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => ({ id: row.id, name: row.name, avatarColor: row.avatarColor }));

  const totalPlays = statsRows.reduce((s, r) => s + r.count, 0);
  const totalCoins = statsRows.reduce((s, r) => s + r.totalCoins, 0);
  const totalDeaths = statsRows.reduce((s, r) => s + r.totalDeaths, 0);
  const totalTimeSec = statsRows.reduce((s, r) => s + r.totalTimeSec, 0);
  const wins = statsRows.reduce((s, r) => s + r.wins, 0);

  // Та же формула уровня, что и в лаунчере (без favorites — они локальные).
  const xp = totalPlays * 120 + friendsCount * 150;
  const level = Math.floor(xp / 500) + 1;

  const live = socialStore.getPresence(userId);
  const session = socialStore.getSessionForUser(userId);

  return apiJson({
    profile: {
      id: u.id,
      name: u.name,
      avatarColor: u.avatarColor,
      handle: p?.handle || `@${u.name.toLowerCase().replace(/\s+/g, "_")}`,
      bio: p?.bio || "",
      coverStyle: p?.coverStyle || "emerald",
      statusQuote: p?.statusQuote || "",
      joinedAt: new Date(u.createdAt).getTime(),
      status: live?.status ?? "offline",
      session: session
        ? {
            id: session.id,
            code: session.code,
            placeId: session.placeId,
            placeTitle: session.placeTitle,
          }
        : null,
      stats: {
        totalPlays,
        gamesPlayed: statsRowsCount,
        friends: friendsCount,
        totalCoins,
        totalDeaths,
        totalTimeSec,
        wins,
        playedGames: statsRows.map((r) => ({
          gameId: r.gameId,
          count: r.count,
          lastPlayedAt: r.lastPlayedAt,
          totalCoins: r.totalCoins,
          totalDeaths: r.totalDeaths,
          totalTimeSec: r.totalTimeSec,
          bestStage: r.bestStage,
          wins: r.wins,
        })),
      },
      level: { level, xp, currentXp: xp % 500, maxXp: 500 },
      isFriend,
      friendRequest,
      mutualFriends,
      friendsList,
      /** Карты, созданные этим игроком в студии (только опубликованные).
       *  На профиле — секция «Карты создателя»: превью, жанр, счётчики,
       *  состояние лайка для текущего зрителя. */
      creatorProjects: creatorProjectRows.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail,
        genre: project.genre,
        version: project.version,
        viewsCount: project.viewsCount,
        likesCount: project.likesCount,
        updatedAt: new Date(project.updatedAt).getTime(),
        likedByMe: myLikedProjectIds.has(project.id),
      })),
    },
  });
}
