# API Key Setup Guide

You mentioned you have the Database and Anthropic keys. Here is how to get the rest.

## 1. Random Secrets (Generated for you)

You can copy-paste these directly into your `.env` file:

```env
NEXTAUTH_SECRET="h8Wk2PFdWDeoXv/xhetMMYvCJy485tfIOs00cSgZqmg="
CRON_SECRET="43f4f73bda5414aea3023d0983d590a10d3877806341caa02f8d4af7c9e15459"
ENCRYPTION_KEY="0db924b3f532e93bcacaee020b116b261882df0792875ad4ef675466bd25ba70"
```

---

## 2. Resend API Key (for Emails)

1.  Go to **[resend.com](https://resend.com)** and sign up (free).
2.  Click **"API Keys"** in the sidebar.
3.  Click **"Create API Key"**.
4.  Name it `hdd-gbp-poster` and give it "Full Access".
5.  Copy the key (starts with `re_`).
6.  Update your `.env`:
    ```env
    RESEND_API_KEY="re_123..."
    EMAIL_FROM="onboarding@resend.dev"
    ```
    *(Use `onboarding@resend.dev` until you verify your own domain)*

---

## 3. Google OAuth Credentials (for Login & Business Profile)

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Create a **New Project** named "HDD GBP Poster".
3.  **Enable APIs:**
    *   Go to "APIs & Services" > "Library".
    *   Search for and enable **"Google Business Profile API"** (specifically "My Business Business Information API" and "My Business Account Management API").
4.  **Configure Consent Screen:**
    *   Go to "APIs & Services" > "OAuth consent screen".
    *   Select **External**.
    *   Fill in app name and email.
    *   Add user support email and developer contact email.
    *   **Test Users:** Add your own email address as a test user.
5.  **Create Credentials:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click **"Create Credentials"** > **"OAuth client ID"**.
    *   Application type: **Web application**.
    *   Name: "HDD GBP Poster Web".
    *   **Authorized redirect URIs:** Add `http://localhost:3000/api/auth/callback/google`.
    *   Click **Create**.
6.  Copy the **Client ID** and **Client Secret** into your `.env`:
    ```env
    GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET="your-client-secret"
    ```

---

## 4. Vercel Blob (Optional - for Image Uploads)

If you don't need image uploads right now, you can skip this.

1.  Go to **[vercel.com](https://vercel.com)** and sign up/login.
2.  Create a new project (import your repo or use a template).
3.  Go to the **Storage** tab.
4.  Click **Create Database** -> **Blob**.
5.  Follow the steps to create a store.
6.  In the store settings, find the `.env.local` snippet.
7.  Copy the `BLOB_READ_WRITE_TOKEN`.
    ```env
    BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
    ```
