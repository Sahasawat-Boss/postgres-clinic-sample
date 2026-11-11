import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** อ่าน user จาก cookie (ใช้ใน Route Handlers) */
export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** คืน Response 401 ถ้ายังไม่ login, ไม่งั้นคืน null — ใช้เป็นชั้นป้องกันซ้ำนอกจาก proxy */
export async function requireAuth() {
  const user = await getSessionUser();
  return user ? null : Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
}
