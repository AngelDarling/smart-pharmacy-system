import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function simpleMigrate() {
  try {
    console.log("🚀 Starting simple migration...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB
    });
    console.log("✅ Connected");
    
    const User = mongoose.connection.collection('users');
    const Staff = mongoose.connection.collection('staffs');
    const Customer = mongoose.connection.collection('customers');
    
    // Get all users
    const users = await User.find({}).toArray();
    console.log(`\n📊 Found ${users.length} users`);
    
    let staffMigrated = 0;
    let customerMigrated = 0;
    let errors = [];
    
    for (const user of users) {
      try {
        const isStaff = ['staff', 'admin', 'manager', 'pharmacist'].includes(user.role);
        
        if (isStaff) {
          // Check if already exists
          const existing = await Staff.findOne({ _id: user._id });
          if (existing) {
            console.log(`⚠️  Staff already exists: ${user.name}`);
            continue;
          }
          
          // Migrate to staff
          const staffData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive !== undefined ? user.isActive : true,
            employeeId: user.employeeId,
            department: user.department,
            position: user.position,
            hireDate: user.hireDate,
            salary: user.salary,
            permissions: user.permissions || [],
            avatar: user.avatar,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount || 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          await Staff.insertOne(staffData);
          staffMigrated++;
          console.log(`✅ Migrated staff: ${user.name} (${user.role})`);
          
        } else {
          // Check if already exists
          const existing = await Customer.findOne({ _id: user._id });
          if (existing) {
            console.log(`⚠️  Customer already exists: ${user.name}`);
            continue;
          }
          
          // Migrate to customer
          const customerData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive !== undefined ? user.isActive : true,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount || 0,
            loyaltyPoints: user.loyaltyPoints || 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          await Customer.insertOne(customerData);
          customerMigrated++;
          console.log(`✅ Migrated customer: ${user.name}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating ${user.name}:`, error.message);
        errors.push({ name: user.name, error: error.message });
      }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total users: ${users.length}`);
    console.log(`✅ Staff migrated: ${staffMigrated}`);
    console.log(`✅ Customers migrated: ${customerMigrated}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log("\n⚠️  Errors:");
      errors.forEach(err => console.log(`  - ${err.name}: ${err.error}`));
    }
    
    // Final counts
    const finalStaff = await Staff.countDocuments();
    const finalCustomers = await Customer.countDocuments();
    console.log(`\n📈 Final counts:`);
    console.log(`  Staff: ${finalStaff}`);
    console.log(`  Customers: ${finalCustomers}`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Done");
  }
}

simpleMigrate();
