import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";
import { csvResponse, ymd } from "@/lib/csv";

// GET /api/patients/export — รายชื่อผู้ป่วยทั้งหมดเป็น CSV
export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const patients = await prisma.patients.findMany({ orderBy: { hn: "asc" } });
    const gender: Record<string, string> = { male: "ชาย", female: "หญิง", other: "อื่นๆ" };
    return csvResponse(
      `patients-${ymd(new Date())}.csv`,
      ["HN", "ชื่อ", "นามสกุล", "เพศ", "วันเกิด", "เบอร์โทร", "อีเมล", "ที่อยู่", "กรุ๊ปเลือด", "แพ้ยา/อาหาร", "วันที่ลงทะเบียน"],
      patients.map((p) => [
        p.hn,
        p.first_name,
        p.last_name,
        p.gender ? gender[p.gender] ?? p.gender : "",
        p.date_of_birth.toISOString().slice(0, 10),
        p.phone,
        p.email,
        p.address,
        p.blood_type,
        p.allergies,
        ymd(p.created_at),
      ]),
    );
  } catch (err) {
    return handleError(err);
  }
}
