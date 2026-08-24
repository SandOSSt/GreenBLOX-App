import { NextResponse } from "next/server";
import { db } from "@/db";
import { multiplayerSessions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(multiplayerSessions).orderBy(desc(multiplayerSessions.currentPlayers));
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db.insert(multiplayerSessions).values({
      projectId: body.projectId || 1,
      serverName: body.serverName || `Dedicated Server #${Math.floor(Math.random() * 99 + 10)}`,
      maxPlayers: body.maxPlayers || 16,
      currentPlayers: body.currentPlayers || 1,
      tickRate: body.tickRate || 60,
      region: body.region || "US-East",
      serverType: body.serverType || "Dedicated",
      status: "In-Game"
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
