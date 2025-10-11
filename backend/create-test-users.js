/**
 * Create test users with different permissions
 * Run: node create-test-users.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestUsers = async () => {
  try {
    console.log('🚀 Creating test users with different permissions...\n');

    // Clear existing test users first
    await User.deleteMany({
      $or: [
        { email: { 
          $in: [
            'manager@pharmacy.com',
            'pharmacist@pharmacy.com', 
            'staff@pharmacy.com',
            'limited@pharmacy.com'
          ]
        }},
        { employeeId: { 
          $in: ['EMP001', 'EMP002', 'EMP003', 'EMP004']
        }}
      ]
    });
    console.log('✅ Cleared existing test users');

    // Manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = new User({
      name: 'Nguyễn Văn Manager',
      email: 'manager@pharmacy.com',
      phone: '0901234567',
      passwordHash: managerPassword,
      role: 'manager',
      isActive: true,
      employeeId: 'EMP001',
      department: 'Quản lý',
      position: 'Quản lý cửa hàng',
      hireDate: new Date('2023-01-15'),
      salary: 15000000,
      permissions: [
        'read_products',
        'write_products',
        'read_categories',
        'write_categories',
        'read_inventory',
        'write_inventory',
        'read_orders',
        'write_orders',
        'manage_staff'
      ],
      lastLogin: new Date('2024-01-15T09:30:00Z'),
      loginCount: 15
    });

    // Pharmacist user
    const pharmacistPassword = await bcrypt.hash('pharmacist123', 10);
    const pharmacist = new User({
      name: 'Trần Thị Dược sĩ',
      email: 'pharmacist@pharmacy.com',
      phone: '0901234568',
      passwordHash: pharmacistPassword,
      role: 'pharmacist',
      isActive: true,
      employeeId: 'EMP002',
      department: 'Dược',
      position: 'Dược sĩ',
      hireDate: new Date('2023-03-20'),
      salary: 12000000,
      permissions: [
        'read_products',
        'read_categories',
        'read_inventory',
        'read_orders',
        'write_orders'
      ],
      lastLogin: new Date('2024-01-14T14:20:00Z'),
      loginCount: 8
    });

    // Staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = new User({
      name: 'Lê Văn Nhân viên',
      email: 'staff@pharmacy.com',
      phone: '0901234569',
      passwordHash: staffPassword,
      role: 'staff',
      isActive: true,
      employeeId: 'EMP003',
      department: 'Bán hàng',
      position: 'Nhân viên bán hàng',
      hireDate: new Date('2023-06-10'),
      salary: 8000000,
      permissions: [
        'read_products',
        'read_categories',
        'read_orders',
        'write_orders'
      ],
      lastLogin: new Date('2024-01-13T16:45:00Z'),
      loginCount: 12
    });

    // Limited staff user (no user management permissions)
    const limitedStaffPassword = await bcrypt.hash('limited123', 10);
    const limitedStaff = new User({
      name: 'Phạm Thị Hạn chế',
      email: 'limited@pharmacy.com',
      phone: '0901234570',
      passwordHash: limitedStaffPassword,
      role: 'staff',
      isActive: true,
      employeeId: 'EMP004',
      department: 'Kho',
      position: 'Nhân viên kho',
      hireDate: new Date('2023-08-05'),
      salary: 7000000,
      permissions: [
        'read_products',
        'read_inventory'
      ],
      lastLogin: new Date('2024-01-12T11:15:00Z'),
      loginCount: 5
    });

    // Save users
    await manager.save();
    await pharmacist.save();
    await staff.save();
    await limitedStaff.save();

    console.log('✅ Test users created successfully!');
    console.log('\n📋 Test Users:');
    console.log('1. Manager (manager@pharmacy.com / manager123)');
    console.log('   - Can manage products, categories, inventory, orders, staff');
    console.log('   - Permissions: read/write products, categories, inventory, orders + manage_staff');
    
    console.log('\n2. Pharmacist (pharmacist@pharmacy.com / pharmacist123)');
    console.log('   - Can read products, categories, inventory, orders');
    console.log('   - Can write orders');
    console.log('   - Permissions: read products, categories, inventory, orders + write orders');
    
    console.log('\n3. Staff (staff@pharmacy.com / staff123)');
    console.log('   - Can read products, categories, orders');
    console.log('   - Can write orders');
    console.log('   - Permissions: read products, categories, orders + write orders');
    
    console.log('\n4. Limited Staff (limited@pharmacy.com / limited123)');
    console.log('   - Can only read products and inventory');
    console.log('   - Permissions: read products, inventory only');

    console.log('\n🔐 Permission Testing:');
    console.log('- Manager: Should see Users and Staff menus');
    console.log('- Pharmacist: Should NOT see Users and Staff menus');
    console.log('- Staff: Should NOT see Users and Staff menus');
    console.log('- Limited Staff: Should only see Products menu');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
};

const main = async () => {
  await connectDB();
  await createTestUsers();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
};

main();
