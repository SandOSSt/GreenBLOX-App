import { NextResponse } from "next/server";
import { db } from "@/db";
import { enginePlugins } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const plugins = await db.select().from(enginePlugins).orderBy(desc(enginePlugins.createdAt));
    return NextResponse.json(plugins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db.insert(enginePlugins).values({
      name: body.name || "Custom Plugin",
      description: body.description || "Extended tool for GreenBlox Studio.",
      version: body.version || "1.0.0",
      author: body.author || "Studio Developer",
      targetSystem: body.targetSystem || "Editor",
      isActiveByDefault: true,
      uiHooks: body.uiHooks || { buttonText: "Execute Tool", tooltip: "Custom plugin command" },
      executionCode: body.executionCode || `print("[Plugin] Custom plugin executed.")`,
      icon: body.icon || "Wrench"
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
