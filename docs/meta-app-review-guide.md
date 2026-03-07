# Meta App Review Documentation Guide

This document contains all the requirements, justifications, and materials you need to submit for Meta App Review to get Instagram DM/Messaging permissions approved.

---

## Table of Contents
1. [Permissions Required](#permissions-required)
2. [Business Verification](#business-verification)
3. [Permission Justifications](#permission-justifications)
4. [Screencast/Video Requirements](#screencastvideo-requirements)
5. [Platform Terms Compliance](#platform-terms-compliance)
6. [Data Handling Disclosures](#data-handling-disclosures)
7. [Privacy Policy Requirements](#privacy-policy-requirements)
8. [Step-by-Step Submission Checklist](#step-by-step-submission-checklist)

---

## Permissions Required

For Instagram DM mirroring, you need these permissions:

| Permission | Level Needed | Purpose |
|------------|--------------|---------|
| `instagram_basic` | Advanced Access | Read Instagram Business Account profile information |
| `instagram_manage_messages` | Advanced Access | Read and send Instagram Direct Messages |
| `pages_show_list` | Advanced Access | List Facebook Pages user manages |
| `pages_messaging` | Advanced Access | Send messages via connected Facebook Page |
| `pages_read_engagement` | Advanced Access | Read page engagement data |
| `pages_manage_metadata` | Advanced Access | Manage page settings and subscriptions |

---

## Business Verification

Before submitting for app review, complete Business Verification:

1. Go to **Business Settings** > **Security Center**
2. Click **"Start Verification"**
3. Provide:
   - Legal business name
   - Business address
   - Business phone number
   - Business website
   - Government-issued business documents (one of):
     - Business license
     - Certificate of incorporation
     - Utility bill with business name
     - Tax registration document

**Timeline**: Business verification typically takes 2-5 business days.

---

## Permission Justifications

Copy and paste these justifications when requesting each permission:

### instagram_basic

**How will you use this permission?**
```
We use instagram_basic to retrieve the user's Instagram Business Account profile information, including their username, profile picture, and account ID. This allows our platform to:

1. Display the connected Instagram account details in our admin dashboard
2. Verify the Instagram Business Account is properly linked to a Facebook Page
3. Show users which Instagram account is connected to their store

Our application is an e-commerce platform that helps small businesses manage customer conversations from Instagram in a unified inbox. The instagram_basic permission is essential for identifying and displaying the connected account.
```

### instagram_manage_messages

**How will you use this permission?**
```
We use instagram_manage_messages to help businesses manage their Instagram Direct Message conversations from our unified omnichannel inbox. Specifically, we:

1. Fetch and display Instagram DM conversations in our admin dashboard
2. Allow business owners to read customer messages alongside messages from other channels
3. Enable businesses to respond to customer inquiries directly from our platform
4. Sync conversation history to provide context for customer support

This permission is critical for our core functionality as an omnichannel customer communication platform for e-commerce businesses. We only access messages for Instagram Business Accounts that the user explicitly connects and authorizes.
```

### pages_show_list

**How will you use this permission?**
```
We use pages_show_list to retrieve the list of Facebook Pages that a user manages. This is necessary because:

1. Instagram Business Accounts must be linked to a Facebook Page
2. We display a selection interface for users to choose which Page/Instagram account to connect
3. We retrieve the Page Access Token needed to make API calls on behalf of the business

This permission is used during the initial account connection flow and allows users to see and select from their managed Pages.
```

### pages_messaging

**How will you use this permission?**
```
We use pages_messaging in conjunction with instagram_manage_messages to enable sending responses to Instagram DM conversations. Our platform allows business owners to:

1. Reply to customer inquiries from our unified inbox
2. Send order confirmations and shipping updates via DM
3. Provide customer support through Instagram messaging

We only send messages on behalf of businesses that have explicitly connected their accounts and authorized our application.
```

### pages_read_engagement

**How will you use this permission?**
```
We use pages_read_engagement to access engagement data from the connected Facebook Page, which is linked to the Instagram Business Account. This allows us to:

1. Retrieve conversation participants and thread information
2. Access message metadata and delivery status
3. Identify new incoming messages for notification purposes

This permission supports our core messaging functionality by providing the necessary engagement data for message synchronization.
```

### pages_manage_metadata

**How will you use this permission?**
```
We use pages_manage_metadata to configure webhook subscriptions for the connected Facebook Page. This enables:

1. Real-time notifications when new Instagram DMs are received
2. Automatic syncing of new messages without manual refresh
3. Webhook subscription management for the instagram_messages topic

This permission is essential for providing a responsive, real-time messaging experience in our platform.
```

---

## Screencast/Video Requirements

Meta requires a screencast demonstrating how your app uses each permission. Here's what to show:

### Video Recording Guidelines

**Format**: MP4 or MOV, under 2 minutes per permission
**Resolution**: 1920x1080 recommended
**Audio**: Optional but helpful for explanation

### Screencast Script for Instagram Messaging Permissions

Record your screen showing:

1. **Login Flow** (30 seconds)
   - Show your app's login/admin page
   - Click "Connect Instagram Account"
   - Show Facebook OAuth dialog with permissions requested
   - Complete authorization

2. **Account Selection** (15 seconds)
   - Show the list of available Facebook Pages/Instagram accounts
   - Select an Instagram Business Account to connect
   - Show confirmation of successful connection

3. **Viewing Conversations** (30 seconds)
   - Navigate to the omnichannel inbox
   - Click the sync button to fetch conversations
   - Show the conversation list populated with Instagram DMs
   - Click on a conversation to view message history

4. **Reading Messages** (20 seconds)
   - Show messages displayed in the conversation view
   - Scroll through message history
   - Show customer and business messages differentiated

5. **Sending a Reply** (20 seconds)
   - Type a reply in the message input
   - Send the message
   - Show the message appears in the conversation

### Recording Tips

- Use a clean browser profile (no personal bookmarks visible)
- Clear any sensitive data from your test account
- Use test/demo customer conversations if possible
- Move your mouse deliberately and slowly
- Add captions or annotations if possible

---

## Platform Terms Compliance

Confirm your app complies with these policies:

### ☐ Instagram Platform Policy Checklist

- [ ] **No data selling**: We do not sell, license, or purchase any data obtained from Instagram
- [ ] **Secure storage**: All access tokens and user data are stored securely (encrypted at rest)
- [ ] **No unauthorized sharing**: We do not share Instagram data with third parties
- [ ] **User consent**: Users explicitly consent to connecting their Instagram accounts
- [ ] **Data minimization**: We only request and store data necessary for our functionality
- [ ] **User control**: Users can disconnect their Instagram account at any time
- [ ] **Transparent purpose**: Our use of Instagram data matches our stated purposes

### ☐ Messenger Platform Policy (for DM access)

- [ ] **No spam**: We do not send unsolicited messages
- [ ] **Business purposes**: Messages are only sent for legitimate business purposes
- [ ] **Opt-out respect**: Users can stop messages by disconnecting their account
- [ ] **Response window**: We only send messages within the 24-hour messaging window unless using approved message tags

---

## Data Handling Disclosures

During app review, you'll be asked about data handling. Use these answers:

### What Instagram user data do you store?

```
We store the following Instagram data for connected business accounts:

1. Instagram Business Account ID
2. Instagram username
3. Profile picture URL (cached temporarily)
4. Conversation IDs
5. Message content (text and attachment URLs)
6. Message timestamps
7. Sender/recipient identifiers

All data is stored in our secure Supabase database with row-level security enabled. Data is associated only with the business that connected the account.
```

### How long do you retain data?

```
- Active connection data: Retained while the Instagram account remains connected
- Message history: Retained for 2 years for customer service reference
- Disconnected accounts: Data deleted within 30 days of disconnection

Users can request immediate data deletion by contacting our support.
```

### Who has access to the data?

```
Access to Instagram data is restricted to:

1. The business owner who connected the account (via our admin dashboard)
2. Staff members the business owner has granted access to
3. Our technical team for support purposes only (with audit logging)

We do not share data with third parties, advertisers, or data brokers.
```

---

## Privacy Policy Requirements

Your privacy policy must include these sections. Add to your existing privacy policy:

### Required Privacy Policy Content

```markdown
## Instagram Data

### What We Collect
When you connect your Instagram Business Account to [Your App Name], we collect:
- Your Instagram username and profile information
- Direct message conversations with your customers
- Message content including text and media attachments

### How We Use Instagram Data
We use your Instagram data to:
- Display your Instagram DM conversations in our unified inbox
- Enable you to respond to customer messages
- Provide customer conversation history for context

### Data Storage and Security
- Instagram data is stored securely in our encrypted database
- Access is restricted to authorized users only
- We use industry-standard security measures to protect your data

### Data Retention
- We retain Instagram message data while your account is connected
- Upon disconnection, your Instagram data is deleted within 30 days

### Your Rights
You can:
- Disconnect your Instagram account at any time via Settings
- Request deletion of your Instagram data by contacting support
- Export your Instagram conversation data

### Third-Party Sharing
We do not sell, share, or provide your Instagram data to third parties.
```

---

## Step-by-Step Submission Checklist

### Before Submission

- [ ] Complete Business Verification
- [ ] Make successful test API calls for each permission
- [ ] Update your Privacy Policy with Instagram data handling
- [ ] Prepare screencast video(s) demonstrating functionality
- [ ] Test your app thoroughly with a test Instagram Business Account
- [ ] Ensure your app icon and description are professional

### Submission Process

1. **Go to App Review**
   - Navigate to your app in [Meta Developer Dashboard](https://developers.facebook.com/)
   - Click **App Review** > **Permissions and Features**

2. **Request Each Permission**
   - Click on the permission name
   - Click **"Request Advanced Access"**
   - Fill in the justification (use text from this document)
   - Upload your screencast video
   - Complete the data handling questionnaire

3. **Submit for Review**
   - Once all permissions are added, click **"Submit for Review"**
   - Confirm your details and submit

4. **Monitor Status**
   - Check the App Review dashboard for updates
   - Respond promptly to any requests for additional information
   - Review typically takes 5-10 business days

### Common Rejection Reasons & Fixes

| Rejection Reason | How to Fix |
|------------------|------------|
| "Cannot verify app functionality" | Ensure screencast clearly shows the feature working |
| "Privacy policy missing required information" | Add the Instagram-specific sections above |
| "Business not verified" | Complete Business Verification first |
| "Insufficient justification" | Expand on WHY you need the permission |
| "App appears incomplete" | Add proper UI, error handling, and polish |

---

## Support Resources

- [Meta App Review Guide](https://developers.facebook.com/docs/app-review/)
- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Messenger Platform Policies](https://developers.facebook.com/docs/messenger-platform/policy/)
- [Business Verification Help](https://www.facebook.com/business/help/2058515294227817)

---

## Notes

- App review timelines can vary (typically 5-10 business days)
- You can continue developing with Standard Access using your own test accounts
- If rejected, you can resubmit after addressing the feedback
- Consider starting with fewer permissions and adding more later

Good luck with your submission! 🚀
