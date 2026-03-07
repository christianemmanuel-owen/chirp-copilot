# Instagram Connection Troubleshooting Guide

## Quick Diagnostic Check

Visit this URL to see your current configuration:
```
http://localhost:3000/api/admin/instagram/debug
```

## Common Issues & Solutions

### Issue 1: "Authorization Failed" or Redirect Loop

**Cause**: Redirect URI mismatch between your app and Meta App settings

**Solution**:
1. Check your current redirect URI in `.env`:
   ```
   INSTAGRAM_OAUTH_REDIRECT_URI="https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback"
   ```

2. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
3. Select your app (ID: `1681448536163237`)
4. Go to **Settings** → **Basic**
5. Scroll to **App Domains** and add: `exiguously-unworn-wyatt.ngrok-free.dev`
6. Click **+ Add Platform** → **Website**
7. Add Site URL: `https://exiguously-unworn-wyatt.ngrok-free.dev`
8. Go to **Products** → **Facebook Login** → **Settings**
9. Add to **Valid OAuth Redirect URIs**:
   ```
   https://exiguously-unworn-wyatt.ngrok-free.dev/api/auth/instagram/callback
   ```
10. Click **Save Changes**

### Issue 2: "No Instagram Account Found"

**Cause**: Instagram account is not a Business/Creator account or not linked to Facebook Page

**Solution**:
1. **Convert to Business Account**:
   - Open Instagram app
   - Go to Profile → Menu (☰) → Settings
   - Tap **Account** → **Switch to Professional Account**
   - Choose **Business** or **Creator**
   - Complete the setup

2. **Link to Facebook Page**:
   - In Instagram app: Settings → Account → Linked Accounts → Facebook
   - Or in Facebook: Page Settings → Instagram → Connect Account

3. **Verify Connection**:
   - Go to your Facebook Page
   - Click **Settings** → **Instagram**
   - Ensure your Instagram account is shown as connected

### Issue 3: Missing Permissions

**Cause**: Meta App doesn't have required permissions

**Solution**:
1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Go to **App Review** → **Permissions and Features**
4. Request these permissions if not already approved:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `pages_manage_engagement`
   - `pages_messaging`

5. For **Development Mode** (testing):
   - Go to **Roles** → **Roles**
   - Add your Facebook account as **Administrator** or **Developer**
   - This allows you to test without app review

### Issue 4: App Not Configured Properly

**Cause**: Required products not added to Meta App

**Solution**:
1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Click **Add Products**
4. Add these products:
   - **Instagram Graph API** (or Instagram Basic Display)
   - **Messenger API**
   - **Facebook Login**

### Issue 5: Token Exchange Fails

**Cause**: App Secret or App ID incorrect

**Solution**:
1. Verify in Meta App Dashboard → Settings → Basic
2. Copy the correct **App ID** and **App Secret**
3. Update `.env`:
   ```
   FACEBOOK_APP_ID="1681448536163237"
   FACEBOOK_APP_SECRET="your-actual-secret"
   ```
4. Restart your dev server

### Issue 6: Ngrok URL Changed

**Cause**: Ngrok generates new URLs on restart

**Solution**:
1. Get your current ngrok URL:
   ```bash
   ngrok http 3000
   ```

2. Update `.env` with new URL:
   ```
   INSTAGRAM_OAUTH_REDIRECT_URI="https://your-new-url.ngrok-free.dev/api/auth/instagram/callback"
   ```

3. Update Meta App settings with new URL (see Issue 1)

4. Restart your Next.js server

**Better Solution**: Use a fixed ngrok domain (requires paid plan) or use a deployed URL

## Step-by-Step Connection Process

1. **Start the OAuth Flow**:
   - Click "Connect Instagram Account" button
   - You'll be redirected to Facebook

2. **Facebook Authorization**:
   - Log in with the Facebook account that manages your Facebook Page
   - Review and accept the permissions
   - Select the Facebook Page connected to your Instagram

3. **Callback & Page Selection**:
   - You'll be redirected back to your app
   - Select which Instagram Business Account to connect
   - Click "Connect Instagram"

4. **Verification**:
   - You should see "Connected" status
   - Your Instagram username should appear
   - Granted scopes should be listed

## Testing Checklist

- [ ] Meta App created with correct App ID and Secret
- [ ] Instagram Graph API product added to Meta App
- [ ] Messenger API product added to Meta App
- [ ] Facebook Login product added to Meta App
- [ ] Redirect URI added to Meta App's Valid OAuth Redirect URIs
- [ ] Instagram account is Business or Creator account
- [ ] Instagram account linked to Facebook Page
- [ ] Facebook account is admin of the Facebook Page
- [ ] Facebook account is admin/developer of the Meta App (for testing)
- [ ] `.env` file has correct FACEBOOK_APP_ID
- [ ] `.env` file has correct FACEBOOK_APP_SECRET
- [ ] `.env` file has correct INSTAGRAM_OAUTH_REDIRECT_URI
- [ ] Dev server restarted after `.env` changes
- [ ] Ngrok URL matches the one in `.env` (if using ngrok)

## Debug Logs

Check your browser console and server logs for specific error messages:

**Browser Console** (F12):
- Look for failed network requests to `/api/auth/instagram/*`
- Check for CORS errors

**Server Logs**:
- Look for `[instagram]` prefixed messages
- Check for token exchange errors
- Verify callback errors

## Still Not Working?

1. **Check Server Logs**: Look for `[instagram]` prefixed error messages
2. **Check Browser Console**: Look for network errors (F12 → Network tab)
3. **Verify Meta App Status**: Ensure app is not restricted or disabled
4. **Test with Different Account**: Try connecting with a different Facebook account
5. **Clear Cookies**: Clear browser cookies and try again
6. **Use Incognito Mode**: Test in incognito to rule out cookie/cache issues

## Getting More Help

If you're still stuck, collect this information:
- Error message from browser console
- Error message from server logs
- Screenshot of Meta App settings
- Screenshot of Instagram account type (Business/Creator/Personal)
- Screenshot of Facebook Page → Instagram connection
