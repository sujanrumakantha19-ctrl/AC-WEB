import mongoose from "mongoose";

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ACWEB");
  const db = mongoose.connection.db;

  const groups = await db.collection("whatsappgroups").find({}).toArray();
  console.log("=== WhatsApp Groups ===");
  groups.forEach(g => {
    console.log(`- ID: ${g._id} | Name: ${g.name} | Status: ${g.status} | Link: ${g.link} | Members: ${g.members}/${g.capacity}`);
  });

  await mongoose.disconnect();
}
main().catch(console.error);
