# Instagram Connection Setup Checklist

## ✅ Your Current Configuration (Verified)
- ✓ FACEBOOK_APP_ID: Set
- ✓ FACEBOOK_APP_SECRET: Set  
- ✓ Redirect URI: `https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback`
- ✓ Required Scopes: All 7 scopes configured
- ✓ Webhook Verify Token: Set

## 🔧 Critical Setup Steps

### Step 1: Configure Meta App Redirect URI ⚠️ CRITICAL
This is the #1 reason Instagram connections fail!

1. Go to: https://developers.facebook.com/apps/1681448536163237/
2. Click **"Use cases"** in left sidebar (or **"Products"** → **"Facebook Login"**)
3. Under **Facebook Login**, click **"Settings"**
4. Find **"Valid OAuth Redirect URIs"** field
5. Add this EXACT URL (copy-paste to avoid typos):
   ```
   https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback
   ```
6. Click **"Save Changes"** at the bottom

**Important**: The URL must match EXACTLY - including `https://`, no trailing slash, correct subdomain.

### Step 2: Add App Domain
1. Still in Meta App Dashboard, go to **"Settings"** → **"Basic"**
2. Scroll to **"App Domains"**
3. Add:
   ```
   exiguously-unworn-wyatt.ngrok-free.dev
   ```
4. Click **"Save Changes"**

### Step 3: Verify Products Are Added
1. In Meta App Dashboard, check left sidebar under **"Products"**
2. You should see:
   - ✓ **Facebook Login** (required)
   - ✓ **Instagram Graph API** or **Instagram Basic Display** (required)
   - ✓ **Messenger** (required for DMs)

3. If any are missing:
   - Click **"+ Add Product"**
   - Find the missing product
   - Click **"Set Up"**

### Step 4: Verify Your Role in the App
1. Go to **"Roles"** → **"Roles"** in left sidebar
2. Make sure YOUR Facebook account is listed as:
   - **Administrator** OR **Developer** OR **Tester**
3. If not listed:
   - Click **"Add Administrators"** (or Developers/Testers)
   - Search for your Facebook account
   - Add yourself

### Step 5: Check App Mode
1. Look at the top of the Meta App Dashboard
2. You'll see either:
   - **"Development"** mode (green toggle) - Good for testing
   - **"Live"** mode - Requires app review for most permissions

3. For testing, **Development mode is fine**, but:
   - Only accounts added in Step 4 can use the app
   - Make sure you're testing with an account that's added as Admin/Developer/Tester

### Step 6: Verify Instagram Account Type
1. Open Instagram mobile app
2. Go to your profile
3. Tap **☰ (menu)** → **Settings and privacy**
4. Tap **Account type and tools**
5. You should see **"Business"** or **"Creator"**
6. If you see **"Personal"**:
   - Tap **"Switch to professional account"**
   - Choose **Business** or **Creator**
   - Complete the setup

### Step 7: Link Instagram to Facebook Page
1. Open Facebook on desktop
2. Go to your Facebook Page (the one you want to connect)
3. Click **"Settings"** (left sidebar)
4. Click **"Instagram"** (left sidebar)
5. You should see your Instagram account connected
6. If not connected:
   - Click **"Connect Account"**
   - Log in to Instagram
   - Authorize the connection

**OR** from Instagram app:
1. Go to **Settings and privacy** → **Account Center**
2. Tap **"Accounts"**
3. Tap **"Add accounts"**
4. Add your Facebook Page

## 🧪 Testing the Connection

After completing the steps above:

1. **Restart your dev server** (if running):
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Clear your browser cookies** for localhost:
   - Press F12 → Application tab → Cookies → localhost → Clear all

3. **Go to admin settings**:
   ```
   http://localhost:3000/admin/settings
   ```

4. **Click "Connect Instagram Account"**

5. **What should happen**:
   - ✓ Redirects to Facebook login
   - ✓ Shows permission request screen
   - ✓ Lists your Facebook Pages
   - ✓ Redirects back to your app
   - ✓ Shows Instagram account selection
   - ✓ Click "Connect Instagram"
   - ✓ Shows "Connected" status

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI in Meta App doesn't match your .env file

**Fix**: 
- Double-check Step 1 above
- Make sure there are no typos
- No trailing slash
- Exact match including `https://`

### Error: "access_denied" or user cancels
**Cause**: User clicked "Cancel" on Facebook permission screen

**Fix**: Try again and click "Continue" instead of "Cancel"

### Error: "No Instagram account found"
**Cause**: Facebook Page doesn't have an Instagram Business Account connected

**Fix**: Complete Steps 6 and 7 above

### Error: "Unauthorized" or "Invalid OAuth state"
**Cause**: Cookies not being set properly or session expired

**Fix**:
- Clear browser cookies
- Try in incognito mode
- Check that ngrok URL hasn't changed

### Error: "App Not Set Up"
**Cause**: Required products not added to Meta App

**Fix**: Complete Step 3 above

### Still getting errors?
1. Open browser console (F12)
2. Go to Network tab
3. Try connecting again
4. Look for failed requests (red)
5. Click on the failed request
6. Check the "Response" tab for error details
7. Share the error message for more specific help

## 📝 Common Mistakes

- ❌ Forgetting to add redirect URI to Meta App settings
- ❌ Typo in redirect URI (extra space, wrong protocol, trailing slash)
- ❌ Using Personal Instagram account instead of Business/Creator
- ❌ Instagram not linked to Facebook Page
- ❌ Testing with Facebook account not added to app roles
- ❌ Ngrok URL changed but .env not updated
- ❌ Not restarting dev server after .env changes

## ✨ Success Indicators

When everything is working, you should see:
- ✓ "Connected" badge in green
- ✓ Your Instagram username displayed (e.g., @yourhandle)
- ✓ Facebook Page name shown
- ✓ List of granted scopes/permissions
- ✓ Token expiration date

## 🆘 Need More Help?

If you're still stuck after following all steps:

1. **Check what error you're getting**:
   - Browser console (F12)
   - Server terminal logs
   - Screenshot of error message

2. **Verify these specific things**:
   - [ ] Redirect URI in Meta App matches .env EXACTLY
   - [ ] Instagram account type is Business or Creator
   - [ ] Instagram is linked to a Facebook Page
   - [ ] You're an Admin/Developer of the Meta App
   - [ ] You're an Admin of the Facebook Page
   - [ ] All 3 products are added to Meta App

3. **Try these debugging steps**:
   - Test in incognito mode
   - Try with a different Facebook account (that's also an admin)
   - Check Meta App isn't restricted or disabled
   - Verify ngrok is still running and URL hasn't changed
