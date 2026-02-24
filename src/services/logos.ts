import { getDb } from "@/lib/mongoServer";
import { ObjectId } from "mongodb";

export type Logo = {
  _id?: ObjectId;
  userId: string;
  filename: string;
  mimeType: string;
  data: string; // base64
  createdAt: number;
  updatedAt: number;
};

/**
 * Save a logo to MongoDB
 */
export async function saveLogo(
  userId: string,
  filename: string,
  mimeType: string,
  base64Data: string
): Promise<string> {
  const db = await getDb();
  const collection = db.collection<Logo>("logos");

  const doc: Logo = {
    userId,
    filename,
    mimeType,
    data: base64Data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const result = await collection.insertOne(doc);
  return result.insertedId.toHexString();
}

/**
 * Get user's logo
 */
export async function getUserLogo(userId: string): Promise<Logo | null> {
  const db = await getDb();
  const collection = db.collection<Logo>("logos");

  const logo = await collection.findOne({ userId });
  return logo || null;
}

/**
 * Get logo by ID
 */
export async function getLogoById(logoId: string): Promise<Logo | null> {
  const db = await getDb();
  const collection = db.collection<Logo>("logos");

  try {
    const logo = await collection.findOne({ _id: new ObjectId(logoId) });
    return logo || null;
  } catch {
    return null;
  }
}

/**
 * Delete user's logo
 */
export async function deleteLogo(userId: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection<Logo>("logos");

  await collection.deleteOne({ userId });
}

/**
 * Update logo (replace old with new)
 */
export async function updateLogo(
  userId: string,
  filename: string,
  mimeType: string,
  base64Data: string
): Promise<string> {
  // Delete old logo
  await deleteLogo(userId);

  // Save new logo
  return saveLogo(userId, filename, mimeType, base64Data);
}
