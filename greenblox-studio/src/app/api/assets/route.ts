import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(assets).orderBy(desc(assets.createdAt));
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db.insert(assets).values({
      name: body.name || "Imported Asset",
      type: body.type || "model",
      category: body.category || "General",
      thumbnail: body.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop",
      author: body.author || "Studio User",
      fileSize: body.fileSize || 512,
      data: body.data || { optimized: true, compression: "WEBP+DRACO", lodsGenerated: true },
      isOptimized: true,
      hasLODs: true
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
