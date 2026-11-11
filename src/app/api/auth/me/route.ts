import { getSessionUser } from "@/lib/auth";

// GET /api/auth/me — ข้อมูลผู้ใช้ที่ login อยู่
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  return Response.json(user);
}
