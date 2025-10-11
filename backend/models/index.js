/**
 * Models Index - Tổng hợp tất cả các models
 * Export tất cả schemas và models để sử dụng trong ứng dụng
 */

// Reference Schemas
import Category from './Category.js';
import Brand from './Brand.js';
import Attribute from './Attribute.js';
import ActiveSubstance from './ActiveSubstance.js';

// Product Base Schema
import Product from './Product.js';

// Product Discriminators
import Drug from './Drug.js';
import Cosmeceutical from './Cosmeceutical.js';
import MedicalDevice from './MedicalDevice.js';
import FunctionalFood from './FunctionalFood.js';

// Core Business Schemas
import Supplier from './Supplier.js';
import User from './User.js';
import Order from './Order.js';
import Cart from './Cart.js';

// Export tất cả models
export {
  // Reference Schemas
  Category,
  Brand,
  Attribute,
  ActiveSubstance,
  
  // Product Schemas
  Product,
  Drug,
  Cosmeceutical,
  MedicalDevice,
  FunctionalFood,
  
  // Core Business Schemas
  Supplier,
  User,
  Order,
  Cart
};

// Export mặc định
export default {
  // Reference Schemas
  Category,
  Brand,
  Attribute,
  ActiveSubstance,
  
  // Product Schemas
  Product,
  Drug,
  Cosmeceutical,
  MedicalDevice,
  FunctionalFood,
  
  // Core Business Schemas
  Supplier,
  User,
  Order,
  Cart
};