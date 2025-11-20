# Ngrok Setup Guide for MoMo IPN Testing

## Why Ngrok?

MoMo IPN (Instant Payment Notification) requires a **public URL** to send payment callbacks. Since you're running on `localhost`, MoMo cannot reach your backend directly. Ngrok creates a secure tunnel from a public URL to your localhost.

## Option 1: Install Ngrok (Recommended)

### Step 1: Download Ngrok

1. Go to https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the `ngrok.exe` file

### Step 2: Install Ngrok

**Option A: Add to PATH (Recommended)**
```powershell
# Move ngrok.exe to a permanent location
Move-Item ngrok.exe C:\ngrok\ngrok.exe

# Add to PATH
$env:Path += ";C:\ngrok"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::User)
```

**Option B: Use from current directory**
```powershell
# Just run from the download folder
.\ngrok.exe http 5000
```

### Step 3: Create Ngrok Account (Free)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for free account
3. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### Step 4: Configure Ngrok

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 5: Start Ngrok Tunnel

```powershell
ngrok http 5000
```

You should see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:5000
```

### Step 6: Update Backend .env

Copy the HTTPS forwarding URL and update your `.env`:

```env
MOMO_IPN_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/payment/momo/ipn
```

### Step 7: Restart Backend

```bash
# Backend will auto-restart with nodemon
# Or manually restart if needed
```

---

## Option 2: Use Localtunnel (Alternative)

If you can't use ngrok, try localtunnel:

### Install:
```powershell
npm install -g localtunnel
```

### Start Tunnel:
```powershell
lt --port 5000
```

### Update .env:
```env
MOMO_IPN_URL=https://your-subdomain.loca.lt/api/payment/momo/ipn
```

---

## Option 3: Skip IPN Testing (For Now)

If you just want to test the payment flow without IPN:

1. **Payment will still work** - User can complete payment on MoMo
2. **Order won't auto-update** - You'll need to manually check payment status
3. **Use callback URL** - Order success page will still show payment info

**To test without IPN:**
- Just proceed with testing
- After payment, manually check order status in database
- Or call the status endpoint: `GET /api/payment/momo/status/:orderId`

---

## Testing Checklist

Once ngrok is running:

- [ ] Ngrok tunnel is active
- [ ] `MOMO_IPN_URL` updated in `.env`
- [ ] Backend restarted
- [ ] Test payment flow
- [ ] Check backend logs for IPN
- [ ] Verify order status updates

---

## Troubleshooting

### Ngrok shows "ERR_NGROK_108"
- Your authtoken is invalid
- Run: `ngrok config add-authtoken YOUR_TOKEN`

### IPN still not received
- Check ngrok web interface: http://127.0.0.1:4040
- Look for POST requests to `/api/payment/momo/ipn`
- Check if MoMo is sending requests

### Backend not accessible via ngrok
- Make sure backend is running on port 5000
- Check firewall settings
- Try restarting ngrok

---

## Quick Start Commands

```powershell
# 1. Install ngrok (if not installed)
# Download from https://ngrok.com/download

# 2. Add authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Start tunnel
ngrok http 5000

# 4. Copy the HTTPS URL (e.g., https://xxxx.ngrok-free.app)

# 5. Update .env
# MOMO_IPN_URL=https://xxxx.ngrok-free.app/api/payment/momo/ipn

# 6. Backend will auto-restart
```

---

## Alternative: Deploy to Cloud

For production or easier testing, deploy backend to:
- **Heroku** (free tier)
- **Railway** (free tier)
- **Render** (free tier)
- **Vercel** (for Node.js)

Then use the deployed URL for `MOMO_IPN_URL`.
