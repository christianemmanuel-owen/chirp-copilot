# 🎉 Business Manager Support Added!

## What Changed

I've updated your Instagram connection code to support **Business Manager Pages**!

Previously, the code only looked for Pages directly owned by your personal Facebook account (`me/accounts`). Now it also checks for Pages managed through Business Manager (`me/businesses`).

## Files Modified

1. **`lib/meta/instagram.ts`**
   - Updated `fetchInstagramPageCandidates()` to query both personal and Business Manager Pages
   - Added detailed logging to help debug which Pages are found
   - Created `processPageCandidate()` helper function

2. **`.env`**
   - Added `business_management` scope to `INSTAGRAM_REQUIRED_SCOPES`

## 🚀 How to Test

### Step 1: Restart Your Dev Server

The `.env` file changed, so you need to restart:

```bash
# Press Ctrl+C to stop the current server
# Then restart:
npm run dev
```

### Step 2: Try Connecting Again

1. **Go to:**
   ```
   https://exiguously-unworn-wyatt.ngrok-free.dev/admin/settings
   ```

2. **Click "Connect Instagram Account"**

3. **During Facebook authorization:**
   - Make sure to grant the new `business_management` permission
   - Select your Business and Pages when prompted

4. **Check the server logs** - you should now see:
   ```
   [instagram] Fetching personal Pages from me/accounts...
   [instagram] Found 0 personal Pages
   [instagram] Fetching Business Manager Pages from me/businesses...
   [instagram] Found 1 businesses
   [instagram] Found 1 Pages in business [Your Business Name]
   [instagram] ✓ Added candidate: chirptester (Page: Chirp-tester)
   [instagram] Total Instagram Page candidates found: 1
   ```

### Step 3: Complete the Connection

After authorization, you should now see:
- ✅ Instagram account selection screen (with chirptester)
- ✅ Ability to click "Connect Instagram"
- ✅ Success! Connected status

## 🔍 Debugging

If it still doesn't work, check the server logs for these messages:

- `[instagram] Fetching personal Pages...` - Shows personal Pages found
- `[instagram] Fetching Business Manager Pages...` - Shows Business Manager lookup
- `[instagram] Found X businesses` - Should be at least 1
- `[instagram] Found X Pages in business...` - Should show your Page
- `[instagram] ✓ Added candidate:...` - Shows Instagram accounts found

## ⚠️ Important Notes

### New Permission Required

The `business_management` permission allows the app to:
- See your Business Manager accounts
- Access Pages managed through Business Manager
- This is a **Standard** permission and doesn't require app review for testing

### First-Time Authorization

When you connect for the first time after this change:
- Facebook will ask for the new `business_management` permission
- Make sure to **grant it** (don't uncheck it)
- You may need to select which Business to grant access to

## 📊 What the Code Does Now

```
OLD FLOW (Personal Pages Only):
┌─────────────────────────────┐
│ Query: me/accounts          │
│ Returns: []                 │  ❌ Empty - Page is in Business Manager
└─────────────────────────────┘

NEW FLOW (Personal + Business Manager):
┌─────────────────────────────┐
│ Query: me/accounts          │
│ Returns: []                 │  ← Still empty for Business Pages
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ Query: me/businesses        │
│ Returns: [Your Business]    │  ✓ Found!
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ Query: {business}/pages     │
│ Returns: [Chirp-tester]     │  ✓ Found your Page!
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ Get Instagram account       │
│ Returns: chirptester        │  ✓ Success!
└─────────────────────────────┘
```

## ✅ Success Checklist

After trying to connect, you should see:

- [ ] Server logs show "Found X businesses" (X > 0)
- [ ] Server logs show "Found X Pages in business..." (X > 0)
- [ ] Server logs show "✓ Added candidate: chirptester"
- [ ] Instagram account selection screen appears
- [ ] Can click "Connect Instagram" button
- [ ] See "Connected" status with green badge
- [ ] Instagram username displayed

## 🐛 Still Not Working?

If you still get "No Instagram Business Accounts found":

1. **Check server logs** - Share the `[instagram]` messages
2. **Verify Business Manager** - Make sure Page is in Business Manager
3. **Check permissions** - Ensure `business_management` was granted
4. **Try Graph API Explorer** - Test `me/businesses` manually

---

**Ready to test!** Restart your dev server and try connecting again. 🚀
