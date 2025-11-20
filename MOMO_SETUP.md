# MoMo Payment Integration Setup

## Backend Setup

### 1. Add MoMo credentials to `.env` file

Add the following lines to `backend/.env`:

```env
# MoMo Payment Gateway
MOMO_PARTNER_CODE=MOMOWVHD20251121_TEST
MOMO_ACCESS_KEY=ptWrNe4jM3EOEjuv
MOMO_SECRET_KEY=iMdI4d49CF5XqXNydqaBueGudHjVgeZS
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_IPN_URL=http://localhost:5000/api/payment/momo/ipn
MOMO_REDIRECT_URL=http://localhost:5173/order-success
MOMO_PUBLIC_KEY=MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0gucmbkI6DtkkeifYBfYO64lUbfkJ9sdESGSJSZpy+o+02oTGvN+cMTebNn5VKJPvFFNah6RQpeOi2reuhXkpEuEpJopXYnFMG6CdnXUEgf0UZIkLeofAIRssGRGvNtHlOn+FOXeZkD1XxcvG7dOl7ljqyDhCPrZdcRcg2AMROPKiFiMUZE1GRnXsCOTe51TcQhJZI8vGDoECduU3OsdPh1gWKdcgy/i0JUQ5Tavm6aBJJNQrrvzA3h7+A/Y7o2zV9sHz3XBJPHNrP/9GO+wG/EVsOlLNOxzq0M2BYcYSuWFzF7Bjf77PyButnddwagHoZwONA4iDphEiEo+yl0ND3kCk6WaiYMKhnv0CUKiJ6RH/05jfYd5HakOH6Fda0+Md1VSOndLaACaQH6+Lu62V0pIh4tNf1sCPSxhrUGzFlxjepI6XOFZA47RjUxH2k2FGeS1jICYajXZESNndqiU4AGagPrTTYMcEvY88fyjv6yn+hg/ZJTkcPxFMycBq6YmC0TikXhc5QfInnNv08+HJ3QdJeCh0xOETF4aHixX3SkeOpJvHLgBRNK7sO52xm9LJmYbAGFuijUu93GfZz/526kwE/MVsOOWWb/LNXzqizpqzfQzl8GlmWxSTqcK9DcqLmkhd6V8PaXI3bbvXFObyKalir7lRerYXgBzBlzbnPcCAwEAAQ==
```

### 2. Restart Backend Server

The backend server will automatically reload with the new environment variables.

## Testing with MoMo Sandbox

### Test Payment Flow

1. Go to checkout page: http://localhost:5173/checkout
2. Select "Thanh toán qua MoMo" payment method
3. Click "Đặt hàng"
4. You will be redirected to MoMo payment page
5. Use MoMo test credentials to complete payment
6. You will be redirected back to order success page

### MoMo Test Credentials

For sandbox testing, MoMo provides test accounts. Check MoMo developer documentation for test credentials.

### IPN Testing

**Important:** MoMo IPN requires a public URL. Localhost won't work for IPN callbacks.

**Options for testing IPN:**

1. **Use ngrok (Recommended for local testing):**
   ```bash
   ngrok http 5000
   ```
   Then update `MOMO_IPN_URL` in `.env` to the ngrok URL:
   ```env
   MOMO_IPN_URL=https://your-ngrok-url.ngrok.io/api/payment/momo/ipn
   ```

2. **Deploy to a test server** with a public URL

3. **Test IPN manually** by sending POST requests to `/api/payment/momo/ipn` with MoMo's expected payload

## Monitoring

Check backend console logs for:
- `=== MoMo Payment Request ===` - When creating payment
- `=== MoMo IPN Received ===` - When receiving payment notification
- `=== MoMo Callback Received ===` - When user returns from MoMo

## Troubleshooting

### Payment creation fails
- Check MoMo credentials in `.env`
- Check backend console for error messages
- Verify MoMo endpoint URL is correct

### IPN not received
- Ensure `MOMO_IPN_URL` is a public URL (not localhost)
- Check MoMo developer portal for IPN logs
- Verify signature generation is correct

### Order status not updating
- Check if IPN was received (backend logs)
- Verify signature validation passed
- Check Payment model in database for status

## Production Deployment

When deploying to production:

1. Update `.env` with production credentials:
   ```env
   MOMO_PARTNER_CODE=your_production_partner_code
   MOMO_ACCESS_KEY=your_production_access_key
   MOMO_SECRET_KEY=your_production_secret_key
   MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
   MOMO_IPN_URL=https://yourdomain.com/api/payment/momo/ipn
   MOMO_REDIRECT_URL=https://yourdomain.com/order-success
   ```

2. Ensure HTTPS is enabled (MoMo requires HTTPS for production)

3. Test thoroughly in production environment before going live
