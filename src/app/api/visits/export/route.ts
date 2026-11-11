import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";
import { csvResponse, ymdHm } from "@/lib/csv";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/visits/export?from=YYYY-MM-DD&to=YYYY-MM-DD — บันทึกการรักษา + ค่ารักษา ตามช่วงวัน (เวลาไทย, รวมวัน to)
export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";
    if (!DATE.test(from) || !DATE.test(to) || from > to) {
      return Response.json({ error: "ช่วงวันที่ไม่ถูกต้อง (from/to รูปแบบ YYYY-MM-DD)" }, { status: 400 });
    }
    const start = new Date(`${from}T00:00:00+07:00`);
    const end = new Date(`${to}T00:00:00+07:00`);
    end.setUTCDate(end.getUTCDate() + 1);

    const visits = await prisma.visits.findMany({
      where: { visit_at: { gte: start, lt: end } },
      include: {
        patients: { select: { hn: true, first_name: true, last_name: true } },
        doctors: { select: { first_name: true, last_name: true } },
      },
      orderBy: { visit_at: "asc" },
    });

    const total = visits.reduce((sum, v) => sum + Number(v.fee ?? 0), 0);
    const rows: unknown[][] = visits.map((v) => [
      ymdHm(v.visit_at),
      v.patients.hn,
      `${v.patients.first_name} ${v.patients.last_name}`,
      `${v.doctors.first_name} ${v.doctors.last_name}`,
      v.symptoms,
      v.diagnosis,
      v.treatment,
      v.fee?.toFixed(2) ?? "0.00",
    ]);
    rows.push(["", "", "", "", "", "", "รวม", total.toFixed(2)]);

    return csvResponse(
      `visits-${from}_to_${to}.csv`,
      ["วันเวลา", "HN", "ผู้ป่วย", "แพทย์", "อาการ", "การวินิจฉัย", "การรักษา", "ค่ารักษา (บาท)"],
      rows,
    );
  } catch (err) {
    return handleError(err);
  }
}
