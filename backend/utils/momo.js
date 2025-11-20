import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MoMo Payment Gateway Utility
 * Handles payment request creation, signature generation, and verification
 */

const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payment/momo/ipn',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/order-success'
};

/**
 * Generate HMAC SHA256 signature
 * @param {string} rawSignature - Raw signature string
 * @returns {string} Signature hash
 */
export function generateSignature(rawSignature) {
  return crypto
    .createHmac('sha256', MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest('hex');
}

/**
 * Create MoMo payment request
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Order ID
 * @param {number} params.amount - Payment amount
 * @param {string} params.orderInfo - Order description
 * @returns {Promise<Object>} Payment response with payUrl
 */
export async function createPaymentRequest({ orderId, amount, orderInfo }) {
  try {
    const requestId = `${orderId}_${Date.now()}`;
    const orderIdStr = String(orderId);
    const requestType = 'captureWallet';
    const extraData = ''; // Optional data

    // Create raw signature according to MoMo spec
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderIdStr}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = generateSignature(rawSignature);

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      amount,
      orderId: orderIdStr,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      requestType,
      extraData,
      lang: 'vi',
      signature
    };

    console.log('MoMo Payment Request:', {
      ...requestBody,
      signature: signature.substring(0, 20) + '...'
    });

    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('MoMo Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('MoMo Payment Request Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create MoMo payment');
  }
}

/**
 * Verify MoMo callback signature
 * @param {Object} data - Callback data from MoMo
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(data) {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = data;

    // Create raw signature for verification
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const calculatedSignature = generateSignature(rawSignature);

    console.log('Signature Verification:', {
      received: signature?.substring(0, 20) + '...',
      calculated: calculatedSignature?.substring(0, 20) + '...',
      match: signature === calculatedSignature
    });

    return signature === calculatedSignature;
  } catch (error) {
    console.error('Signature Verification Error:', error);
    return false;
  }
}

/**
 * Check transaction status from MoMo
 * @param {string} orderId - Order ID
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} Transaction status
 */
export async function checkTransactionStatus(orderId, requestId) {
  try {
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}`;
    const signature = generateSignature(rawSignature);

    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId,
      orderId,
      signature,
      lang: 'vi'
    };

    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/query',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Check Transaction Status Error:', error.response?.data || error.message);
    throw new Error('Failed to check transaction status');
  }
}

export default {
  createPaymentRequest,
  verifySignature,
  checkTransactionStatus,
  generateSignature
};
