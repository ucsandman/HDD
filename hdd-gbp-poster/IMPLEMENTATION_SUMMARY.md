
## Session Updates (Feb 12, 2026)

### Authentication
- **Edge Runtime Fix:** Updated `middleware.ts` to use cookie-based session checking instead of database calls, resolving a crash in the Edge Runtime.
- **Database Schema:** Added `Account`, `Session`, `VerificationToken`, `User.emailVerified`, and `User.image` to `prisma/schema.prisma` to fully support NextAuth (Auth.js) v5.
- **Demo Mode:** Fixed `lib/demo.ts` and `prisma/seed-demo.ts` to use valid UUIDs for PostgreSQL compatibility.

### AI Integration
- **Model Update:** Updated all Anthropic API calls in `app/api/generate/route.ts`, `app/api/blogs/route.ts`, and `app/api/blogs/[id]/summary/route.ts` to use `claude-haiku-4-5` (per user request).
- **Blog Generation Fix:** Fixed a RegExp syntax error in `app/api/blogs/route.ts` that was causing generation failures.
- **Data Limits:** Added truncation to `app/api/blogs/route.ts` (Title, Slug, Keywords) to prevent `P2000` database errors.

### Blog Features
- **Blog Editor:** Added a new page `app/(dashboard)/blogs/[id]/page.tsx` (and `blog-editor.tsx`) allowing users to:
  - View blog posts rendered in Markdown.
  - Edit blog content, title, and SEO metadata.
  - Save changes via a new `PATCH /api/blogs/[id]` endpoint.
  - Delete blog posts via a new `DELETE /api/blogs/[id]` endpoint.
- **Markdown Support:** Installed `react-markdown`, `remark-gfm`, `remark-breaks`, and `@tailwindcss/typography` for proper content rendering.

### Dependencies Added
- `date-fns`
- `react-markdown`
- `remark-gfm`
- `remark-breaks`
- `@tailwindcss/typography`
