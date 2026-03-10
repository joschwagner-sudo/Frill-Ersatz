import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SettingsSchema = z.object({
  emailNotifications: z.boolean(),
  userId: z.string().min(1),
});

// PATCH /api/user/settings — update user settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = SettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { emailNotifications, userId } = result.data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailNotifications },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
