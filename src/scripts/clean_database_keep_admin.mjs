import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ACWEB";
  console.log("Connecting to MongoDB at:", uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log("\n=== Found Collections ===");
  collections.forEach(c => console.log(`- ${c.name}`));

  // 1. Inspect users collection
  const adminUsers = await db.collection("users").find({
    $or: [
      { role: "admin" },
      { role: "superadmin" },
      { email: "shenbagamoorthy031@gmail.com" }
    ]
  }).toArray();

  console.log(`\n=== Preserving ${adminUsers.length} Admin User(s) ===`);
  adminUsers.forEach(u => console.log(`  Keep: ${u.name} (${u.email}) | Role: ${u.role} | ID: ${u._id}`));

  if (adminUsers.length === 0) {
    console.error("CRITICAL ERROR: No admin user found! Aborting deletion to prevent locking out admin.");
    await mongoose.disconnect();
    process.exit(1);
  }

  // Delete all non-admin users
  const deleteUsersResult = await db.collection("users").deleteMany({
    _id: { $nin: adminUsers.map(u => u._id) }
  });
  console.log(`\nDeleted ${deleteUsersResult.deletedCount} non-admin user(s) from 'users'.`);

  // Delete documents from all other collections except 'users' and system collections
  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName === "users" || colName.startsWith("system.")) {
      continue;
    }
    const result = await db.collection(colName).deleteMany({});
    console.log(`Cleared collection '${colName}': deleted ${result.deletedCount} document(s).`);
  }

  console.log("\n=== Database Cleanup Completed Successfully! ===");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
