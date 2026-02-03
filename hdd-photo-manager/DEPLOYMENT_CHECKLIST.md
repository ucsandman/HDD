# Deployment Checklist - HDD Photo Manager

Use this checklist to ensure proper deployment to Vercel.

## Pre-Deployment Verification

### Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console errors in dev mode
- [ ] Can add projects with photos (test with dummy data)
- [ ] Photos display correctly
- [ ] Can delete photos individually
- [ ] Can delete entire projects

### Code Review
- [ ] No secrets in code (API keys, tokens, passwords)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with placeholders
- [ ] No debug/console.log statements (except intentional error logging)
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings resolved

### Documentation
- [ ] README.md is up to date
- [ ] DEPLOYMENT.md is complete
- [ ] IMPLEMENTATION.md documents all changes
- [ ] Comments added for complex logic

## Vercel Setup

### 1. Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Verify email address
- [ ] Connect GitHub account (if using Git deployment)

### 2. Create Blob Store
- [ ] Go to https://vercel.com/dashboard/stores
- [ ] Click "Create Database" → "Blob"
- [ ] Name: `hdd-photo-storage`
- [ ] Region: Choose closest to users (e.g., Washington, D.C. for Cincinnati)
- [ ] Click "Create"
- [ ] Copy `BLOB_READ_WRITE_TOKEN`
- [ ] Save token securely (password manager recommended)

### 3. Deploy Project
Choose one method:

