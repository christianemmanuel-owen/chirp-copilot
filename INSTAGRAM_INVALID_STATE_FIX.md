# 🔧 Instagram OAuth "Invalid State" Error - SOLUTION

## ❌ The Problem

You're getting this error:
```
status=error&reason=invalid_state&message=Instagram+authorization+failed+due+to+an+invalid+session
```

**Root Cause:** Cookie mismatch between HTTP and HTTPS protocols.

- Your ngrok URL uses **HTTPS**: `https://exiguously-unworn-wyatt.ngrok-free.dev`
- You're accessing via **HTTP**: `http://localhost:3000`
- The redirect goes to **HTTPS localhost**: `https://localhost:3000`
- Cookies set on HTTP can't be read on HTTPS → State validation fails ❌

## ✅ Solution: Access Via Ngrok URL

**Instead of accessing:** `http://localhost:3000`

**Access your app via the ngrok URL:** `https://exiguously-unworn-wyatt.ngrok-free.dev`

### Step-by-Step Fix:

1. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```

2. **Access your admin settings via the ngrok URL:**
   ```
   https://exiguously-unworn-wyatt.ngrok-free.dev/admin/settings
   ```

3. **Click "Connect Instagram Account"**

4. **Complete the OAuth flow**

5. **Success!** ✓

## 🔍 Why This Happens

```
┌─────────────────────────────────────────────────────────────┐
│ OAuth Flow with Mixed Protocols (BROKEN)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User visits: http://localhost:3000/admin/settings       │
│     ↓ Clicks "Connect Instagram"                            │
│                                                              │
│  2. Redirects to: /api/auth/instagram/login                 │
│     ↓ Sets cookies with secure=false (HTTP)                 │
│                                                              │
│  3. Redirects to: Facebook OAuth                            │
│     ↓ User authorizes                                       │
│                                                              │
│  4. Facebook redirects to:                                  │
│     https://exiguously-unworn-wyatt.ngrok-free.dev/callback │
│     ↓ Ngrok forwards to localhost                           │
│                                                              │
│  5. Callback tries to read cookies                          │
│     ❌ Cookies not found! (HTTP cookies can't be read       │
│        on HTTPS request)                                    │
│                                                              │
│  6. State validation fails → "invalid_state" error          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ OAuth Flow with Consistent Protocol (WORKING)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User visits: https://your-ngrok-url.ngrok-free.dev      │
│     ↓ Clicks "Connect Instagram"                            │
│                                                              │
│  2. Redirects to: /api/auth/instagram/login                 │
│     ↓ Sets cookies with secure=false (dev mode)             │
│                                                              │
│  3. Redirects to: Facebook OAuth                            │
│     ↓ User authorizes                                       │
│                                                              │
│  4. Facebook redirects to:                                  │
│     https://your-ngrok-url.ngrok-free.dev/callback          │
│     ↓ Same domain, same protocol                            │
│                                                              │
│  5. Callback reads cookies successfully                     │
│     ✓ Cookies found and validated                           │
│                                                              │
│  6. State validation succeeds → Connection established! ✓   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Quick Checklist

- [ ] Ngrok is running: `ngrok http 3000`
- [ ] Access app via ngrok URL (not localhost)
- [ ] Meta App redirect URI matches ngrok URL exactly
- [ ] Clear browser cookies before trying again
- [ ] Check server logs for detailed error info (I added better logging)

## 🔧 What I Fixed in Your Code

I've enhanced the error logging so you can see exactly what's happening:

1. **Better error messages** - Now tells you if cookies are missing vs mismatched
2. **Detailed logging** - Shows protocol, host, cookies received, etc.
3. **Helpful hints** - Error message suggests using ngrok URL directly

Check your server terminal after trying to connect - you'll see detailed logs like:
```
[instagram][login] Setting OAuth cookies { state: 'abc12345...', returnTo: '/admin/settings', ... }
[instagram][callback] Invalid OAuth state { stateCookie: undefined, stateParam: 'abc12345...', ... }
```

## 🚀 Alternative Solutions

### Option 1: Use Ngrok URL (Recommended for Testing)
✓ **Easiest** - Just access via ngrok URL
✓ **No code changes needed**
✓ **Works immediately**

### Option 2: Deploy to Production
✓ **Best for real use** - Deploy to Vercel/Netlify
✓ **Proper HTTPS** - No mixed protocol issues
✓ **Persistent URL** - No ngrok restarts

### Option 3: Use Ngrok Fixed Domain (Paid)
✓ **Consistent URL** - Doesn't change on restart
✓ **Less config updates** - Set once and forget
❌ **Costs money** - Requires ngrok paid plan

## 📝 Testing Steps

1. **Clear all cookies:**
   - Press F12 → Application → Cookies → Clear all

2. **Access via ngrok:**
   ```
   https://exiguously-unworn-wyatt.ngrok-free.dev/admin/settings
   ```

3. **Open browser console (F12)** to see any errors

4. **Click "Connect Instagram Account"**

5. **Watch server logs** for detailed debugging info

6. **Complete Facebook authorization**

7. **Should redirect back successfully!** ✓

## 🐛 If It Still Doesn't Work

Check the server logs for this new detailed output:
```
[instagram][callback] Invalid OAuth state {
  codePresent: true,
  stateParam: 'abc123...',
  stateCookie: undefined,  ← This tells you cookies aren't being received
  requestProtocol: 'https:',
  requestHost: 'exiguously-unworn-wyatt.ngrok-free.dev',
  cookiesReceived: ['admin_auth'],  ← Shows which cookies ARE received
  isProduction: false
}
```

Share this log output and I can help further!

## ✨ Success Indicators

When it works, you'll see:
1. No error in URL after redirect
2. Instagram account selection screen appears
3. After clicking "Connect", you see green "Connected" badge
4. Your Instagram username is displayed

---

**TL;DR:** Access your app via `https://exiguously-unworn-wyatt.ngrok-free.dev` instead of `http://localhost:3000`
