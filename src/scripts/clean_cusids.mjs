import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ACWEB";
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  const usersCollection = db.collection("users");
  const users = await usersCollection.find({ role: "user" }).sort({ createdAt: 1 }).toArray();

  let seq = 1;
  const suffix = "826";

  for (const user of users) {
    const cleanId = `CUS-${seq}${suffix}`;
    await usersCollection.updateOne({ _id: user._id }, { $set: { cusId: cleanId } });
    console.log(`Updated user ${user.name} (${user.email || ""}) -> ${cleanId}`);
    seq++;
  }

  console.log("Database Customer IDs cleaned up successfully!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
