import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";

const es = initEdgeStore.create();

/**
 * This is the main router for the EdgeStore buckets.
 */
const edgeStoreRouter = es.router({
  profilePhotos: es.fileBucket({
    maxSize: 1024 * 1024, // 1 MB
    accept: [
      "image/png",
      "image/jpeg", // covers both .jpg and .jpeg
      "image/webp",
    ],
  }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
