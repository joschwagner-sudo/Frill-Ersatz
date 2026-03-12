import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/emails/preview — render email HTML from markdown
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { subject, body } = await request.json();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://frill-ersatz.vercel.app";

  // Simple markdown → HTML (basic formatting)
  const htmlBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #1a56db; padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">${subject.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h1>
    </div>
    <div style="padding: 30px 20px; font-size: 15px; line-height: 1.7; color: #15284B;">
      <p>${htmlBody}</p>
    </div>
    <div style="padding: 20px; text-align: center;">
      <a href="${baseUrl}/requests" style="display: inline-block; background: #1a56db; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Zur Feedback-Plattform →
      </a>
    </div>
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        <a href="${baseUrl}/account" style="color: #1a56db; text-decoration: none;">Einstellungen</a> · 
        <a href="${baseUrl}/account?unsubscribe=true" style="color: #6b7280; text-decoration: none;">Abmelden</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();

  return NextResponse.json({ html });
}
