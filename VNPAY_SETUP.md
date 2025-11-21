# VNPay Payment Gateway Setup Guide

This guide explains how to configure and use VNPay payment gateway in the Smart Pharmacy System.

## Prerequisites

1. **VNPay Sandbox Account**
   - Register at: https://sandbox.vnpayment.vn/
   - You will receive credentials via email:
     - `TMN_CODE` (Terminal Code / Mã website)
     - `HASH_SECRET` (Secret Key for signature generation)

2. **Ngrok for IPN Testing**
   - VNPay needs to send IPN (Instant Payment Notification) to your backend
   - In development, use Ngrok to expose your localhost
   - See `NGROK_SETUP.md` for detailed instructions

## Environment Variables

Add the following variables to your `.env` file in the `backend` folder:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code_here
VNPAY_HASH_SECRET=your_secret_key_here
VNPAY_URL=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=http://localhost:5173/order-success
VNPAY_IPN_URL=https://your-ngrok-url.ngrok.io/api/payment/vnpay/ipn
```

### Configuration Details

- **VNPAY_TMN_CODE**: Your terminal code from VNPay registration email
- **VNPAY_HASH_SECRET**: Your secret key from VNPay registration email
- **VNPAY_URL**: VNPay gateway URL (use sandbox URL for testing)
- **VNPAY_RETURN_URL**: URL where users are redirected after payment (frontend)
- **VNPAY_IPN_URL**: URL where VNPay sends payment notifications (backend, must be public)

## Important Notes

### 1. IPN URL Must Be Public
The `VNPAY_IPN_URL` must be accessible from the internet because VNPay servers will call this endpoint to notify payment status.

**For Development:**
```bash
# Start ngrok
ngrok http 5000

# Update VNPAY_IPN_URL in .env with the ngrok URL
VNPAY_IPN_URL=https://abc123.ngrok.io/api/payment/vnpay/ipn
```

### 2. VNPay IPN Uses GET Method
Unlike MoMo (which uses POST), VNPay sends IPN via **GET** request. The route is already configured correctly:
```javascript
router.get('/vnpay/ipn', vnpayIPN);
```

### 3. Transaction Reference Uniqueness
The `vnp_TxnRef` must be unique for each payment attempt. The system automatically generates:
```
vnp_TxnRef = orderId_timestamp
Example: 673e8f1234567890_1732176799123
```

This prevents "Order already exists" errors when users retry payment for the same order.

## API Endpoints

### 1. Create Payment URL
**POST** `/api/payment/vnpay/create`

Request body:
```json
{
  "orderId": "673e8f1234567890",
  "amount": 219000,
  "orderInfo": "Thanh toan don hang DH001"
}
```

Response:
```json
{
  "success": true,
  "payUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "vnp_TxnRef": "673e8f1234567890_1732176799123"
}
```

### 2. Return URL (User Redirect)
**GET** `/api/payment/vnpay/return`

VNPay redirects users here after payment. Query parameters include:
- `vnp_ResponseCode`: "00" = success
- `vnp_TxnRef`: Transaction reference
- `vnp_TransactionNo`: VNPay transaction number
- And other parameters...

### 3. IPN (Instant Payment Notification)
**GET** `/api/payment/vnpay/ipn`

VNPay calls this endpoint to notify payment status. The system:
- Verifies signature
- Updates payment and order status
- Reduces inventory
- Adds loyalty points

### 4. Check Payment Status
**GET** `/api/payment/vnpay/status/:orderId`

Returns current payment status for an order.

## Payment Flow

```
1. User selects VNPay at checkout
   ↓
2. Frontend calls POST /api/payment/vnpay/create
   ↓
3. Backend creates payment record and returns payUrl
   ↓
4. Frontend redirects user to VNPay payment page
   ↓
5. User completes payment on VNPay
   ↓
6. VNPay redirects user to VNPAY_RETURN_URL (for UX)
   ↓
7. VNPay sends IPN to VNPAY_IPN_URL (for order processing)
   ↓
8. Backend processes IPN:
   - Updates payment status
   - Updates order status
   - Reduces inventory
   - Adds loyalty points
```

## Testing

### Test Card Information
VNPay Sandbox provides test cards. Check VNPay documentation for current test card numbers.

### Test Scenarios

1. **Successful Payment**
   - Complete payment with test card
   - Check backend logs for IPN processing
   - Verify order status changed to "processing"
   - Verify inventory reduced

2. **Failed Payment**
   - Cancel payment or use invalid card
   - Verify order status changed to "cancelled"
   - Verify inventory not reduced

3. **Retry Payment**
   - Cancel first payment attempt
   - Try payment again for same order
   - Should work without "Order already exists" error

## Troubleshooting

### IPN Not Received
- Check if Ngrok is running
- Verify `VNPAY_IPN_URL` is correct and public
- Check VNPay dashboard for IPN delivery status
- Check backend logs for errors

### Signature Verification Failed
- Verify `VNPAY_HASH_SECRET` is correct
- Check for extra spaces in environment variables
- Ensure using SHA512 algorithm

### Amount Mismatch
- The vnpay library automatically multiplies amount by 100
- Send amount in VND (e.g., 219000 for 219,000 VND)
- Do NOT multiply by 100 manually

## Security Notes

1. **Never expose credentials**
   - Keep `.env` file in `.gitignore`
   - Never commit credentials to version control

2. **Always verify signatures**
   - The system automatically verifies all VNPay callbacks
   - Never trust data without signature verification

3. **Implement idempotency**
   - The system checks if IPN was already processed
   - Prevents duplicate order processing

## Production Deployment

When deploying to production:

1. **Update VNPay credentials**
   - Register for production VNPay account
   - Update `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET`
   - Change `VNPAY_URL` to production URL

2. **Update URLs**
   - Set `VNPAY_RETURN_URL` to production frontend URL
   - Set `VNPAY_IPN_URL` to production backend URL
   - No need for Ngrok in production

3. **Disable test mode**
   - Update `testMode: false` in `utils/vnpay.js`

## Support

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/docs/
- VNPay Library: https://github.com/lehuygiang28/vnpay
- Contact VNPay support for account issues
