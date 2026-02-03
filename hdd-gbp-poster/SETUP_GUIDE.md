# GBP Post Scheduler - Setup Guide

## What's Already Done

- [x] `.env` file created from `.env.example`
- [x] `NEXTAUTH_SECRET` generated and set
- [x] `NEXTAUTH_URL` set to `http://localhost:3000`
- [x] `CRON_SECRET` generated and set
- [x] `ENCRYPTION_KEY` generated and set

## What You Need To Do

Complete these 5 steps to get API keys, then run the final commands.

---

## Step 1: Neon Database (5 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up (free tier works)
2. Click **"Create Project"**
3. Name it `hdd-gbp-poster`
4. Select region closest to you (e.g., `US East`)
5. Click **"Create Project"**
6. On the dashboard, you'll see a connection string. Click **"Copy"** next to the pooled connection.

**Update `.env`:**
```
DATABASE_URL=<paste the pooled connection string>
DATABASE_URL_UNPOOLED=<paste the direct/unpooled connection string>
```

To get the unpooled URL: Click the dropdown next to the connection string and select "Direct connection" instead of "Pooled connection".

---

## Step 2: Resend Email (3 minutes)

1. Go to [resend.com](https://resend.com) and sign up (free tier: 3,000 emails/month)
2. After signup, you're on the dashboard
3. Click **"API Keys"** in the sidebar
4. Click **"Create API Key"**
5. Name it `hdd-gbp-poster`, leave permissions as "Full access"
6. Copy the key (starts with `re_`)

**Update `.env`:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

> Note: Use `onboarding@resend.dev` as the sender for testing. For production, add and verify your own domain in Resend.

---

## Step 3: Anthropic Claude API (2 minutes)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Name it `hdd-gbp-poster`
6. Copy the key (starts with `sk-ant-`)

**Update `.env`:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxx
```

> Note: New accounts get $5 free credit. After that, it's ~$3 per 1M input tokens for Claude Sonnet.

---

## Step 4: Google Cloud OAuth (10 minutes)

This is the most complex step. Follow carefully.

### 4a. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top left, next to "Google Cloud")
3. Click **"New Project"**
4. Name: `HDD GBP Poster`
5. Click **"Create"**
6. Wait for it to create, then select it from the dropdown

### 4b. Enable the Business Profile API

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for **"My Business Business Information API"**
3. Click it, then click **"Enable"**
4. Also search and enable: **"My Business Account Management API"**

### 4c. Configure OAuth Consent Screen

1. Go to [APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in:
   - App name: `HDD GBP Poster`
   - User support email: Your email
   - Developer contact: Your email
5. Click **"Save and Continue"**
6. On Scopes page, click **"Add or Remove Scopes"**
7. Search and add these scopes:
   - `https://www.googleapis.com/auth/business.manage`
8. Click **"Update"**, then **"Save and Continue"**
9. On Test users page, click **"Add Users"**
10. Add the Google account email that owns the business profile
11. Click **"Save and Continue"**

### 4d. Create OAuth Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `HDD GBP Poster`
5. Under "Authorized redirect URIs", click **"Add URI"**
6. Enter: `http://localhost:3000/api/auth/google/callback`
7. Click **"Create"**
8. Copy the **Client ID** and **Client Secret**

**Update `.env`:**
```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

### Important: Testing Mode Limitations

The OAuth consent screen starts in "Testing" mode. This means:
- Only emails you manually add as test users can authenticate
- **Tokens expire after 7 days** and users must re-authenticate
- Maximum of 100 test users

For ongoing use, you will need to push the app to **Production** mode:
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click **"Publish App"**
3. Google may request verification (can take a few days for simple apps)

Do this after you have confirmed everything works in testing mode. Until then, be aware that the Google connection will break every 7 days and require re-authentication.

---

## Step 5: Vercel Blob Storage (5 minutes)

> **Option A: Skip for now** - If you don't need image uploads immediately, you can leave this blank and the app will still work. Image uploads will fail but post creation will work.

> **Option B: Set it up**

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Create a new project (can be empty or import this repo)
3. Go to the project's **"Storage"** tab
4. Click **"Create Database"** > **"Blob"**
5. Name it `hdd-gbp-images`
6. Click **"Create"**
7. Go to the Blob store's **"Settings"** or **.env.local** tab
8. Copy the `BLOB_READ_WRITE_TOKEN`

**Update `.env`:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxx
```

---

## Final Steps (Run These Commands)

Once all env vars are filled in, run these in your terminal:

```bash
cd hdd-gbp-poster

# Push the database schema to Neon
npx prisma db push

# Seed the Cincinnati franchise data
npx prisma db seed

# Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## Adding Yourself as a User

The app uses magic link login. Only pre-registered users can log in.

After seeding, the database has one user: `nricke@decks.ca`

To add your email, run this in a new terminal:

```bash
cd hdd-gbp-poster
npx prisma studio
```

This opens a database browser at `http://localhost:5555`.

1. Click on the **"User"** table
2. Click **"Add record"**
3. Fill in:
   - `email`: your email
   - `name`: your name
   - `franchiseId`: copy the UUID from the existing franchise record
   - `role`: `admin`
4. Click **"Save 1 change"**

Now you can log in with your email.

---

## Troubleshooting

### "Invalid login" or magic link doesn't arrive
- Check `RESEND_API_KEY` is correct
- Check `EMAIL_FROM` is `onboarding@resend.dev` or a verified domain
- Check spam folder

### Google OAuth error
- Make sure your email is added as a test user in Google Cloud Console
- Make sure the redirect URI matches exactly: `http://localhost:3000/api/auth/google/callback`

### Database connection error
- Make sure `DATABASE_URL` starts with `postgresql://` not `postgres://`
- Make sure you're using the pooled connection string for `DATABASE_URL`

### Prisma errors
- Run `npx prisma generate` to regenerate the client
- Run `npx prisma db push` to sync schema

---

## Current .env Status

```
DATABASE_URL=         ❌ Needs Neon connection string
DATABASE_URL_UNPOOLED= ❌ Needs Neon direct connection string

NEXTAUTH_SECRET=      ✅ Generated
NEXTAUTH_URL=         ✅ Set to http://localhost:3000

RESEND_API_KEY=       ❌ Needs Resend API key
EMAIL_FROM=           ❌ Needs sender address

ANTHROPIC_API_KEY=    ❌ Needs Claude API key

GOOGLE_CLIENT_ID=     ❌ Needs Google OAuth client ID
GOOGLE_CLIENT_SECRET= ❌ Needs Google OAuth client secret

BLOB_READ_WRITE_TOKEN= ❌ Optional - skip for now

CRON_SECRET=          ✅ Generated
ENCRYPTION_KEY=       ✅ Generated
```

Complete steps 1-4 minimum to get the app running.
