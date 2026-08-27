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
  const query = {
    $or: [
      { phone: { $regex: "9902262397" } },
      { email: "test@gmail.com" }
    ]
  };

  const usersToDelete = await usersCollection.find(query).toArray();
  console.log(`Found ${usersToDelete.length} user(s) matching criteria:`);
  usersToDelete.forEach((u) => {
    console.log(`- ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone} | cusId: ${u.cusId}`);
  });

  if (usersToDelete.length > 0) {
    const result = await usersCollection.deleteMany(query);
    console.log(`Successfully deleted ${result.deletedCount} user record(s) from Contabo MongoDB database.`);
  } else {
    console.log("No matching user records found to delete.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
