import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Parse .env.local directly
let uri = process.env.MONGODB_URI;
if (!uri) {
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
    const match = envContent.match(/^MONGODB_URI=(.*)$/m);
    if (match) uri = match[1].trim();
  } catch (e) {}
}

if (!uri) {
  uri = 'mongodb://127.0.0.1:27017/ACWEB';
}

async function run() {
  console.log('Connecting to MongoDB uri:', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // 1. List and truncate all collections in the database
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    console.log(`Truncating collection: ${col.name}...`);
    await db.collection(col.name).deleteMany({});
  }

  // 2. Import User model schema or bcrypt password hashing
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.default.hash('Kali@4921', 10);

  // 3. Seed new primary Admin account
  const usersColl = db.collection('users');
  const newAdmin = {
    name: 'VKS Admin',
    email: 'shenbagamoorthy031@gmail.com',
    password: hashedPassword,
    role: 'admin',
    cusId: 'ADM-1001',
    phone: '916369455056',
    accountType: 'individual',
    kycVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await usersColl.insertOne(newAdmin);
  console.log(`\nSuccessfully created fresh Admin user (ID: ${insertResult.insertedId})`);

  // 4. Initialize default platform settings
  const settingsColl = db.collection('settings');
  await settingsColl.insertMany([
    { key: 'registrationFee', value: '5000', createdAt: new Date(), updatedAt: new Date() },
    { key: 'specialRules', value: 'Welcome to VKS Autoservices Auction Portal.', createdAt: new Date(), updatedAt: new Date() },
  ]);

  const remainingUsers = await usersColl.find({}).toArray();
  console.log('\n--- CURRENT USERS IN DATABASE ---');
  remainingUsers.forEach(u => console.log(`- ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | CusId: ${u.cusId}`));

  await mongoose.disconnect();
  console.log('\nDatabase completely truncated and fresh Admin seeded successfully!');
}

run().catch(err => {
  console.error('Error during database wipe and seed:', err);
  process.exit(1);
});
