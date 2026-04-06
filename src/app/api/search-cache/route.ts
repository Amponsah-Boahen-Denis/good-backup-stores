import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongoServer";

export type SearchSnapshot = {
  key: string;
  query: { product: string; category?: string[] | null; country?: string; lat?: number; lon?: number; radiusMeters: number };
  storeIds: string[];
  totalCount: number;
  source: "db" | "provider" | "mixed";
  createdAt: number;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Cache key is required" }, { status: 400 });
    }

    const db = await getDb();
    const snapshot = await db.collection("search_cache").findOne({ key });

    if (!snapshot) {
      return NextResponse.json(null);
    }

    // Check if expired (30 minutes TTL)
    const ttl = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - snapshot.createdAt > ttl) {
      // Clean up expired entry
      await db.collection("search_cache").deleteOne({ key });
      return NextResponse.json(null);
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Search cache fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cache" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const snapshot = await req.json() as SearchSnapshot;

    const db = await getDb();
    await db.collection("search_cache").replaceOne(
      { key: snapshot.key },
      snapshot,
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search cache save error:", error);
    return NextResponse.json({ error: "Failed to save cache" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    // Clean up expired entries (older than 30 minutes)
    const ttl = 30 * 60 * 1000; // 30 minutes
    const cutoff = Date.now() - ttl;

    const result = await db.collection("search_cache").deleteMany({
      createdAt: { $lt: cutoff }
    });

    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Search cache cleanup error:", error);
    return NextResponse.json({ error: "Failed to cleanup cache" }, { status: 500 });
  }
}