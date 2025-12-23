/**
 * Models Index - Tổng hợp tất cả các models
 * Export tất cả schemas và models để sử dụng trong ứng dụng
 * Updated: 10/12/2025 - Exported all 32 models
 */

// ==================== REFERENCE SCHEMAS ====================
import Category from './Category.js';
import Brand from './Brand.js';
import Attribute from './Attribute.js';
import ActiveSubstance from './ActiveSubstance.js';

// ==================== PRODUCT SCHEMAS ====================
// Product Base Schema
import Product from './Product.js';

// Product Discriminators
import Drug from './Drug.js';
import Cosmeceutical from './Cosmeceutical.js';
import MedicalDevice from './MedicalDevice.js';
import FunctionalFood from './FunctionalFood.js';

// Product Related
import ProductBatch from './ProductBatch.js';
import ProductSalesDaily from './ProductSalesDaily.js';

// ==================== USER MANAGEMENT ====================
import User from './User.js';
import Customer, { PointHistory } from './Customer.js';
import Staff from './Staff.js';

// ==================== ORDER & PAYMENT ====================
import Cart from './Cart.js';
import Order from './Order.js';
import Payment from './Payment.js';
import Shipment from './Shipment.js';

// ==================== INVENTORY MANAGEMENT ====================
import GoodsReceipt from './GoodsReceipt.js';
import InventoryTransaction from './InventoryTransaction.js';
import InventoryAlert from './InventoryAlert.js';

// ==================== MARKETING & ENGAGEMENT ====================
import Coupon from './Coupon.js';
import Review from './Review.js';
import HealthNews from './HealthNews.js';
import HealthNewsCategory from './HealthNewsCategory.js';

// ==================== HEALTH SERVICES ====================
import HealthCheck from './HealthCheck.js';
import HealthCheckResult from './HealthCheckResult.js';
import Question from './Question.js';
import AnswerOption from './AnswerOption.js';

// ==================== SYSTEM ====================
import Supplier from './Supplier.js';
import Settings from './Settings.js';

// ==================== EXPORTS ====================
// Named exports - Import như: import { Product, Order } from './models/index.js'
export {
  // Reference Schemas (4)
  Category,
  Brand,
  Attribute,
  ActiveSubstance,
  
  // Product Schemas (7)
  Product,
  Drug,
  Cosmeceutical,
  MedicalDevice,
  FunctionalFood,
  ProductBatch,
  ProductSalesDaily,
  
  // User Management (3)
  User,
  Customer,
  PointHistory,
  Staff,
  
  // Order & Payment (4)
  Cart,
  Order,
  Payment,
  Shipment,
  
  // Inventory Management (3)
  GoodsReceipt,
  InventoryTransaction,
  InventoryAlert,
  
  // Marketing & Engagement (4)
  Coupon,
  Review,
  HealthNews,
  HealthNewsCategory,
  
  // Health Services (4)
  HealthCheck,
  HealthCheckResult,
  Question,
  AnswerOption,
  
  // System (2)
  Supplier,
  Settings
};

// Default export - Import như: import models from './models/index.js'
export default {
  // Reference Schemas (4)
  Category,
  Brand,
  Attribute,
  ActiveSubstance,
  
  // Product Schemas (7)
  Product,
  Drug,
  Cosmeceutical,
  MedicalDevice,
  FunctionalFood,
  ProductBatch,
  ProductSalesDaily,
  
  // User Management (3)
  User,
  Customer,
  PointHistory,
  Staff,
  
  // Order & Payment (4)
  Cart,
  Order,
  Payment,
  Shipment,
  
  // Inventory Management (3)
  GoodsReceipt,
  InventoryTransaction,
  InventoryAlert,
  
  // Marketing & Engagement (4)
  Coupon,
  Review,
  HealthNews,
  HealthNewsCategory,
  
  // Health Services (4)
  HealthCheck,
  HealthCheckResult,
  Question,
  AnswerOption,
  
  // System (2)
  Supplier,
  Settings
};