#### Option A: Vercel CLI
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel` (from project directory)
- [ ] Answer prompts:
  - Link to existing? **N**
  - Project name: **hdd-photo-manager**
  - Directory: **./** (current)
  - Override settings? **N**
- [ ] Add environment variable: `vercel env add BLOB_READ_WRITE_TOKEN`
- [ ] Deploy to production: `vercel --prod`

#### Option B: Vercel Dashboard
- [ ] Go to https://vercel.com/new
- [ ] Import Git repository (or upload project)
- [ ] Configure:
  - Framework: **Vite**
  - Root Directory: **hdd-photo-manager** (if monorepo) or **.** (if standalone)
  - Build Command: **npm run build**
  - Output Directory: **dist**
- [ ] Add Environment Variables:
  - Name: `BLOB_READ_WRITE_TOKEN`
  - Value: [paste from step 2]
  - Environment: All (Production, Preview, Development)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (~1-2 minutes)

### 4. Connect Blob Store
- [ ] Go to project in Vercel Dashboard
- [ ] Click "Storage" tab
- [ ] Click "Connect Store"
- [ ] Select `hdd-photo-storage`
- [ ] Click "Connect"
- [ ] Verify connection shows as active

## Post-Deployment Verification

### Basic Functionality
- [ ] Visit deployment URL
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] UI renders correctly
- [ ] Can click "Add Project" button
- [ ] Form opens correctly

### Photo Upload
- [ ] Can select before photos
- [ ] Upload progress shows
- [ ] Photos appear in preview
- [ ] Can select after photos
- [ ] Photos appear in preview
- [ ] Can remove individual photos
- [ ] Save project works

### Photo Display
- [ ] Project appears in grid
- [ ] Thumbnail shows correctly
- [ ] Click project opens detail modal
- [ ] Before/after photos display correctly
- [ ] Photos are full resolution (not pixelated)
- [ ] No broken image links

### Delete Operations
- [ ] Can delete entire project
- [ ] Confirmation dialog appears
- [ ] Project removed from list
- [ ] Check Blob dashboard - files should be deleted

### Filters
- [ ] Type filter works
- [ ] Material filter works
- [ ] Neighborhood filter works
- [ ] Can clear filters
- [ ] Project count updates correctly

### Migration (If Applicable)
If you have existing localStorage data:
- [ ] Migration banner appears
- [ ] Progress counter updates
- [ ] Migration completes successfully
- [ ] Check Blob dashboard - migrated photos present
- [ ] Old base64 data no longer in localStorage

### Blob Storage Verification
- [ ] Go to Vercel Dashboard → Storage → hdd-photo-storage
- [ ] See uploaded files in `/hdd-photos/` directory
- [ ] File names include timestamps
- [ ] Click file to view/download
- [ ] Public URLs work when opened in new tab

### API Endpoints
- [ ] Go to Vercel Dashboard → Deployments → [latest] → Functions
- [ ] See `api/upload.ts` listed
- [ ] See `api/delete.ts` listed
- [ ] Check function logs for errors (should be clean)

## Production Configuration

### Domain Setup (Optional)
- [ ] Go to project Settings → Domains
- [ ] Add custom domain (e.g., photos.hddcincinnati.com)
- [ ] Configure DNS records (Vercel provides instructions)
- [ ] Wait for SSL certificate (automatic, ~1-2 minutes)
- [ ] Verify HTTPS works

### Environment Variables Review
- [ ] Settings → Environment Variables
- [ ] Verify `BLOB_READ_WRITE_TOKEN` is set
- [ ] Verify it's enabled for Production
- [ ] Do NOT share this token
- [ ] Do NOT commit to Git

### Security Settings
- [ ] Settings → General → Protection Password (optional)
- [ ] Settings → Security → Secure Compute (enabled by default)
- [ ] Verify no sensitive data in function logs

### Performance
- [ ] Test on mobile device
- [ ] Test on slow connection (throttle in DevTools)
- [ ] Check Lighthouse score (DevTools → Lighthouse)
  - Target: 90+ Performance
  - Target: 100 Accessibility
  - Target: 100 Best Practices
  - Target: 100 SEO

## Monitoring Setup

### Vercel Dashboard
- [ ] Bookmark project URL
- [ ] Enable email notifications (Settings → Notifications)
- [ ] Set up Slack integration (optional)

### Usage Monitoring
- [ ] Check Analytics tab weekly
- [ ] Monitor function invocation count
- [ ] Monitor bandwidth usage
- [ ] Monitor storage usage

### Cost Monitoring
- [ ] Go to Account Settings → Billing
- [ ] Review current usage
- [ ] Set up spending alerts (optional)
- [ ] Estimated monthly cost: $0-1 for typical usage

### Error Monitoring (Optional)
- [ ] Add Sentry (https://sentry.io)
- [ ] Add LogRocket (https://logrocket.com)
- [ ] Or use Vercel's built-in logs

## User Training

### Documentation
- [ ] Create user guide (screenshots + steps)
- [ ] Document workflow: Add project → Upload photos → Organize
- [ ] Share deployment URL with team
- [ ] Provide login instructions (if auth added)

### Bookmarking
- [ ] Add to browser bookmarks
- [ ] Add to home screen on mobile
- [ ] Share with franchisees

## Backup Strategy

### Blob Storage
- [ ] Blobs are durable (Vercel handles backups)
- [ ] Export important photos periodically (Vercel CLI: `vercel blob ls`)
- [ ] Download locally for critical projects

### localStorage
- [ ] Instruct users to export data periodically
- [ ] Document export process:
  1. DevTools → Application → Local Storage
  2. Copy `hdd-projects` value
  3. Save to text file
- [ ] Consider adding export feature to UI (future enhancement)

## Rollback Plan

If issues arise:
- [ ] Redeploy previous version: `vercel --prod` (from previous commit)
- [ ] Or rollback via Dashboard: Deployments → [previous] → Promote to Production
- [ ] Verify rollback works
- [ ] Investigate issue before redeploying

## Maintenance Schedule

### Weekly
- [ ] Check Vercel Dashboard for errors
- [ ] Review function logs
- [ ] Test core functionality

### Monthly
- [ ] Review storage usage
- [ ] Review bandwidth usage
- [ ] Check for dependency updates: `npm outdated`
- [ ] Review function performance

### Quarterly
- [ ] Update dependencies: `npm update`
- [ ] Test full workflow
- [ ] Review user feedback
- [ ] Consider new features

## Success Metrics

### Technical
- [ ] 99%+ uptime
- [ ] <1s page load time
- [ ] <2s photo upload time
- [ ] Zero critical errors

### Business
- [ ] Users can organize 100+ projects
- [ ] No storage quota errors
- [ ] Accessible across devices
- [ ] Monthly cost under $5

## Support Contacts

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Vercel Blob Docs:**
- https://vercel.com/docs/storage/vercel-blob

**Project Repository:**
- [Add your GitHub URL here]

## Completion

Deployment completed by: _______________

Date: _______________

Deployment URL: _______________

Blob Store Name: _______________

All checks passed: [ ] Yes [ ] No

Issues encountered: _______________

---

**Note:** Keep this checklist for future reference and re-deployments.
