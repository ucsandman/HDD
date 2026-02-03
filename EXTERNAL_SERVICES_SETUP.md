# External Services Setup Guide for HDD Marketing Tools

**For:** Nathan & Brinton (Hickory Dickory Decks Cincinnati)  
**Purpose:** Set up the online services needed to run the marketing tools  
**Time Required:** About 30-45 minutes total

---

## What You're Setting Up (and Why)

Your marketing tools need some online services to work. Think of these like utilities for your tools:

- **Database** - Stores your posts, leads, and settings
- **Email Service** - Sends login emails and notifications  
- **SMS Service** - Sends text messages to leads
- **Google Business** - Posts to your Google Business Profile
- **AI Service** - Generates post content and responses
- **Booking Service** - Handles appointment scheduling
- **File Storage** - Stores images for your posts

---

## Service #1: Database (Neon)

**What it does:** Stores all your data safely in the cloud  
**Cost:** Free for your needs  
**Time:** 5 minutes

### Steps:
1. Go to **neon.tech**
2. Click "Sign Up" and create account with your email
3. Create a new project:
   - Name: "HDD Marketing Tools"
   - Region: Choose "US East" 
4. After created, click "Connection Details"
5. Copy the "Connection String" - it looks like:
   ```
   postgresql://username:password@host.neon.tech/dbname
   ```
6. **Save this in a text file** - you'll need it later

---

## Service #2: Email Service (Resend)

**What it does:** Sends login emails and notifications  
**Cost:** Free for 3,000 emails/month (plenty for you)  
**Time:** 5 minutes

### Steps:
1. Go to **resend.com**
2. Sign up with your business email
3. After signup, go to "API Keys" in the sidebar
4. Click "Create API Key"
   - Name: "HDD Marketing Tools"
   - Permission: "Full access"
5. Copy the API key (starts with "re_")
6. **Save this in your text file**

---

## Service #3: SMS Service (Twilio)

**What it does:** Sends text messages to leads  
**Cost:** $1/month for phone number + $0.0075 per text  
**Time:** 10 minutes

### Steps:
1. Go to **twilio.com/try-twilio**
2. Sign up with your business info
3. Verify your business phone number
4. In the Twilio dashboard:
   - Go to "Phone Numbers" → "Manage" → "Buy a number"
   - Search for a 513 area code number (Cincinnati local)
   - Purchase it ($1/month)
5. Go to "Account" → "API Keys & Tokens"
6. Copy these three items to your text file:
   - Account SID
   - Auth Token  
   - Your purchased phone number

---

## Service #4: Google Business API

**What it does:** Lets tools post to your Google Business Profile  
**Cost:** Free  
**Time:** 10 minutes (most complex step)

### Steps:
1. Go to **console.cloud.google.com**
2. Sign in with the Google account that manages your Google Business Profile
3. Create a new project:
   - Name: "HDD Marketing Tools"
4. Enable the Google My Business API:
   - Go to "APIs & Services" → "Library"
   - Search "Google My Business"
   - Click "Google My Business API" → "Enable"
5. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "HDD Marketing Tools"
   - Authorized redirect URIs: Add this exactly:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
6. Copy to your text file:
   - Client ID
   - Client Secret

---

## Service #5: AI Service (Anthropic)

**What it does:** Generates post content and response templates  
**Cost:** Pay-as-you-go (expect $10-30/month based on usage)  
**Time:** 5 minutes

### Steps:
1. Go to **console.anthropic.com**
2. Sign up with your business email
3. Add a payment method (required even for free trial)
4. Go to "API Keys"
5. Click "Create Key"
   - Name: "HDD Marketing Tools"
6. Copy the API key (starts with "sk-")
7. **Save this in your text file**

---

## Service #6: Booking Service (Cal.com)

**What it does:** Handles appointment scheduling  
**Cost:** Free plan is fine  
**Time:** 5 minutes

### Steps:
1. Go to **cal.com**
2. Sign up with your business email
3. Create a booking page:
   - Title: "Free Deck Consultation"
   - Duration: 30 minutes
   - Description: Brief description of your consultation
4. Go to Settings → Webhooks
5. Add webhook URL (we'll provide this later)
6. Copy your booking page URL to your text file

---

## Service #7: File Storage (Vercel Blob)

**What it does:** Stores images for your posts  
**Cost:** Free for small usage  
**Time:** 5 minutes

### Steps:
1. Go to **vercel.com**
2. Sign up with your GitHub account (or create one if needed)
3. Create a new project (can be empty)
4. Go to your project settings → "Storage"
5. Create a new Blob store
6. Copy the "BLOB_READ_WRITE_TOKEN" to your text file

---

## Next Steps

Once you have all these items in your text file:

1. **Share the file securely** with your developer (Wes)
2. He'll configure the tools with these credentials
3. You'll be able to test everything together

### Your Text File Should Have:
- [ ] Neon Database connection string
- [ ] Resend API key
- [ ] Twilio Account SID, Auth Token, and Phone Number
- [ ] Google Client ID and Client Secret
- [ ] Anthropic API Key
- [ ] Cal.com booking URL
- [ ] Vercel Blob token

---

## Important Notes

**Security:** These are like passwords for your tools. Don't share them publicly or put them in emails. Use a secure method to share with your developer.

**Costs:** Most services are free or very low cost. The main ongoing cost will be:
- Twilio: ~$5-15/month depending on text volume
- Anthropic AI: ~$10-30/month depending on how much content you generate

**Questions?** If you get stuck on any step, take a screenshot and send it to Wes. These are one-time setup steps that unlock all your marketing tools.

---

*Created for Hickory Dickory Decks Cincinnati marketing tools setup*