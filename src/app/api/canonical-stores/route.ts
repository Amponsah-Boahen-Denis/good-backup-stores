import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongoServer";

export type CanonicalStore = {
  id: string;
  name: string;
  country?: string;
  address?: string;
  lat: number;
  lon: number;
  contact?: { phone?: string | null; email?: string | null; website?: string | null };
  category?: string | null;
  tags?: string[];
  providers?: { source: "osm" | "google"; externalId?: string; fetchedAt: number }[];
  createdAt: number;
  updatedAt: number;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json({ error: "Store IDs are required" }, { status: 400 });
    }

    const idArray = ids.split(",").filter(Boolean);
    const db = await getDb();
    // @ts-ignore - MongoDB WithId<Document> to CanonicalStore cast
    const stores = await db.collection("canonical_stores")
      .find({ id: { $in: idArray } })
      .toArray() as unknown as CanonicalStore[];

    // Convert to a map for easy lookup
    const storeMap: Record<string, CanonicalStore> = {};
    stores.forEach(store => {
      // @ts-ignore - MongoDB WithId<Document> to CanonicalStore cast
      storeMap[store.id] = store as unknown as CanonicalStore;
    });

    return NextResponse.json(storeMap);
  } catch (error) {
    console.error("Canonical stores fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const stores = await req.json() as CanonicalStore[];

    if (!Array.isArray(stores)) {
      return NextResponse.json({ error: "Expected array of stores" }, { status: 400 });
    }

    const db = await getDb();

    // Use bulk write for efficiency
    const operations = stores.map(store => ({
      replaceOne: {
        filter: { id: store.id },
        replacement: store,
        upsert: true
      }
    }));

    const result = await db.collection("canonical_stores").bulkWrite(operations);

    return NextResponse.json({
      success: true,
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Canonical stores save error:", error);
    return NextResponse.json({ error: "Failed to save stores" }, { status: 500 });
  }
}