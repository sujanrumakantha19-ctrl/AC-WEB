import mongoose from "mongoose";
import { GridFSBucket, ObjectId, type GridFSBucketWriteStreamOptions } from "mongodb";
import dbConnect from "@/lib/db";

let cachedBucket: GridFSBucket | null = null;

export function getGridFSBucket(): GridFSBucket {
  if (cachedBucket) return cachedBucket;
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not ready");
  cachedBucket = new GridFSBucket(db);
  return cachedBucket;
}

export function imageUrl(id: string | ObjectId): string {
  return `/api/images/${String(id)}`;
}

export function imageIdFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = String(url).match(/\/api\/images\/([0-9a-fA-F]{24})/);
  return match ? match[1] : null;
}

export async function saveImage(
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<ObjectId> {
  await dbConnect();
  const bucket = getGridFSBucket();
  const id = new ObjectId();

  const options: GridFSBucketWriteStreamOptions = {
    contentType,
    metadata: { originalName: filename },
  };

  return new Promise<ObjectId>((resolve, reject) => {
    const stream = bucket.openUploadStreamWithId(id, filename, options);
    stream.on("error", reject);
    stream.on("finish", () => resolve(id));
    stream.end(buffer);
  });
}

export async function deleteImage(id: string | ObjectId): Promise<boolean> {
  try {
    await dbConnect();
    const bucket = getGridFSBucket();
    await bucket.delete(new ObjectId(id));
    return true;
  } catch {
    return false;
  }
}