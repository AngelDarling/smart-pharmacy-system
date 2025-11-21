import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Staff from './models/Staff.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'superadmin@example.com';
    const password = 'password123';
    const hashedPassword = await Staff.hashPassword(password);

    // Check if exists
    let admin = await Staff.findOne({ email });
    if (admin) {
        console.log('Admin already exists. Updating permissions...');
        admin.permissions = [
            'read_products', 'write_products', 'delete_products',
            'read_categories', 'write_categories', 'delete_categories',
            'read_users', 'write_users', 'delete_users',
            'read_orders', 'write_orders', 'delete_orders',
            'read_inventory', 'write_inventory', 'delete_inventory',
            'read_reports', 'write_reports',
            'manage_staff', 'manage_settings',
            'manage_content'
        ];
        admin.role = 'admin';
        await admin.save();
        console.log('Admin updated.');
    } else {
        admin = await Staff.create({
            name: 'Super Admin',
            email,
            passwordHash: hashedPassword,
            role: 'admin',
            permissions: [
                'read_products', 'write_products', 'delete_products',
                'read_categories', 'write_categories', 'delete_categories',
                'read_users', 'write_users', 'delete_users',
                'read_orders', 'write_orders', 'delete_orders',
                'read_inventory', 'write_inventory', 'delete_inventory',
                'read_reports', 'write_reports',
                'manage_staff', 'manage_settings',
                'manage_content'
            ],
            isActive: true
        });
        console.log('Admin created.');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
