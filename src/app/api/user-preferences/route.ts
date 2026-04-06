import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongoServer";

export type UserPreferences = {
  layout: "grid" | "list";
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  website?: string;
  logo?: string;
};

const defaultPrefs: UserPreferences = { layout: "grid" };

export async function GET() {
  try {
    const db = await getDb();
    const prefs = await db.collection("user_preferences").findOne({});
    return NextResponse.json({ ...defaultPrefs, ...prefs });
  } catch (error) {
    console.error("Preferences fetch error:", error);
    return NextResponse.json(defaultPrefs, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<UserPreferences>;
    const merged = { ...defaultPrefs, ...body } as UserPreferences;

    const db = await getDb();
    await db.collection("user_preferences").replaceOne(
      {},
      merged,
      { upsert: true }
    );

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Preferences save error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}