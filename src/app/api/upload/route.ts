import { NextRequest } from "next/server";
import { badRequest, handleError } from "@/lib/api-helpers";
import { saveImage, imageUrl } from "@/lib/gridfs";

const MAX_SIZE = 10 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return badRequest("No file provided");
    }
    if (!file.type || !file.type.startsWith("image/")) {
      return badRequest("Only image files are allowed");
    }
    if (file.size > MAX_SIZE) {
      return badRequest("Image must be 10MB or smaller");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = MIME_TO_EXT[file.type] || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const id = await saveImage(buffer, file.type, filename);

    return Response.json({ url: imageUrl(id) });
  } catch (error) {
    return handleError(error, "Upload failed");
  }
}