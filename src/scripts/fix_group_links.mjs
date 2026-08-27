import mongoose from "mongoose";

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ACWEB");
  const db = mongoose.connection.db;

  const groups = await db.collection("whatsappgroups").find({}).toArray();
  console.log("Before fix:");
  groups.forEach(g => console.log(`  Link: ${g.link}`));

  // Strip query string from all group links — Meta bans ? and & in template body params
  for (const g of groups) {
    const cleanLink = g.link ? g.link.split("?")[0] : g.link;
    if (cleanLink !== g.link) {
      await db.collection("whatsappgroups").updateOne(
        { _id: g._id },
        { $set: { link: cleanLink } }
      );
      console.log(`Updated group "${g.name}": ${g.link} -> ${cleanLink}`);
    } else {
      console.log(`Group "${g.name}" link already clean: ${g.link}`);
    }
  }

  console.log("\nAfter fix:");
  const updated = await db.collection("whatsappgroups").find({}).toArray();
  updated.forEach(g => console.log(`  Link: ${g.link}`));

  await mongoose.disconnect();
}
main().catch(console.error);
