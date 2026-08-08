import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://Sudexhub:Sudexhub2026@cluster0.ivs0qfk.mongodb.net/ACWEB";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  phone: String,
  accountType: { type: String, enum: ["individual", "dealer"] },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "admin@gmail.com" });
  if (existing) {
    console.log("Admin already exists, updating password...");
    existing.password = bcrypt.hashSync("12345678", 10);
    await existing.save();
    console.log("Admin password updated");
  } else {
    await User.create({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: bcrypt.hashSync("12345678", 10),
      phone: "+91 9999999999",
      accountType: "individual",
      role: "admin",
    });
    console.log("Admin account created");
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
