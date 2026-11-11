import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, REMEMBER_MAX_AGE, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { handleError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  // checkbox ส่งมาเป็น "on" (จาก FormData) หรือ boolean
  remember: z.union([z.boolean(), z.literal("on")]).optional().transform((v) => v === true || v === "on"),
});

// POST /api/auth/login { email, password, remember? }
export async function POST(req: NextRequest) {
  try {
    const { email, password, remember } = loginSchema.parse(await req.json());
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
    // จดจำฉันไว้: cookie อยู่ 30 วัน / ไม่ติ๊ก: session cookie (หายเมื่อปิดเบราว์เซอร์) + token หมดอายุ 8 ชม.
    const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
    (await cookies()).set(SESSION_COOKIE, await createSessionToken(sessionUser, maxAge), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(remember ? { maxAge } : {}),
    });
    return Response.json(sessionUser);
  } catch (err) {
    return handleError(err);
  }
}
