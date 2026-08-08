import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { badRequest, handleError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return badRequest("No file provided");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(filepath, buffer);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (error) {
    return handleError(error, "Upload failed");
  }
}
