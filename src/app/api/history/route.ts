import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongoServer";

export type SearchHistoryItem = {
  id: string;
  product: string;
  country: string;
  location: string;
  resultsCount: number;
  createdAt: number;
};

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("search_history")
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json(items);
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<SearchHistoryItem, "id" | "createdAt">;
    const now = Date.now();
    const record: SearchHistoryItem = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: now,
    };

    const db = await getDb();

    // Insert new record
    await db.collection("search_history").insertOne(record);

    // Keep only the latest 50 records
    const allRecords = await db.collection("search_history")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    if (allRecords.length > 50) {
      const toDelete = allRecords.slice(50).map(item => item._id);
      await db.collection("search_history").deleteMany({ _id: { $in: toDelete } });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("History save error:", error);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.collection("search_history").deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History clear error:", error);
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}