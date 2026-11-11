import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentUpdateSchema } from "@/lib/validation";
import { badId, handleError, parseId } from "@/lib/api";
import { conflictResponse, findConflict } from "@/lib/appointments";

// PATCH /api/appointments/:id — เปลี่ยนสถานะ และ/หรือ เลื่อนนัด
// body: { status?, appointment_at?, doctor_id?, reason? }
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const id = parseId((await ctx.params).id);
  if (!id) return badId();
  try {
    const data = appointmentUpdateSchema.parse(await req.json());
    const current = await prisma.appointments.findUnique({ where: { id } });
    if (!current) return Response.json({ error: "ไม่พบนัดหมาย" }, { status: 404 });

    const reschedule = data.appointment_at !== undefined || data.doctor_id !== undefined;
    if (reschedule) {
      if (current.status !== "scheduled") {
        return Response.json({ error: "เลื่อนได้เฉพาะนัดที่ยังรอพบแพทย์" }, { status: 400 });
      }
      const conflict = await findConflict(
        data.doctor_id ?? current.doctor_id,
        data.appointment_at ?? current.appointment_at,
        id,
      );
      if (conflict) return conflictResponse(conflict);
    }

    const appointment = await prisma.appointments.update({ where: { id }, data });
    return Response.json(appointment);
  } catch (err) {
    return handleError(err);
  }
}
