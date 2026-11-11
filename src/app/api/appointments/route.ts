import { requireAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validation";
import { handleError } from "@/lib/api";

// GET /api/appointments?status=scheduled&patient_id=1
export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") ?? undefined;
    const patientId = sp.get("patient_id");
    const appointments = await prisma.appointments.findMany({
      where: {
        status,
        patient_id: patientId ? Number(patientId) : undefined,
      },
      include: { patients: true, doctors: true },
      orderBy: { appointment_at: "asc" },
    });
    return Response.json(appointments);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/appointments — สร้างนัดหมาย
export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  try {
    const data = appointmentSchema.parse(await req.json());
    const appointment = await prisma.appointments.create({ data });
    return Response.json(appointment, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
