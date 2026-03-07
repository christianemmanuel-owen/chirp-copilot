# 🚀 Instagram Connection - Quick Start Guide

Your configuration looks good! Here's what to do next:

## 🎯 Step 1: Test Your Configuration

Visit this visual testing page:
```
http://localhost:3000/instagram-test.html
```

This will show you:
- ✓ What's configured correctly
- ⚠️ What needs attention  
- 📋 Specific next steps

## 🔧 Step 2: Configure Meta App Settings

**This is the #1 reason connections fail!**

1. **Go to your Meta App Dashboard:**
   ```
   https://developers.facebook.com/apps/1681448536163237/
   ```

2. **Add the Redirect URI:**
   - Click **"Use cases"** or **"Products"** → **"Facebook Login"** → **"Settings"**
   - Find **"Valid OAuth Redirect URIs"**
   - Add this EXACT URL:
     ```
     https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback
     ```
   - Click **"Save Changes"**

3. **Add App Domain:**
   - Go to **"Settings"** → **"Basic"**
   - In **"App Domains"**, add:
     ```
     exiguously-unworn-wyatt.ngrok-free.dev
     ```
   - Click **"Save Changes"**

4. **Verify Products:**
   - Check that these are added (left sidebar):
     - ✓ Facebook Login
     - ✓ Instagram Graph API (or Instagram Basic Display)
     - ✓ Messenger
   - If missing, click **"+ Add Product"**

5. **Add Yourself as Admin/Developer:**
   - Go to **"Roles"** → **"Roles"**
   - Make sure YOUR Facebook account is listed
   - If not, add yourself as Administrator or Developer

## 📱 Step 3: Verify Instagram Account

1. **Check Account Type:**
   - Open Instagram app
   - Go to Profile → ☰ → Settings → Account type
   - Should say **"Business"** or **"Creator"**
   - If "Personal", switch to Professional Account

2. **Link to Facebook Page:**
   - In Instagram: Settings → Account Center → Accounts
   - Add your Facebook Page
   - OR in Facebook: Page Settings → Instagram → Connect Account

## ✅ Step 4: Test the Connection

1. **Go to admin settings:**
   ```
   http://localhost:3000/admin/settings
   ```

2. **Click "Connect Instagram Account"**

3. **Expected flow:**
   - Redirects to Facebook
   - Login with Facebook account that manages your Page
   - Accept permissions
   - Redirects back to your app
   - Select Instagram account
   - Click "Connect Instagram"
   - See "Connected" status ✓

## 🐛 If It Still Doesn't Work

### Check for Specific Errors:

1. **Open Browser Console (F12)**
   - Look for red errors
   - Check Network tab for failed requests

2. **Check Server Logs**
   - Look for `[instagram]` messages
   - Note any error details

3. **Common Issues:**

   **"redirect_uri_mismatch"**
   - The URL in Meta App doesn't match your .env
   - Double-check Step 2 above - must be EXACT match

   **"No Instagram account found"**
   - Instagram not linked to Facebook Page
   - Complete Step 3 above

   **"access_denied"**
   - You clicked "Cancel" on Facebook
   - Try again and click "Continue"

   **"Unauthorized" or "Invalid state"**
   - Clear browser cookies
   - Try in incognito mode
   - Check ngrok URL hasn't changed

## 📚 Additional Resources

- **Detailed Setup Checklist:** `INSTAGRAM_SETUP_CHECKLIST.md`
- **Troubleshooting Guide:** `docs/instagram-troubleshooting.md`
- **Visual Tester:** `http://localhost:3000/instagram-test.html`
- **API Diagnostics:** `http://localhost:3000/api/admin/instagram/debug`
- **Flow Test:** `http://localhost:3000/api/admin/instagram/test-flow`

## 🎯 Most Common Fix

**90% of the time, the issue is:**
The redirect URI in your Meta App settings doesn't match the one in your `.env` file.

**Solution:**
1. Copy this EXACT URL: `https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback`
2. Add it to Meta App → Facebook Login → Settings → Valid OAuth Redirect URIs
3. Save changes
4. Try connecting again

## ⚠️ Important Notes

- **Ngrok URLs change** when you restart ngrok
  - If ngrok URL changes, update both `.env` AND Meta App settings
  - Or use a fixed ngrok domain (paid plan)

- **Development Mode**
  - Only accounts added as Admin/Developer/Tester can use the app
  - Make sure you're testing with the right account

- **Restart Required**
  - After changing `.env`, restart your dev server
  - After changing Meta App settings, no restart needed

## ✨ Success Checklist

When it works, you'll see:
- ✓ Green "Connected" badge
- ✓ Your Instagram username (e.g., @yourhandle)
- ✓ Facebook Page name
- ✓ List of granted permissions
- ✓ Token expiration date

---

**Need help?** Share:
1. Error message from browser console
2. Error message from server logs
3. Screenshot of what you see

Good luck! 🍀
