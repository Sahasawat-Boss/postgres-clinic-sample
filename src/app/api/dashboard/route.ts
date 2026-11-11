import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/api";

const TZ_OFFSET_MS = 7 * 60 * 60 * 1000; // เวลาไทย UTC+7

/** จุดเริ่มวัน/เดือนตามเวลาไทย คืนค่าเป็น Date (UTC) */
function bangkokStart(unit: "day" | "month", now = new Date()) {
  const local = new Date(now.getTime() + TZ_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = unit === "day" ? local.getUTCDate() : 1;
  return new Date(Date.UTC(y, m, d) - TZ_OFFSET_MS);
}

// GET /api/dashboard — สรุปตัวเลขหน้าแรก
export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const now = new Date();
    const todayStart = bangkokStart("day", now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const monthStart = bangkokStart("month", now);

    const [patientCount, todayCount, upcomingCount, revenue, upcoming, recentVisits] = await Promise.all([
      prisma.patients.count(),
      prisma.appointments.count({
        where: { appointment_at: { gte: todayStart, lt: tomorrowStart }, status: { not: "cancelled" } },
      }),
      prisma.appointments.count({ where: { status: "scheduled", appointment_at: { gte: now } } }),
      prisma.visits.aggregate({ _sum: { fee: true }, where: { visit_at: { gte: monthStart } } }),
      prisma.appointments.findMany({
        where: { status: "scheduled", appointment_at: { gte: todayStart } },
        include: { patients: true, doctors: true },
        orderBy: { appointment_at: "asc" },
        take: 6,
      }),
      prisma.visits.findMany({
        include: { patients: true, doctors: true },
        orderBy: { visit_at: "desc" },
        take: 5,
      }),
    ]);

    return Response.json({
      stats: {
        patients: patientCount,
        appointmentsToday: todayCount,
        upcoming: upcomingCount,
        revenueThisMonth: Number(revenue._sum.fee ?? 0),
      },
      upcoming,
      recentVisits,
    });
  } catch (err) {
    return handleError(err);
  }
}
