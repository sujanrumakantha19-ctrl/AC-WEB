import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose | null> | null } = {
  conn: null,
  promise: null,
};

async function dbConnect(): Promise<typeof mongoose | null> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then((m) => m).catch((err) => {
      console.error("MongoDB connection error:", err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.conn = null;
  }
  return cached.conn;
}

export default dbConnect;
