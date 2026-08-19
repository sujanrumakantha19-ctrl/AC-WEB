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

  const usersColl = db.collection('users');
  const allUsers = await usersColl.find({}).toArray();
  console.log('--- ALL USERS BEFORE TRUNCATE ---');
  allUsers.forEach(u => console.log(`- ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | CusId: ${u.cusId}`));

  // Delete all users except admin
  const deleteResult = await usersColl.deleteMany({
    role: { $ne: 'admin' },
    email: { $ne: 'admin@gmail.com' }
  });
  console.log(`\nDeleted ${deleteResult.deletedCount} non-admin users.`);

  // Also clean test payments and notifications from non-admin users
  const paymentsColl = db.collection('payments');
  const notificationsColl = db.collection('notifications');

  const adminUsers = await usersColl.find({ role: 'admin' }).toArray();
  const adminIds = adminUsers.map(a => a._id);

  const delPayments = await paymentsColl.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${delPayments.deletedCount} test payment records.`);

  const delNotifs = await notificationsColl.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${delNotifs.deletedCount} test notification records.`);

  const remainingUsers = await usersColl.find({}).toArray();
  console.log('\n--- REMAINING USERS IN DATABASE ---');
  remainingUsers.forEach(u => console.log(`- ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | CusId: ${u.cusId}`));

  await mongoose.disconnect();
  console.log('Cleanup complete!');
}

run().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
