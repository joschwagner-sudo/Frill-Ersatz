import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  email?: string;
  isAdmin?: boolean;
}

const SESSION_PASSWORD =
  process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_fallback_dev_only!";

const sessionOptions = {
  password: SESSION_PASSWORD,
  cookieName: "copilot_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Quick helper: returns { userId, email, isAdmin } or null
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  isAdmin: boolean;
} | null> {
  const session = await getSession();
  if (!session.userId || !session.email) return null;
  return {
    userId: session.userId,
    email: session.email,
    isAdmin: session.isAdmin ?? false,
  };
}
