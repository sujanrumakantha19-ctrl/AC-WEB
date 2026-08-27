import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ACWEB";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const query = {
    $or: [
      { email: "test@gmail.com" },
      { phone: { $regex: "9902262397" } }
    ]
  };

  const found = await db.collection("users").find(query).toArray();
  console.log(`Found ${found.length} user(s):`);
  found.forEach(u => console.log(`  - ${u.name} | ${u.email} | ${u.phone} | ${u.cusId}`));

  if (found.length > 0) {
    const result = await db.collection("users").deleteMany(query);
    console.log(`Deleted ${result.deletedCount} user(s).`);
  } else {
    console.log("No matching users found.");
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
