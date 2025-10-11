/**
 * Settings Controller
 * Handles system settings management
 */

import { z } from "zod";

const settingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(1),
    siteDescription: z.string().optional(),
    siteLogo: z.string().optional(),
    timezone: z.string(),
    language: z.string(),
    currency: z.string(),
    dateFormat: z.string(),
    timeFormat: z.string()
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    orderNotifications: z.boolean(),
    inventoryNotifications: z.boolean(),
    userNotifications: z.boolean(),
    systemNotifications: z.boolean()
  }),
  security: z.object({
    sessionTimeout: z.number().min(5).max(480),
    maxLoginAttempts: z.number().min(3).max(10),
    passwordExpiry: z.number().min(30).max(365),
    twoFactorAuth: z.boolean(),
    ipWhitelist: z.boolean(),
    auditLog: z.boolean()
  }),
  pharmacy: z.object({
    pharmacyName: z.string().min(1),
    pharmacyAddress: z.string().optional(),
    pharmacyPhone: z.string().optional(),
    pharmacyEmail: z.string().email().optional(),
    pharmacyLicense: z.string().optional(),
    taxCode: z.string().optional(),
    workingHours: z.string().optional(),
    deliveryRadius: z.number().min(0).max(50)
  }),
  inventory: z.object({
    lowStockThreshold: z.number().min(0),
    expiryWarningDays: z.number().min(0).max(365),
    autoReorder: z.boolean(),
    reorderLevel: z.number().min(0),
    inventoryTracking: z.boolean(),
    batchTracking: z.boolean(),
    expiryTracking: z.boolean()
  }),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    primaryColor: z.string(),
    sidebarCollapsed: z.boolean(),
    showBreadcrumb: z.boolean(),
    showFooter: z.boolean(),
    compactMode: z.boolean()
  })
});

// Default settings
const defaultSettings = {
  general: {
    siteName: 'Smart Pharmacy System',
    siteDescription: 'Hệ thống quản lý nhà thuốc thông minh',
    siteLogo: '',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    inventoryNotifications: true,
    userNotifications: true,
    systemNotifications: true
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    twoFactorAuth: false,
    ipWhitelist: false,
    auditLog: true
  },
  pharmacy: {
    pharmacyName: 'Nhà thuốc Smart Pharmacy',
    pharmacyAddress: '123 Đường ABC, Quận 1, TP.HCM',
    pharmacyPhone: '0123456789',
    pharmacyEmail: 'info@smartpharmacy.com',
    pharmacyLicense: 'SĐK-123456',
    taxCode: '0123456789',
    workingHours: '08:00 - 22:00',
    deliveryRadius: 10
  },
  inventory: {
    lowStockThreshold: 10,
    expiryWarningDays: 30,
    autoReorder: false,
    reorderLevel: 20,
    inventoryTracking: true,
    batchTracking: true,
    expiryTracking: true
  },
  appearance: {
    theme: 'light',
    primaryColor: '#1890ff',
    sidebarCollapsed: false,
    showBreadcrumb: true,
    showFooter: true,
    compactMode: false
  }
};

// In-memory storage for demo (in production, use database)
let currentSettings = { ...defaultSettings };

// Get all settings
export async function getSettings(req, res) {
  try {
    res.json(currentSettings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tải cài đặt" });
  }
}

// Update settings
export async function updateSettings(req, res) {
  try {
    const validatedData = settingsSchema.parse(req.body);
    currentSettings = { ...currentSettings, ...validatedData };
    
    res.json({ 
      message: "Cài đặt đã được cập nhật thành công",
      settings: currentSettings 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Dữ liệu không hợp lệ", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật cài đặt" });
  }
}

// Reset to default settings
export async function resetSettings(req, res) {
  try {
    currentSettings = { ...defaultSettings };
    res.json({ 
      message: "Đã khôi phục cài đặt mặc định",
      settings: currentSettings 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khôi phục cài đặt" });
  }
}

// Test email
export async function testEmail(req, res) {
  try {
    // In production, implement actual email sending
    console.log('Test email sent to:', req.body.email || 'admin@pharmacy.com');
    res.json({ message: "Email test đã được gửi thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi email test" });
  }
}

// Test SMS
export async function testSMS(req, res) {
  try {
    // In production, implement actual SMS sending
    console.log('Test SMS sent to:', req.body.phone || '0123456789');
    res.json({ message: "SMS test đã được gửi thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi SMS test" });
  }
}
