import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://Sudexhub:Sudexhub2026@cluster0.ivs0qfk.mongodb.net/ACWEB";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("ACWEB");
    const hashedPassword = await bcrypt.hash("12345678", 10);
    
    const result = await db.collection("users").updateOne(
      { email: "admin@gmail.com" },
      {
        $set: {
          name: "Super Admin",
          email: "admin@gmail.com",
          password: hashedPassword,
          role: "admin",
          phone: "+91 9999999999",
          accountType: "individual",
          kycVerified: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    console.log("SUCCESS: Admin user admin@gmail.com created/updated in database ACWEB!");
    const user = await db.collection("users").findOne({ email: "admin@gmail.com" });
    console.log("Verified in ACWEB:", { email: user.email, role: user.role, name: user.name });
  } finally {
    await client.close();
  }
}

run().catch(console.error);
