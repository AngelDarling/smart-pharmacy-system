/**
 * Migration Script: User to Staff and Customer
 * 
 * This script migrates data from the old User model to the new Staff and Customer models.
 * 
 * Run this script once after deploying the new models:
 * node backend/scripts/migrate-users.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Customer, { PointHistory } from "../models/Customer.js";

async function migrateUsers() {
  try {
    console.log("🚀 Starting user migration...");
    console.log("Connecting to database:", process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB
    });
    
    console.log("✅ Connected to database");
    
    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users to migrate`);
    
    let staffCount = 0;
    let customerCount = 0;
    let errors = [];
    
    for (const user of users) {
      try {
        // Determine if staff or customer
        const isStaff = ['staff', 'admin', 'manager', 'pharmacist'].includes(user.role);
        
        if (isStaff) {
          // Migrate to Staff
          const staffData = {
            _id: user._id, // Keep the same ID
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            employeeId: user.employeeId,
            department: user.department,
            position: user.position,
            hireDate: user.hireDate,
            salary: user.salary,
            permissions: user.permissions,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          // Check if already exists
          const existing = await Staff.findById(user._id);
          if (existing) {
            console.log(`⚠️  Staff already exists: ${user.name} (${user.email || user.phone})`);
          } else {
            await Staff.create(staffData);
            staffCount++;
            console.log(`✅ Migrated staff: ${user.name} (${user.role})`);
          }
        } else {
          // Migrate to Customer
          const customerData = {
            _id: user._id, // Keep the same ID
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            avatar: user.avatar,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount,
            loyaltyPoints: user.loyaltyPoints || 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          // Check if already exists
          const existing = await Customer.findById(user._id);
          if (existing) {
            console.log(`⚠️  Customer already exists: ${user.name} (${user.email || user.phone})`);
          } else {
            await Customer.create(customerData);
            customerCount++;
            console.log(`✅ Migrated customer: ${user.name}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error migrating user ${user.name}:`, error.message);
        errors.push({ user: user.name, error: error.message });
      }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total users: ${users.length}`);
    console.log(`✅ Staff migrated: ${staffCount}`);
    console.log(`✅ Customers migrated: ${customerCount}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach(err => {
        console.log(`  - ${err.user}: ${err.error}`);
      });
    }
    
    // Validate migration
    console.log("\n🔍 Validating migration...");
    const staffInDb = await Staff.countDocuments();
    const customersInDb = await Customer.countDocuments();
    console.log(`Staff in database: ${staffInDb}`);
    console.log(`Customers in database: ${customersInDb}`);
    
    if (staffInDb + customersInDb === users.length - errors.length) {
      console.log("✅ Migration validation successful!");
    } else {
      console.log("⚠️  Warning: Numbers don't match. Please verify manually.");
    }
    
    console.log("\n✨ Migration complete!");
    console.log("Note: The old 'users' collection has been kept for backup.");
    console.log("You can manually delete it after verifying the migration.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from database");
  }
}

// Run migration
migrateUsers()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
