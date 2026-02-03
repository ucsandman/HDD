# HDD GBP Poster - Setup Summary

## ✅ What's Done

### Google Cloud Project
- **Project Name:** HDD GBP Poster
- **Project ID:** `hdd-gbp-poster`
- **Project Number:** `51852690564`
- **Console:** https://console.cloud.google.com/apis/credentials?project=hdd-gbp-poster

### APIs Enabled
- ✅ My Business Business Information API
- ✅ My Business Account Management API

### OAuth 2.0 Credentials
- ✅ OAuth consent screen configured (External, Testing mode)
- ✅ Desktop app credentials created
- ✅ Test user added: sandman.uc@gmail.com
- ✅ Credentials downloaded to `credentials.json`

### Node.js Tool
- ✅ Project created at: `C:\Projects\Practical Systems\hdd-gbp-poster`
- ✅ Dependencies installed
- ✅ Authentication completed (token saved)

**Available commands:**
| Command | Description |
|---------|-------------|
| `npm run auth` | Re-authenticate with Google |
| `npm run gbp-list` | List all Business Profile accounts & locations |
| `npm run gbp-post` | Post updates to configured locations |

---

## ⏸️ What's Pending

### Google API Access Approval
The GBP API requires explicit approval from Google. Current status: **Not approved** (0 quota)

**Form to complete:** https://support.google.com/business/contact/api_default
- Select: "Application For Basic API Access"

---

## 📋 Information Needed From Your Friend

To complete the API access request, you need:

### 1. Google Account Info
- [ ] **Email address** that manages their Google Business Profile(s)
- [ ] This email must be an **owner or manager** on the Business Profile

### 2. Business Details
- [ ] **Company name** (as registered)
- [ ] **Company website URL**

### 3. Google Business Profile
- [ ] **Google Maps listing URL** for their business
  - How to get: Search the business on Google Maps → Click "Share" → Copy link
  - Example: `https://maps.app.goo.gl/xxxxx` or `https://www.google.com/maps/place/...`
- [ ] Profile must be **verified and active for 60+ days**

### 4. Verification
- [ ] Confirm they agree to [Google Business Profile API policies](https://developers.google.com/my-business/content/policies)

---

## 🚀 Next Steps

### Step 1: Verify Business Profile Exists
Your friend needs a verified Google Business Profile. Check:
- Go to https://business.google.com
- Sign in with the account that manages their business
- Verify they have at least one location that's been verified 60+ days

**If no profile exists:**
1. Create one at https://business.google.com
2. Complete verification (postcard, phone, or video)
3. Wait 60 days before applying for API access

### Step 2: Add Friend as Test User (if different email)
If your friend uses a different Google account than sandman.uc@gmail.com:
1. Go to: https://console.cloud.google.com/auth/audience?project=hdd-gbp-poster
2. Click "Add users" under Test Users
3. Add their email address

### Step 3: Complete API Access Request
1. Go to: https://support.google.com/business/contact/api_default
2. Select "Application For Basic API Access"
3. Fill in the form with:
   - Name: [Your friend's name]
   - Email: [Their business email]
   - Admin emails: sandman.uc@gmail.com, [their email]
   - Company Name: [Their company name]
   - Company Website: [Their website]
   - Project ID: `hdd-gbp-poster`
   - Project Number: `51852690564`
   - Google Maps URL: [Their business listing URL]
   - Region: North America
   - Category: [Select appropriate - likely "Local Business" or similar]
   - Why: "To Manage Locations On Google Maps & Search"
   - Locations managed: [Select appropriate range]
   - Agree to policies: Yes

### Step 4: Wait for Approval
- Google typically responds in 1-3 business days
- Check quota at: https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas?project=hdd-gbp-poster
- When approved, quota changes from 0 to 300 QPM

### Step 5: Configure & Test
Once approved:
1. Run `npm run gbp-list` to get location IDs
2. Edit `post-update.js` - add location IDs to `LOCATIONS` array
3. Edit the `POST_CONTENT` with your message
4. Run `npm run gbp-post` to publish

---

## 📁 Project Files

```
C:\Projects\HDD\hdd-gbp-poster\
├── credentials.json     # OAuth credentials (DO NOT SHARE)
├── token.json          # Auth token (DO NOT SHARE)
├── package.json        # Node.js config
├── authenticate.js     # OAuth flow script
├── list-accounts.js    # List GBP accounts/locations
├── post-update.js      # Post updates script
├── README.md           # Full documentation
├── SETUP_SUMMARY.md    # This file
└── .gitignore          # Protects sensitive files
```

---

## ⚠️ Important Notes

1. **Testing Mode:** The OAuth app is in "testing" mode - only emails added as test users can authenticate
2. **Security:** Never commit `credentials.json` or `token.json` to git
3. **API Limits:** Once approved, you get 300 requests/minute - plenty for posting
4. **Post Frequency:** Google recommends not posting more than once per day per location

---

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=hdd-gbp-poster)
- [OAuth Test Users](https://console.cloud.google.com/auth/audience?project=hdd-gbp-poster)
- [API Access Request Form](https://support.google.com/business/contact/api_default)
- [GBP API Documentation](https://developers.google.com/my-business/content/overview)
- [Create Business Profile](https://business.google.com)
