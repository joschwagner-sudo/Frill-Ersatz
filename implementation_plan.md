# Prototyp-Pro Enhancements Implementation Plan

Upgrade the Frill-Ersatz MVP to professional standards with robust validation, rich content rendering, and interactive comments.

## User Review Required

> [!IMPORTANT]
> - **Markdown Sanitization**: `dompurify` will be used with `jsdom` on the server. This adds a slight overhead to rendering but ensures security.
> - **Database Migration**: Adding the `Comment` model requires a migration (`npx prisma migrate dev`).

## Proposed Changes

### [Validation & Schemas]

#### [NEW] [schemas.ts](file:///Users/joschwagner/Frill%20Ersatz/src/lib/schemas.ts)
- Define Zod schemas for:
    - `AuthCodeSchema` (email)
    - `VerifyCodeSchema` (email, 6-digit code)
    - `FeatureRequestSchema` (title: 5-80 chars, description: min 10, type, tags)
    - `ReportSchema` (type, title, description, userEmail, pageUrl)

#### [requests/route.ts](file:///Users/joschwagner/Frill%20Ersatz/src/app/api/requests/route.ts)
- Use `FeatureRequestSchema.safeParse()` to validate incoming data.

#### [auth endpoints]
- Use `AuthCodeSchema` and `VerifyCodeSchema` in `/api/auth/request-code` and `/api/auth/verify-code`.

---

### [Markdown Rendering]

#### [NEW] [Markdown.tsx](file:///Users/joschwagner/Frill%20Ersatz/src/components/Markdown.tsx)
- Create a component that:
    - Uses `marked` to convert Markdown to HTML.
    - Uses `dompurify` (with `jsdom` for server-side) to sanitize the HTML.
    - Styles the output using `prose` classes or custom Tailwind rules.

#### [requests/[id]/page.tsx](file:///Users/joschwagner/Frill%20Ersatz/src/app/requests/%5Bid%5D/page.tsx)
- Replace plain text description with the `Markdown` component.

---

### [Interactive Features (Comments)]

#### [schema.prisma](file:///Users/joschwagner/Frill%20Ersatz/prisma/schema.prisma)
- Add `Comment` model: `id`, `body`, `createdAt`, `userId`, `featureRequestId`.
- Add relation to `User` and `FeatureRequest`.

#### [NEW] [comments/route.ts](file:///Users/joschwagner/Frill%20Ersatz/src/app/api/requests/%5Bid%5D/comments/route.ts)
- `POST` to add a comment (requires session).
- `GET` to list comments (included in request detail fetch or separate).

#### [requests/[id]/page.tsx](file:///Users/joschwagner/Frill%20Ersatz/src/app/requests/%5Bid%5D/page.tsx)
- Add a comments section at the bottom.
- Add a simple "Add Comment" form (if logged in).

---

### [Cloud Deployment]

#### [schema.prisma](file:///Users/joschwagner/Frill%20Ersatz/prisma/schema.prisma)
- Change `provider` from "sqlite" to "postgresql".
- Ensure all models are compatible (most are, but BigInt/Decimal might need care - not used here).

#### [.env](file:///Users/joschwagner/Frill%20Ersatz/.env)
- Update `DATABASE_URL` with the new Cloud DB connection string.

#### [GitHub & Vercel]
- Initialize Git repository.
- Connect local repo to a new GitHub repository.
- Connect GitHub to Vercel for automatic deployments.

## Verification Plan

### Automated Tests
- `npx prisma migrate dev` against the new Cloud DB.
- `npm run build` to ensure production readiness.

### Manual Verification
1. **GitHub**: Verify code is pushed correctly.
2. **Vercel**: Check deployment logs and verify the public URL.
3. **Database**: Ensure data is persisting in the Cloud DB (Supabase/Neon dashboard).
