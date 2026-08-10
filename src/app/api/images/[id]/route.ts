import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { notFound } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import { getGridFSBucket } from "@/lib/gridfs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    let fileId: ObjectId;
    try {
      fileId = new ObjectId(id);
    } catch {
      return notFound("Image not found");
    }

    const bucket = getGridFSBucket();

    const [file] = await bucket.find({ _id: fileId }).limit(1).toArray();
    if (!file) return notFound("Image not found");

    const stream = bucket.openDownloadStream(fileId);

    const headers = new Headers();
    headers.set("Content-Type", (file.contentType as string) || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("X-Content-Type-Options", "nosniff");

    const response = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)));
        stream.on("error", (err) => controller.error(err));
        stream.on("end", () => controller.close());
      },
    });

    return new Response(response, { headers });
  } catch {
    return notFound("Image not found");
  }
}