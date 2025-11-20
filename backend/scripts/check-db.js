import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Simple check script
async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB
    });
    
    console.log("✅ Connected to database");
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📊 Collections:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Count documents in each collection
    const User = mongoose.connection.collection('users');
    const Staff = mongoose.connection.collection('staffs');
    const Customer = mongoose.connection.collection('customers');
    
    const userCount = await User.countDocuments();
    const staffCount = await Staff.countDocuments();
    const customerCount = await Customer.countDocuments();
    
    console.log("\n📈 Document counts:");
    console.log(`  Users: ${userCount}`);
    console.log(`  Staff: ${staffCount}`);
    console.log(`  Customers: ${customerCount}`);
    
    // Show some users
    if (userCount > 0) {
      console.log("\n👥 Sample users:");
      const users = await User.find({}).limit(5).toArray();
      users.forEach(u => {
        console.log(`  - ${u.name} (${u.role}) - ${u.email || u.phone}`);
      });
    }
    
    // Show some staff
    if (staffCount > 0) {
      console.log("\n👔 Sample staff:");
      const staff = await Staff.find({}).limit(5).toArray();
      staff.forEach(s => {
        console.log(`  - ${s.name} (${s.role}) - ${s.email || s.phone}`);
      });
    }
    
    // Show some customers
    if (customerCount > 0) {
      console.log("\n🛒 Sample customers:");
      const customers = await Customer.find({}).limit(5).toArray();
      customers.forEach(c => {
        console.log(`  - ${c.name} - ${c.email || c.phone} (${c.loyaltyPoints || 0} points)`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected");
  }
}

checkDatabase();
