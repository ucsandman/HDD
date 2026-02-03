# Deployment Guide - HDD Photo Manager

## Vercel Deployment

This app requires Vercel for full functionality (Blob storage + serverless functions).

### Prerequisites

1. Vercel account (free tier works)
2. Vercel CLI (optional): `npm i -g vercel`

### Step 1: Create Vercel Blob Store

1. Go to https://vercel.com/dashboard/stores
2. Click "Create Database"
3. Select "Blob"
4. Name it: `hdd-photo-storage`
5. Click "Create"
6. Copy the `BLOB_READ_WRITE_TOKEN`

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Login
vercel login

# Deploy
cd hdd-photo-manager
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: hdd-photo-manager
# - Directory: ./
# - Override settings? N

# Add environment variable
vercel env add BLOB_READ_WRITE_TOKEN

# Paste your token from Step 1

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `hdd-photo-manager`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: [paste token from Step 1]
5. Click "Deploy"

### Step 3: Connect Blob Store to Project

1. In Vercel Dashboard, go to your project
2. Click "Storage" tab
3. Click "Connect Store"
4. Select your `hdd-photo-storage` Blob store
5. Confirm connection

### Step 4: Verify Deployment

1. Visit your deployed URL
2. Try adding a project with photos
3. Check Vercel Blob dashboard to see uploaded files
4. Verify photos load correctly

### API Endpoints

The deployment includes two serverless functions:

- `POST /api/upload` - Upload photo to Blob
- `DELETE /api/delete` - Delete photo from Blob

These are automatically available via Vercel's Functions.

## Environment Variables

Only one variable is required:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxx
```

**Never commit this token.** It's already in `.gitignore`.

## Local Development with Vercel

To test Blob storage locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to project
vercel link

# Pull environment variables
vercel env pull

# Start dev server
npm run dev
```

This downloads the `.env` file with production tokens for local testing.

## Storage Limits

**Vercel Blob - Free Tier:**
- 200 GB bandwidth/month
- Unlimited storage (pay per GB)
- $0.15/GB stored
- $0.30/GB transferred

**Recommendations:**
- Resize images before upload (max 1920px width)
- Use JPEG compression for photos
- Archive old projects if storage costs grow

## Migration Notes

If you have existing localStorage data:
1. The app auto-migrates base64 photos to Blob on first load
2. Shows progress banner during migration
3. Sets `hdd-blob-migration-complete` flag when done
4. Keeps project metadata in localStorage

## Troubleshooting

### Upload Fails
- Check `BLOB_READ_WRITE_TOKEN` is set correctly
- Verify Blob store is connected in Vercel Dashboard
- Check function logs in Vercel Dashboard > Deployments > [latest] > Functions

### Migration Issues
- Clear `hdd-blob-migration-complete` from localStorage to retry
- Check browser console for errors
- Ensure you're accessing via deployed URL (not file://)

### Photos Don't Load
- Verify URLs start with `https://` and contain `blob.vercel-storage.com`
- Check Blob store permissions (should be public access)
- Open photo URL directly to test

## Monitoring

**Vercel Dashboard:**
- View function invocations
- Check error logs
- Monitor bandwidth usage

**Blob Dashboard:**
- View stored files
- Check storage size
- Download/delete files manually if needed

## Backup Strategy

Project metadata is in localStorage only. To backup:
1. Open browser DevTools > Application > Local Storage
2. Copy `hdd-projects` value
3. Save to text file

Photos are in Vercel Blob and can be exported:
1. Go to Blob Dashboard
2. List all files
3. Download individually or use Vercel CLI

## Security

- Blob URLs are public but unguessable (long random strings)
- No authentication on upload (add if needed for multi-user)
- Photos are customer-facing content (safe to be public)
- Consider adding basic auth or IP restriction if sensitive

## Next Steps

After deployment:
1. Test upload/delete workflows
2. Bookmark production URL
3. Monitor first month's usage
4. Consider image optimization if costs grow
