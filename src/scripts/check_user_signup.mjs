import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ACWEB";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const users = await db.collection("users").find({ email: /test/i }).sort({ createdAt: -1 }).toArray();
  console.log("Found users matching /test/i:", users.length);
  users.forEach((u) => {
    console.log(`- ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone} | cusId: ${u.cusId} | groupLinkSent: ${u.whatsAppGroupLinkSent} | group: ${u.whatsAppGroup}`);
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
