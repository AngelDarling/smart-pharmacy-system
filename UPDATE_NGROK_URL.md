# Update MOMO_IPN_URL in .env file

**Your ngrok URL:** https://084ad033cd25.ngrok-free.app

**Action Required:**

Open `backend/.env` file and update the following line:

**FROM:**
```env
MOMO_IPN_URL=http://localhost:5000/api/payment/momo/ipn
```

**TO:**
```env
MOMO_IPN_URL=https://084ad033cd25.ngrok-free.app/api/payment/momo/ipn
```

**Save the file** and the backend will automatically restart with nodemon.

---

## ✅ After Update

Once you save the `.env` file:

1. **Backend will restart automatically** (nodemon)
2. **Test a new payment:**
   - Go to checkout
   - Select MoMo payment
   - Complete payment
   - **This time IPN will be received!**

3. **Check backend logs for:**
   ```
   === MoMo IPN Received ===
   ✅ Payment successful for order: ORDxxxxxx
   ```

4. **Order status will auto-update to:**
   - Payment status: "Đã thanh toán"
   - Order status: "Đang xử lý"

---

## 🎯 Important Notes

**Ngrok URL Changes:**
- Free ngrok URLs change every time you restart ngrok
- If you restart ngrok, you'll need to update `.env` again
- To keep the same URL, upgrade to ngrok paid plan (optional)

**Keep Ngrok Running:**
- Don't close the ngrok terminal window
- Ngrok must be running for IPN to work
- If ngrok stops, MoMo can't send IPN

---

## 🧪 Testing

After updating `.env`, test with a new order:

1. Create new order with MoMo payment
2. Complete payment on MoMo
3. Check backend logs - you should see IPN received
4. Order should auto-update to "Đang xử lý"
5. Inventory should be reduced
6. Loyalty points should be added

---

## 📊 Monitoring

**Ngrok Web Interface:**
- Open http://127.0.0.1:4040 in browser
- See all HTTP requests to your localhost
- Very useful for debugging IPN

**Backend Logs:**
- Watch for "=== MoMo IPN Received ===" message
- Check signature verification
- Monitor order status updates
