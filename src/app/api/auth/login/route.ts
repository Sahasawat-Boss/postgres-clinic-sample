import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { handleError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// POST /api/auth/login { email, password }
export async function POST(req: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await req.json());
    const user = await prisma.users.findUnique({ where: { email } });

    // ข้อความเดียวกันทั้งกรณีไม่พบ user และรหัสผิด (ไม่บอกใบ้ผู้โจมตี)
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return Response.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "staff",
    };
    (await cookies()).set(SESSION_COOKIE, await createSessionToken(sessionUser), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return Response.json(sessionUser);
  } catch (err) {
    return handleError(err);
  }
}
