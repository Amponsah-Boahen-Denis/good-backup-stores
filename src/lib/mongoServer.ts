import { MongoClient } from "mongodb";

declare global {
   
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  // In production you should set MONGODB_URI in environment; on dev we allow missing.
}

function createClient() {
  if (!uri) throw new Error("MONGODB_URI is not defined");
  return new MongoClient(uri);
}

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!global.__mongoClientPromise) {
    const client = createClient();
    global.__mongoClientPromise = client.connect();
  }
  return global.__mongoClientPromise;
};

export async function getDb(dbName?: string) {
  const client = await getMongoClient();
  return client.db(dbName || process.env.MONGODB_DB || "my_best_db");
}
