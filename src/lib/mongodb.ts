import { Db, MongoClient } from "mongodb";

let client: MongoClient;
let db: Db;

export async function getMongoDb(): Promise<Db> {
  if (!client) {
    client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    db = client.db(); // use DB from connection string
  }
  return db;
}
