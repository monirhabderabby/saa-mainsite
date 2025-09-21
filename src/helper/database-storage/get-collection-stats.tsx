import { getMongoDb } from "@/lib/mongodb";

export async function getCollectionStats(collectionName: string) {
  const db = await getMongoDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = db.collection<Document>(collectionName) as any; // TS won't complain
  const stats = await collection.stats();
  return stats;
}
