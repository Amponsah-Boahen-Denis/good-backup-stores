import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongoServer";

type StoreRecord = {
  id: string;
  name: string;
  country: string;
  address: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: number;
  updatedAt: number;
};

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("stores").find().sort({ updatedAt: -1 }).toArray();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to list stores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<StoreRecord>;
    const now = Date.now();
    const record: Partial<StoreRecord> = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };
    const db = await getDb();
    const res = await db.collection("stores").insertOne(record);
    const inserted = await db.collection("stores").findOne({ _id: res.insertedId });
    return NextResponse.json(inserted);
  } catch {
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<StoreRecord>;
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    const updated = { ...rest, updatedAt: Date.now() };
    await db.collection("stores").updateOne({ id }, { $set: updated }, { upsert: false });
    const item = await db.collection("stores").findOne({ id });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    await db.collection("stores").deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
  }
}
