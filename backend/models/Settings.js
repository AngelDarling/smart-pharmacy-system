import mongoose from "mongoose";

/**
 * Settings Schema
 * Lưu trữ cài đặt hệ thống
 */
const settingsSchema = new mongoose.Schema({
  // General settings
  general: {
    siteName: { type: String, default: 'Smart Pharmacy System' },
    siteDescription: { type: String, default: 'Hệ thống quản lý nhà thuốc thông minh' },
    siteLogo: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    language: { type: String, default: 'vi' },
    currency: { type: String, default: 'VND' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '24h' }
  },
  // Notifications settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    inventoryNotifications: { type: Boolean, default: true },
    userNotifications: { type: Boolean, default: true },
    systemNotifications: { type: Boolean, default: true }
  },
  // Security settings
  security: {
    sessionTimeout: { type: Number, default: 30, min: 5, max: 480 },
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    passwordExpiry: { type: Number, default: 90, min: 30, max: 365 },
    twoFactorAuth: { type: Boolean, default: false },
    ipWhitelist: { type: Boolean, default: false },
    auditLog: { type: Boolean, default: true }
  },
  // Pharmacy settings
  pharmacy: {
    pharmacyName: { type: String, default: 'Nhà thuốc Smart Pharmacy' },
    pharmacyAddress: { type: String, default: '' },
    pharmacyPhone: { type: String, default: '' },
    pharmacyEmail: { type: String, default: '' },
    pharmacyLicense: { type: String, default: '' },
    taxCode: { type: String, default: '' },
    workingHours: { type: String, default: '08:00 - 22:00' },
    deliveryRadius: { type: Number, default: 10, min: 0, max: 50 }
  },
  // Inventory settings
  inventory: {
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    expiryWarningDays: { type: Number, default: 30, min: 0, max: 365 },
    autoReorder: { type: Boolean, default: false },
    reorderLevel: { type: Number, default: 20, min: 0 },
    inventoryTracking: { type: Boolean, default: true },
    batchTracking: { type: Boolean, default: true },
    expiryTracking: { type: Boolean, default: true }
  },
  // Appearance settings
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    primaryColor: { type: String, default: '#1890ff' },
    sidebarCollapsed: { type: Boolean, default: false },
    showBreadcrumb: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    compactMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Chỉ lưu 1 document duy nhất
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Tạo settings mặc định nếu chưa có
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(data) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(data);
  } else {
    // Merge data vào settings hiện có
    Object.keys(data).forEach(key => {
      if (settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
        settings[key] = { ...settings[key], ...data[key] };
      } else {
        settings[key] = data[key];
      }
    });
    await settings.save();
  }
  return settings;
};

settingsSchema.statics.resetSettings = async function() {
  let settings = await this.findOne();
  if (settings) {
    await settings.deleteOne();
  }
  settings = await this.create({});
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

