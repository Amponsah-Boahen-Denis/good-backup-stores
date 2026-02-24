/**
 * Simple migration script to import a JSON file of stores into MongoDB.
 * Usage: set MONGODB_URI (and optional MONGODB_DB), then:
 *   node scripts/migrate-local.js data/local_stores.json
 */

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI must be set in environment");
    process.exit(1);
  }
  const file = process.argv[2] || "data/local_stores.json";
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.error(`File not found: ${full}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(full, "utf8");
  let items;
  try {
    items = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON file", err);
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "my_best_db");
  const coll = db.collection("stores");

  if (!Array.isArray(items)) {
    console.error("Expected an array of store objects");
    process.exit(1);
  }

  const ops = items.map((it) => ({ insertOne: { document: it } }));
  const res = await coll.bulkWrite(ops);
  console.log(`Inserted ${res.insertedCount || items.length} documents.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
