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

## Verification Plan

### Automated Tests
- I will write a scratch script `verify_zod.ts` to test schemas against valid/invalid edge cases.
- Run `npx prisma migrate dev --name add_comments` to verify schema changes.

### Manual Verification
1. **Zod**: Try to submit a request with an empty title or invalid email and verify the error message.
2. **Markdown**: Post a request with `**bold**`, `*italic*`, and `# headers` and verify they render correctly.
3. **Comments**: Log in, post a comment, and verify it appears on the page.
