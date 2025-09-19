import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import SuperAdminOverViewContainer from "./_components/super-admin-overview/super-admin-overview-container";

async function getAllCollectionStats() {
  // 1. Get all collections
  const collections = (await prisma.$runCommandRaw({
    listCollections: 1,
    nameOnly: true,
  })) as { cursor: { firstBatch: { name: string }[] } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allStats: any[] = [];

  // 2. Loop through collections and get stats
  for (const coll of collections.cursor.firstBatch) {
    const stats = await prisma.$runCommandRaw({
      collStats: coll.name,
    });

    allStats.push({
      name: coll.name,
      count: stats.count,
      size: stats.size, // in bytes
      storageSize: stats.storageSize, // in bytes
    });
  }

  return allStats;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function Home() {
  const cu = await auth();

  if (!cu || !cu.user || !cu.user.id) redirect("/login");

  const role = cu.user.role;

  const storage = await getAllCollectionStats();
  const formatted = storage.map((coll) => ({
    name: coll.name,
    count: coll.count,
    size: formatBytes(coll.size), // readable data size
    storageSize: formatBytes(coll.storageSize), // allocated storage
  }));

  console.log(formatted);

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return <SuperAdminOverViewContainer />;
  }
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Button asChild>
        <Link href="/registration">Get Started</Link>
      </Button>
    </div>
  );
}
