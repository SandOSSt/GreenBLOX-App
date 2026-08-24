import { NextResponse } from "next/server";
import { db } from "@/db";
import { packagesRegistry } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const pkgs = await db.select().from(packagesRegistry).orderBy(desc(packagesRegistry.downloads));
    return NextResponse.json(pkgs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inserted = await db.insert(packagesRegistry).values({
      packageName: body.packageName || `@greenblox/module-${Date.now()}`,
      displayName: body.displayName || "Custom Package",
      version: body.version || "1.0.0",
      description: body.description || "A community published script library.",
      author: body.author || "Community Engineer",
      category: body.category || "General",
      downloads: 1,
      sourceCode: body.sourceCode || "-- Empty module",
      documentation: body.documentation || "# Custom Package\nDocumentation pending.",
      dependencies: body.dependencies || []
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
