import { VNPay } from 'vnpay';
import dotenv from 'dotenv';

dotenv.config();

/**
 * VNPay Payment Gateway Configuration
 * Using vnpay library by lehuygiang28
 * Documentation: https://github.com/lehuygiang28/vnpay
 */

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE || '', // Terminal Code from VNPay
  secureSecret: process.env.VNPAY_HASH_SECRET || '', // Secret Key from VNPay
  vnpayHost: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn', // Sandbox URL
  testMode: true, // Enable test mode for sandbox
  hashAlgorithm: 'SHA512', // VNPay uses SHA512
  
  // Enable logging for debugging
  enableLog: true,
});

// Log configuration (without sensitive data)
console.log('VNPay Configuration:', {
  tmnCode: process.env.VNPAY_TMN_CODE ? '***' + process.env.VNPAY_TMN_CODE.slice(-4) : 'NOT SET',
  hasSecret: !!process.env.VNPAY_HASH_SECRET,
  vnpayHost: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn',
  testMode: true
});

export default vnpay;
