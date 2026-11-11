import { prisma } from "@/lib/prisma";

/** ช่วงเวลาที่ถือว่า "ชนกัน" ของแพทย์คนเดียวกัน (นาที) */
export const SLOT_MINUTES = 30;

/**
 * หานัด scheduled ของแพทย์คนนี้ที่ห่างจากเวลาที่ขอไม่ถึง SLOT_MINUTES
 * excludeId: ไม่นับนัดตัวเอง (ตอนเลื่อนนัด)
 */
export async function findConflict(doctorId: number, at: Date, excludeId?: number) {
  const slot = SLOT_MINUTES * 60 * 1000;
  return prisma.appointments.findFirst({
    where: {
      doctor_id: doctorId,
      status: "scheduled",
      id: excludeId ? { not: excludeId } : undefined,
      appointment_at: { gt: new Date(at.getTime() - slot), lt: new Date(at.getTime() + slot) },
    },
    include: { patients: { select: { first_name: true, last_name: true } } },
  });
}

export function conflictResponse(c: NonNullable<Awaited<ReturnType<typeof findConflict>>>) {
  const time = c.appointment_at.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return Response.json(
    { error: `แพทย์มีนัดอยู่แล้วช่วงเวลานี้: ${c.patients.first_name} ${c.patients.last_name} (${time}) — ต้องห่างกันอย่างน้อย ${SLOT_MINUTES} นาที` },
    { status: 409 },
  );
}
