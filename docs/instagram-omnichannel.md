# Instagram DM Omnichannel Setup

This dashboard tab expects a Meta developer app that is wired only on the server. Follow the checklist below before enabling real traffic.

## 1. Create the Meta app
- Create a new Meta developer app and enable **Instagram Graph API** plus **Messenger API for Instagram**.
- Add your production admin URL to **Valid OAuth Redirect URIs**.
- Note the App ID and App Secret.

## 2. Connect the business account
- Switch the Instagram profile to a Professional account and link it to a Facebook Page.
- In Business Settings -> Accounts -> Instagram accounts, assign the Page to your Meta app so it can read/send DMs.

## 3. Generate long-lived tokens
- Use the token exchange flow: short-lived user token -> long-lived user token -> Page token.
- Store every token on the backend only. Never expose Meta tokens to the browser.

## 4. Configure webhooks
- Expose `POST /api/instagram/webhook` on the server.
- Subscribe the Meta app to the `instagram_messages` and `instagram_account` topics.
- Use a custom `IG_VERIFY_TOKEN` that only the backend knows.

## 5. Set environment variables
Add the following values to `.env` (or your hosting secrets vault) and restart the app so the API routes can pick them up:

```
IG_APP_ID="your-meta-app-id"
IG_APP_SECRET="your-meta-app-secret"
IG_PAGE_ID="facebook-page-id"
IG_LONG_LIVED_TOKEN="EAAB..."
IG_VERIFY_TOKEN="your-random-verify-token"
```

## 6. Secure the proxy
- Route every Instagram API call through `/api/instagram/*` using the server-side token.
- Rotate long-lived tokens every 60 days and keep them in your platform key manager (Supabase secrets, Vercel env vars, etc.).
- Audit webhook payloads before logging to avoid storing customer PII in plaintext.

Once these steps are complete, flip on the production connector and the omnichannel interface will display real conversations.
